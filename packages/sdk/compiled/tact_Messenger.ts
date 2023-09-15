import { 
    Cell,
    Slice, 
    Address, 
    Builder, 
    beginCell, 
    ComputeError, 
    TupleItem, 
    TupleReader, 
    Dictionary, 
    contractAddress, 
    ContractProvider, 
    Sender, 
    Contract, 
    ContractABI, 
    ABIType,
    ABIGetter,
    ABIReceiver,
    TupleBuilder,
    DictionaryValue
} from 'ton-core';

export type StateInit = {
    $$type: 'StateInit';
    code: Cell;
    data: Cell;
}

export function storeStateInit(src: StateInit) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeRef(src.code);
        b_0.storeRef(src.data);
    };
}

export function loadStateInit(slice: Slice) {
    let sc_0 = slice;
    let _code = sc_0.loadRef();
    let _data = sc_0.loadRef();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

function loadTupleStateInit(source: TupleReader) {
    let _code = source.readCell();
    let _data = source.readCell();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

function storeTupleStateInit(source: StateInit) {
    let builder = new TupleBuilder();
    builder.writeCell(source.code);
    builder.writeCell(source.data);
    return builder.build();
}

function dictValueParserStateInit(): DictionaryValue<StateInit> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeStateInit(src)).endCell());
        },
        parse: (src) => {
            return loadStateInit(src.loadRef().beginParse());
        }
    }
}

export type Context = {
    $$type: 'Context';
    bounced: boolean;
    sender: Address;
    value: bigint;
    raw: Cell;
}

export function storeContext(src: Context) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeBit(src.bounced);
        b_0.storeAddress(src.sender);
        b_0.storeInt(src.value, 257);
        b_0.storeRef(src.raw);
    };
}

export function loadContext(slice: Slice) {
    let sc_0 = slice;
    let _bounced = sc_0.loadBit();
    let _sender = sc_0.loadAddress();
    let _value = sc_0.loadIntBig(257);
    let _raw = sc_0.loadRef();
    return { $$type: 'Context' as const, bounced: _bounced, sender: _sender, value: _value, raw: _raw };
}

function loadTupleContext(source: TupleReader) {
    let _bounced = source.readBoolean();
    let _sender = source.readAddress();
    let _value = source.readBigNumber();
    let _raw = source.readCell();
    return { $$type: 'Context' as const, bounced: _bounced, sender: _sender, value: _value, raw: _raw };
}

function storeTupleContext(source: Context) {
    let builder = new TupleBuilder();
    builder.writeBoolean(source.bounced);
    builder.writeAddress(source.sender);
    builder.writeNumber(source.value);
    builder.writeSlice(source.raw);
    return builder.build();
}

function dictValueParserContext(): DictionaryValue<Context> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeContext(src)).endCell());
        },
        parse: (src) => {
            return loadContext(src.loadRef().beginParse());
        }
    }
}

export type SendParameters = {
    $$type: 'SendParameters';
    bounce: boolean;
    to: Address;
    value: bigint;
    mode: bigint;
    body: Cell | null;
    code: Cell | null;
    data: Cell | null;
}

export function storeSendParameters(src: SendParameters) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeBit(src.bounce);
        b_0.storeAddress(src.to);
        b_0.storeInt(src.value, 257);
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        if (src.code !== null && src.code !== undefined) { b_0.storeBit(true).storeRef(src.code); } else { b_0.storeBit(false); }
        if (src.data !== null && src.data !== undefined) { b_0.storeBit(true).storeRef(src.data); } else { b_0.storeBit(false); }
    };
}

export function loadSendParameters(slice: Slice) {
    let sc_0 = slice;
    let _bounce = sc_0.loadBit();
    let _to = sc_0.loadAddress();
    let _value = sc_0.loadIntBig(257);
    let _mode = sc_0.loadIntBig(257);
    let _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    let _code = sc_0.loadBit() ? sc_0.loadRef() : null;
    let _data = sc_0.loadBit() ? sc_0.loadRef() : null;
    return { $$type: 'SendParameters' as const, bounce: _bounce, to: _to, value: _value, mode: _mode, body: _body, code: _code, data: _data };
}

function loadTupleSendParameters(source: TupleReader) {
    let _bounce = source.readBoolean();
    let _to = source.readAddress();
    let _value = source.readBigNumber();
    let _mode = source.readBigNumber();
    let _body = source.readCellOpt();
    let _code = source.readCellOpt();
    let _data = source.readCellOpt();
    return { $$type: 'SendParameters' as const, bounce: _bounce, to: _to, value: _value, mode: _mode, body: _body, code: _code, data: _data };
}

function storeTupleSendParameters(source: SendParameters) {
    let builder = new TupleBuilder();
    builder.writeBoolean(source.bounce);
    builder.writeAddress(source.to);
    builder.writeNumber(source.value);
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeCell(source.code);
    builder.writeCell(source.data);
    return builder.build();
}

function dictValueParserSendParameters(): DictionaryValue<SendParameters> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeSendParameters(src)).endCell());
        },
        parse: (src) => {
            return loadSendParameters(src.loadRef().beginParse());
        }
    }
}

export type Deploy = {
    $$type: 'Deploy';
    queryId: bigint;
}

export function storeDeploy(src: Deploy) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(2490013878, 32);
        b_0.storeUint(src.queryId, 64);
    };
}

export function loadDeploy(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 2490013878) { throw Error('Invalid prefix'); }
    let _queryId = sc_0.loadUintBig(64);
    return { $$type: 'Deploy' as const, queryId: _queryId };
}

function loadTupleDeploy(source: TupleReader) {
    let _queryId = source.readBigNumber();
    return { $$type: 'Deploy' as const, queryId: _queryId };
}

function storeTupleDeploy(source: Deploy) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    return builder.build();
}

function dictValueParserDeploy(): DictionaryValue<Deploy> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeDeploy(src)).endCell());
        },
        parse: (src) => {
            return loadDeploy(src.loadRef().beginParse());
        }
    }
}

export type DeployOk = {
    $$type: 'DeployOk';
    queryId: bigint;
}

export function storeDeployOk(src: DeployOk) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(2952335191, 32);
        b_0.storeUint(src.queryId, 64);
    };
}

export function loadDeployOk(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 2952335191) { throw Error('Invalid prefix'); }
    let _queryId = sc_0.loadUintBig(64);
    return { $$type: 'DeployOk' as const, queryId: _queryId };
}

function loadTupleDeployOk(source: TupleReader) {
    let _queryId = source.readBigNumber();
    return { $$type: 'DeployOk' as const, queryId: _queryId };
}

function storeTupleDeployOk(source: DeployOk) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    return builder.build();
}

function dictValueParserDeployOk(): DictionaryValue<DeployOk> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeDeployOk(src)).endCell());
        },
        parse: (src) => {
            return loadDeployOk(src.loadRef().beginParse());
        }
    }
}

export type FactoryDeploy = {
    $$type: 'FactoryDeploy';
    queryId: bigint;
    cashback: Address;
}

export function storeFactoryDeploy(src: FactoryDeploy) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(1829761339, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.cashback);
    };
}

export function loadFactoryDeploy(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 1829761339) { throw Error('Invalid prefix'); }
    let _queryId = sc_0.loadUintBig(64);
    let _cashback = sc_0.loadAddress();
    return { $$type: 'FactoryDeploy' as const, queryId: _queryId, cashback: _cashback };
}

function loadTupleFactoryDeploy(source: TupleReader) {
    let _queryId = source.readBigNumber();
    let _cashback = source.readAddress();
    return { $$type: 'FactoryDeploy' as const, queryId: _queryId, cashback: _cashback };
}

function storeTupleFactoryDeploy(source: FactoryDeploy) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.cashback);
    return builder.build();
}

function dictValueParserFactoryDeploy(): DictionaryValue<FactoryDeploy> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeFactoryDeploy(src)).endCell());
        },
        parse: (src) => {
            return loadFactoryDeploy(src.loadRef().beginParse());
        }
    }
}

export type ChangeOwner = {
    $$type: 'ChangeOwner';
    queryId: bigint;
    newOwner: Address;
}

export function storeChangeOwner(src: ChangeOwner) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(2174598809, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.newOwner);
    };
}

export function loadChangeOwner(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 2174598809) { throw Error('Invalid prefix'); }
    let _queryId = sc_0.loadUintBig(64);
    let _newOwner = sc_0.loadAddress();
    return { $$type: 'ChangeOwner' as const, queryId: _queryId, newOwner: _newOwner };
}

