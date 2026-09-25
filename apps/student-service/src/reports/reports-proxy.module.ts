import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ReportsProxyController } from './reports-proxy.controller';
import { ReportsProxyService } from './reports-proxy.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 0,
    }),
  ],
  controllers: [ReportsProxyController],
  providers: [ReportsProxyService],
})
export class ReportsProxyModule {}
