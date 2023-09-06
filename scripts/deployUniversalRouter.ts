import { toNano } from 'ton-core';
import { UniversalRouter } from '../wrappers/UniversalRouter';
import { NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const universalRouter = provider.open(await UniversalRouter.fromInit());

    await universalRouter.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(universalRouter.address);

    // run methods on `universalRouter`
}
