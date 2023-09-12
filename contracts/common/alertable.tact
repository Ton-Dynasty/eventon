import "@stdlib/ownable";

trait Alertable with Ownable {
    owner: Address;
    promiseEyeAddress: Address;
    eventId: Int;
    fun sendAlert(msg: EventSignal) {
        //dump("send to promise eye");
        send(SendParameters{
            to: self.promiseEyeAddress, 
            value: 0,
            bounce: false,
            mode: SendRemainingValue, // have think why use SendRemainingValue mode
            body: EventSignal{ 
                eventId: msg.eventId,
                payload: msg.payload
            }.toCell()
        });
    }

    receive(msg : ProtcolRegister) {
        self.requireOwner();
        send(SendParameters{
            to: self.promiseEyeAddress, 
            value: 0, 
            bounce: false,
            mode: SendRemainingValue, // have think why use SendRemainingValue mode
            body: ProtcolRegister{ 
                sourceAddress: myAddress(), // Protocol's address
                template: msg.template, // Callback contract for subscribers
                maxUserStakeAmount: msg.maxUserStakeAmount, // Maximum amount of stake that a user can stake for the protocol
                subscribeFeePerTick: msg.subscribeFeePerTick // Amount of fee that a subscriber has to pay for each tick
            }.toCell()
        });
    }

    receive(msg: SetEventId) {
        self.requireOwner();
        self.eventId = msg.eventId;
    }
}