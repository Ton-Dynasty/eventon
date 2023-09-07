message EventTrigger {
    value: Int;
    address: Address;
    info: EventSignal;
}

message EventSignal {
    eventId: Int as uint8; // Protocol-defined event identifier to allow the callback contract to handle based on the ID.
    payload: Cell; // Optional information that the message sender can choose to send to the subscriber who subcribes to the event.
}

message BuildMessenger {
    sourceAddress: Address; // Protocol's address
} 

message BuildChildRouter {
    sourceAddress: Address; // Protocol's address
    template: Cell; // Callback contract for subscribers
} 

message DefaultRegister {
    walletAddress: Address; // Owner address of callback contract
    deadline: Int; // The deadline of the msg can delay
    eventId: Int; // The even id which user want to subscribe
    parameter: Cell; // Callback contract parameter
}

message AdvancedRegister {
    walletAddress: Address; // Owner address of callback contract
    deadline: Int; // The deadline of the msg can delay
    eventId: Int; // The even id which user want to subscribe
    callbackAddress: Address; // Callback contract address written by user
}

message ProtcolRegister {
    sourceAddress: Address; // Protocol's address
    template: Cell; // Callback contract for subscribers
}

message CallbackAddress {
    callbackAddress: Address; // UDC address
}

message AddMessenger {
    protocolAddress: Address; // Protocol's address
}


message AddStakeFor {
    beneficiary: Address; // Beneficiary address
}

message RemoveStake {
    receiver: Address; // Receiver address
    amount: Int as coins; // Amount of stake to be removed
}

message CollectFee {
    messengerId: Int; // Messenger id
    fee: Int as coins; // Amount of fee from subscribers to be collected
}

message BuildUDC {
    owner: Address; // Owner address of UDC
}