function loadTupleChangeOwner(source: TupleReader) {
    let _queryId = source.readBigNumber();
    let _newOwner = source.readAddress();
    return { $$type: 'ChangeOwner' as const, queryId: _queryId, newOwner: _newOwner };
}

function storeTupleChangeOwner(source: ChangeOwner) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.newOwner);
    return builder.build();
}

function dictValueParserChangeOwner(): DictionaryValue<ChangeOwner> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeChangeOwner(src)).endCell());
        },
        parse: (src) => {
            return loadChangeOwner(src.loadRef().beginParse());
        }
    }
}

export type ChangeOwnerOk = {
    $$type: 'ChangeOwnerOk';
    queryId: bigint;
    newOwner: Address;
}

export function storeChangeOwnerOk(src: ChangeOwnerOk) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(846932810, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.newOwner);
    };
}

export function loadChangeOwnerOk(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 846932810) { throw Error('Invalid prefix'); }
    let _queryId = sc_0.loadUintBig(64);
    let _newOwner = sc_0.loadAddress();
    return { $$type: 'ChangeOwnerOk' as const, queryId: _queryId, newOwner: _newOwner };
}

function loadTupleChangeOwnerOk(source: TupleReader) {
    let _queryId = source.readBigNumber();
    let _newOwner = source.readAddress();
    return { $$type: 'ChangeOwnerOk' as const, queryId: _queryId, newOwner: _newOwner };
}

function storeTupleChangeOwnerOk(source: ChangeOwnerOk) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.newOwner);
    return builder.build();
}

function dictValueParserChangeOwnerOk(): DictionaryValue<ChangeOwnerOk> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeChangeOwnerOk(src)).endCell());
        },
        parse: (src) => {
            return loadChangeOwnerOk(src.loadRef().beginParse());
        }
    }
}

export type EventTrigger = {
    $$type: 'EventTrigger';
    value: bigint;
    address: Address;
    info: EventSignal;
}

export function storeEventTrigger(src: EventTrigger) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(1365159228, 32);
        b_0.storeInt(src.value, 257);
        b_0.storeAddress(src.address);
        b_0.store(storeEventSignal(src.info));
    };
}

export function loadEventTrigger(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 1365159228) { throw Error('Invalid prefix'); }
    let _value = sc_0.loadIntBig(257);
    let _address = sc_0.loadAddress();
    let _info = loadEventSignal(sc_0);
    return { $$type: 'EventTrigger' as const, value: _value, address: _address, info: _info };
}

function loadTupleEventTrigger(source: TupleReader) {
    let _value = source.readBigNumber();
    let _address = source.readAddress();
    const _info = loadTupleEventSignal(source.readTuple());
    return { $$type: 'EventTrigger' as const, value: _value, address: _address, info: _info };
}

function storeTupleEventTrigger(source: EventTrigger) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.value);
    builder.writeAddress(source.address);
    builder.writeTuple(storeTupleEventSignal(source.info));
    return builder.build();
}

function dictValueParserEventTrigger(): DictionaryValue<EventTrigger> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeEventTrigger(src)).endCell());
        },
        parse: (src) => {
            return loadEventTrigger(src.loadRef().beginParse());
        }
    }
}

export type EventSignal = {
    $$type: 'EventSignal';
    eventId: bigint;
    payload: Cell;
}

export function storeEventSignal(src: EventSignal) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(306637748, 32);
        b_0.storeInt(src.eventId, 257);
        b_0.storeRef(src.payload);
    };
}

export function loadEventSignal(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 306637748) { throw Error('Invalid prefix'); }
    let _eventId = sc_0.loadIntBig(257);
    let _payload = sc_0.loadRef();
    return { $$type: 'EventSignal' as const, eventId: _eventId, payload: _payload };
}

function loadTupleEventSignal(source: TupleReader) {
    let _eventId = source.readBigNumber();
    let _payload = source.readCell();
    return { $$type: 'EventSignal' as const, eventId: _eventId, payload: _payload };
}

function storeTupleEventSignal(source: EventSignal) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.eventId);
    builder.writeCell(source.payload);
    return builder.build();
}

function dictValueParserEventSignal(): DictionaryValue<EventSignal> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeEventSignal(src)).endCell());
        },
        parse: (src) => {
            return loadEventSignal(src.loadRef().beginParse());
        }
    }
}

export type BuildMessenger = {
    $$type: 'BuildMessenger';
    sourceAddress: Address;
    eventId: bigint;
    maxUserStakeAmount: bigint;
    subscribeFeePerTick: bigint;
    template: Cell;
    sourceName: string;
}

export function storeBuildMessenger(src: BuildMessenger) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(2826761911, 32);
        b_0.storeAddress(src.sourceAddress);
        b_0.storeInt(src.eventId, 257);
        b_0.storeCoins(src.maxUserStakeAmount);
        b_0.storeCoins(src.subscribeFeePerTick);
        b_0.storeRef(src.template);
        b_0.storeStringRefTail(src.sourceName);
    };
}

export function loadBuildMessenger(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 2826761911) { throw Error('Invalid prefix'); }
    let _sourceAddress = sc_0.loadAddress();
    let _eventId = sc_0.loadIntBig(257);
    let _maxUserStakeAmount = sc_0.loadCoins();
    let _subscribeFeePerTick = sc_0.loadCoins();
    let _template = sc_0.loadRef();
    let _sourceName = sc_0.loadStringRefTail();
    return { $$type: 'BuildMessenger' as const, sourceAddress: _sourceAddress, eventId: _eventId, maxUserStakeAmount: _maxUserStakeAmount, subscribeFeePerTick: _subscribeFeePerTick, template: _template, sourceName: _sourceName };
}

function loadTupleBuildMessenger(source: TupleReader) {
    let _sourceAddress = source.readAddress();
    let _eventId = source.readBigNumber();
    let _maxUserStakeAmount = source.readBigNumber();
    let _subscribeFeePerTick = source.readBigNumber();
    let _template = source.readCell();
    let _sourceName = source.readString();
    return { $$type: 'BuildMessenger' as const, sourceAddress: _sourceAddress, eventId: _eventId, maxUserStakeAmount: _maxUserStakeAmount, subscribeFeePerTick: _subscribeFeePerTick, template: _template, sourceName: _sourceName };
}

function storeTupleBuildMessenger(source: BuildMessenger) {
    let builder = new TupleBuilder();
    builder.writeAddress(source.sourceAddress);
    builder.writeNumber(source.eventId);
    builder.writeNumber(source.maxUserStakeAmount);
    builder.writeNumber(source.subscribeFeePerTick);
    builder.writeCell(source.template);
    builder.writeString(source.sourceName);
    return builder.build();
}

function dictValueParserBuildMessenger(): DictionaryValue<BuildMessenger> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeBuildMessenger(src)).endCell());
        },
        parse: (src) => {
            return loadBuildMessenger(src.loadRef().beginParse());
        }
    }
}

export type BuildChildRouter = {
    $$type: 'BuildChildRouter';
    sourceAddress: Address;
    eventId: bigint;
    maxUserStakeAmount: bigint;
    subscribeFeePerTick: bigint;
    template: Cell;
    sourceName: string;
}

export function storeBuildChildRouter(src: BuildChildRouter) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(2831422442, 32);
        b_0.storeAddress(src.sourceAddress);
        b_0.storeInt(src.eventId, 257);
        b_0.storeCoins(src.maxUserStakeAmount);
        b_0.storeCoins(src.subscribeFeePerTick);
        b_0.storeRef(src.template);
        b_0.storeStringRefTail(src.sourceName);
    };
}

export function loadBuildChildRouter(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 2831422442) { throw Error('Invalid prefix'); }
    let _sourceAddress = sc_0.loadAddress();
    let _eventId = sc_0.loadIntBig(257);
    let _maxUserStakeAmount = sc_0.loadCoins();
    let _subscribeFeePerTick = sc_0.loadCoins();
    let _template = sc_0.loadRef();
    let _sourceName = sc_0.loadStringRefTail();
    return { $$type: 'BuildChildRouter' as const, sourceAddress: _sourceAddress, eventId: _eventId, maxUserStakeAmount: _maxUserStakeAmount, subscribeFeePerTick: _subscribeFeePerTick, template: _template, sourceName: _sourceName };
}

function loadTupleBuildChildRouter(source: TupleReader) {
    let _sourceAddress = source.readAddress();
    let _eventId = source.readBigNumber();
    let _maxUserStakeAmount = source.readBigNumber();
    let _subscribeFeePerTick = source.readBigNumber();
    let _template = source.readCell();
    let _sourceName = source.readString();
    return { $$type: 'BuildChildRouter' as const, sourceAddress: _sourceAddress, eventId: _eventId, maxUserStakeAmount: _maxUserStakeAmount, subscribeFeePerTick: _subscribeFeePerTick, template: _template, sourceName: _sourceName };
}

