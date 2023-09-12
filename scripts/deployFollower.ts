import { toNano } from 'ton-core';
import { Follower } from '../wrappers/Follower';
import { NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const follower = provider.open(await Follower.fromInit());

    await follower.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(follower.address);

    // run methods on `follower`
}
