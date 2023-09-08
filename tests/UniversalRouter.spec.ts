import { Blockchain, SandboxContract, TreasuryContract } from '@ton-community/sandbox';
import { Address, beginCell, contractAddress, StateInit, toNano } from 'ton-core';
import {
    UniversalRouter,
    EventTrigger,
    EventSignal,
    ProtcolRegister,
    SubscribeBody,
} from '../wrappers/UniversalRouter';
import { Event } from '../wrappers/Event';
import '@ton-community/test-utils';
import { ChildRouter, CreateBody } from '../wrappers/ChildRouter';
import { BuildMessenger, Messenger } from '../wrappers/Messenger';
import { UserDefaultCallback } from '../wrappers/UserDefaultCallback';
import exp from 'constants';

describe('UniversalRouter', () => {
    let blockchain: Blockchain;
    let universalRouter: SandboxContract<UniversalRouter>;
    let event: SandboxContract<Event>;
    let deployer: SandboxContract<TreasuryContract>;
    let callBackContract: SandboxContract<UserDefaultCallback>;
    async function protocolRegsiter() {
        // Trigger the event
        const eventSignal: EventSignal = {
            $$type: 'EventSignal',
            eventId: 0n, // Setting the eventId to 0 as per your request
            payload: beginCell().endCell(),
        };

        const event1: EventTrigger = {
            $$type: 'EventTrigger',
            value: toNano('0'),
            address: event.address,
            info: eventSignal,
        };

        await event.send(
            deployer.getSender(),
            {
                value: toNano('10'),
            },
            event1
        );

        // Register the protocol
        const protocolRegister: ProtcolRegister = {
            $$type: 'ProtcolRegister',
            sourceAddress: event.address,
            template: beginCell().endCell(),
        };

        await universalRouter.send(
            deployer.getSender(),
            {
                value: toNano('0.2'),
            },
            protocolRegister
        );
    }

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
        // The rest of your test assertions remain unchanged...
        const eventIdBefore = await universalRouter.getEventId();
        await protocolRegsiter(); // Simply call the function to handle the registration
        const eventIdAfter = await universalRouter.getEventId();
        expect(eventIdBefore).toEqual(eventIdAfter - 1n);
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
        const childRouter = blockchain.openContract(ChildRouter.fromAddress(childRouterAddress));
        const messangerAddress = await childRouter.getMessengerAddress(event.address, 0n);
        // Test whether the child router build messenger successfully
        expect(protocolRegisterResult.transactions).toHaveTransaction({
            from: childRouterAddress,
            to: messangerAddress,
            success: true,
        });
    });

    it('should user subscribe successfully', async () => {
        await protocolRegsiter(); // Simply call the function to handle the registration

        const childRouterAddress = await universalRouter.getChildRouterAddress(event.address);
        const childRouter = blockchain.openContract(ChildRouter.fromAddress(childRouterAddress));
        const messagerAddress = await childRouter.getMessengerAddress(event.address, 0n);
        let messager = blockchain.openContract(Messenger.fromAddress(messagerAddress));
        const subIdBefore = await messager.getGetsubId();
        let Subscriber = await blockchain.treasury('Subscriber');
        callBackContract = blockchain.openContract(
            await UserDefaultCallback.fromInit(childRouterAddress, Subscriber.address, beginCell().endCell())
        );
        const udcResult = await callBackContract.send(
            Subscriber.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );
        const subscribeBody: SubscribeBody = {
            $$type: 'SubscribeBody',
            walletAddress: Subscriber.address, // Owner address of callback contract
            deadline: 100n, // The deadline of the msg can delay
            eventId: 0n, // The even id which user want to subscribe
            callbackAddress: callBackContract.address, // Callback contract address written by user
        };
        const subscriberCountBefore = await universalRouter.getEventSubCount(0n);
        expect(subscriberCountBefore).toEqual(null);
        const subscribeResult = await universalRouter.send(
            Subscriber.getSender(),
            {
                value: toNano('5'),
            },
            subscribeBody
        );
        const subscriberCountAfter = await universalRouter.getEventSubCount(0n);
        expect(subscriberCountAfter).toEqual(1n);
        // Test whether the advanced register msg has been sent to the universal router
        expect(subscribeResult.transactions).toHaveTransaction({
            from: Subscriber.address,
            to: universalRouter.address,
            success: true,
        });

        // Test whether universalRouter sent the advanced register msg to the child router
        expect(subscribeResult.transactions).toHaveTransaction({
            from: universalRouter.address,
            to: childRouterAddress,
            success: true,
        });

        // Test whether the child router sent the advanced register msg to the messanger contract
        expect(subscribeResult.transactions).toHaveTransaction({
            from: childRouterAddress,
            to: messagerAddress,
            success: true,
        });
        const subIdAfter = await messager.getGetsubId();
        // Test whether the messager contract set the subscriber's callback address correctly
        expect(subIdBefore).toEqual(subIdAfter - 1n);
    });

    it('should user register successfully (default callback contract)', async () => {
        await protocolRegsiter(); // Simply call the function to handle the registration
        const createBody: CreateBody = {
            $$type: 'CreateBody',
            walletAddress: deployer.address, // Assuming deployer is the user for simplicity.
            deadline: 100n, // 60 seconds from now, adjust as required.
            eventId: 0n,
            parameter: beginCell().endCell(), // Assuming a simple cell, adjust as required.
        };
        const registerMsgResult = await universalRouter.send(
            deployer.getSender(),
            {
                value: toNano('100'), // Adjust as required.
            },
            createBody
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
        const childRouter = blockchain.openContract(ChildRouter.fromAddress(childRouterAddress));
        const udcAddress = await childRouter.getUdcAddress(deployer.address, createBody.parameter);

        // Check if the UDC contract has been deployed.
        expect(registerMsgResult.transactions).toHaveTransaction({
            from: childRouterAddress,
            to: udcAddress,
            deploy: true,
            success: true,
        });

        // 3. messenger will receive and set the relevant information.
        const messengerAddress = await childRouter.getMessengerAddress(event.address, 0n); // Adjust messengerId as required.

        // Check if the child router has successfully sent a message to the messenger.
        expect(registerMsgResult.transactions).toHaveTransaction({
            from: childRouterAddress,
            to: messengerAddress,
            success: true,
        });

        // Check if messenger has set the subscriber's callback address correctly.
        const messenger = blockchain.openContract(Messenger.fromAddress(messengerAddress));
        const subscriberAddress = await messenger.getIdToSubscriber(0n); // Assuming subscriberId starts from 1 and increments.
        expect(subscriberAddress?.toString()).toEqual(udcAddress.toString());
    });

    it('should trigger event and subscriber get the event', async () => {
        // 1. Protocol register
        await protocolRegsiter(); // Simply call the function to handle the registration
        const childRouterAddress = await universalRouter.getChildRouterAddress(event.address);
        const childRouter = blockchain.openContract(await ChildRouter.fromAddress(childRouterAddress));
        const messengerAddress = await childRouter.getMessengerAddress(event.address, 0n);
        const messenger = blockchain.openContract(await Messenger.fromAddress(messengerAddress));

        // 2. User register
        const createBody: CreateBody = {
            $$type: 'CreateBody',
            walletAddress: deployer.address, // Assuming deployer is the user for simplicity.
            deadline: 100n, // 60 seconds from now, adjust as required.
            eventId: 0n,
            parameter: beginCell().endCell(), // Assuming a simple cell, adjust as required.
        };

        const registerMsgResult = await universalRouter.send(
            deployer.getSender(),
            {
                value: toNano('100'), // Adjust as required.
            },
            createBody
        );
        expect(registerMsgResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: universalRouter.address,
            success: true,
        });
        // const subscriberAddress = await messenger.getIdToSubscriber(0n);
        const udcAddress = await childRouter.getUdcAddress(deployer.address, createBody.parameter);
        const subscriber = blockchain.openContract(await UserDefaultCallback.fromAddress(udcAddress));

        // 3. Trigger event
        let preEventCount = await subscriber.getEventCount();
        const eventSignal: EventSignal = {
            $$type: 'EventSignal',
            eventId: 0n, // Setting the eventId to 0 as per your request
            payload: beginCell().endCell(),
        };

        const event1: EventTrigger = {
            $$type: 'EventTrigger',
            value: toNano('0'),
            address: event.address,
            info: eventSignal,
        };

        let eventTrigggerResult = await event.send(
            deployer.getSender(),
            {
                value: toNano('10'),
            },
            event1
        );
        expect(eventTrigggerResult.transactions).toHaveTransaction({
            from: event.address,
            to: universalRouter.address,
            success: true,
        });

        expect(eventTrigggerResult.transactions).toHaveTransaction({
            from: universalRouter.address,
            to: childRouterAddress,
            success: true,
        });
        expect(eventTrigggerResult.transactions).toHaveTransaction({
            from: childRouterAddress,
            to: messengerAddress,
            success: true,
        });
        expect(eventTrigggerResult.transactions).toHaveTransaction({
            from: messengerAddress,
            to: udcAddress,
            success: true,
        });
        let postEventCount = await subscriber.getEventCount();
        // 4. Check if the subscriber get the event
        expect(postEventCount).toEqual(preEventCount + 1n);
    });
});
