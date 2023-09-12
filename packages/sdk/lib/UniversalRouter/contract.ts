import { Address, Contract, beginCell, contractAddress } from 'ton-core';
import { WalletContractV4, TonClient4, TonClient4Parameters, OpenedContract } from 'ton';
import { SubscribeBody, UniversalRouter } from '../../compiled/tact_UniversalRouter';
import { CreateBody } from '../../compiled/tact_ChildRouter';
import { ABEyeValue } from '../utils/types';
import { ABEyeCellBuilder, ABIToSpecs } from '../utils/convert';
import { SmartContract } from '@ton-community/sandbox';
import { KeyPair, mnemonicToWalletKey } from 'ton-crypto';
import { Maybe } from 'ton-core/dist/utils/maybe';

export const mainnetEndpoint = 'https://mainnet-v4.tonhubapi.com';
export const testnetEndpoint = 'https://sandbox-v4.tonhubapi.com';

export interface WalletConfig {
    mnemonic: string;
    workchain: number;
    walletId?: Maybe<number>;
}

export interface UniversalRouterClientConfig {
    routerAddress: string;
    walletConfig: WalletConfig;
    mainnet?: boolean;
}

export interface MessageOpts {
    value: bigint;
    bounce?: boolean;
}

export class UniversalRouterClient {
    client: TonClient4;
    router: OpenedContract<UniversalRouter>;
    private keypair: KeyPair;
    private underlyingWallet: OpenedContract<WalletContractV4>;

    private constructor(client: TonClient4, router: UniversalRouter, keypair: KeyPair, wallet: WalletContractV4) {
        this.client = client;
        this.router = client.open(router);
        this.keypair = keypair;
        this.underlyingWallet = client.open(wallet);
    }

    static async fromConfig(config: UniversalRouterClientConfig) {
        const client = new TonClient4({
            endpoint: config.mainnet ? mainnetEndpoint : testnetEndpoint,
        });
        const { mnemonic, workchain, walletId } = config.walletConfig;
        const router = UniversalRouter.fromAddress(Address.parse(config.routerAddress));
        const keypair = await mnemonicToWalletKey(mnemonic.split(' '));
        const wallet = WalletContractV4.create({
            workchain: workchain,
            publicKey: keypair.publicKey,
            walletId: walletId,
        });
        return new UniversalRouterClient(client, router, keypair, wallet);
    }

    // Private methods

    private getSender() {
        return this.underlyingWallet.sender(this.keypair.secretKey);
    }

    // Public methods

    async getRegisteredContracts() {}

    async deployUserDefaultCallbackContract() {}

    async subscribeEvent(
        param: { walletAddress: Address; deadline: bigint; eventId: bigint; callbackAddress: Address },
        opts: MessageOpts
    ) {
        let body: SubscribeBody = {
            $$type: 'SubscribeBody',
            walletAddress: param.walletAddress,
            deadline: param.deadline,
            eventId: param.eventId,
            callbackAddress: param.callbackAddress,
        };
        const result = this.router.send(this.getSender(), opts, body);
    }

    async unsubscribeEvent() {}
}
