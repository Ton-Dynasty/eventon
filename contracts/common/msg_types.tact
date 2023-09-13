message EventTrigger {
    value: Int; 
    address: Address; 
    info: EventSignal;
}
message EventSignal {
    eventId: Int; // Protocol-defined event identifier to allow the callback contract to handle based on the ID.
    payload: Cell; // Optional information that the message sender can choose to send to the subscriber who subcribes to the event.
}
message BuildMessenger {
    sourceAddress: Address; // Protocol's address
    eventId: Int; // The even id which user want to subscribe
    maxUserStakeAmount: Int as coins; // Maximum amount of stake that a user can stake for the protocol
    subscribeFeePerTick: Int as coins; // Amount of fee that a subscriber has to pay for each tick
    template: Cell; // Callback contract for subscribers
    sourceName: String; // Protocol's name
}

message BuildChildRouter {
    sourceAddress: Address; // Protocol's address
    eventId: Int; // The even id which user want to subscribe
    maxUserStakeAmount: Int as coins; // Maximum amount of stake that a user can stake for the protocol
    subscribeFeePerTick: Int as coins; // Amount of fee that a subscriber has to pay for each tick
    template: Cell; // Callback contract for subscribers
    sourceName: String; // Protocol's name
}
message CreateBody {
    walletAddress: Address; // Owner address of callback contract
    deadline: Int; // The deadline of the msg can delay
    eventId: Int; // The even id which user want to subscribe
    parameter: Cell; // Callback contract parameter
}
message SubscribeBody {
    walletAddress: Address; // Owner address of callback contract
    deadline: Int; // The deadline of the msg can delay
    eventId: Int; // The even id which user want to subscribe
    callbackAddress: Address; // Callback contract address written by user
}

message EventSourceRegister {
    template: Cell; // Callback contract for subscribers
    maxUserStakeAmount: Int as coins; // Maximum amount of stake that a user can stake for the protocol
    subscribeFeePerTick: Int as coins; // Amount of fee that a subscriber has to pay for each tick
    sourceName: String; // Protocol's name
}

message ProtcolRegister {
    sourceAddress: Address; // Protocol's address
    template: Cell; // Callback contract for subscribers
    maxUserStakeAmount: Int as coins; // Maximum amount of stake that a user can stake for the protocol
    subscribeFeePerTick: Int as coins; // Amount of fee that a subscriber has to pay for each tick
    sourceName: String; // Protocol's name
}

message ProtcolRegisterSuccess {
    sourceAddress: Address; // Protocol's address
    eventId: Int; // The even id which user want to subscribe
    maxUserStakeAmount: Int as coins; // Maximum amount of stake that a user can stake for the protocol
    subscribeFeePerTick: Int as coins; // Amount of fee that a subscriber has to pay for each tick
    template: Cell; // Callback contract for subscribers
    sourceName: String; // Protocol's name
}

message CreateMsgSubscriber {
    walletAddress: Address; // Owner address of callback contract
    callbackAddress: Address; // UDC address
    eventId: Int; // The even id which user want to subscribe
}

message CreateMsgSubscriberSuccess {
    callbackAddress: Address; // Owner address of callback contract
}

message CreateUdcSuccess {
    walletAddress: Address; // Owner address of callback contract
    callbackAddress: Address; // UDC address
}

message DeleteSubscriber {
    walletAddress: Address; // Owner address of callback contract
    callbackAddress: Address; // UDC address
    eventId: Int; // The even id which user want to subscribe
}

message DestroyMessenger {
    messengerId: Int; 
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

message ExtMessage {
    seqno: Int as uint32; // Sequence number of the event
    valid_until: Int as uint32; // deadline of the message
    signature: Slice as bytes64; // Signature of the above all fields
    message_parameters: SendParameters; // NOTICE: Message payload should be in message parameters.
}

message OffchainEventSignal {
    eventId: Int; // Protocol-defined event identifier to allow the callback contract to handle based on the ID.
    payload: Cell; // Optional information that the message sender can choose to send to the subscriber who subcribes to the event.
}

message Staked {
    amount: Int as coins;
    staker: Address;
    beneficiary: Address;
}

message Withdrawn {
    amount: Int as coins;
    receiver: Address;
}

message ClaimReward{
    amount: Int as coins;
    receiver: Address;
}
