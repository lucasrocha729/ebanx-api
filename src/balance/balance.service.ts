import { Account } from './models/account';
import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common';
import { HttpResponse } from 'src/interfaces/i-http-return';
import { EventDto } from './dto/event-dto';

@Injectable()
export class BalanceService {
  private accounts: Account[];

  constructor() {
    this.accounts = [];
  }

  reset(): HttpResponse {
    this.accounts = [];

    return {
      message: 'Account information reset successfully!',
      status: HttpStatus.OK
    };
  }

  getBalance(accountId: string): HttpResponse {
    if (!this.accounts.find((acc) => acc.id === accountId)) {
      throw new NotFoundException('Account not found');
    }
    return {
      message: 'Account located successfully!',
      body: {
        balance: this.accounts.find((account) => account.id === accountId)
      },
      status: 200
    };
  }

  createEvent(eventDto: EventDto): HttpResponse {
    try {
      const { type, destination, amount, origin } = eventDto;
      let eventResult = null;

      switch (type) {
        case 'deposit':
          eventResult = this.handleDeposit(destination, amount);
          break;
        case 'transfer':
          eventResult = this.handleTransfer(origin, destination, amount);
          break;
        case 'withdraw':
          eventResult = this.handleWithdraw(origin, amount);
          break;
        default:
          throw new NotFoundException('Invalid event type');
      }

      return eventResult;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  protected handleDeposit(destination: string, amount: number): HttpResponse {
    const accountToMoviment = this.accounts.find(
      (account) => account.id === destination
    );

    if (!accountToMoviment) {
      this.accounts.push({ id: destination, balance: amount });
    } else {
      const index = this.accounts.findIndex(
        (account) => account.id === destination
      );
      this.accounts[index].balance += amount;
    }

    return {
      message: 'Balance updated successfully!',
      status: 201,
      body: {
        destination: this.accounts.find((account) => account.id === destination)
      }
    };
  }
  protected handleWithdraw(origin: string, amount: number): HttpResponse {
    try {
      const accountToMoviment = this.accounts.find(
        (account) => account.id === origin
      );

      if (!accountToMoviment) {
        throw new NotFoundException('Account not found.');
      }

      if (accountToMoviment.balance < amount) {
        throw new NotFoundException('Insufficient balance');
      }

      const index = this.accounts.findIndex((account) => account.id === origin);

      this.accounts[index].balance -= amount;

      return {
        message: 'Balance updated successfully!',
        status: 201,
        body: {
          destination: this.accounts.find((account) => account.id === origin)
        }
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  protected handleTransfer(
    origin: string,
    destination: string,
    amount: number
  ): HttpResponse {
    const originAccount = this.accounts.find(
      (account) => account.id === origin
    );

    const destinationAccount = this.accounts.find(
      (account) => account.id === destination
    );

    if (!originAccount || !destinationAccount) {
      throw new NotFoundException('One of the accounts was not identified');
    }

    if (originAccount.balance < amount) {
      throw new NotFoundException('Insufficient balance');
    }

    const indexOriginAccount = this.accounts.findIndex(
      (account) => account.id === origin
    );
    const indexDestinationAccount = this.accounts.findIndex(
      (account) => account.id === destination
    );

    this.accounts[indexOriginAccount].balance -= amount;
    this.accounts[indexDestinationAccount].balance += amount;

    return {
      message: 'Balance updated successfully!',
      status: 201,
      body: {
        origin: this.accounts.find((account) => account.id === origin),
        destination: this.accounts.find((account) => account.id === destination)
      }
    };
  }
}
