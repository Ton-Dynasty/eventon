import { toNano } from 'ton-core';
import { CopyTrading } from '../wrappers/CopyTrading';
import { NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const copyTrading = provider.open(await CopyTrading.fromInit());

    await copyTrading.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(copyTrading.address);

    // run methods on `copyTrading`
}
