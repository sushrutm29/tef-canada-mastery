import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';


@Injectable()
export class AppService {
  constructor(
    private prisma: PrismaService
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async dbTest(): Promise<{ connected: boolean; time: Date, expressionCount: number }> {
    const result = await this.prisma.$queryRaw<Array<{ now: Date }>>`SELECT NOW()`;
    const count = await this.prisma.expression.count();

    return { connected: true, time: result[0].now, expressionCount: count };
  }
}