function storeTupleBuildChildRouter(source: BuildChildRouter) {
    let builder = new TupleBuilder();
    builder.writeAddress(source.sourceAddress);
    builder.writeNumber(source.eventId);
    builder.writeNumber(source.maxUserStakeAmount);
    builder.writeNumber(source.subscribeFeePerTick);
    builder.writeCell(source.template);
    builder.writeString(source.sourceName);
    return builder.build();
}

function dictValueParserBuildChildRouter(): DictionaryValue<BuildChildRouter> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeBuildChildRouter(src)).endCell());
        },
        parse: (src) => {
            return loadBuildChildRouter(src.loadRef().beginParse());
        }
    }
}

export type CreateBody = {
    $$type: 'CreateBody';
    walletAddress: Address;
    deadline: bigint;
    eventId: bigint;
    parameter: Cell;
}

export function storeCreateBody(src: CreateBody) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(2617235749, 32);
        b_0.storeAddress(src.walletAddress);
        b_0.storeInt(src.deadline, 257);
        b_0.storeInt(src.eventId, 257);
        b_0.storeRef(src.parameter);
    };
}

export function loadCreateBody(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 2617235749) { throw Error('Invalid prefix'); }
    let _walletAddress = sc_0.loadAddress();
    let _deadline = sc_0.loadIntBig(257);
    let _eventId = sc_0.loadIntBig(257);
    let _parameter = sc_0.loadRef();
    return { $$type: 'CreateBody' as const, walletAddress: _walletAddress, deadline: _deadline, eventId: _eventId, parameter: _parameter };
}

function loadTupleCreateBody(source: TupleReader) {
    let _walletAddress = source.readAddress();
    let _deadline = source.readBigNumber();
    let _eventId = source.readBigNumber();
    let _parameter = source.readCell();
    return { $$type: 'CreateBody' as const, walletAddress: _walletAddress, deadline: _deadline, eventId: _eventId, parameter: _parameter };
}

function storeTupleCreateBody(source: CreateBody) {
    let builder = new TupleBuilder();
    builder.writeAddress(source.walletAddress);
    builder.writeNumber(source.deadline);
    builder.writeNumber(source.eventId);
    builder.writeCell(source.parameter);
    return builder.build();
}

function dictValueParserCreateBody(): DictionaryValue<CreateBody> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeCreateBody(src)).endCell());
        },
        parse: (src) => {
            return loadCreateBody(src.loadRef().beginParse());
        }
    }
}

export type SubscribeBody = {
    $$type: 'SubscribeBody';
    walletAddress: Address;
    deadline: bigint;
    eventId: bigint;
    callbackAddress: Address;
}

export function storeSubscribeBody(src: SubscribeBody) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(1953340414, 32);
        b_0.storeAddress(src.walletAddress);
        b_0.storeInt(src.deadline, 257);
        b_0.storeInt(src.eventId, 257);
        let b_1 = new Builder();
        b_1.storeAddress(src.callbackAddress);
        b_0.storeRef(b_1.endCell());
    };
}

export function loadSubscribeBody(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 1953340414) { throw Error('Invalid prefix'); }
    let _walletAddress = sc_0.loadAddress();
    let _deadline = sc_0.loadIntBig(257);
    let _eventId = sc_0.loadIntBig(257);
    let sc_1 = sc_0.loadRef().beginParse();
    let _callbackAddress = sc_1.loadAddress();
    return { $$type: 'SubscribeBody' as const, walletAddress: _walletAddress, deadline: _deadline, eventId: _eventId, callbackAddress: _callbackAddress };
}

function loadTupleSubscribeBody(source: TupleReader) {
    let _walletAddress = source.readAddress();
    let _deadline = source.readBigNumber();
    let _eventId = source.readBigNumber();
    let _callbackAddress = source.readAddress();
    return { $$type: 'SubscribeBody' as const, walletAddress: _walletAddress, deadline: _deadline, eventId: _eventId, callbackAddress: _callbackAddress };
}

function storeTupleSubscribeBody(source: SubscribeBody) {
    let builder = new TupleBuilder();
    builder.writeAddress(source.walletAddress);
    builder.writeNumber(source.deadline);
    builder.writeNumber(source.eventId);
    builder.writeAddress(source.callbackAddress);
    return builder.build();
}

function dictValueParserSubscribeBody(): DictionaryValue<SubscribeBody> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeSubscribeBody(src)).endCell());
        },
        parse: (src) => {
            return loadSubscribeBody(src.loadRef().beginParse());
        }
    }
}

export type EventSourceRegister = {
    $$type: 'EventSourceRegister';
    template: Cell;
    maxUserStakeAmount: bigint;
    subscribeFeePerTick: bigint;
    sourceName: string;
}

export function storeEventSourceRegister(src: EventSourceRegister) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(3902166577, 32);
        b_0.storeRef(src.template);
        b_0.storeCoins(src.maxUserStakeAmount);
        b_0.storeCoins(src.subscribeFeePerTick);
        b_0.storeStringRefTail(src.sourceName);
    };
}

export function loadEventSourceRegister(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 3902166577) { throw Error('Invalid prefix'); }
    let _template = sc_0.loadRef();
    let _maxUserStakeAmount = sc_0.loadCoins();
    let _subscribeFeePerTick = sc_0.loadCoins();
    let _sourceName = sc_0.loadStringRefTail();
    return { $$type: 'EventSourceRegister' as const, template: _template, maxUserStakeAmount: _maxUserStakeAmount, subscribeFeePerTick: _subscribeFeePerTick, sourceName: _sourceName };
}

function loadTupleEventSourceRegister(source: TupleReader) {
    let _template = source.readCell();
    let _maxUserStakeAmount = source.readBigNumber();
    let _subscribeFeePerTick = source.readBigNumber();
    let _sourceName = source.readString();
    return { $$type: 'EventSourceRegister' as const, template: _template, maxUserStakeAmount: _maxUserStakeAmount, subscribeFeePerTick: _subscribeFeePerTick, sourceName: _sourceName };
}

function storeTupleEventSourceRegister(source: EventSourceRegister) {
    let builder = new TupleBuilder();
    builder.writeCell(source.template);
    builder.writeNumber(source.maxUserStakeAmount);
    builder.writeNumber(source.subscribeFeePerTick);
    builder.writeString(source.sourceName);
    return builder.build();
}

function dictValueParserEventSourceRegister(): DictionaryValue<EventSourceRegister> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeEventSourceRegister(src)).endCell());
        },
        parse: (src) => {
            return loadEventSourceRegister(src.loadRef().beginParse());
        }
    }
}

export type ProtcolRegister = {
    $$type: 'ProtcolRegister';
    sourceAddress: Address;
    template: Cell;
    maxUserStakeAmount: bigint;
    subscribeFeePerTick: bigint;
    sourceName: string;
}

export function storeProtcolRegister(src: ProtcolRegister) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(882920319, 32);
        b_0.storeAddress(src.sourceAddress);
        b_0.storeRef(src.template);
        b_0.storeCoins(src.maxUserStakeAmount);
        b_0.storeCoins(src.subscribeFeePerTick);
        b_0.storeStringRefTail(src.sourceName);
    };
}

export function loadProtcolRegister(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 882920319) { throw Error('Invalid prefix'); }
    let _sourceAddress = sc_0.loadAddress();
    let _template = sc_0.loadRef();
    let _maxUserStakeAmount = sc_0.loadCoins();
    let _subscribeFeePerTick = sc_0.loadCoins();
    let _sourceName = sc_0.loadStringRefTail();
    return { $$type: 'ProtcolRegister' as const, sourceAddress: _sourceAddress, template: _template, maxUserStakeAmount: _maxUserStakeAmount, subscribeFeePerTick: _subscribeFeePerTick, sourceName: _sourceName };
}

function loadTupleProtcolRegister(source: TupleReader) {
    let _sourceAddress = source.readAddress();
    let _template = source.readCell();
    let _maxUserStakeAmount = source.readBigNumber();
    let _subscribeFeePerTick = source.readBigNumber();
    let _sourceName = source.readString();
    return { $$type: 'ProtcolRegister' as const, sourceAddress: _sourceAddress, template: _template, maxUserStakeAmount: _maxUserStakeAmount, subscribeFeePerTick: _subscribeFeePerTick, sourceName: _sourceName };
}

