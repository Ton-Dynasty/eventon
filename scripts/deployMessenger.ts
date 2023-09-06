import { toNano } from 'ton-core';
import { Messenger } from '../wrappers/Messenger';
import { NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const messenger = provider.open(await Messenger.fromInit());

    await messenger.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(messenger.address);

    // run methods on `messenger`
}
