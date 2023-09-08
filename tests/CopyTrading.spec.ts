import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { toNano } from 'ton-core';
import { CopyTrading } from '../wrappers/CopyTrading';
import '@ton-community/test-utils';

describe('CopyTrading', () => {
    let blockchain: Blockchain;
    let copyTrading: SandboxContract<CopyTrading>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        copyTrading = blockchain.openContract(await CopyTrading.fromInit());

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await copyTrading.send(
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
            to: copyTrading.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and copyTrading are ready to use
    });
});
