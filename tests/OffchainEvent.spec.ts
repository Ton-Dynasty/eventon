import { Blockchain, SandboxContract, TreasuryContract } from '@ton-community/sandbox';
import { mnemonicNew, mnemonicToWalletKey, KeyPair, sign } from 'ton-crypto';
import { beginCell, toNano } from 'ton-core';
import { OffchainEvent, OffchainEventSignal } from '../wrappers/EventOffchain';
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
        keyPair = await mnemonicToWalletKey(await mnemonicNew(24), '123');
        offchainEventContract = blockchain.openContract(
            await OffchainEvent.fromInit(keyPair.publicKey.readBigInt64LE(0), promiseEye.address)
        );

        const deployResult = await offchainEventContract.send(
            deployer.getSender(),
            {
                value: toNano('0.8'),
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
        let seqno = 0n;
        let valid_until = tenMinutesAfter;

        let hash = beginCell()
            .storeUint(seqno, 32)
            .storeUint(valid_until, 32)
            .storeUint(eventId, 8)
            .storeRef(payload)
            .endCell()
            .hash();

        let signature = beginCell().storeBuffer(sign(hash, keyPair.secretKey)).endCell();
        let msg: OffchainEventSignal = {
            $$type: 'OffchainEventSignal',
            seqno: seqno,
            valid_until: BigInt(valid_until),
            eventId: eventId,
            payload: payload,
            signature: signature,
        };
        console.log('offchain hash: ', hash.readBigInt64LE());
        expect(await offchainEventContract.getGetPublicKey()).toEqual(keyPair.publicKey.readBigInt64LE(0));
        expect(await offchainEventContract.sendExternal(msg)).not.toThrowError();
    });
});
