import { SandboxContract, TreasuryContract } from '@ton-community/sandbox';
import { ProtocolContract } from './types';
import { ProtcolRegister, SubscribeBody, UniversalRouter } from '../wrappers/UniversalRouter';
import { Address, beginCell, toNano } from 'ton-core';

export async function protocolRegister(
    protocol: SandboxContract<ProtocolContract>,
    deployer: SandboxContract<TreasuryContract>,
    sourceAddress: Address
) {
    // Register the protocol
    const protocolRegister: ProtcolRegister = {
        $$type: 'ProtcolRegister',
        maxUserStakeAmount: toNano('100'),
        subscribeFeePerTick: toNano('0.5'),
        sourceAddress: sourceAddress, // oracle event
        template: beginCell().endCell(),
    };

    await protocol.send(
        deployer.getSender(),
        {
            value: toNano('10'),
        },
        protocolRegister
    );
}

export async function userRegister(
    universalRouter: SandboxContract<UniversalRouter>,
    eventId: bigint,
    user: SandboxContract<TreasuryContract>,
    callbackAddress: Address
) {
    //await protocolRegsiter(oracle.address, trader); // Simply call the function to handle the registration
    const subscribeBody: SubscribeBody = {
        $$type: 'SubscribeBody',
        walletAddress: user.address, // Owner address of callback contract
        deadline: 100n, // The deadline of the msg can delay
        eventId: eventId, // The even id which user want to subscribe
        callbackAddress: callbackAddress, // Callback contract address written by user
    };

    await universalRouter.send(
        user.getSender(),
        {
            value: toNano('10'),
        },
        subscribeBody
    );
}
