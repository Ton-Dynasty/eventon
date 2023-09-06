import { toNano } from 'ton-core';
import { ChildRouter } from '../wrappers/ChildRouter';
import { NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const childRouter = provider.open(await ChildRouter.fromInit());

    await childRouter.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(childRouter.address);

    // run methods on `childRouter`
}
