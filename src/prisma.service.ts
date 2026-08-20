import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// Same pattern as F:\shop-products\nextjs-shop-main\lib\prismadb.ts: local
// dev keeps using the plain file:./dev.db client, but Vercel's filesystem is
// read-only, so when TURSO_DATABASE_URL is set (i.e. on Vercel) this swaps in
// the libsql driver adapter instead — same SQLite-shaped schema, a real
// remote DB behind it.
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    if (process.env.TURSO_DATABASE_URL) {
      // @prisma/adapter-libsql v6's PrismaLibSQL is an adapter *factory*: it
      // wants the raw {url, authToken} config and creates the libsql client
      // itself internally (lazily, per connect() call) — it does NOT take a
      // pre-built client instance. Passing an already-created client here
      // silently becomes `config.url === undefined` inside the factory,
      // which crashed every request in production with
      // `LibsqlError: URL_INVALID: The URL 'undefined' is not in a valid format`.
      const { PrismaLibSQL } = require('@prisma/adapter-libsql');
      const adapter = new PrismaLibSQL({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
      });
      super({ adapter } as any);
    } else {
      super();
    }
  }

  async onModuleInit() {
    await this.$connect();
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
