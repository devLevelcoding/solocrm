import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('clientId') clientId?: string,
    @Query('status') status?: string,
  ) {
    const take = +limit;
    const skip = (+page - 1) * take;
    const where: any = {};
    if (clientId) where.clientId = +clientId;
    if (status) where.status = status;
    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where, skip, take, orderBy: { dueDate: 'desc' }, include: { client: true, contract: true },
      }),
      this.prisma.invoice.count({ where }),
    ]);
    return { data, total, page: +page, limit: take };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.prisma.invoice.findUnique({
      where: { id: +id },
      include: { client: true, contract: true },
    });
  }

  @Post()
  create(@Body() body: any) {
    const { clientId, contractId, number, amount, tax, dueDate, status } = body;
    const amt = Number(amount);
    const taxAmt = Number(tax ?? 0);
    return this.prisma.invoice.create({
      data: {
        clientId: +clientId,
        contractId: contractId ? +contractId : undefined,
        number,
        amount: amt,
        tax: taxAmt,
        total: amt + taxAmt,
        dueDate: new Date(dueDate),
        status,
      },
    });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    const data: any = {};
    if (body.status !== undefined) data.status = body.status;
    if (body.paidAt !== undefined) data.paidAt = body.paidAt ? new Date(body.paidAt) : null;
    if (body.dueDate !== undefined) data.dueDate = new Date(body.dueDate);
    return this.prisma.invoice.update({ where: { id: +id }, data });
  }

  @Post(':id/pay')
  markPaid(@Param('id') id: string) {
    return this.prisma.invoice.update({ where: { id: +id }, data: { status: 'paid', paidAt: new Date() } });
  }
}
