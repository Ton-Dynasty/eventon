import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { toNano } from 'ton-core';
import { CallbackFactory } from '../wrappers/CallbackFactory';
import '@ton-community/test-utils';

describe('CallbackFactory', () => {
    let blockchain: Blockchain;
    let callbackFactory: SandboxContract<CallbackFactory>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        callbackFactory = blockchain.openContract(await CallbackFactory.fromInit());

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await callbackFactory.send(
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
            to: callbackFactory.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and callbackFactory are ready to use
    });
});
