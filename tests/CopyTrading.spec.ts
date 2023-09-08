import { Blockchain, SandboxContract, TreasuryContract } from '@ton-community/sandbox';
import { Address, beginCell, toNano } from 'ton-core';
import { CopyTrading, SetMessenger } from '../wrappers/CopyTrading';
import '@ton-community/test-utils';
import { EventSignal, ProtcolRegister, SubscribeBody, UniversalRouter } from '../wrappers/UniversalRouter';
import { ChildRouter, CreateBody, DeleteSubscriber } from '../wrappers/ChildRouter';
import { Event, EventTrigger } from '../wrappers/Event';
import { Messenger } from '../wrappers/Messenger';
import { UserDefaultCallback } from '../wrappers/UserDefaultCallback';
describe('CopyTrading', () => {
    let blockchain: Blockchain;
    let copyTrading: SandboxContract<CopyTrading>;
    let universalRouter: SandboxContract<UniversalRouter>;
    let oracle: SandboxContract<Event>; 
    let trader: SandboxContract<TreasuryContract>;

    async function protocolRegsiter(sourceAddress: Address) {
        // Register the protocol
        const protocolRegister: ProtcolRegister = {
            $$type: 'ProtcolRegister',
            sourceAddress: sourceAddress, // oracle event
            template: beginCell().endCell(),
        };

        await universalRouter.send(
            trader.getSender(),
            {
                value: toNano('0.2'),
            },
            protocolRegister
        );
    }

    async function userRegsiter(eventId: bigint) {
        await protocolRegsiter(oracle.address); // Simply call the function to handle the registration
        const subscribeBody: SubscribeBody = {
            $$type: 'SubscribeBody',
            walletAddress: trader.address, // Owner address of callback contract
            deadline: 100n, // The deadline of the msg can delay
            eventId: eventId, // The even id which user want to subscribe
            callbackAddress: copyTrading.address, // Callback contract address written by user
        };

        await universalRouter.send(
            trader.getSender(),
            {
                value: toNano('5'),
            },
            subscribeBody
        );
    }
    beforeEach(async () => {

        blockchain = await Blockchain.create();
        trader = await blockchain.treasury('deployer');
        universalRouter = blockchain.openContract(await UniversalRouter.fromInit(trader.address));
        oracle = blockchain.openContract(await Event.fromInit(trader.address, universalRouter.address));

        copyTrading = blockchain.openContract(await CopyTrading.fromInit(trader.address, universalRouter.address, oracle.address));

        const deployResult = await copyTrading.send(
            trader.getSender(),
            {
                value: toNano('0.05'),
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
        await protocolRegsiter(oracle.address);
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and copyTrading are ready to use
    });

    it('should user get the price msg from the event', async () => {
        await userRegsiter(0n); // Register for the oracle event
        const childRouterAddress = await universalRouter.getChildRouterAddress(oracle.address);
        const childRouter = blockchain.openContract(ChildRouter.fromAddress(childRouterAddress));
        const messagerAddress = await childRouter.getMessengerAddress(oracle.address, 0n);
        const setMessenger: SetMessenger = {
            $$type: 'SetMessenger',
            messenger: messagerAddress, // The address of the messenger contract
            eventId: 0n, // The event id which user want to set the messenger
        };

        await copyTrading.send(
            trader.getSender(),
            {
                value: toNano('1'),
            },
            setMessenger
        );
            
        // Trigger the event
        const priceSignal: EventSignal = {
            $$type: 'EventSignal',
            eventId: 0n, // Setting the eventId to 0 as per your request
            payload: beginCell().storeInt(1688,32).endCell(),
        };

        const priceEvent: EventTrigger = {
            $$type: 'EventTrigger',
            value: toNano('0'),
            address: oracle.address,
            info: priceSignal,
        };

        const priceResult = await oracle.send(
            trader.getSender(),
            {
                value: toNano('10'),
            },
            priceEvent
        );
        expect(priceResult.transactions).toHaveTransaction({
            from: messagerAddress,
            to: copyTrading.address,
            success: true,
        });
        
    });

    
});
