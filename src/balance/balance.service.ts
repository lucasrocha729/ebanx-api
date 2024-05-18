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

  protected eventResolve = {
    deposit: this.handleDeposit.bind(this),
    transfer: this.handleTransfer.bind(this),
    withdraw: this.handleWithdraw.bind(this)
  };

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
    const eventResult = this.eventResolve[type]({
      origin,
      destination,
      amount
    });

    return eventResult;
  }

  protected handleDeposit({ destination, amount }) {
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
  protected handleWithdraw({ origin, amount }) {
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
  protected handleTransfer({ origin, destination, amount }) {
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
