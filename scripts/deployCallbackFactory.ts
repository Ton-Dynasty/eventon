import { toNano } from 'ton-core';
import { CallbackFactory } from '../wrappers/CallbackFactory';
import { NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const callbackFactory = provider.open(await CallbackFactory.fromInit());

    await callbackFactory.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(callbackFactory.address);

    // run methods on `callbackFactory`
}
