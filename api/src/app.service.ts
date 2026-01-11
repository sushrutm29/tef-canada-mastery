import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
  constructor(
    @InjectDataSource() private dataSource: DataSource
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async dbTest(): Promise<{ connected: boolean; time: Date }> {
    const result = await this.dataSource.query('SELECT NOW()');
    return { connected: true, time: result[0].now };
  }
}
