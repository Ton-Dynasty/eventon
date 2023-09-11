import { Blockchain, SandboxContract, TreasuryContract, printTransactionFees } from '@ton-community/sandbox';
import { BlacklistPublisher, BlacklistWarning } from '../wrappers/BlacklistPublisher';
import '@ton-community/test-utils';
import { EventSignal, ProtcolRegister, SubscribeBody, UniversalRouter } from '../wrappers/UniversalRouter';
import { UserDefaultCallback } from '../wrappers/UserDefaultCallback';
import { Address, Cell, address, beginCell, toNano } from 'ton-core';
import { ChildRouter, CreateBody, DeleteSubscriber } from '../wrappers/ChildRouter';
import { Messenger } from '../wrappers/Messenger';
import * as utils from './utils';

describe('BlacklistPublisher', () => {
    let blockchain: Blockchain;
    let blacklistPublisher: SandboxContract<BlacklistPublisher>;
    let universalRouter: SandboxContract<UniversalRouter>;
    let owner: SandboxContract<TreasuryContract>;
    let userDefaultCallback: SandboxContract<UserDefaultCallback>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        owner = await blockchain.treasury('owner');
        universalRouter = blockchain.openContract(await UniversalRouter.fromInit(owner.address));
        blacklistPublisher = blockchain.openContract(
            await BlacklistPublisher.fromInit(owner.address, universalRouter.address)
        );

        await utils.deployProtocol(blacklistPublisher, owner, toNano('1'));
        await utils.deployProtocol(universalRouter, owner, toNano('1'));
    });

    it('should deploy', async () => {
        expect(owner.address).toBeTruthy();
        expect(blacklistPublisher.address).toBeTruthy();
        expect(universalRouter.address).toBeTruthy();
    });

    it('should register blacklist in the universal router', async () => {
        const eventIdBefore = await universalRouter.getEventId();
        const registerResult = await utils.protocolRegister(blacklistPublisher, owner);
        const eventIdAfter = await universalRouter.getEventId();

        // Test whether owner send event signal to universal router
        expect(registerResult.transactions).toHaveTransaction({
            from: owner.address,
            to: blacklistPublisher.address,
            success: true,
        });

        // Test whether the event signal is sent to universal router
        expect(registerResult.transactions).toHaveTransaction({
            from: blacklistPublisher.address,
            to: universalRouter.address,
            success: true,
        });

        // Test whether the event id is increased by 1
        expect(eventIdAfter).toBe(eventIdBefore + 1n);
        printTransactionFees(registerResult.transactions);
    });

    it('should blacklist publisher send event signal to universal router', async () => {
        await utils.protocolRegister(blacklistPublisher, owner);

        const childRouterAddress = await universalRouter.getChildRouterAddress(blacklistPublisher.address);
        const childRouter = blockchain.openContract(ChildRouter.fromAddress(childRouterAddress));
        const messagerAddress = await childRouter.getMessengerAddress(blacklistPublisher.address, 0n);
        const messenger = blockchain.openContract(await Messenger.fromAddress(messagerAddress));

        // Deploy user default callback contract
        let user = await blockchain.treasury('user');
        userDefaultCallback = blockchain.openContract(
            await UserDefaultCallback.fromInit(childRouterAddress, user.address, beginCell().endCell())
        );
        const deployResultUdc = await userDefaultCallback.send(
            owner.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );
        // User register the event
        await utils.userSubscribe(universalRouter, 0n, user, userDefaultCallback.address);
        let blackAddress = await blockchain.treasury('blackAddress');
        let blackInfo: Cell = beginCell().storeBuffer(Buffer.from('Phishing')).endCell();
        const blackEvent: BlacklistWarning = {
            $$type: 'BlacklistWarning',
            address: blackAddress.address,
            info: blackInfo,
        };
        const res = await blacklistPublisher.send(
            owner.getSender(),
            {
                value: toNano('1'),
            },
            blackEvent
        );
        // Test whether the event signal is sent by blacklist publisher
        expect(res.transactions).toHaveTransaction({
            from: blacklistPublisher.address,
            to: universalRouter.address,
            success: true,
        });
        // Test whether the event signal is sent to universal router
        expect(res.transactions).toHaveTransaction({
            from: blacklistPublisher.address,
            to: universalRouter.address,
            success: true,
        });
        // Test whether the event signal is sent to user default callback contract
        expect(res.transactions).toHaveTransaction({
            from: universalRouter.address,
            to: childRouterAddress,
            success: true,
        });
        // Test whether the event signal is sent to messenger
        expect(res.transactions).toHaveTransaction({
            from: childRouterAddress,
            to: messagerAddress,
            success: true,
        });
        // Test whether the event signal is sent to user default callback contract
        expect(res.transactions).toHaveTransaction({
            from: messagerAddress,
            to: userDefaultCallback.address,
            success: true,
        });
    });
});
