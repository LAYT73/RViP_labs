import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from './health/health.module';
import { Student } from './students/student.entity';
import { StudentsModule } from './students/students.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: Number(config.get<string>('DB_PORT', '5432')),
        username: config.get<string>('DB_USER', 'students'),
        password: config.get<string>('DB_PASSWORD', 'students'),
        database: config.get<string>('DB_NAME', 'students'),
        entities: [Student],
        synchronize: false,
      }),
    }),
    StudentsModule,
    HealthModule,
  ],
})
export class AppModule {}
