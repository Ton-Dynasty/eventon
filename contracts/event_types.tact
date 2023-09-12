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


