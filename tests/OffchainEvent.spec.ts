import { Blockchain, SandboxContract, TreasuryContract } from '@ton-community/sandbox';
import { mnemonicNew, mnemonicToWalletKey, KeyPair, sign } from 'ton-crypto';
import { SendMode, beginCell, toNano } from 'ton-core';
import {
    ExtMessage,
    OffchainEvent,
    OffchainEventSignal,
    SendParameters,
    storeSendParameters,
} from '../wrappers/EventOffchain';
import '@ton-community/test-utils';

describe('OffchainEvent', () => {
    let blockchain: Blockchain;
    let keyPair: KeyPair;
    let offchainEventContract: SandboxContract<OffchainEvent>;
    let deployer: SandboxContract<TreasuryContract>;
    let promiseEye: SandboxContract<TreasuryContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        deployer = await blockchain.treasury('deployer', { balance: toNano('100') });
        promiseEye = await blockchain.treasury('promiseEye');
        keyPair = await mnemonicToWalletKey(await mnemonicNew(24));
        offchainEventContract = blockchain.openContract(
            await OffchainEvent.fromInit(BigInt('0x' + keyPair.publicKey.toString('hex')), promiseEye.address)
        );

        const deployResult = await offchainEventContract.send(
            deployer.getSender(),
            {
                value: toNano('2'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: offchainEventContract.address,
            deploy: true,
            success: true,
        });

        const contract = await blockchain.getContract(offchainEventContract.address);
        contract.balance = toNano('10');
    });

    it('Should contains 10 TON balance', async () => {
        const val = (await blockchain.getContract(offchainEventContract.address)).balance;
        const expectedVal = toNano('10');
        expect(val.toString()).toEqual(expectedVal.toString());
    });

    it('Should verify signature', async () => {
        const currentTimestamp: number = Math.floor(Date.now() / 1000);
        const tenMinutesAfter: number = currentTimestamp + 600; // 10 minutes * 60 seconds/minute

        let eventId = 1n;
        let payload = beginCell().storeBit(0).endCell();
        let seqno = await offchainEventContract.getSeqno();
        let valid_until = BigInt(tenMinutesAfter);

        let sendParams: SendParameters = {
            $$type: 'SendParameters',
            to: offchainEventContract.address,
            value: 0n,
            body: beginCell().storeUint(eventId, 8).storeRef(payload).endCell(),
            mode: 1n,
            bounce: true,
            code: null,
            data: null,
        };

        let message_parameters = beginCell();
        storeSendParameters(sendParams)(message_parameters);
        let hash = beginCell()
            .storeUint(seqno, 32)
            .storeUint(valid_until, 32)
            .storeRef(message_parameters.endCell())
            .endCell()
            .hash();

        let msg: ExtMessage = {
            $$type: 'ExtMessage',
            signature: sign(hash, keyPair.secretKey),
            seqno: seqno,
            valid_until: valid_until,
            message_parameters: sendParams,
        };

        expect(await offchainEventContract.getGetPublicKey()).toEqual(BigInt('0x' + keyPair.publicKey.toString('hex')));
        await offchainEventContract.sendExternal(msg);
        expect(await offchainEventContract.getSeqno()).toEqual(BigInt(seqno + 1n));
    });
});
