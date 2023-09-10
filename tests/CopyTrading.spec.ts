import { Blockchain, SandboxContract, TreasuryContract, printTransactionFees } from '@ton-community/sandbox';
import { Address, beginCell, toNano } from 'ton-core';
import { CopyTrading, SetMessenger } from '../wrappers/CopyTrading';
import '@ton-community/test-utils';
import { EventSignal, ProtcolRegister, SubscribeBody, UniversalRouter } from '../wrappers/UniversalRouter';
import { ChildRouter, CreateBody, DeleteSubscriber } from '../wrappers/ChildRouter';
import { Event, EventTrigger } from '../wrappers/Event';
import { Messenger } from '../wrappers/Messenger';
import { Follower } from '../wrappers/Follower';
import { Dex } from '../wrappers/Dex';
describe('CopyTrading', () => {
    let blockchain: Blockchain;
    let copyTrading: SandboxContract<CopyTrading>;
    let universalRouter: SandboxContract<UniversalRouter>;
    let oracle: SandboxContract<Event>;
    let trader: SandboxContract<TreasuryContract>;
    let dex: SandboxContract<Dex>;
    let follower: SandboxContract<Follower>;

    async function protocolRegsiter(sourceAddress: Address, protocol: SandboxContract<TreasuryContract>) {
        // Register the protocol
        const protocolRegister: ProtcolRegister = {
            $$type: 'ProtcolRegister',
            maxUserStakeAmount: toNano('100'),
            subscribeFeePerTick: toNano('0.5'),
            sourceAddress: sourceAddress, // oracle event
            template: beginCell().endCell(),
        };

        await universalRouter.send(
            protocol.getSender(),
            {
                value: toNano('10'),
            },
            protocolRegister
        );
    }

    async function userRegsiter(eventId: bigint, user: SandboxContract<TreasuryContract>, callbackAddress: Address) {
        //await protocolRegsiter(oracle.address, trader); // Simply call the function to handle the registration
        const subscribeBody: SubscribeBody = {
            $$type: 'SubscribeBody',
            walletAddress: user.address, // Owner address of callback contract
            deadline: 100n, // The deadline of the msg can delay
            eventId: eventId, // The even id which user want to subscribe
            callbackAddress: callbackAddress, // Callback contract address written by user
        };

        await universalRouter.send(
            user.getSender(),
            {
                value: toNano('10'),
            },
            subscribeBody
        );
    }
    beforeEach(async () => {
        blockchain = await Blockchain.create();
        trader = await blockchain.treasury('deployer');
        dex = blockchain.openContract(await Dex.fromInit(trader.address));
        universalRouter = blockchain.openContract(await UniversalRouter.fromInit(trader.address));
        oracle = blockchain.openContract(await Event.fromInit(trader.address, universalRouter.address));

        copyTrading = blockchain.openContract(
            await CopyTrading.fromInit(trader.address, universalRouter.address, dex.address)
        );

        const deployResult = await copyTrading.send(
            trader.getSender(),
            {
                value: toNano('10'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        const uniResult = await universalRouter.send(
            trader.getSender(),
            {
                value: toNano('10'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        const dexResult = await dex.send(
            trader.getSender(),
            {
                value: toNano('10'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: trader.address,
            to: copyTrading.address,
            deploy: true,
            success: true,
        });
        await protocolRegsiter(oracle.address, trader);
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and copyTrading are ready to use
    });

    it('should user get the price msg from the event', async () => {
        await userRegsiter(0n, trader, copyTrading.address); // trader registers for the oracle event
        const childRouterAddress = await universalRouter.getChildRouterAddress(oracle.address);
        const childRouter = blockchain.openContract(ChildRouter.fromAddress(childRouterAddress));
        const messagerAddress = await childRouter.getMessengerAddress(oracle.address, 0n);
        const messenger = blockchain.openContract(await Messenger.fromAddress(messagerAddress));
        const setMessenger: SetMessenger = {
            $$type: 'SetMessenger',
            messenger: messagerAddress, // The address of the messenger contract
            eventId: 0n, // The event id which user want to set the messenger
        };

        // Set copyTrading contract's messenger
        await copyTrading.send(
            trader.getSender(),
            {
                value: toNano('10'),
            },
            setMessenger
        );

        // Trigger the event
        const priceSignal: EventSignal = {
            $$type: 'EventSignal',
            eventId: 0n, // Setting the eventId to 0 as per your request
            payload: beginCell().storeInt(1588, 32).endCell(),
        };

        const priceEvent: EventTrigger = {
            $$type: 'EventTrigger',
            value: toNano('0'),
            address: oracle.address,
            info: priceSignal,
        };

        // Register trader contract as Protocol -> send the order action to the follower contract
        // 1. Register the copyTrading contract as Protocol
        await protocolRegsiter(copyTrading.address, trader);
        // 2. Deploy the follower contract
        let bob = await blockchain.treasury('bob'); // bob is the user who follows the trader contract
        follower = blockchain.openContract(await Follower.fromInit(bob.address, dex.address));
        const deployFollowerResult = await follower.send(
            bob.getSender(),
            {
                value: toNano('10'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        await userRegsiter(1n, bob, follower.address);
        const childRouterAddress2 = await universalRouter.getChildRouterAddress(copyTrading.address);
        const childRouter2 = blockchain.openContract(ChildRouter.fromAddress(childRouterAddress2));
        const messagerAddress2 = await childRouter2.getMessengerAddress(copyTrading.address, 0n);
        const messenger2 = blockchain.openContract(await Messenger.fromAddress(messagerAddress2));
        // Set bob contract's messenger
        const setMessenger2: SetMessenger = {
            // setFollowerMessenger
            $$type: 'SetMessenger',
            messenger: messagerAddress2, // The address of the messenger contract
            eventId: 1n, // The event id which user want to set the messenger
        };

        await follower.send(
            bob.getSender(),
            {
                value: toNano('10'),
            },
            setMessenger2
        );

        const priceResult = await oracle.send(
            trader.getSender(),
            {
                value: toNano('10'),
            },
            priceEvent
        );
        // Test whther the copyTrading contract get the price msg
        expect(priceResult.transactions).toHaveTransaction({
            from: messagerAddress,
            to: copyTrading.address,
            success: true,
        });

        // Test whether the copyTrading contract send the trading msg to the dex
        expect(priceResult.transactions).toHaveTransaction({
            from: copyTrading.address,
            to: dex.address,
            success: true,
        });

        // Test whther the copyTrading contract send the trading event to the universalRouter
        expect(priceResult.transactions).toHaveTransaction({
            from: copyTrading.address,
            to: universalRouter.address,
            success: true,
        });

        // Test whther the universalRouter send the trading event to the childrouter2
        expect(priceResult.transactions).toHaveTransaction({
            from: universalRouter.address,
            to: childRouter2.address,
            success: true,
        });

        // Test whther the childRouter send the trading event to the messager
        expect(priceResult.transactions).toHaveTransaction({
            from: childRouter2.address,
            to: messagerAddress2,
            success: true,
        });
        // Test whther the messager send the trading event to the follower
        expect(priceResult.transactions).toHaveTransaction({
            from: messagerAddress2,
            to: follower.address,
            success: true,
        });
        // printTransactionFees(priceResult.transactions);  // See all the transaction fees
    });
});
