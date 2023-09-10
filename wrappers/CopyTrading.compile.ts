import { CompilerConfig } from '@ton-community/blueprint';

export const compile: CompilerConfig = {
    lang: 'tact',
    target: 'contracts/copy_trading.tact',
    options: {
        debug: true,
    },
};
