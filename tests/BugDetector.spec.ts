import { Blockchain, SandboxContract, TreasuryContract, printTransactionFees } from '@ton-community/sandbox';
import { Address, Cell, address, beginCell, toNano } from 'ton-core';
import { BugDetector, EventSourceRegister } from '../wrappers/BugDetector';
import '@ton-community/test-utils';
import { BugWarning, EventSignal, ProtcolRegister, SubscribeBody, UniversalRouter } from '../wrappers/UniversalRouter';
import { ChildRouter, CreateBody, DeleteSubscriber } from '../wrappers/ChildRouter';
import { Event, EventTrigger } from '../wrappers/Event';
import { Messenger } from '../wrappers/Messenger';
import { Follower } from '../wrappers/Follower';
import exp from 'constants';
import { UserDefaultCallback } from '../wrappers/UserDefaultCallback';
import * as utils from './utils';
describe('BugDetector', () => {
    let blockchain: Blockchain;
    let bugDetector: SandboxContract<BugDetector>;
    let universalRouter: SandboxContract<UniversalRouter>;
    let owner: SandboxContract<TreasuryContract>;
    let userDefaultCallback: SandboxContract<UserDefaultCallback>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        // Init
        owner = await blockchain.treasury('owner');
        universalRouter = blockchain.openContract(await UniversalRouter.fromInit(owner.address));
        bugDetector = blockchain.openContract(await BugDetector.fromInit(owner.address, universalRouter.address));

        // Deploy
        await utils.deployProtocol(bugDetector, owner, toNano('1'));
        await utils.deployProtocol(universalRouter, owner, toNano('1'));
    });

    it('should deploy', async () => {
        expect(owner.address).toBeTruthy();
        expect(bugDetector.address).toBeTruthy();
        expect(universalRouter.address).toBeTruthy();
    });

    it('should register bug detectoer in  universal router', async () => {
        const eventSrcRegister: EventSourceRegister = {
            $$type: 'EventSourceRegister',
            maxUserStakeAmount: toNano('10'),
            subscribeFeePerTick: toNano('0.5'),
            template: beginCell().endCell(),
            sourceName: 'test',
        };
        const eventIdBefore = await universalRouter.getEventId();
        const registerResult = await bugDetector.send(
            owner.getSender(),
            {
                value: toNano('0.5'),
            },
            eventSrcRegister
        );
        const eventIdAfter = await universalRouter.getEventId();

        // Test whether the register msg is sent by owner
        expect(registerResult.transactions).toHaveTransaction({
            from: owner.address,
            to: bugDetector.address,
            success: true,
        });

        // Test whether the register msg is sent to universal router
        expect(registerResult.transactions).toHaveTransaction({
            from: bugDetector.address,
            to: universalRouter.address,
            success: true,
        });

        // Test whether the event id is increased by 1
        expect(eventIdAfter).toBe(eventIdBefore + 1n);
        //printTransactionFees(registerResult.transactions);
    });

    it('should bug detectoer should send event signal to universal router', async () => {
        await utils.protocolRegister(bugDetector, owner);
        const childRouterAddress = await universalRouter.getChildRouterAddress(bugDetector.address);
        const childRouter = blockchain.openContract(ChildRouter.fromAddress(childRouterAddress));
        const messagerAddress = await childRouter.getMessengerAddress(bugDetector.address, 0n);
        const messenger = blockchain.openContract(await Messenger.fromAddress(messagerAddress));
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
        //await userRegsiter(0n, user, userDefaultCallback.address);
        await utils.userSubscribe(universalRouter, 0n, user, userDefaultCallback.address);

        // Bug Detector send event signal to the user default callback contract
        let badContract = await blockchain.treasury('badContract');
        let bugInfo: Cell = beginCell().storeBuffer(Buffer.from('Reentrancy')).endCell();
        const bugWarning: BugWarning = {
            $$type: 'BugWarning',
            targetAdress: badContract.address,
            bugInfo: bugInfo,
        };

        const bugWarningResult = await bugDetector.send(
            owner.getSender(),
            {
                value: toNano('10'),
            },
            bugWarning
        );
        //printTransactionFees(bugWarningResult.transactions);
        expect(bugWarningResult.transactions).toHaveTransaction({
            from: bugDetector.address,
            to: universalRouter.address,
            success: true,
        });

        expect(bugWarningResult.transactions).toHaveTransaction({
            from: universalRouter.address,
            to: childRouterAddress,
            success: true,
        });

        expect(bugWarningResult.transactions).toHaveTransaction({
            from: childRouterAddress,
            to: messagerAddress,
            success: true,
        });

        expect(bugWarningResult.transactions).toHaveTransaction({
            from: messagerAddress,
            to: userDefaultCallback.address,
            success: true,
        });
    });
});
