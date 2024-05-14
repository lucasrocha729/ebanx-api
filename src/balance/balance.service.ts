import { Account } from './models/account';
import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpResponse } from 'src/interfaces/i-http-return';
import { EventDto } from './dto/event-dto';

@Injectable()
export class BalanceService {
  private accounts: Account[];

  constructor() {
    this.accounts = [];
  }

  reset(): string {
    this.accounts = [];

    return 'OK';
  }

  getBalance(accountId: string): number {
    if (!this.accounts.find((acc) => acc.id === accountId)) {
      throw new NotFoundException();
    }

    const accountData = this.accounts.find(
      (account) => account.id === accountId
    );
    return accountData.balance;
  }

  createEvent(eventDto: EventDto): HttpResponse {
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
  }

  protected handleDeposit(destination: string, amount: number) {
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
      destination: this.accounts.find((account) => account.id === destination)
    };
  }
  protected handleWithdraw(origin: string, amount: number) {
    const accountToMoviment = this.accounts.find(
      (account) => account.id === origin
    );

    if (!accountToMoviment) {
      throw new NotFoundException();
    }

    if (accountToMoviment.balance < amount) {
      throw new NotFoundException('Insufficient balance');
    }

    const index = this.accounts.findIndex((account) => account.id === origin);

    this.accounts[index].balance -= amount;

    return {
      origin: this.accounts.find((account) => account.id === origin)
    };
  }
  protected handleTransfer(
    origin: string,
    destination: string,
    amount: number
  ) {
    const originAccount = this.accounts.find(
      (account) => account.id === origin
    );

    const destinationAccount = this.accounts.find(
      (account) => account.id === destination
    );

    if (!originAccount) {
      throw new NotFoundException();
    }

    // if (originAccount.balance < amount) {
    //   throw new NotFoundException('Insufficient balance');
    // }

    const indexOriginAccount = this.accounts.findIndex(
      (account) => account.id === origin
    );
    const indexDestinationAccount = this.accounts.findIndex(
      (account) => account.id === destination
    );

    this.accounts[indexOriginAccount].balance -= amount;

    destinationAccount
      ? (this.accounts[indexDestinationAccount].balance += amount)
      : this.accounts.push({ id: destination, balance: amount });

    return {
      origin: this.accounts.find((account) => account.id === origin),
      destination: this.accounts.find((account) => account.id === destination)
    };
  }
}
