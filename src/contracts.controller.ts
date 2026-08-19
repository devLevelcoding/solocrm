import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Controller('contracts')
export class ContractsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('clientId') clientId?: string,
  ) {
    const take = +limit;
    const skip = (+page - 1) * take;
    const where: any = {};
    if (clientId) where.clientId = +clientId;
    const [data, total] = await Promise.all([
      this.prisma.contract.findMany({
        where, skip, take, orderBy: { createdAt: 'desc' }, include: { client: true, proposal: true },
      }),
      this.prisma.contract.count({ where }),
    ]);
    return { data, total, page: +page, limit: take };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.prisma.contract.findUnique({
      where: { id: +id },
      include: { client: true, proposal: true, invoices: true },
    });
  }

  @Post()
  create(@Body() body: any) {
    const { clientId, proposalId, title, type, startDate, endDate, status, body: text } = body;
    return this.prisma.contract.create({
      data: {
        clientId: +clientId,
        proposalId: proposalId ? +proposalId : undefined,
        title,
        type,
        status,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        body: text,
      },
    });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    const data: any = {};
    for (const key of ['title', 'type', 'status']) if (body[key] !== undefined) data[key] = body[key];
    if (body.endDate !== undefined) data.endDate = body.endDate ? new Date(body.endDate) : null;
    if (body.body !== undefined) data.body = body.body;
    return this.prisma.contract.update({ where: { id: +id }, data });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prisma.contract.update({ where: { id: +id }, data: { status: 'terminated' } });
  }
}
