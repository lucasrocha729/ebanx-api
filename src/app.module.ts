import { Module } from '@nestjs/common';
import { BalanceModule } from './balance/balance.module';

@Module({
  imports: [BalanceModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