function storeTupleProtcolRegister(source: ProtcolRegister) {
    let builder = new TupleBuilder();
    builder.writeAddress(source.sourceAddress);
    builder.writeCell(source.template);
    builder.writeNumber(source.maxUserStakeAmount);
    builder.writeNumber(source.subscribeFeePerTick);
    builder.writeString(source.sourceName);
    return builder.build();
}

function dictValueParserProtcolRegister(): DictionaryValue<ProtcolRegister> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeProtcolRegister(src)).endCell());
        },
        parse: (src) => {
            return loadProtcolRegister(src.loadRef().beginParse());
        }
    }
}

export type ProtcolRegisterSuccess = {
    $$type: 'ProtcolRegisterSuccess';
    sourceAddress: Address;
    eventId: bigint;
    maxUserStakeAmount: bigint;
    subscribeFeePerTick: bigint;
    template: Cell;
    sourceName: string;
}

export function storeProtcolRegisterSuccess(src: ProtcolRegisterSuccess) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(2543656262, 32);
        b_0.storeAddress(src.sourceAddress);
        b_0.storeInt(src.eventId, 257);
        b_0.storeCoins(src.maxUserStakeAmount);
        b_0.storeCoins(src.subscribeFeePerTick);
        b_0.storeRef(src.template);
        b_0.storeStringRefTail(src.sourceName);
    };
}

export function loadProtcolRegisterSuccess(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 2543656262) { throw Error('Invalid prefix'); }
    let _sourceAddress = sc_0.loadAddress();
    let _eventId = sc_0.loadIntBig(257);
    let _maxUserStakeAmount = sc_0.loadCoins();
    let _subscribeFeePerTick = sc_0.loadCoins();
    let _template = sc_0.loadRef();
    let _sourceName = sc_0.loadStringRefTail();
    return { $$type: 'ProtcolRegisterSuccess' as const, sourceAddress: _sourceAddress, eventId: _eventId, maxUserStakeAmount: _maxUserStakeAmount, subscribeFeePerTick: _subscribeFeePerTick, template: _template, sourceName: _sourceName };
}

function loadTupleProtcolRegisterSuccess(source: TupleReader) {
    let _sourceAddress = source.readAddress();
    let _eventId = source.readBigNumber();
    let _maxUserStakeAmount = source.readBigNumber();
    let _subscribeFeePerTick = source.readBigNumber();
    let _template = source.readCell();
    let _sourceName = source.readString();
    return { $$type: 'ProtcolRegisterSuccess' as const, sourceAddress: _sourceAddress, eventId: _eventId, maxUserStakeAmount: _maxUserStakeAmount, subscribeFeePerTick: _subscribeFeePerTick, template: _template, sourceName: _sourceName };
}

function storeTupleProtcolRegisterSuccess(source: ProtcolRegisterSuccess) {
    let builder = new TupleBuilder();
    builder.writeAddress(source.sourceAddress);
    builder.writeNumber(source.eventId);
    builder.writeNumber(source.maxUserStakeAmount);
    builder.writeNumber(source.subscribeFeePerTick);
    builder.writeCell(source.template);
    builder.writeString(source.sourceName);
    return builder.build();
}

function dictValueParserProtcolRegisterSuccess(): DictionaryValue<ProtcolRegisterSuccess> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeProtcolRegisterSuccess(src)).endCell());
        },
        parse: (src) => {
            return loadProtcolRegisterSuccess(src.loadRef().beginParse());
        }
    }
}

export type CreateMsgSubscriber = {
    $$type: 'CreateMsgSubscriber';
    walletAddress: Address;
    callbackAddress: Address;
    eventId: bigint;
}

export function storeCreateMsgSubscriber(src: CreateMsgSubscriber) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(2100856841, 32);
        b_0.storeAddress(src.walletAddress);
        b_0.storeAddress(src.callbackAddress);
        b_0.storeInt(src.eventId, 257);
    };
}

export function loadCreateMsgSubscriber(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 2100856841) { throw Error('Invalid prefix'); }
    let _walletAddress = sc_0.loadAddress();
    let _callbackAddress = sc_0.loadAddress();
    let _eventId = sc_0.loadIntBig(257);
    return { $$type: 'CreateMsgSubscriber' as const, walletAddress: _walletAddress, callbackAddress: _callbackAddress, eventId: _eventId };
}

function loadTupleCreateMsgSubscriber(source: TupleReader) {
    let _walletAddress = source.readAddress();
    let _callbackAddress = source.readAddress();
    let _eventId = source.readBigNumber();
    return { $$type: 'CreateMsgSubscriber' as const, walletAddress: _walletAddress, callbackAddress: _callbackAddress, eventId: _eventId };
}

function storeTupleCreateMsgSubscriber(source: CreateMsgSubscriber) {
    let builder = new TupleBuilder();
    builder.writeAddress(source.walletAddress);
    builder.writeAddress(source.callbackAddress);
    builder.writeNumber(source.eventId);
    return builder.build();
}

function dictValueParserCreateMsgSubscriber(): DictionaryValue<CreateMsgSubscriber> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeCreateMsgSubscriber(src)).endCell());
        },
        parse: (src) => {
            return loadCreateMsgSubscriber(src.loadRef().beginParse());
        }
    }
}

export type BuildCallback = {
    $$type: 'BuildCallback';
    parameter: Cell;
}

export function storeBuildCallback(src: BuildCallback) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(371930965, 32);
        b_0.storeRef(src.parameter);
    };
}

export function loadBuildCallback(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 371930965) { throw Error('Invalid prefix'); }
    let _parameter = sc_0.loadRef();
    return { $$type: 'BuildCallback' as const, parameter: _parameter };
}

function loadTupleBuildCallback(source: TupleReader) {
    let _parameter = source.readCell();
    return { $$type: 'BuildCallback' as const, parameter: _parameter };
}

function storeTupleBuildCallback(source: BuildCallback) {
    let builder = new TupleBuilder();
    builder.writeCell(source.parameter);
    return builder.build();
}

function dictValueParserBuildCallback(): DictionaryValue<BuildCallback> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeBuildCallback(src)).endCell());
        },
        parse: (src) => {
            return loadBuildCallback(src.loadRef().beginParse());
        }
    }
}

export type CreateMsgSubscriberSuccess = {
    $$type: 'CreateMsgSubscriberSuccess';
    callbackAddress: Address;
}

export function storeCreateMsgSubscriberSuccess(src: CreateMsgSubscriberSuccess) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(3382650231, 32);
        b_0.storeAddress(src.callbackAddress);
    };
}

export function loadCreateMsgSubscriberSuccess(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 3382650231) { throw Error('Invalid prefix'); }
    let _callbackAddress = sc_0.loadAddress();
    return { $$type: 'CreateMsgSubscriberSuccess' as const, callbackAddress: _callbackAddress };
}

function loadTupleCreateMsgSubscriberSuccess(source: TupleReader) {
    let _callbackAddress = source.readAddress();
    return { $$type: 'CreateMsgSubscriberSuccess' as const, callbackAddress: _callbackAddress };
}

function storeTupleCreateMsgSubscriberSuccess(source: CreateMsgSubscriberSuccess) {
    let builder = new TupleBuilder();
    builder.writeAddress(source.callbackAddress);
    return builder.build();
}

function dictValueParserCreateMsgSubscriberSuccess(): DictionaryValue<CreateMsgSubscriberSuccess> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeCreateMsgSubscriberSuccess(src)).endCell());
        },
        parse: (src) => {
            return loadCreateMsgSubscriberSuccess(src.loadRef().beginParse());
        }
    }
}

export type CreateUdcSuccess = {
    $$type: 'CreateUdcSuccess';
    walletAddress: Address;
    callbackAddress: Address;
}

export function storeCreateUdcSuccess(src: CreateUdcSuccess) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(3989598131, 32);
        b_0.storeAddress(src.walletAddress);
        b_0.storeAddress(src.callbackAddress);
    };
}

export function loadCreateUdcSuccess(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 3989598131) { throw Error('Invalid prefix'); }
    let _walletAddress = sc_0.loadAddress();
    let _callbackAddress = sc_0.loadAddress();
    return { $$type: 'CreateUdcSuccess' as const, walletAddress: _walletAddress, callbackAddress: _callbackAddress };
}

function loadTupleCreateUdcSuccess(source: TupleReader) {
    let _walletAddress = source.readAddress();
    let _callbackAddress = source.readAddress();
    return { $$type: 'CreateUdcSuccess' as const, walletAddress: _walletAddress, callbackAddress: _callbackAddress };
}

