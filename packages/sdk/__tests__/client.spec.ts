import { UniversalRouterClient } from '../lib/UniversalRouter';
import { Address, Sender, beginCell, contractAddress, toNano } from 'ton-core';
import * as dotenv from 'dotenv';
import { TonClient4 } from 'ton';
import { EventSourceRegister, ProtcolRegister } from '../compiled/tact_UniversalRouter';
import { BugDetector } from '../../../wrappers/BugDetector';

dotenv.config();

const Deployer = 'EQB_IbNTgL7I1pcVTOn_hpu90k2glmf9e1B17u55W4_eeKxe';
const UniversalRouterAddress = 'EQABJ7PW-xIZT9pOEwxJI_QjraFK-MlxkxhhmUsuAItl6Ewe';
const BugDetectorAddress = 'EQAHm1BCcGDPC2fgRzLHxEIUe0PheW03NcHhA1_YuWhm_qyJ';
const UserDefaultCallbackAddress = 'EQCaI2cv9SrMJC8UyuNQrzIRtxm9VYegiomsCiUCOF3WlH';

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

        const result = await contract.send(client.getSender(), { value: 1n }, body).catch((err) => console.error(err));
        console.log(result);

        // User Create `UserDefaultCallback`
        const deployOutput = await client.deployUserDefaultCallbackContract({ value: toNano(1) });
        console.log(deployOutput);

        // User subscribe protocol
        const rtn = await client.subscribeEvent(
            {
                deadline: 0n,
                eventId: 0n,
                callbackAddress: Address.parse(UserDefaultCallbackAddress),
            },
            {
                value: toNano(1),
                bounce: false,
                simulate: true,
            }
        );
        console.log(rtn);
    });
});
