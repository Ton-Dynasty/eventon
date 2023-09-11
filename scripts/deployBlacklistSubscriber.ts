import { toNano } from 'ton-core';
import { BlacklistSubscriber } from '../wrappers/BlacklistSubscriber';
import { NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const blacklistSubscriber = provider.open(await BlacklistSubscriber.fromInit());

    await blacklistSubscriber.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(blacklistSubscriber.address);

    // run methods on `blacklistSubscriber`
}
