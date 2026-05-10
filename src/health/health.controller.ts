import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: DatabaseService) {}

  /**
   * GET /health/db
   * Checks the database connection and returns status with latency info.
   */
  @Get('db')
  async checkDatabase() {
    return this.prisma.checkConnection();
  }
}
