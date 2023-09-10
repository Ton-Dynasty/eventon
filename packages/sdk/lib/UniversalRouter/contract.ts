import { Address, Contract, beginCell, contractAddress } from 'ton-core';
import { WalletContractV4, TonClient4, TonClient4Parameters, OpenedContract } from 'ton';
import { SubscribeBody, UniversalRouter } from '../../compiled/tact_UniversalRouter';
import { CreateBody } from '../../compiled/tact_ChildRouter';
import { ABEyeValue } from '../utils/types';
import { ABEyeCellBuilder, ABIToSpecs } from '../utils/convert';
import { SmartContract } from '@ton-community/sandbox';

export interface UniversalRouterClientConfig extends TonClient4Parameters {}

export class UniversalRouterClient {
    client: TonClient4;
    router: OpenedContract<UniversalRouter>;

    constructor(universalRouterAddr: string, config?: UniversalRouterClientConfig) {
        if (config === undefined || config.endpoint === '') {
            config = {
                endpoint: 'https://sandbox-v4.tonhubapi.com',
            };
        }
        let client = new TonClient4(config);
        this.client = client;
        this.router = client.open(UniversalRouter.fromAddress(Address.parse(universalRouterAddr)));
    }

    async getRegisteredContracts() {}

    async deployUserDefaultCallbackContract(
        callbackAddress: string,
        eventId: BigInt,
        parameter?: ABEyeValue,
        config: { deadline?: BigInt } = {}
    ) {}

    async subscribeEvent() {}
    async unsubscribeEvent() {}
}
