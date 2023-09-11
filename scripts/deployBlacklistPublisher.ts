import { toNano } from 'ton-core';
import { BlacklistPublisher } from '../wrappers/BlacklistPublisher';
import { NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const blacklistPublisher = provider.open(await BlacklistPublisher.fromInit());

    await blacklistPublisher.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(blacklistPublisher.address);

    // run methods on `blacklistPublisher`
}
