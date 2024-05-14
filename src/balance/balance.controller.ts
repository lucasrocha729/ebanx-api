import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query
} from '@nestjs/common';
import { BalanceService } from './balance.service';
import { EventDto } from './dto/event-dto';

@Controller()
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @Post('/reset')
  @HttpCode(HttpStatus.OK)
  reset() {
    return this.balanceService.reset();
  }

  @Post('/event')
  createEvent(@Body() eventDto: EventDto) {
    return this.balanceService.createEvent(eventDto);
  }

  @Get('/balance')
  getBalance(@Query('account_id') accountId: string) {
    return this.balanceService.getBalance(accountId);
  }
}
