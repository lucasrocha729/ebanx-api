import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { BalanceService } from './balance.service';
import { HttpResponse } from 'src/interfaces/i-http-return';

@Controller()
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @Post('/reset')
  @HttpCode(HttpStatus.OK)
  reset(): HttpResponse {
    return this.balanceService.reset();
  }
}
