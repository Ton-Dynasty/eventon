import { toNano } from 'ton-core';
import { Event } from '../wrappers/Event';
import { NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const event = provider.open(await Event.fromInit());

    await event.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(event.address);

    // run methods on `event`
}
