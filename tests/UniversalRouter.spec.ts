import { Blockchain, SandboxContract, TreasuryContract } from '@ton-community/sandbox';
import { Address, beginCell, contractAddress, StateInit, toNano } from 'ton-core';
import {
    UniversalRouter,
    EventTrigger,
    EventSignal,
    ProtcolRegister,
    AdvancedRegister,
} from '../wrappers/UniversalRouter';
import { Event } from '../wrappers/Event';
import '@ton-community/test-utils';
import { ChildRouter, DefaultRegister } from '../wrappers/ChildRouter';
import { BuildMessenger, Messenger } from '../wrappers/Messenger';
import { UserDefaultCallback } from '../wrappers/UserDefaultCallback';

describe('UniversalRouter', () => {
    let blockchain: Blockchain;
    let universalRouter: SandboxContract<UniversalRouter>;
    let event: SandboxContract<Event>;
    let deployer: SandboxContract<TreasuryContract>;
    let advancedContract: SandboxContract<UserDefaultCallback>;
    async function protocolRegiter() {
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
        await protocolRegiter(); // Simply call the function to handle the registration
        const eventIdAfter = await universalRouter.getEventId();
        expect(eventIdBefore).toEqual(eventIdAfter - 1n);
        const childRouterAddress = await universalRouter.getChildRouterAddress(event.address);
        const childRouter = blockchain.openContract(await ChildRouter.fromAddress(childRouterAddress));
        const messangerAddress = await childRouter.getMessengerAddress(event.address, 0n);
    });

    it('should user register successfully (advanced)', async () => {
        const childRouterAddress = await universalRouter.getChildRouterAddress(event.address);
        const childRouter = blockchain.openContract(await ChildRouter.fromAddress(childRouterAddress));
        let advancedUser = await blockchain.treasury('advancedUser');
        advancedContract = blockchain.openContract(
            await UserDefaultCallback.fromInit(childRouterAddress, advancedUser.address, beginCell().endCell())
        );
        const udcResult = await advancedContract.send(
            advancedUser.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );
        const advancedRegister: AdvancedRegister = {
            $$type: 'AdvancedRegister',
            walletAddress: advancedUser.address, // Owner address of callback contract
            deadline: 100n, // The deadline of the msg can delay
            eventId: 0n, // The even id which user want to subscribe
            callbackAddress: advancedContract.address, // Callback contract address written by user
        };

        const advancedRegisterResult = await universalRouter.send(
            advancedUser.getSender(),
            {
                value: toNano('1'),
            },
            advancedRegister
        );
        // expect(advancedRegisterResult.transactions).toHaveTransaction({
        //     from: advancedUser.address,
        //     to: universalRouter.address,
        //     success: true
        // });
        //console.log('advancedRegisterResult ',advancedRegisterResult.transactions);
    });

    it('should user register successfully (default callback contract)', async () => {
        await protocolRegiter();
        // 1. 用户向universal router发送注册消息
        const defaultRegisterMsg: DefaultRegister = {
            $$type: 'DefaultRegister',
            walletAddress: deployer.address, // Assuming deployer is the user for simplicity.
            deadline: 100n, // 60 seconds from now, adjust as required.
            eventId: 0n,
            parameter: beginCell().endCell(), // Assuming a simple cell, adjust as required.
        };
        const registerMsgResult = await universalRouter.send(
            deployer.getSender(),
            {
                value: toNano('1'),
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
