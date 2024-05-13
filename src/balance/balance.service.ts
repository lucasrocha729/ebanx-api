import { HttpStatus, Injectable } from '@nestjs/common';
import { HttpResponse } from 'src/interfaces/i-http-return';

@Injectable()
export class BalanceService {
  accounts: unknown = {};

  constructor() {
    this.accounts = {};
  }

  reset(): HttpResponse {
    this.accounts = {};
    return {
      message: 'Account information reset successfully!',
      status: HttpStatus.OK
    };
  }
}
