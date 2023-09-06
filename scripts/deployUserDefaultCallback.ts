import { toNano } from 'ton-core';
import { UserDefaultCallback } from '../wrappers/UserDefaultCallback';
import { NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const userDefaultCallback = provider.open(await UserDefaultCallback.fromInit());

    await userDefaultCallback.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(userDefaultCallback.address);

    // run methods on `userDefaultCallback`
}
