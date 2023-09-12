import { UniversalRouterClient } from '../lib/UniversalRouter';
import { Address, Sender, beginCell, contractAddress, toNano } from 'ton-core';
import * as dotenv from 'dotenv';
import { TonClient4 } from 'ton';
import { BugWarning, EventSourceRegister, ProtcolRegister, SetEventId } from '../compiled/tact_UniversalRouter';
import { BugDetector } from '../../../wrappers/BugDetector';

dotenv.config();

const UniversalRouterAddress = 'EQCuzDGZUvIkyQWviIplz_lSLkg69WeP4NqgwHese-Qi9xBB';
const BugDetectorAddress = 'EQDoog68bootdz4nfENLrJuHvxepYyhHJRbHO9mtZkkHRPti';
const UserDefaultCallbackAddress = 'EQAvl_1DoWeXAtk7UFBevxcEbuP8R95eYnf_NQCJuqCN-YI9';

describe('UniversalRouterClient', () => {
    it('Should load mnemonic from .env.test file', async () => {
        expect(process.env.WALLET_MNEMONIC).toBeTruthy();
    });

    it('Should access the router', async () => {
        const client = await UniversalRouterClient.fromAddress({
            routerAddress: Address.parse(UniversalRouterAddress),
            walletConfig: {
                mnemonic: process.env.WALLET_MNEMONIC!,
                workchain: 0,
            },
            timeout: 10000,
        });

        // Interact with the router
        expect((await client.router.getEventId()).toString()).toEqual(BigInt(0).toString());
        expect((await client.router.getOwner()).toString()).toEqual(client.underlyingWallet.address.toString());

        // Protocol registered
        let contract = client.tonClient.open(BugDetector.fromAddress(Address.parse(BugDetectorAddress)));
        let body: EventSourceRegister = {
            $$type: 'EventSourceRegister',
            template: beginCell().endCell(),
            sourceName: 'test',
            maxUserStakeAmount: toNano(10),
            subscribeFeePerTick: toNano(0.5),
        };
        await contract.send(client.getSender(), { value: toNano(1) }, body).catch((err) => console.error(err));

        // Set event id
        let setEventId: SetEventId = {
            $$type: 'SetEventId',
            eventId: 0n,
        };
        await contract.send(client.getSender(), { value: toNano(1) }, setEventId);

        // Check event id
        expect((await client.router.getEventId()).toString()).toEqual(BigInt(0).toString());

        // User subscribe protocol
        await client.subscribeEvent(
            {
                deadline: 0n,
                eventId: 0n,
                callbackAddress: Address.parse(UserDefaultCallbackAddress),
            },
            {
                value: toNano(1),
                bounce: false,
                simulate: false,
            }
        );

        // Send signal
        let buggy: BugWarning = {
            $$type: 'BugWarning',
            bugInfo: beginCell().endCell(),
            targetAdress: Address.parse('kQC8zFHM8LCMp9Xs--w3g9wmf7RwuDgJcQtV-oHZRSCqQSR1'),
        };
        await contract.send(client.getSender(), { value: toNano(1) }, buggy);
    });
});
