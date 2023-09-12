import { toNano } from 'ton-core';
import { BugDetector } from '../wrappers/BugDetector';
import { NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const bugDetector = provider.open(await BugDetector.fromInit());

    await bugDetector.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(bugDetector.address);

    // run methods on `bugDetector`
}
