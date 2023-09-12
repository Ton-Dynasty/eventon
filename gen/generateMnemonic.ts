import * as fs from 'fs';
import { WalletContractV4 } from 'ton';
import { mnemonicNew, mnemonicToWalletKey } from 'ton-crypto';

const run = async () => {
    try {
        const mnemonic = await mnemonicNew(24);
        console.log('Generated Mnemonic:', mnemonic);

        // Save to .env file
        const envData = `WALLET_MNEMONIC=${mnemonic.join(' ')}\nWALLET_VERSION=v4\n`;
        fs.writeFileSync('.env.test', envData);
        console.log('Mnemonic saved to .env.test file.');
        const keypair = await mnemonicToWalletKey(mnemonic);
        console.log('Public Key:', keypair.publicKey);
        console.log('Secret Key:', keypair.secretKey);
        console.log('Address:', WalletContractV4.create({ workchain: 0, publicKey: keypair.publicKey }).address);
    } catch (error) {
        console.error('An error occurred:', error);
    }
};

run();
