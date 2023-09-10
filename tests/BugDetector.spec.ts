import { Blockchain, SandboxContract, TreasuryContract } from '@ton-community/sandbox';
import { beginCell, toNano } from 'ton-core';
import { BugDetector } from '../wrappers/BugDetector';
import '@ton-community/test-utils';
import { EventSignal, ProtcolRegister, SubscribeBody, UniversalRouter } from '../wrappers/UniversalRouter';
import { ChildRouter, CreateBody, DeleteSubscriber } from '../wrappers/ChildRouter';
import { Event, EventTrigger } from '../wrappers/Event';
import { Messenger } from '../wrappers/Messenger';
import { Follower } from '../wrappers/Follower';
import exp from 'constants';
describe('BugDetector', () => {
    let blockchain: Blockchain;
    let bugDetector: SandboxContract<BugDetector>;
    let universalRouter: SandboxContract<UniversalRouter>;
    let owner: SandboxContract<TreasuryContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        owner = await blockchain.treasury('owner');

        universalRouter = blockchain.openContract(await UniversalRouter.fromInit(owner.address));
        bugDetector = blockchain.openContract(await BugDetector.fromInit(owner.address, universalRouter.address));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await bugDetector.send(
            deployer.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        const deployResultUniversal = await universalRouter.send(
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
            to: bugDetector.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and bugDetector are ready to use
    });

    it('should register bug detectoer in  universal router', async () => {
        const protocolRegister: ProtcolRegister = {
            $$type: 'ProtcolRegister',
            maxUserStakeAmount: toNano('100'),
            subscribeFeePerTick: toNano('0.5'),
            sourceAddress: bugDetector.address, // oracle event
            template: beginCell().endCell(),
        };
        const registerResult = await bugDetector.send(
            owner.getSender(),
            {
                value: toNano('0.5'),
            },
            protocolRegister
        ); 
        
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


    });
});
