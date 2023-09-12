import { HttpApi, OpenedContract, TonClient4, WalletContractV4 } from 'ton';
import { Address, Cell, beginCell } from 'ton-core';
import { Maybe } from 'ton/dist/utils/maybe';
import { KeyPair, mnemonicToHDSeed, mnemonicToWalletKey } from 'ton-crypto';
import {
    DeleteSubscriber,
    SubscribeBody,
    UniversalRouter,
    storeDeleteSubscriber,
    storeSubscribeBody,
} from '../../compiled/tact_UniversalRouter';
import { UserDefaultCallback, Deploy } from '../../compiled/tact_UserDefaultCallback';
import { createNetworkProvider } from '@ton-community/blueprint';

export const mainnetEndpoint = 'https://mainnet-v4.tonhubapi.com';
export const testnetEndpoint = 'https://sandbox-v4.tonhubapi.com';

export interface WalletConfig {
    mnemonic: string;
    workchain: number;
    walletId?: Maybe<number>;
}

export interface ClientConfigFromAddress {
    routerAddress: Address;
    walletConfig: WalletConfig;
    mainnet?: boolean;
}

export interface ClientConfig {
    walletConfig: WalletConfig;
    mainnet?: boolean;
}

export interface MessageOpts {
    value: bigint;
    bounce?: boolean;
    simulate?: boolean; // if true, the message is not sent, return the estimated fees
}

export interface Fees {
    in_fwd_fee: number;
    storage_fee: number;
    gas_fee: number;
    fwd_fee: number;
}

export class UniversalRouterClient {
    public tonClient: TonClient4;
    public underlyingWallet: OpenedContract<WalletContractV4>;
    public router: OpenedContract<UniversalRouter>;
    private api: HttpApi;
    private keypair: KeyPair;

    private constructor(
        tonClient: TonClient4,
        api: HttpApi,
        router: UniversalRouter,
        keypair: KeyPair,
        wallet: WalletContractV4
    ) {
        this.tonClient = tonClient;
        this.api = api;
        this.router = tonClient.open(router);
        this.keypair = keypair;
        this.underlyingWallet = tonClient.open(wallet);
    }

    static async fromAddress(config: ClientConfigFromAddress) {
        let endpoint = config.mainnet ? mainnetEndpoint : testnetEndpoint;
        const client = new TonClient4({ endpoint: endpoint });
        const api = new HttpApi(endpoint);
        const { mnemonic, workchain, walletId } = config.walletConfig;
        const router = UniversalRouter.fromAddress(config.routerAddress);
        const keypair = await mnemonicToWalletKey(mnemonic.split(' '));
        const wallet = WalletContractV4.create({
            workchain: workchain,
            publicKey: keypair.publicKey,
            walletId: walletId,
        });
        return new UniversalRouterClient(client, api, router, keypair, wallet);
    }

    getSender() {
        return this.underlyingWallet.sender(this.keypair.secretKey);
    }

    private async estimateFee(address: Address, body: Cell): Promise<Fees> {
        const estimation = await this.api.estimateFee(address, {
            body: body,
            initCode: null,
            initData: null,
            ignoreSignature: true,
        });
        return {
            in_fwd_fee: estimation.source_fees.in_fwd_fee,
            storage_fee: estimation.source_fees.storage_fee,
            gas_fee: estimation.source_fees.gas_fee,
            fwd_fee: estimation.source_fees.fwd_fee,
        };
    }

    /**
     * Get all details of every registered contract
     */
    async getRegisteredContracts(eventSrcAddr: string) {
        console.log('getRegisteredContracts', this.api.endpoint);
        // childRouter is a mapping from event source address to child router address
        const childRouter = await this.router.getChildRouterAddress(Address.parse(eventSrcAddr));
        const txs = await this.api.getTransactions(childRouter, { limit: 0 });
        for (const tx of txs) {
            for (const msg of tx.out_msgs) {
                msg.msg_data;
            }
        }
    }

    async deployUserDefaultCallbackContract(opts: MessageOpts) {
        // TODO BUG master will remove in the future
        const master = this.underlyingWallet.address;
        const wallet = this.underlyingWallet.address;
        const cell = beginCell().endCell();
        const userDefaultCallback = await UserDefaultCallback.fromInit(master, wallet, cell);
        return await this.tonClient.open(userDefaultCallback).send(
            this.getSender(),
            {
                value: opts.value,
                bounce: opts.bounce,
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );
    }

    /**
     * subscribeEvent subscribes to the event with the given id
     */
    async subscribeEvent(
        param: { deadline: bigint; eventId: bigint; callbackAddress: Address; walletAddress?: Address },
        opts: MessageOpts
    ): Promise<Fees | void> {
        let body: SubscribeBody = {
            $$type: 'SubscribeBody',
            walletAddress: param.walletAddress || this.getSender().address!,
            deadline: param.deadline,
            eventId: param.eventId,
            callbackAddress: param.callbackAddress,
        };
        if (opts.simulate) {
            const cell = beginCell();
            storeSubscribeBody(body)(cell);
            return this.estimateFee(this.router.address, cell.asCell());
        }
        const result = await this.router.send(this.getSender(), opts, body);
        return result;
    }

    /**
     * unsubscribeEvent unsubscribes from the event with the given id
     */
    async unsubscribeEvent(
        param: { callbackAddress: Address; eventId: bigint; walletAddress: Address },
        opts: MessageOpts
    ) {
        let body: DeleteSubscriber = {
            $$type: 'DeleteSubscriber',
            walletAddress: param.walletAddress || this.getSender().address!,
            callbackAddress: param.callbackAddress,
            eventId: param.eventId,
        };
        if (opts.simulate) {
            const cell = beginCell();
            storeDeleteSubscriber(body)(cell);
            console.log('Before estimateFee');
            return this.estimateFee(this.router.address, cell.asCell());
        }
        const result = await this.router.send(this.getSender(), opts, body);
        return result;
    }
}
