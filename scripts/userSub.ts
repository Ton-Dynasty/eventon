import { BlacklistPublisher } from '../wrappers/BlacklistPublisher';
import { NetworkProvider } from '@ton-community/blueprint';
import { UniversalRouterClient } from '../packages/sdk/lib/UniversalRouter'; //'/lib/UniversalRouter';
import { Address, Sender, beginCell, contractAddress, toNano } from 'ton-core';
import * as dotenv from 'dotenv';
import { TonClient4 } from 'ton';
import {
    BugWarning,
    EventSourceRegister,
    ProtcolRegister,
    SetEventId,
} from '../packages/sdk/compiled/tact_UniversalRouter'; //'../compiled/tact_UniversalRouter';
import { BugDetector } from '../wrappers/BugDetector'; //'../../../wrappers/BugDetector';

dotenv.config({ path: '.env.test' });

const UniversalRouterAddress = 'EQDgHbzuBG3bXP_0R_XEqc4nhcS7fwA2zR4VDeAaP4AcdUa2';
const BugDetectorAddress = 'EQBaAi0uBaT-JpBElFxYKCMiOhtaCvXvaiKYA9r0kB-gh4D3';
const UserDefaultCallbackAddress = 'EQAFcgv5ieBtRg-7G842_WU5xPxLLhrRNSPFpKzz7INDoEmR';
export async function run(provider: NetworkProvider) {
    const client = await UniversalRouterClient.fromAddress({
        routerAddress: Address.parse(UniversalRouterAddress),
        walletConfig: {
            mnemonic: process.env.WALLET_MNEMONIC!,
            workchain: 0,
        },
        timeout: 1030000,
    });
    let contract = client.tonClient.open(BugDetector.fromAddress(Address.parse(BugDetectorAddress)));
    // User subscribe protocol
    await client.subscribeEvent(
        {
            deadline: 0n,
            walletAddress: Address.parse('EQDiQBARi3FIiKs-0kI9t6i6GPnX-V1J4ZbADjYSLNE1uadA'),
            eventId: 0n,
            callbackAddress: Address.parse(UserDefaultCallbackAddress),
        },
        {
            value: toNano(1),
            bounce: false,
            simulate: false,
        }
    );
}
