
import { Blockchain, SandboxContract, TreasuryContract } from '@ton-community/sandbox';
import { Address, beginCell, contractAddress, StateInit, toNano } from 'ton-core';
import { UniversalRouter, EventTrigger, EventSignal, ProtcolRegister, AdvancedRegister } from '../wrappers/UniversalRouter';
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
    async function protocolRegsiter() {
        // Trigger the event
        const eventSignal: EventSignal = {
            $$type: 'EventSignal',
            eventId: 0n,  // Setting the eventId to 0 as per your request
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
        await protocolRegsiter();  // Simply call the function to handle the registration
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
        const childRouter = blockchain.openContract(await ChildRouter.fromAddress(childRouterAddress));
        const messangerAddress = await childRouter.getMessengerAddress(event.address, 0n);
        // Test whether the child router build messenger successfully
        expect(protocolRegisterResult.transactions).toHaveTransaction({
            from: childRouterAddress,
            to: messangerAddress,
            success: true
        });
    });

    it('should user register successfully (advanced)', async () => {
        await protocolRegsiter(); // Simply call the function to handle the registration
        
        const childRouterAddress = await universalRouter.getChildRouterAddress(event.address);
        const childRouter = blockchain.openContract(await ChildRouter.fromAddress(childRouterAddress));
        const messagerAddress = await childRouter.getMessengerAddress(event.address, 0n);
        let messager = blockchain.openContract(await Messenger.fromAddress(messagerAddress));
        const subIdBefore = await messager.getGetsubId();
        console.log('messagerAddress', messagerAddress);
        let advancedUser = await blockchain.treasury('advancedUser');
        advancedContract = blockchain.openContract(await UserDefaultCallback.fromInit(childRouterAddress,advancedUser.address, beginCell().endCell()));
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
            callbackAddress: advancedContract.address // Callback contract address written by user
        };

        const advancedRegisterResult = await universalRouter.send(
            advancedUser.getSender(),
            {
                value: toNano('5'),
            },
            advancedRegister
        );
        // Test whether the advanced register msg has been sent to the universal router
        expect(advancedRegisterResult.transactions).toHaveTransaction({
            from: advancedUser.address,
            to: universalRouter.address,
            success: true
        });

        // Test whether universalRouter sent the advanced register msg to the child router
        expect(advancedRegisterResult.transactions).toHaveTransaction({
            from: universalRouter.address,
            to: childRouterAddress,
            success: true
        });
        console.log('childRouterAddress', childRouterAddress);
        console.log('universalRouter', universalRouter.address);
        
        // Test whether the child router sent the advanced register msg to the messanger contract
        expect(advancedRegisterResult.transactions).toHaveTransaction({
            from: childRouterAddress,
            to: messagerAddress,
            success: true
        });
        const subIdAfter = await messager.getGetsubId();
        // Test whether the messager contract set the subscriber's callback address correctly
        expect(subIdBefore).toEqual(subIdAfter - 1n);


    });

    
    it('should user register successfully (default callback contract)', async () => {
        await protocolRegsiter(); // Simply call the function to handle the registration
        const childRouterAddress = await universalRouter.getChildRouterAddress(event.address);
        const childRouter = blockchain.openContract(await ChildRouter.fromAddress(childRouterAddress));
        const messagerAddress = await childRouter.getMessengerAddress(event.address, 0n);
        let messager = blockchain.openContract(await Messenger.fromAddress(messagerAddress));
        const subIdBefore = await messager.getGetsubId();
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
                value: toNano('5'), // Adjust as required.
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

        // Check if the message has been successfully sent from universal router to child router.
        expect(registerMsgResult.transactions).toHaveTransaction({
            from: universalRouter.address,
            to: childRouterAddress,
            success: true,
        });
        const udcContractAddress = await childRouter.getUdcAddress(deployer.address,beginCell().endCell());
        console.log('udcContractAddress', udcContractAddress);
        // Check if the message has been successfully built the udc contract.
        expect(registerMsgResult.transactions).toHaveTransaction({
            from: childRouterAddress,
            to: udcContractAddress,
            success: true,
        });

        // Check if the message has been successfully sent from child router to messanger.
        expect(registerMsgResult.transactions).toHaveTransaction({
            from: childRouterAddress,
            to: messagerAddress,
            success: true,
        });
        
        
    });
});
