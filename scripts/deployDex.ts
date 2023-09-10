import { toNano } from 'ton-core';
import { Dex } from '../wrappers/Dex';
import { NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const dex = provider.open(await Dex.fromInit());

    await dex.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(dex.address);

    // run methods on `dex`
}
