import { SandboxContract, TreasuryContract } from '@ton-community/sandbox';
import { BaseContract, ProtocolContract } from './types';
import { CreateBody, ProtcolRegister, SubscribeBody, UniversalRouter } from '../wrappers/UniversalRouter';
import { Address, beginCell, toNano } from 'ton-core';

export async function protocolRegister(
    protocol: SandboxContract<ProtocolContract>,
    deployer: SandboxContract<TreasuryContract>
) {
    // Register the protocol
    const protocolRegister: ProtcolRegister = {
        $$type: 'ProtcolRegister',
        maxUserStakeAmount: toNano('100'),
        subscribeFeePerTick: toNano('0.5'),
        sourceAddress: protocol.address, // oracle event
        template: beginCell().endCell(),
    };

    const res = await protocol.send(
        deployer.getSender(),
        {
            value: toNano('10'),
        },
        protocolRegister
    );
    return res;
}

export async function userSubscribe(
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

    const res = await universalRouter.send(
        user.getSender(),
        {
            value: toNano('10'),
        },
        subscribeBody
    );
    return res;
}

export async function userCreateCallback(
    universalRouter: SandboxContract<UniversalRouter>,
    deployer: SandboxContract<TreasuryContract>
) {
    const createBody: CreateBody = {
        $$type: 'CreateBody',
        walletAddress: deployer.address, // Assuming deployer is the user for simplicity.
        deadline: 100n, // 60 seconds from now, adjust as required.
        eventId: 0n,
        parameter: beginCell().endCell(), // Assuming a simple cell, adjust as required.
    };
    const res = await universalRouter.send(
        deployer.getSender(),
        {
            value: toNano('100'), // Adjust as required.
        },
        createBody
    );
    return res;
}

export async function deployProtocol(
    protocol: SandboxContract<BaseContract>,
    deployer: SandboxContract<TreasuryContract>,
    value: bigint
) {
    const deployResult = await protocol.send(
        deployer.getSender(),
        {
            value: value,
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );
    return deployResult;
}
