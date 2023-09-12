import { Maybe } from 'ton-core/dist/utils/maybe';

export type Spec = {
    name: string; // struct name
    header?: number; // struct header
    fields: Field[]; // struct fields
};

export type Field = {
    name: string; // Field name
    type: Type; // Field type
};

export type Type = {
    kind: string;
    type: string; // 'uint' | 'int' | 'address' | 'slice' | 'cell' | 'struct' or another ABEyeField.name
    optional?: boolean; // true | false
    format?: Maybe<string | number | boolean>; // 32 | 64 | 128 | 256 | 'coins' | ...
};

export type ABEyeValue = {
    name: string;
    payload: { [key: string]: any };
};
