import { Blockchain, SandboxContract, TreasuryContract } from '@ton-community/sandbox';
import { Address, beginCell, contractAddress, StateInit, toNano } from 'ton-core';
import { UniversalRouter, EventTrigger, EventSignal, ProtcolRegister } from '../wrappers/UniversalRouter';
import { Event } from '../wrappers/Event';
import '@ton-community/test-utils';
import { ChildRouter, DefaultRegister } from '../wrappers/ChildRouter';
import { Messenger } from '../wrappers/Messenger';
describe('UniversalRouter', () => {
    let blockchain: Blockchain;
    let universalRouter: SandboxContract<UniversalRouter>;
    let event: SandboxContract<Event>;
    let deployer: SandboxContract<TreasuryContract>;
    beforeEach(async () => {
        blockchain = await Blockchain.create();
        deployer = await blockchain.treasury('deployer');
        universalRouter = blockchain.openContract(await UniversalRouter.fromInit(deployer.address));
        event = blockchain.openContract(await Event.fromInit(deployer.address, universalRouter.address));

        const deployResult = await universalRouter.send(
            deployer.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: universalRouter.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and universalRouter are ready to use
    });

    it('should protocol register successfully', async () => {
        const eventSignal: EventSignal = {
            $$type: 'EventSignal',
            eventId: 1n,
            payload: beginCell().endCell(),
        };

        const event1: EventTrigger = {
            $$type: 'EventTrigger',
            value: toNano('0'),
            address: event.address,
            info: eventSignal,
        };
        const eventTrigggerResult = await event.send(
            deployer.getSender(),
            {
                value: toNano('10'),
            },
            event1
        );
        // exit code 3 because of the protocol doesn't register before
        expect(eventTrigggerResult.transactions).toHaveTransaction({
            from: event.address,
            to: universalRouter.address,
            exitCode: 3,
        });

        const protocolRegister: ProtcolRegister = {
            $$type: 'ProtcolRegister',
            sourceAddress: event.address,
            template: beginCell().endCell(),
        };
        const eventIdBefore = await universalRouter.getEventId();
        // Ptotocol send regiter msg to universal router
        const protocolRegisterResult = await universalRouter.send(
            deployer.getSender(),
            {
                value: toNano('0.2'),
            },
            protocolRegister
        );
        const eventIdAfter = await universalRouter.getEventId();
        console.log(protocolRegisterResult, protocolRegisterResult);
        // Test whether prorocol send register msg to universal router successfully
        expect(protocolRegisterResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: universalRouter.address,
            success: true,
        });
        expect(eventIdBefore).toEqual(eventIdAfter - 1n);
        // Test wheteher the universal router build the child router successfully
        const childRouterAddress = await universalRouter.getChildRouterAddress(event.address);
        expect(protocolRegisterResult.transactions).toHaveTransaction({
            from: universalRouter.address,
            to: childRouterAddress,
            success: true,
        });
    });

    it('should user register successfully (default callback contract)', async () => {
        // 1. 用户向universal router发送注册消息
        const defaultRegisterMsg: DefaultRegister = {
            $$type: 'DefaultRegister',
            walletAddress: deployer.address, // Assuming deployer is the user for simplicity.
            deadline: BigInt(Date.now() + 60000), // 60 seconds from now, adjust as required.
            eventId: 1n,
            parameter: beginCell().endCell(), // Assuming a simple cell, adjust as required.
        };
        const registerMsgResult = await universalRouter.send(
            deployer.getSender(),
            {
                value: toNano('0.01'), // Adjust as required.
            },
            defaultRegisterMsg
        );

        // Check if user register message has been successfully sent to the universal router.
        expect(registerMsgResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: universalRouter.address,
            success: true,
        });

        // 2. child router will receive, deploy user callback contract, then send a message to messenger.
        // Getting child router address
        const childRouterAddress = await universalRouter.getChildRouterAddress(event.address);

        // Check if the message has been successfully sent from universal router to child router.
        expect(registerMsgResult.transactions).toHaveTransaction({
            from: universalRouter.address,
            to: childRouterAddress,
            success: true,
        });

        // Assuming the child router will also deploy the UDC contract after receiving the message.
        const childRouter = blockchain.openContract(await ChildRouter.fromAddress(childRouterAddress));
        const udcAddress = await childRouter.getUdcAddress(deployer.address, defaultRegisterMsg.parameter);

        // Check if the UDC contract has been deployed.
        expect(registerMsgResult.transactions).toHaveTransaction({
            from: childRouterAddress,
            to: udcAddress,
            deploy: true,
            success: true,
        });

        // 3. messenger will receive and set the relevant information.
        const messengerAddress = await childRouter.getMessengerAddress(event.address, 1n); // Adjust messengerId as required.

        // Check if the child router has successfully sent a message to the messenger.
        expect(registerMsgResult.transactions).toHaveTransaction({
            from: childRouterAddress,
            to: messengerAddress,
            success: true,
        });

        // Check if messenger has set the subscriber's callback address correctly.
        const messenger = blockchain.openContract(await Messenger.fromAddress(messengerAddress));
        const subscriberAddress = await messenger.getIdToSubscriber(1n); // Assuming subscriberId starts from 1 and increments.
        expect(subscriberAddress).toEqual(udcAddress);
    });
});