function storeTupleCreateUdcSuccess(source: CreateUdcSuccess) {
    let builder = new TupleBuilder();
    builder.writeAddress(source.walletAddress);
    builder.writeAddress(source.callbackAddress);
    return builder.build();
}

function dictValueParserCreateUdcSuccess(): DictionaryValue<CreateUdcSuccess> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeCreateUdcSuccess(src)).endCell());
        },
        parse: (src) => {
            return loadCreateUdcSuccess(src.loadRef().beginParse());
        }
    }
}

export type DeleteSubscriber = {
    $$type: 'DeleteSubscriber';
    walletAddress: Address;
    callbackAddress: Address;
    eventId: bigint;
}

export function storeDeleteSubscriber(src: DeleteSubscriber) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(380345681, 32);
        b_0.storeAddress(src.walletAddress);
        b_0.storeAddress(src.callbackAddress);
        b_0.storeInt(src.eventId, 257);
    };
}

export function loadDeleteSubscriber(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 380345681) { throw Error('Invalid prefix'); }
    let _walletAddress = sc_0.loadAddress();
    let _callbackAddress = sc_0.loadAddress();
    let _eventId = sc_0.loadIntBig(257);
    return { $$type: 'DeleteSubscriber' as const, walletAddress: _walletAddress, callbackAddress: _callbackAddress, eventId: _eventId };
}

function loadTupleDeleteSubscriber(source: TupleReader) {
    let _walletAddress = source.readAddress();
    let _callbackAddress = source.readAddress();
    let _eventId = source.readBigNumber();
    return { $$type: 'DeleteSubscriber' as const, walletAddress: _walletAddress, callbackAddress: _callbackAddress, eventId: _eventId };
}

function storeTupleDeleteSubscriber(source: DeleteSubscriber) {
    let builder = new TupleBuilder();
    builder.writeAddress(source.walletAddress);
    builder.writeAddress(source.callbackAddress);
    builder.writeNumber(source.eventId);
    return builder.build();
}

function dictValueParserDeleteSubscriber(): DictionaryValue<DeleteSubscriber> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeDeleteSubscriber(src)).endCell());
        },
        parse: (src) => {
            return loadDeleteSubscriber(src.loadRef().beginParse());
        }
    }
}

export type DestroyMessenger = {
    $$type: 'DestroyMessenger';
    messengerId: bigint;
}

export function storeDestroyMessenger(src: DestroyMessenger) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(2952350305, 32);
        b_0.storeInt(src.messengerId, 257);
    };
}

export function loadDestroyMessenger(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 2952350305) { throw Error('Invalid prefix'); }
    let _messengerId = sc_0.loadIntBig(257);
    return { $$type: 'DestroyMessenger' as const, messengerId: _messengerId };
}

function loadTupleDestroyMessenger(source: TupleReader) {
    let _messengerId = source.readBigNumber();
    return { $$type: 'DestroyMessenger' as const, messengerId: _messengerId };
}

function storeTupleDestroyMessenger(source: DestroyMessenger) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.messengerId);
    return builder.build();
}

function dictValueParserDestroyMessenger(): DictionaryValue<DestroyMessenger> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeDestroyMessenger(src)).endCell());
        },
        parse: (src) => {
            return loadDestroyMessenger(src.loadRef().beginParse());
        }
    }
}

export type AddMessenger = {
    $$type: 'AddMessenger';
    protocolAddress: Address;
}

export function storeAddMessenger(src: AddMessenger) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(2557114565, 32);
        b_0.storeAddress(src.protocolAddress);
    };
}

export function loadAddMessenger(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 2557114565) { throw Error('Invalid prefix'); }
    let _protocolAddress = sc_0.loadAddress();
    return { $$type: 'AddMessenger' as const, protocolAddress: _protocolAddress };
}

function loadTupleAddMessenger(source: TupleReader) {
    let _protocolAddress = source.readAddress();
    return { $$type: 'AddMessenger' as const, protocolAddress: _protocolAddress };
}

function storeTupleAddMessenger(source: AddMessenger) {
    let builder = new TupleBuilder();
    builder.writeAddress(source.protocolAddress);
    return builder.build();
}

function dictValueParserAddMessenger(): DictionaryValue<AddMessenger> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeAddMessenger(src)).endCell());
        },
        parse: (src) => {
            return loadAddMessenger(src.loadRef().beginParse());
        }
    }
}

export type AddStakeFor = {
    $$type: 'AddStakeFor';
    beneficiary: Address;
}

export function storeAddStakeFor(src: AddStakeFor) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(3476889102, 32);
        b_0.storeAddress(src.beneficiary);
    };
}

export function loadAddStakeFor(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 3476889102) { throw Error('Invalid prefix'); }
    let _beneficiary = sc_0.loadAddress();
    return { $$type: 'AddStakeFor' as const, beneficiary: _beneficiary };
}

function loadTupleAddStakeFor(source: TupleReader) {
    let _beneficiary = source.readAddress();
    return { $$type: 'AddStakeFor' as const, beneficiary: _beneficiary };
}

function storeTupleAddStakeFor(source: AddStakeFor) {
    let builder = new TupleBuilder();
    builder.writeAddress(source.beneficiary);
    return builder.build();
}

function dictValueParserAddStakeFor(): DictionaryValue<AddStakeFor> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeAddStakeFor(src)).endCell());
        },
        parse: (src) => {
            return loadAddStakeFor(src.loadRef().beginParse());
        }
    }
}

export type RemoveStake = {
    $$type: 'RemoveStake';
    receiver: Address;
    amount: bigint;
}

export function storeRemoveStake(src: RemoveStake) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(3725077757, 32);
        b_0.storeAddress(src.receiver);
        b_0.storeCoins(src.amount);
    };
}

export function loadRemoveStake(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 3725077757) { throw Error('Invalid prefix'); }
    let _receiver = sc_0.loadAddress();
    let _amount = sc_0.loadCoins();
    return { $$type: 'RemoveStake' as const, receiver: _receiver, amount: _amount };
}

function loadTupleRemoveStake(source: TupleReader) {
    let _receiver = source.readAddress();
    let _amount = source.readBigNumber();
    return { $$type: 'RemoveStake' as const, receiver: _receiver, amount: _amount };
}

function storeTupleRemoveStake(source: RemoveStake) {
    let builder = new TupleBuilder();
    builder.writeAddress(source.receiver);
    builder.writeNumber(source.amount);
    return builder.build();
}

function dictValueParserRemoveStake(): DictionaryValue<RemoveStake> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeRemoveStake(src)).endCell());
        },
        parse: (src) => {
            return loadRemoveStake(src.loadRef().beginParse());
        }
    }
}

export type CollectFee = {
    $$type: 'CollectFee';
    messengerId: bigint;
    fee: bigint;
}

export function storeCollectFee(src: CollectFee) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(901872456, 32);
        b_0.storeInt(src.messengerId, 257);
        b_0.storeCoins(src.fee);
    };
}

export function loadCollectFee(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 901872456) { throw Error('Invalid prefix'); }
    let _messengerId = sc_0.loadIntBig(257);
    let _fee = sc_0.loadCoins();
    return { $$type: 'CollectFee' as const, messengerId: _messengerId, fee: _fee };
}

function loadTupleCollectFee(source: TupleReader) {
    let _messengerId = source.readBigNumber();
    let _fee = source.readBigNumber();
    return { $$type: 'CollectFee' as const, messengerId: _messengerId, fee: _fee };
}

function storeTupleCollectFee(source: CollectFee) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.messengerId);
    builder.writeNumber(source.fee);
    return builder.build();
}

function dictValueParserCollectFee(): DictionaryValue<CollectFee> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeCollectFee(src)).endCell());
        },
        parse: (src) => {
            return loadCollectFee(src.loadRef().beginParse());
        }
    }
}

export type BuildUDC = {
    $$type: 'BuildUDC';
    owner: Address;
}

export function storeBuildUDC(src: BuildUDC) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(2104203658, 32);
        b_0.storeAddress(src.owner);
    };
}

export function loadBuildUDC(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 2104203658) { throw Error('Invalid prefix'); }
    let _owner = sc_0.loadAddress();
    return { $$type: 'BuildUDC' as const, owner: _owner };
}

function loadTupleBuildUDC(source: TupleReader) {
    let _owner = source.readAddress();
    return { $$type: 'BuildUDC' as const, owner: _owner };
}

function storeTupleBuildUDC(source: BuildUDC) {
    let builder = new TupleBuilder();
    builder.writeAddress(source.owner);
    return builder.build();
}

