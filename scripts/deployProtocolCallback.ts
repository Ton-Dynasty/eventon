import { toNano } from 'ton-core';
import { ProtocolCallback } from '../wrappers/ProtocolCallback';
import { NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const protocolCallback = provider.open(await ProtocolCallback.fromInit());

    await protocolCallback.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(protocolCallback.address);

    // run methods on `protocolCallback`
}
