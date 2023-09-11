message SetMessenger {
    messenger: Address; // Messenger address
    eventId: Int; // Event id
}

message Trade {
    orderAction: Int;
    positionSize: Int;
}

message BugWarning {
    targetAdress: Address; // The smart contract address that has a bug
    bugInfo: Cell; // The bug information
}

message SetEventId {
    eventId: Int; // Event id
}

// Blacklist warning
message BlacklistWarning {
    address: Address;
    info: Cell;
}

// Transfer
message Transfer {
    to: Address;
    value: Int as coins;
}