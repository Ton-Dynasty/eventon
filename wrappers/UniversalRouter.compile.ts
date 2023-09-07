import { CompilerConfig } from '@ton-community/blueprint';

export const compile: CompilerConfig = {
    lang: 'tact',
    target: 'contracts/universal_router.tact',
    options: {
        "debug": true,
    },
};