function dictValueParserBuildUDC(): DictionaryValue<BuildUDC> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeBuildUDC(src)).endCell());
        },
        parse: (src) => {
            return loadBuildUDC(src.loadRef().beginParse());
        }
    }
}

export type ExtMessage = {
    $$type: 'ExtMessage';
    seqno: bigint;
    valid_until: bigint;
    signature: Buffer;
    message_parameters: SendParameters;
}

export function storeExtMessage(src: ExtMessage) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(2686769784, 32);
        b_0.storeUint(src.seqno, 32);
        b_0.storeUint(src.valid_until, 32);
        b_0.storeBuffer(src.signature);
        let b_1 = new Builder();
        b_1.store(storeSendParameters(src.message_parameters));
        b_0.storeRef(b_1.endCell());
    };
}

export function loadExtMessage(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 2686769784) { throw Error('Invalid prefix'); }
    let _seqno = sc_0.loadUintBig(32);
    let _valid_until = sc_0.loadUintBig(32);
    let _signature = sc_0.loadBuffer(64);
    let sc_1 = sc_0.loadRef().beginParse();
    let _message_parameters = loadSendParameters(sc_1);
    return { $$type: 'ExtMessage' as const, seqno: _seqno, valid_until: _valid_until, signature: _signature, message_parameters: _message_parameters };
}

function loadTupleExtMessage(source: TupleReader) {
    let _seqno = source.readBigNumber();
    let _valid_until = source.readBigNumber();
    let _signature = source.readBuffer();
    const _message_parameters = loadTupleSendParameters(source.readTuple());
    return { $$type: 'ExtMessage' as const, seqno: _seqno, valid_until: _valid_until, signature: _signature, message_parameters: _message_parameters };
}

function storeTupleExtMessage(source: ExtMessage) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.seqno);
    builder.writeNumber(source.valid_until);
    builder.writeBuffer(source.signature);
    builder.writeTuple(storeTupleSendParameters(source.message_parameters));
    return builder.build();
}

function dictValueParserExtMessage(): DictionaryValue<ExtMessage> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeExtMessage(src)).endCell());
        },
        parse: (src) => {
            return loadExtMessage(src.loadRef().beginParse());
        }
    }
}

export type OffchainEventSignal = {
    $$type: 'OffchainEventSignal';
    eventId: bigint;
    payload: Cell;
}

export function storeOffchainEventSignal(src: OffchainEventSignal) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(3146769914, 32);
        b_0.storeInt(src.eventId, 257);
        b_0.storeRef(src.payload);
    };
}

export function loadOffchainEventSignal(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 3146769914) { throw Error('Invalid prefix'); }
    let _eventId = sc_0.loadIntBig(257);
    let _payload = sc_0.loadRef();
    return { $$type: 'OffchainEventSignal' as const, eventId: _eventId, payload: _payload };
}

function loadTupleOffchainEventSignal(source: TupleReader) {
    let _eventId = source.readBigNumber();
    let _payload = source.readCell();
    return { $$type: 'OffchainEventSignal' as const, eventId: _eventId, payload: _payload };
}

function storeTupleOffchainEventSignal(source: OffchainEventSignal) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.eventId);
    builder.writeCell(source.payload);
    return builder.build();
}

function dictValueParserOffchainEventSignal(): DictionaryValue<OffchainEventSignal> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeOffchainEventSignal(src)).endCell());
        },
        parse: (src) => {
            return loadOffchainEventSignal(src.loadRef().beginParse());
        }
    }
}

export type Staked = {
    $$type: 'Staked';
    amount: bigint;
    staker: Address;
    beneficiary: Address;
}

export function storeStaked(src: Staked) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(4007728783, 32);
        b_0.storeCoins(src.amount);
        b_0.storeAddress(src.staker);
        b_0.storeAddress(src.beneficiary);
    };
}

export function loadStaked(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 4007728783) { throw Error('Invalid prefix'); }
    let _amount = sc_0.loadCoins();
    let _staker = sc_0.loadAddress();
    let _beneficiary = sc_0.loadAddress();
    return { $$type: 'Staked' as const, amount: _amount, staker: _staker, beneficiary: _beneficiary };
}

function loadTupleStaked(source: TupleReader) {
    let _amount = source.readBigNumber();
    let _staker = source.readAddress();
    let _beneficiary = source.readAddress();
    return { $$type: 'Staked' as const, amount: _amount, staker: _staker, beneficiary: _beneficiary };
}

function storeTupleStaked(source: Staked) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.amount);
    builder.writeAddress(source.staker);
    builder.writeAddress(source.beneficiary);
    return builder.build();
}

function dictValueParserStaked(): DictionaryValue<Staked> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeStaked(src)).endCell());
        },
        parse: (src) => {
            return loadStaked(src.loadRef().beginParse());
        }
    }
}

export type Withdrawn = {
    $$type: 'Withdrawn';
    amount: bigint;
    receiver: Address;
}

export function storeWithdrawn(src: Withdrawn) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(912108722, 32);
        b_0.storeCoins(src.amount);
        b_0.storeAddress(src.receiver);
    };
}

export function loadWithdrawn(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 912108722) { throw Error('Invalid prefix'); }
    let _amount = sc_0.loadCoins();
    let _receiver = sc_0.loadAddress();
    return { $$type: 'Withdrawn' as const, amount: _amount, receiver: _receiver };
}

function loadTupleWithdrawn(source: TupleReader) {
    let _amount = source.readBigNumber();
    let _receiver = source.readAddress();
    return { $$type: 'Withdrawn' as const, amount: _amount, receiver: _receiver };
}

function storeTupleWithdrawn(source: Withdrawn) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.amount);
    builder.writeAddress(source.receiver);
    return builder.build();
}

function dictValueParserWithdrawn(): DictionaryValue<Withdrawn> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeWithdrawn(src)).endCell());
        },
        parse: (src) => {
            return loadWithdrawn(src.loadRef().beginParse());
        }
    }
}

export type ClaimReward = {
    $$type: 'ClaimReward';
    amount: bigint;
    receiver: Address;
}

export function storeClaimReward(src: ClaimReward) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(3088241813, 32);
        b_0.storeCoins(src.amount);
        b_0.storeAddress(src.receiver);
    };
}

export function loadClaimReward(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 3088241813) { throw Error('Invalid prefix'); }
    let _amount = sc_0.loadCoins();
    let _receiver = sc_0.loadAddress();
    return { $$type: 'ClaimReward' as const, amount: _amount, receiver: _receiver };
}

function loadTupleClaimReward(source: TupleReader) {
    let _amount = source.readBigNumber();
    let _receiver = source.readAddress();
    return { $$type: 'ClaimReward' as const, amount: _amount, receiver: _receiver };
}

function storeTupleClaimReward(source: ClaimReward) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.amount);
    builder.writeAddress(source.receiver);
    return builder.build();
}

function dictValueParserClaimReward(): DictionaryValue<ClaimReward> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeClaimReward(src)).endCell());
        },
        parse: (src) => {
            return loadClaimReward(src.loadRef().beginParse());
        }
    }
}

export type SetMessenger = {
    $$type: 'SetMessenger';
    messenger: Address;
    eventId: bigint;
}

export function storeSetMessenger(src: SetMessenger) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(853868809, 32);
        b_0.storeAddress(src.messenger);
        b_0.storeInt(src.eventId, 257);
    };
}

export function loadSetMessenger(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 853868809) { throw Error('Invalid prefix'); }
    let _messenger = sc_0.loadAddress();
    let _eventId = sc_0.loadIntBig(257);
    return { $$type: 'SetMessenger' as const, messenger: _messenger, eventId: _eventId };
}

function loadTupleSetMessenger(source: TupleReader) {
    let _messenger = source.readAddress();
    let _eventId = source.readBigNumber();
    return { $$type: 'SetMessenger' as const, messenger: _messenger, eventId: _eventId };
}

function storeTupleSetMessenger(source: SetMessenger) {
    let builder = new TupleBuilder();
    builder.writeAddress(source.messenger);
    builder.writeNumber(source.eventId);
    return builder.build();
}

function dictValueParserSetMessenger(): DictionaryValue<SetMessenger> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeSetMessenger(src)).endCell());
        },
        parse: (src) => {
            return loadSetMessenger(src.loadRef().beginParse());
        }
    }
}

export type Trade = {
    $$type: 'Trade';
    orderAction: bigint;
    positionSize: bigint;
}

export function storeTrade(src: Trade) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(2411913942, 32);
        b_0.storeInt(src.orderAction, 257);
        b_0.storeInt(src.positionSize, 257);
    };
}

