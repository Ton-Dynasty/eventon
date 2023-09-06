import { Blockchain, SandboxContract, TreasuryContract } from '@ton-community/sandbox';
import { Address, beginCell, contractAddress, StateInit, toNano } from 'ton-core';
import { UniversalRouter, EventTrigger, EventSignal, ProtcolRegister } from '../wrappers/UniversalRouter';
import { Event } from '../wrappers/Event';
import '@ton-community/test-utils';
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

    it('should send EvnetTrigger', async () => {
        const eventSignal: EventSignal = {
            $$type: 'EventSignal',
            eventId: 1n,
            payload: beginCell().endCell(),
        }

        const event1: EventTrigger = {
            $$type: 'EventTrigger',
            value: toNano('0'),
            address: event.address,
            info: eventSignal,
        }
        const eventTrigggerResult = await event.send(
            deployer.getSender(), 
            {
                value: toNano('10')
            },
            event1
        );
        // exit code 3 because of the protocol doesn't register before
        expect(eventTrigggerResult.transactions).toHaveTransaction({
            from: event.address,
            to: universalRouter.address,
            exitCode: 3
        });
        
        const protocolRegister: ProtcolRegister = {
            $$type: 'ProtcolRegister',
            sourceAddress: event.address,
            template: beginCell().endCell(),
        }
        const eventIdBefore = await universalRouter.getGetEventId();
        const protocolRegisterResult = await universalRouter.send(
            deployer.getSender(),
            {
                value: toNano('0.2'),
            },
            protocolRegister
        );
        const eventIdAfter = await universalRouter.getGetEventId();
        // Test whether the protocol register successfully
        expect(protocolRegisterResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: universalRouter.address,
            success: true
        });
        expect(eventIdBefore).toEqual(eventIdAfter - 1n);
        
        const childRouterAddress = await universalRouter.getGetChildRouterAddress(event.address);
        expect(protocolRegisterResult.transactions).toHaveTransaction({
            from: universalRouter.address,
            to: childRouterAddress,
            success: true
        });
        
    });
});
