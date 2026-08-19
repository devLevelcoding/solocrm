import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ClientsController } from './clients.controller';
import { ProposalsController } from './proposals.controller';
import { ContractsController } from './contracts.controller';
import { InvoicesController } from './invoices.controller';
import { TasksController } from './tasks.controller';

@Module({
  controllers: [
    ClientsController,
    ProposalsController,
    ContractsController,
    InvoicesController,
    TasksController,
  ],
  providers: [PrismaService],
})
export class AppModule {}
