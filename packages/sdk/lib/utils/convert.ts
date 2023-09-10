import { Address, Builder, Cell, beginCell } from 'ton-core';
import { Spec, Field, ABEyeValue } from './types';

const simpleCellBuilder = (field: Field, payload: any, specs: Spec[]): Builder => {
    let builder = beginCell();
    let value = payload[field.name];

    const specForType = specs.find((s) => s.name === field.type.type);

    if (specForType) {
        // Found a spec for this type, it's a nested struct
        let _builder = recursiveBuilder(specs, field.type.type, value);
        return builder.storeRef(_builder.endCell());
    }

    switch (field.type.type) {
        case 'uint':
            if (field.type.format === 'coins') {
                builder = builder.storeCoins(value);
            } else {
                builder = builder.storeUint(value, field.type.format as number);
            }
            break;
        case 'int':
            builder = builder.storeInt(value, field.type.format as number);
            break;
        case 'address':
            builder = builder.storeAddress(Address.parse(value));
            break;
        case 'fixed-bytes':
            builder = builder.storeBuffer(Buffer.from(value, 'hex'), field.type.format as number);
        default:
            throw new Error(`Unrecognized type ${field.type.type}`);
    }
    return builder;
};

const recursiveBuilder = (specs: Spec[], name: string, payload: { [key: string]: any }): Builder => {
    const builder = beginCell();

    const spec = specs.find((s) => s.name === name);
    if (!spec) {
        throw new Error(`No spec found for ${name}`);
    }

    for (const field of spec.fields) {
        const fieldBuilder = simpleCellBuilder(field, payload, specs);
        builder.storeBuilder(fieldBuilder);
    }

    return builder;
};

export const ABEyeBuilder = (specs: Spec[], value: ABEyeValue): Cell => {
    const builder = recursiveBuilder(specs, value.name, value.payload);
    return builder.endCell();
};
