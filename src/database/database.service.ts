import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class DatabaseService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(DatabaseService.name);
  private readonly pool: Pool;

  constructor() {
    const connectionString = process.env['POSTGRES_CONNECT_URL']!;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);

    super({ adapter });
    this.pool = pool;
  }

  async onModuleInit(): Promise<void> {
    this.logger.log('Connecting to PostgreSQL database...');
    await this.$connect();
    this.logger.log('Successfully connected to PostgreSQL database.');
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('Disconnecting from PostgreSQL database...');
    await this.$disconnect();
    await this.pool.end();
    this.logger.log('Disconnected from PostgreSQL database.');
  }

  /**
   * Check the database connection by running a simple query.
   * Returns an object with status and latency info.
   */
  async checkConnection(): Promise<{
    status: 'ok' | 'error';
    latencyMs: number;
    message: string;
    timestamp: string;
    url: string;
  }> {
    const start = Date.now();
    try {
      await this.$queryRawUnsafe('SELECT 1');
      const latencyMs = Date.now() - start;
      return {
        status: 'ok',
        latencyMs,
        message: 'Database connection is healthy',
        timestamp: new Date().toISOString(),
        url: process.env['POSTGRES_CONNECT_URL']!,
      };
    } catch (error) {
      const latencyMs = Date.now() - start;
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Database connection check failed: ${errorMessage}`);
      return {
        status: 'error',
        latencyMs,
        message: `Database connection failed: ${errorMessage}`,
        timestamp: new Date().toISOString(),
        url: process.env['POSTGRES_CONNECT_URL']!,
      };
    }
  }
}
