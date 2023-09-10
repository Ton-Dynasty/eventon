import { Address, Contract, contractAddress } from 'ton-core';
import { WalletContractV4, TonClient4, TonClient4Parameters, OpenedContract } from 'ton';
import { SubscribeBody, UniversalRouter } from './tact_UniversalRouter';
import { CreateBody } from './tact_ChildRouter';

export interface UniversalRouterClientConfig extends TonClient4Parameters {}

export class UniversalRouterClient {
    router: OpenedContract<UniversalRouter>;

    constructor(universalRouterAddr: string, config?: UniversalRouterClientConfig) {
        if (config === undefined || config.endpoint === '') {
            config = {
                endpoint: 'https://sandbox-v4.tonhubapi.com',
            };
        }
        let client = new TonClient4(config);
        this.router = client.open(UniversalRouter.fromAddress(Address.parse(universalRouterAddr)));
    }

    async deployUserDefaultCallbackContract(message: CreateBody) {
        this.router.send();
    }
    async subscribeEvent() {}
    async unsubscribeEvent() {}
}