export function loadTrade(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 2411913942) { throw Error('Invalid prefix'); }
    let _orderAction = sc_0.loadIntBig(257);
    let _positionSize = sc_0.loadIntBig(257);
    return { $$type: 'Trade' as const, orderAction: _orderAction, positionSize: _positionSize };
}

function loadTupleTrade(source: TupleReader) {
    let _orderAction = source.readBigNumber();
    let _positionSize = source.readBigNumber();
    return { $$type: 'Trade' as const, orderAction: _orderAction, positionSize: _positionSize };
}

function storeTupleTrade(source: Trade) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.orderAction);
    builder.writeNumber(source.positionSize);
    return builder.build();
}

function dictValueParserTrade(): DictionaryValue<Trade> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeTrade(src)).endCell());
        },
        parse: (src) => {
            return loadTrade(src.loadRef().beginParse());
        }
    }
}

export type BugWarning = {
    $$type: 'BugWarning';
    targetAdress: Address;
    bugInfo: Cell;
}

export function storeBugWarning(src: BugWarning) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(1795428193, 32);
        b_0.storeAddress(src.targetAdress);
        b_0.storeRef(src.bugInfo);
    };
}

export function loadBugWarning(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 1795428193) { throw Error('Invalid prefix'); }
    let _targetAdress = sc_0.loadAddress();
    let _bugInfo = sc_0.loadRef();
    return { $$type: 'BugWarning' as const, targetAdress: _targetAdress, bugInfo: _bugInfo };
}

function loadTupleBugWarning(source: TupleReader) {
    let _targetAdress = source.readAddress();
    let _bugInfo = source.readCell();
    return { $$type: 'BugWarning' as const, targetAdress: _targetAdress, bugInfo: _bugInfo };
}

function storeTupleBugWarning(source: BugWarning) {
    let builder = new TupleBuilder();
    builder.writeAddress(source.targetAdress);
    builder.writeCell(source.bugInfo);
    return builder.build();
}

function dictValueParserBugWarning(): DictionaryValue<BugWarning> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeBugWarning(src)).endCell());
        },
        parse: (src) => {
            return loadBugWarning(src.loadRef().beginParse());
        }
    }
}

export type SetEventId = {
    $$type: 'SetEventId';
    eventId: bigint;
}

export function storeSetEventId(src: SetEventId) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(1872535788, 32);
        b_0.storeInt(src.eventId, 257);
    };
}

export function loadSetEventId(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 1872535788) { throw Error('Invalid prefix'); }
    let _eventId = sc_0.loadIntBig(257);
    return { $$type: 'SetEventId' as const, eventId: _eventId };
}

function loadTupleSetEventId(source: TupleReader) {
    let _eventId = source.readBigNumber();
    return { $$type: 'SetEventId' as const, eventId: _eventId };
}

function storeTupleSetEventId(source: SetEventId) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.eventId);
    return builder.build();
}

function dictValueParserSetEventId(): DictionaryValue<SetEventId> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeSetEventId(src)).endCell());
        },
        parse: (src) => {
            return loadSetEventId(src.loadRef().beginParse());
        }
    }
}

export type BlacklistWarning = {
    $$type: 'BlacklistWarning';
    address: Address;
    info: Cell;
}

export function storeBlacklistWarning(src: BlacklistWarning) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(2874857256, 32);
        b_0.storeAddress(src.address);
        b_0.storeRef(src.info);
    };
}

export function loadBlacklistWarning(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 2874857256) { throw Error('Invalid prefix'); }
    let _address = sc_0.loadAddress();
    let _info = sc_0.loadRef();
    return { $$type: 'BlacklistWarning' as const, address: _address, info: _info };
}

function loadTupleBlacklistWarning(source: TupleReader) {
    let _address = source.readAddress();
    let _info = source.readCell();
    return { $$type: 'BlacklistWarning' as const, address: _address, info: _info };
}

function storeTupleBlacklistWarning(source: BlacklistWarning) {
    let builder = new TupleBuilder();
    builder.writeAddress(source.address);
    builder.writeCell(source.info);
    return builder.build();
}

function dictValueParserBlacklistWarning(): DictionaryValue<BlacklistWarning> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeBlacklistWarning(src)).endCell());
        },
        parse: (src) => {
            return loadBlacklistWarning(src.loadRef().beginParse());
        }
    }
}

export type Transfer = {
    $$type: 'Transfer';
    to: Address;
    value: bigint;
}

export function storeTransfer(src: Transfer) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(3125994780, 32);
        b_0.storeAddress(src.to);
        b_0.storeCoins(src.value);
    };
}

export function loadTransfer(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 3125994780) { throw Error('Invalid prefix'); }
    let _to = sc_0.loadAddress();
    let _value = sc_0.loadCoins();
    return { $$type: 'Transfer' as const, to: _to, value: _value };
}

function loadTupleTransfer(source: TupleReader) {
    let _to = source.readAddress();
    let _value = source.readBigNumber();
    return { $$type: 'Transfer' as const, to: _to, value: _value };
}

function storeTupleTransfer(source: Transfer) {
    let builder = new TupleBuilder();
    builder.writeAddress(source.to);
    builder.writeNumber(source.value);
    return builder.build();
}

function dictValueParserTransfer(): DictionaryValue<Transfer> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeTransfer(src)).endCell());
        },
        parse: (src) => {
            return loadTransfer(src.loadRef().beginParse());
        }
    }
}

 type Messenger_init_args = {
    $$type: 'Messenger_init_args';
    owner: Address;
    sourceAddress: Address;
    messengerId: bigint;
}

function initMessenger_init_args(src: Messenger_init_args) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeAddress(src.sourceAddress);
        b_0.storeInt(src.messengerId, 257);
    };
}

async function Messenger_init(owner: Address, sourceAddress: Address, messengerId: bigint) {
    const __code = Cell.fromBase64('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');
    const __system = Cell.fromBase64('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');
    let builder = beginCell();
    builder.storeRef(__system);
    builder.storeUint(0, 1);
    initMessenger_init_args({ $$type: 'Messenger_init_args', owner, sourceAddress, messengerId })(builder);
    const __data = builder.endCell();
    return { code: __code, data: __data };
}

const Messenger_errors: { [key: number]: { message: string } } = {
    2: { message: `Stack undeflow` },
    3: { message: `Stack overflow` },
    4: { message: `Integer overflow` },
    5: { message: `Integer out of expected range` },
    6: { message: `Invalid opcode` },
    7: { message: `Type check error` },
    8: { message: `Cell overflow` },
    9: { message: `Cell underflow` },
    10: { message: `Dictionary error` },
    13: { message: `Out of gas error` },
    32: { message: `Method ID not found` },
    34: { message: `Action is invalid or not supported` },
    37: { message: `Not enough TON` },
    38: { message: `Not enough extra-currencies` },
    128: { message: `Null reference exception` },
    129: { message: `Invalid serialization prefix` },
    130: { message: `Invalid incoming message` },
    131: { message: `Constraints error` },
    132: { message: `Access denied` },
    133: { message: `Contract stopped` },
    134: { message: `Invalid argument` },
    135: { message: `Code of a contract was not found` },
    136: { message: `Invalid address` },
    137: { message: `Masterchain support is not enabled for this contract` },
    38856: { message: `User stake amount exceeds the max user stake amount` },
    40476: { message: `Amount must be greater than 0` },
    50575: { message: `Insufficient stake to remove` },
    56733: { message: `Stake must be greater than minimum stake` },
}

