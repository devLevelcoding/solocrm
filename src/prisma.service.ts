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
      const { createClient } = require('@libsql/client');
      const { PrismaLibSQL } = require('@prisma/adapter-libsql');
      const libsql = createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
      });
      const adapter = new PrismaLibSQL(libsql);
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
