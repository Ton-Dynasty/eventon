import "@stdlib/ownable";

trait Alertable with Ownable {
    owner: Address;
    universalRouterAddress: Address;
    eventId: Int; // Event id of this protocol

    // Send event signal to Universal Router so that it can be broadcasted to subscribers
    fun sendAlert(msg: EventSignal) {
        send(SendParameters{
            to: self.universalRouterAddress, 
            value: 0,
            bounce: false,
            mode: SendRemainingValue,
            body: EventSignal{ 
                eventId: msg.eventId, // This is protocol's event signal id, it can let one protocol to have multiple event signals(not implemented yet)
                payload: msg.payload // Information about the event signal
            }.toCell()
        });
    }

    // Register protocol to Universal Router
    receive(msg : EventSourceRegister) {
        self.requireOwner();
        send(SendParameters{
            to: self.universalRouterAddress, 
            value: 0, 
            bounce: false,
            mode: SendRemainingValue, 
            body: ProtcolRegister{ 
                sourceAddress: myAddress(), // Protocol's address
                template: msg.template, // Callback contract for subscribers
                maxUserStakeAmount: msg.maxUserStakeAmount, // Maximum amount of stake that a user can stake for the protocol
                subscribeFeePerTick: msg.subscribeFeePerTick, // Amount of fee that a subscriber has to pay for each tick
                sourceName: msg.sourceName // Protocol's name
            }.toCell()
        });
    }

    // Set this protocol's event id
    receive(msg: SetEventId) {
        self.requireOwner();
        self.eventId = msg.eventId;
    }

    // Get this protocol's event id
    get fun getEventId(): Int {
        return self.eventId;
    }
}