const Messenger_types: ABIType[] = [
    {"name":"StateInit","header":null,"fields":[{"name":"code","type":{"kind":"simple","type":"cell","optional":false}},{"name":"data","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"Context","header":null,"fields":[{"name":"bounced","type":{"kind":"simple","type":"bool","optional":false}},{"name":"sender","type":{"kind":"simple","type":"address","optional":false}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"raw","type":{"kind":"simple","type":"slice","optional":false}}]},
    {"name":"SendParameters","header":null,"fields":[{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}},{"name":"to","type":{"kind":"simple","type":"address","optional":false}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"code","type":{"kind":"simple","type":"cell","optional":true}},{"name":"data","type":{"kind":"simple","type":"cell","optional":true}}]},
    {"name":"Deploy","header":2490013878,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"DeployOk","header":2952335191,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"FactoryDeploy","header":1829761339,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"cashback","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ChangeOwner","header":2174598809,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"newOwner","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ChangeOwnerOk","header":846932810,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"newOwner","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"EventTrigger","header":1365159228,"fields":[{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"address","type":{"kind":"simple","type":"address","optional":false}},{"name":"info","type":{"kind":"simple","type":"EventSignal","optional":false}}]},
    {"name":"EventSignal","header":306637748,"fields":[{"name":"eventId","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"payload","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"BuildMessenger","header":2826761911,"fields":[{"name":"sourceAddress","type":{"kind":"simple","type":"address","optional":false}},{"name":"eventId","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"maxUserStakeAmount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"subscribeFeePerTick","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"template","type":{"kind":"simple","type":"cell","optional":false}},{"name":"sourceName","type":{"kind":"simple","type":"string","optional":false}}]},
    {"name":"BuildChildRouter","header":2831422442,"fields":[{"name":"sourceAddress","type":{"kind":"simple","type":"address","optional":false}},{"name":"eventId","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"maxUserStakeAmount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"subscribeFeePerTick","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"template","type":{"kind":"simple","type":"cell","optional":false}},{"name":"sourceName","type":{"kind":"simple","type":"string","optional":false}}]},
    {"name":"CreateBody","header":2617235749,"fields":[{"name":"walletAddress","type":{"kind":"simple","type":"address","optional":false}},{"name":"deadline","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"eventId","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"parameter","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"SubscribeBody","header":1953340414,"fields":[{"name":"walletAddress","type":{"kind":"simple","type":"address","optional":false}},{"name":"deadline","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"eventId","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"callbackAddress","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"EventSourceRegister","header":3902166577,"fields":[{"name":"template","type":{"kind":"simple","type":"cell","optional":false}},{"name":"maxUserStakeAmount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"subscribeFeePerTick","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"sourceName","type":{"kind":"simple","type":"string","optional":false}}]},
    {"name":"ProtcolRegister","header":882920319,"fields":[{"name":"sourceAddress","type":{"kind":"simple","type":"address","optional":false}},{"name":"template","type":{"kind":"simple","type":"cell","optional":false}},{"name":"maxUserStakeAmount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"subscribeFeePerTick","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"sourceName","type":{"kind":"simple","type":"string","optional":false}}]},
    {"name":"ProtcolRegisterSuccess","header":2543656262,"fields":[{"name":"sourceAddress","type":{"kind":"simple","type":"address","optional":false}},{"name":"eventId","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"maxUserStakeAmount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"subscribeFeePerTick","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"template","type":{"kind":"simple","type":"cell","optional":false}},{"name":"sourceName","type":{"kind":"simple","type":"string","optional":false}}]},
    {"name":"CreateMsgSubscriber","header":2100856841,"fields":[{"name":"walletAddress","type":{"kind":"simple","type":"address","optional":false}},{"name":"callbackAddress","type":{"kind":"simple","type":"address","optional":false}},{"name":"eventId","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"BuildCallback","header":371930965,"fields":[{"name":"parameter","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"CreateMsgSubscriberSuccess","header":3382650231,"fields":[{"name":"callbackAddress","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"CreateUdcSuccess","header":3989598131,"fields":[{"name":"walletAddress","type":{"kind":"simple","type":"address","optional":false}},{"name":"callbackAddress","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"DeleteSubscriber","header":380345681,"fields":[{"name":"walletAddress","type":{"kind":"simple","type":"address","optional":false}},{"name":"callbackAddress","type":{"kind":"simple","type":"address","optional":false}},{"name":"eventId","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"DestroyMessenger","header":2952350305,"fields":[{"name":"messengerId","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"AddMessenger","header":2557114565,"fields":[{"name":"protocolAddress","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"AddStakeFor","header":3476889102,"fields":[{"name":"beneficiary","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"RemoveStake","header":3725077757,"fields":[{"name":"receiver","type":{"kind":"simple","type":"address","optional":false}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"CollectFee","header":901872456,"fields":[{"name":"messengerId","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"fee","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"BuildUDC","header":2104203658,"fields":[{"name":"owner","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ExtMessage","header":2686769784,"fields":[{"name":"seqno","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"valid_until","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"signature","type":{"kind":"simple","type":"fixed-bytes","optional":false,"format":64}},{"name":"message_parameters","type":{"kind":"simple","type":"SendParameters","optional":false}}]},
    {"name":"OffchainEventSignal","header":3146769914,"fields":[{"name":"eventId","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"payload","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"Staked","header":4007728783,"fields":[{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"staker","type":{"kind":"simple","type":"address","optional":false}},{"name":"beneficiary","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"Withdrawn","header":912108722,"fields":[{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"receiver","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ClaimReward","header":3088241813,"fields":[{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"receiver","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"SetMessenger","header":853868809,"fields":[{"name":"messenger","type":{"kind":"simple","type":"address","optional":false}},{"name":"eventId","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"Trade","header":2411913942,"fields":[{"name":"orderAction","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"positionSize","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"BugWarning","header":1795428193,"fields":[{"name":"targetAdress","type":{"kind":"simple","type":"address","optional":false}},{"name":"bugInfo","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"SetEventId","header":1872535788,"fields":[{"name":"eventId","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"BlacklistWarning","header":2874857256,"fields":[{"name":"address","type":{"kind":"simple","type":"address","optional":false}},{"name":"info","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"Transfer","header":3125994780,"fields":[{"name":"to","type":{"kind":"simple","type":"address","optional":false}},{"name":"value","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
]

const Messenger_getters: ABIGetter[] = [
    {"name":"idToSubscriber","arguments":[{"name":"id","type":{"kind":"simple","type":"int","optional":false,"format":257}}],"returnType":{"kind":"simple","type":"address","optional":true}},
    {"name":"getsubId","arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"totalSubscriberNumber","arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"owner","arguments":[],"returnType":{"kind":"simple","type":"address","optional":false}},
]

const Messenger_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"empty"}},
    {"receiver":"internal","message":{"kind":"typed","type":"BuildMessenger"}},
    {"receiver":"internal","message":{"kind":"typed","type":"EventSignal"}},
    {"receiver":"internal","message":{"kind":"typed","type":"CreateMsgSubscriber"}},
    {"receiver":"internal","message":{"kind":"typed","type":"DeleteSubscriber"}},
    {"receiver":"internal","message":{"kind":"typed","type":"Deploy"}},
]

export class Messenger implements Contract {
    
    static async init(owner: Address, sourceAddress: Address, messengerId: bigint) {
        return await Messenger_init(owner, sourceAddress, messengerId);
    }
    
    static async fromInit(owner: Address, sourceAddress: Address, messengerId: bigint) {
        const init = await Messenger_init(owner, sourceAddress, messengerId);
        const address = contractAddress(0, init);
        return new Messenger(address, init);
    }
    
    static fromAddress(address: Address) {
        return new Messenger(address);
    }
    
    readonly address: Address; 
    readonly init?: { code: Cell, data: Cell };
    readonly abi: ContractABI = {
        types:  Messenger_types,
        getters: Messenger_getters,
        receivers: Messenger_receivers,
        errors: Messenger_errors,
    };
    
    private constructor(address: Address, init?: { code: Cell, data: Cell }) {
        this.address = address;
        this.init = init;
    }
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: null | BuildMessenger | EventSignal | CreateMsgSubscriber | DeleteSubscriber | Deploy) {
        
        let body: Cell | null = null;
        if (message === null) {
            body = new Cell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'BuildMessenger') {
            body = beginCell().store(storeBuildMessenger(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'EventSignal') {
            body = beginCell().store(storeEventSignal(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'CreateMsgSubscriber') {
            body = beginCell().store(storeCreateMsgSubscriber(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'DeleteSubscriber') {
            body = beginCell().store(storeDeleteSubscriber(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Deploy') {
            body = beginCell().store(storeDeploy(message)).endCell();
        }
        if (body === null) { throw new Error('Invalid message type'); }
        
        await provider.internal(via, { ...args, body: body });
        
    }
    
    async getIdToSubscriber(provider: ContractProvider, id: bigint) {
        let builder = new TupleBuilder();
        builder.writeNumber(id);
        let source = (await provider.get('idToSubscriber', builder.build())).stack;
        let result = source.readAddressOpt();
        return result;
    }
    
    async getGetsubId(provider: ContractProvider) {
        let builder = new TupleBuilder();
        let source = (await provider.get('getsubId', builder.build())).stack;
        let result = source.readBigNumber();
        return result;
    }
    
    async getTotalSubscriberNumber(provider: ContractProvider) {
        let builder = new TupleBuilder();
        let source = (await provider.get('totalSubscriberNumber', builder.build())).stack;
        let result = source.readBigNumber();
        return result;
    }
    
    async getOwner(provider: ContractProvider) {
        let builder = new TupleBuilder();
        let source = (await provider.get('owner', builder.build())).stack;
        let result = source.readAddress();
        return result;
    }
    
}