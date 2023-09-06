import { Blockchain, SandboxContract, TreasuryContract } from '@ton-community/sandbox';
import { beginCell, contractAddress, StateInit, toNano } from 'ton-core';
import { UniversalRouter, EventTrigger, EventSignal } from '../wrappers/UniversalRouter';
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
                value: toNano('0.05'),
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
        const player = await blockchain.treasury('player');
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
        const result0 = await universalRouter.send(
            deployer.getSender(), 
            {
                value: toNano('10')
            },
            eventSignal
        );
        expect(result0.transactions).toHaveTransaction({
            from: deployer.address,
            to: universalRouter.address,
            exitCode: 3
        });

    });
});
