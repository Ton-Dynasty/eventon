import { SandboxContract, TreasuryContract } from '@ton-community/sandbox';
import { ProtocolContract } from './types';
import { ProtcolRegister } from '../wrappers/UniversalRouter';
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
