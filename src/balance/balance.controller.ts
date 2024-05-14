import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { BalanceService } from './balance.service';
import { HttpResponse } from 'src/interfaces/i-http-return';
import { EventDto } from './dto/event-dto';

@Controller()
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @Post('/reset')
  @HttpCode(HttpStatus.OK)
  reset(): HttpResponse {
    return this.balanceService.reset();
  }

  @Post('/event')
  createEvent(@Body() eventDto: EventDto): any {
    return this.balanceService.createEvent(eventDto);
  }
}
