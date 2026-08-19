import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Controller('proposals')
export class ProposalsController {
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
      this.prisma.proposal.findMany({
        where, skip, take, orderBy: { createdAt: 'desc' }, include: { client: true },
      }),
      this.prisma.proposal.count({ where }),
    ]);
    return { data, total, page: +page, limit: take };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.prisma.proposal.findUnique({
      where: { id: +id },
      include: { client: true, contracts: true },
    });
  }

  @Post()
  create(@Body() body: any) {
    const { clientId, title, amount, body: text, status, validUntil } = body;
    return this.prisma.proposal.create({
      data: {
        clientId: +clientId,
        title,
        amount,
        body: text,
        status,
        validUntil: validUntil ? new Date(validUntil) : undefined,
      },
    });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    const data: any = {};
    for (const key of ['title', 'amount', 'status']) if (body[key] !== undefined) data[key] = body[key];
    if (body.body !== undefined) data.body = body.body;
    if (body.validUntil !== undefined) data.validUntil = body.validUntil ? new Date(body.validUntil) : null;
    return this.prisma.proposal.update({ where: { id: +id }, data });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prisma.proposal.delete({ where: { id: +id } });
  }
}
