import { Blockchain, SandboxContract, TreasuryContract } from '@ton-community/sandbox';
import { mnemonicNew, mnemonicToWalletKey, KeyPair, sign } from 'ton-crypto';
import { Address, beginCell, contractAddress, StateInit, toNano } from 'ton-core';
import { EventSignal, OffchainEvent, OffchainEventSignal } from '../wrappers/EventOffchain';
import { WalletContractV4 } from 'ton';
import '@ton-community/test-utils';
import { log } from 'console';

describe('OffchainEvent', () => {
    let blockchain: Blockchain;
    let keyPair: KeyPair;
    let wallet: WalletContractV4;
    let offchainEventContract: SandboxContract<OffchainEvent>;
    let deployer: SandboxContract<TreasuryContract>;
    let promiseEye: SandboxContract<TreasuryContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        deployer = await blockchain.treasury('deployer');
        promiseEye = await blockchain.treasury('promiseEye');
        keyPair = await mnemonicToWalletKey(await mnemonicNew(24));
        offchainEventContract = blockchain.openContract(
            await OffchainEvent.fromInit(keyPair.publicKey.readBigInt64LE(0), promiseEye.address)
        );
        wallet = WalletContractV4.create({ publicKey: keyPair.publicKey, workchain: 0 });

        const deployResult = await offchainEventContract.send(
            deployer.getSender(),
            {
                value: toNano('10'),
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
    });

    it('Should verify signature', async () => {
        const currentTimestamp: number = Math.floor(Date.now() / 1000);
        const tenMinutesAfter: number = currentTimestamp + 600; // 10 minutes * 60 seconds/minute

        let eventId = 1n;
        let payload = beginCell().endCell();
        let seqno = 0n;
        let valid_until = tenMinutesAfter;

        let hash = beginCell()
            .storeUint(seqno, 32)
            .storeUint(valid_until, 32)
            .storeUint(eventId, 32)
            .storeRef(payload)
            .endCell()
            .hash();

        let signature = beginCell().storeBuffer(sign(hash, keyPair.secretKey)).endCell();
        let msg: OffchainEventSignal = {
            $$type: 'OffchainEventSignal',
            seqno: seqno,
            eventId: eventId,
            payload: payload,
            signature: signature,
            valid_until: BigInt(valid_until),
        };

        console.log('msg: ', msg);
        console.log('deployer address: ', deployer.address);
        console.log('offchainEventContract address: ', offchainEventContract.address);
        expect(await offchainEventContract.getGetPublicKey()).toEqual(keyPair.publicKey.readBigInt64LE(0));
        expect(await offchainEventContract.sendExternal(msg)).not.toThrowError();
    });
});
