import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { toNano } from 'ton-core';
import { BlacklistSubscriber } from '../wrappers/BlacklistSubscriber';
import '@ton-community/test-utils';

describe('BlacklistSubscriber', () => {
    let blockchain: Blockchain;
    let blacklistSubscriber: SandboxContract<BlacklistSubscriber>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        blacklistSubscriber = blockchain.openContract(await BlacklistSubscriber.fromInit());

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await blacklistSubscriber.send(
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
            to: blacklistSubscriber.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and blacklistSubscriber are ready to use
    });
});
