import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from '../students/student.entity';
import { ReportsController } from './reports.controller';
import { REPORT_EXPORT_QUEUE, ReportsService } from './reports.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student]),
    ClientsModule.registerAsync([
      {
        name: REPORT_EXPORT_QUEUE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [
              config.get<string>(
                'RABBITMQ_URL',
                'amqp://guest:guest@localhost:5672',
              ),
            ],
            queue: 'report.export.csv',
            queueOptions: { durable: true },
          },
        }),
      },
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
