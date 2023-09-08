import { CompilerConfig } from '@ton-community/blueprint';

export const compile: CompilerConfig = {
    lang: 'tact',
    target: 'contracts/event_offchain.tact',
    options: {
        debug: true,
        external: true,
    },
};
