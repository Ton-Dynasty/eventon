import { Spec, Field } from '../lib/utils/types'; // Replace with the actual path to your code
import { Address, Builder, beginCell } from 'ton-core';
import { Maybe } from 'ton-core/dist/utils/maybe';
import { ABEyeCellBuilder } from '../lib/utils/convert';

const specs: Spec[] = [
    {
        name: 'EventTrigger',
        fields: [
            {
                name: 'value',
                type: {
                    kind: 'simple',
                    type: 'int',
                    optional: false,
                    format: 257,
                },
            },
            {
                name: 'address',
                type: {
                    kind: 'simple',
                    type: 'address',
                    optional: false,
                },
            },
            {
                name: 'info',
                type: {
                    kind: 'simple',
                    type: 'EventSignal',
                    optional: false,
                },
            },
        ],
    },
    {
        name: 'EventSignal',
        fields: [
            {
                name: 'eventId',
                type: {
                    kind: 'simple',
                    type: 'int',
                    optional: false,
                    format: 257,
                },
            },
            {
                name: 'payload',
                type: {
                    kind: 'simple',
                    type: 'PriceChange',
                    optional: false,
                },
            },
        ],
    },
    {
        name: 'PriceChange',
        fields: [
            {
                name: 'token',
                type: {
                    kind: 'simple',
                    type: 'address',
                    optional: false,
                },
            },
            {
                name: 'change',
                type: {
                    kind: 'simple',
                    type: 'int',
                    optional: false,
                    format: 257,
                },
            },
        ],
    },
];

describe('ABEyeBuilder', () => {
    it('Should parse a simple struct', () => {
        const valueToEncode = {
            name: 'EventTrigger',
            payload: {
                value: 123,
                address: 'kQC8zFHM8LCMp9Xs--w3g9wmf7RwuDgJcQtV-oHZRSCqQSR1',
                info: {
                    eventId: 456,
                    payload: {
                        token: 'kQC8zFHM8LCMp9Xs--w3g9wmf7RwuDgJcQtV-oHZRSCqQSR1',
                        change: 789,
                    },
                },
            },
        };
        const builder = ABEyeCellBuilder(specs, valueToEncode);

        const innerBuilder = beginCell()
            .storeAddress(Address.parse('kQC8zFHM8LCMp9Xs--w3g9wmf7RwuDgJcQtV-oHZRSCqQSR1'))
            .storeInt(789, 257)
            .endCell();
        const middleBuilder = beginCell().storeInt(456, 257).storeRef(innerBuilder);
        const expectedCell = beginCell()
            .storeInt(123, 257)
            .storeAddress(Address.parse('kQC8zFHM8LCMp9Xs--w3g9wmf7RwuDgJcQtV-oHZRSCqQSR1'))
            .storeRef(middleBuilder)
            .endCell();

        expect(builder.toString()).toEqual(expectedCell.toString());
    });
});
