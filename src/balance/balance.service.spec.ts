import { BalanceService } from './balance.service';
import { Account } from './models/account';
import { EventDto } from './dto/event-dto';
import { NotFoundException } from '@nestjs/common';

describe('BalanceService', () => {
  let balanceService: BalanceService;

  beforeEach(() => {
    balanceService = new BalanceService();
  });

  describe('reset', () => {
    it('should reset the accounts array', () => {
      // Arrange
      const initialAccounts: Account[] = [
        { id: '1', balance: 100 },
        { id: '2', balance: 200 }
      ];
      balanceService['accounts'] = initialAccounts;

      balanceService.reset();

      expect(balanceService['accounts']).toEqual([]);
    });
  });

  describe('getBalance', () => {
    it('should return the balance of the specified account', () => {
      const accountId = '1';
      const expectedBalance = 100;
      balanceService['accounts'] = [
        { id: '1', balance: 100 },
        { id: '2', balance: 200 }
      ];

      const balance = balanceService.getBalance(accountId);

      expect(balance).toEqual(expectedBalance);
    });

    it('should return 0 if the specified account does not exist', () => {
      const accountId = '3';
      balanceService['accounts'] = [
        { id: '1', balance: 100 },
        { id: '2', balance: 200 }
      ];

      expect(() => balanceService.getBalance(accountId)).toThrow(
        new NotFoundException('0')
      );
    });
  });

  describe('createEvent', () => {
    it('should create a new event and return a success response', () => {
      balanceService['accounts'] = [
        { id: '1', balance: 100 },
        { id: '2', balance: 200 }
      ];

      const eventDto: EventDto = {
        origin: '2',
        type: 'deposit',
        destination: '1',
        amount: 100
      };

      const response = balanceService.createEvent(eventDto);

      expect(response).toEqual({
        destination: {
          id: '1',
          balance: 200
        }
      });
    });
  });

  describe('handleTransfer', () => {
    it('should transfer the specified amount from the origin account to the destination account', () => {
      const originAccount: Account = { id: '1', balance: 200 };
      const destinationAccount: Account = { id: '2', balance: 100 };
      const amount = 50;
      balanceService['accounts'] = [originAccount, destinationAccount];

      balanceService['handleTransfer']({
        origin: '1',
        destination: '2',
        amount
      });

      expect(originAccount.balance).toEqual(150);
      expect(destinationAccount.balance).toEqual(150);
    });

    it('should throw an error if the origin account does not exist', () => {
      const originAccountId = '3';
      const destinationAccountId = '2';
      const amount = 50;
      balanceService['accounts'] = [{ id: '1', balance: 200 }];

      expect(() =>
        balanceService['handleTransfer']({
          origin: originAccountId,
          destination: destinationAccountId,
          amount
        })
      ).toThrow(new NotFoundException('0'));
    });
  });

  describe('handleWithdraw', () => {
    it('should withdraw the specified amount from the origin account', () => {
      const originAccount: Account = { id: '1', balance: 200 };
      const amount = 50;
      balanceService['accounts'] = [originAccount];
      balanceService['handleWithdraw']({ origin: '1', amount });
      expect(originAccount.balance).toEqual(150);
    });

    it('should throw an error if the origin account does not exist', () => {
      const originAccountId = '3';
      const amount = 50;
      balanceService['accounts'] = [{ id: '1', balance: 200 }];
      expect(() =>
        balanceService['handleWithdraw']({ origin: originAccountId, amount })
      ).toThrow(new NotFoundException('0'));
    });

    it('should throw an error if the origin account has insufficient balance', () => {
      const originAccount: Account = { id: '1', balance: 50 };
      const amount = 100;
      balanceService['accounts'] = [originAccount];
      expect(() =>
        balanceService['handleWithdraw']({ origin: '1', amount })
      ).toThrow(new Error('Insufficient balance'));
    });
  });
});
