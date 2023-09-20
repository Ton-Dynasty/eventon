import { beginCell, toNano } from 'ton-core';
import { BugDetector, EventSourceRegister } from '../wrappers/BugDetector';
import { NetworkProvider } from '@ton-community/blueprint';
import { Address } from 'ton-core';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

export async function run(provider: NetworkProvider) {
    const owner = provider.sender().address!;

    const universalRouterAddress = Address.parse('EQDgHbzuBG3bXP_0R_XEqc4nhcS7fwA2zR4VDeAaP4AcdUa2');
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
    const eventSrcRegister: EventSourceRegister = {
        $$type: 'EventSourceRegister',
        maxUserStakeAmount: toNano('10'),
        subscribeFeePerTick: toNano('0.5'),
        template: beginCell().endCell(),
        sourceName: 'test',
    };
    const registerResult = await bugDetector.send(
        provider.sender(),
        {
            value: toNano('0.5'),
        },
        eventSrcRegister
    );

    // run methods on `bugDetector`
}
