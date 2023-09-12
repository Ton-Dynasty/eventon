import { beginCell, toNano } from 'ton-core';
import { UserDefaultCallback } from '../wrappers/UserDefaultCallback';
import { NetworkProvider } from '@ton-community/blueprint';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

export async function run(provider: NetworkProvider) {
    // TODO BUG: master will be remove in the future
    const master = provider.sender().address!;
    const owner = provider.sender().address!;
    const userDefaultCallback = provider.open(await UserDefaultCallback.fromInit(master, owner, beginCell().endCell()));

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
