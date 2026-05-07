import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * GET /health/db
   * Checks the database connection and returns status with latency info.
   */
  @Get('db')
  async checkDatabase() {
    return this.prisma.checkConnection();
  }
}
