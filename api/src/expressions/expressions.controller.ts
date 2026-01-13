import { Controller, Get } from '@nestjs/common';
import { ExpressionsService } from './expressions.service.js';

@Controller('expressions')
export class ExpressionsController {
  constructor(private expressionsService: ExpressionsService) {}

  @Get()
  async getAllExpressions() {
    return this.expressionsService.findAll();
  }
}