import { CompilerConfig } from '@ton-community/blueprint';

export const compile: CompilerConfig = {
    lang: 'tact',
    target: 'contracts/blacklist_publisher.tact',
    options: {
        debug: true,
    },
};
