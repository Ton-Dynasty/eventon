import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { toNano } from 'ton-core';
import { ProtocolCallback } from '../wrappers/ProtocolCallback';
import '@ton-community/test-utils';

describe('ProtocolCallback', () => {
    let blockchain: Blockchain;
    let protocolCallback: SandboxContract<ProtocolCallback>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        protocolCallback = blockchain.openContract(await ProtocolCallback.fromInit());

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await protocolCallback.send(
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
            to: protocolCallback.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and protocolCallback are ready to use
    });
});
