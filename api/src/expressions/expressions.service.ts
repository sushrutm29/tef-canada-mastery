import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class ExpressionsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.expression.findMany();
  }
}