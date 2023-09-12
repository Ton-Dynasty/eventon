import { toNano } from 'ton-core';
import { BugDetector } from '../wrappers/BugDetector';
import { NetworkProvider } from '@ton-community/blueprint';
import { Address } from 'ton-core';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

export async function run(provider: NetworkProvider) {
    const owner = provider.sender().address!;
    const universalRouterAddress = Address.parse('EQCuzDGZUvIkyQWviIplz_lSLkg69WeP4NqgwHese-Qi9xBB');
    const bugDetector = provider.open(await BugDetector.fromInit(owner, universalRouterAddress));

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
