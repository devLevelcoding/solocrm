import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Controller('clients')
export class ClientsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search?: string,
  ) {
    const take = +limit;
    const skip = (+page - 1) * take;
    const where: any = { deletedAt: null };
    if (search) {
      where.OR = [
        { fname: { contains: search } },
        { lname: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
      ];
    }
    const [data, total] = await Promise.all([
      this.prisma.client.findMany({ where, skip, take, orderBy: { lname: 'asc' } }),
      this.prisma.client.count({ where }),
    ]);
    return { data, total, page: +page, limit: take };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.prisma.client.findUnique({
      where: { id: +id },
      include: { proposals: true, contracts: true, invoices: true, tasks: true },
    });
  }

  @Post()
  create(@Body() body: any) {
    const { fname, lname, phone, email, address, notes, status } = body;
    return this.prisma.client.create({
      data: { fname, lname, phone, email, address, notes, status },
    });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    const allowed = ['fname', 'lname', 'phone', 'email', 'address', 'notes', 'status'];
    const data: any = {};
    for (const key of allowed) if (body[key] !== undefined) data[key] = body[key];
    return this.prisma.client.update({ where: { id: +id }, data });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prisma.client.update({ where: { id: +id }, data: { deletedAt: new Date() } });
  }
}
