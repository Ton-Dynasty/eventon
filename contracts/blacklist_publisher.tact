
import "./common/alertable";
import "@stdlib/deploy";
import "./common/msg_types";
import "./example/msg_types";

// Blacklist publisher
// This contract is used to blacklist a publisher
contract BlacklistPublisher with Deployable, Alertable {
    owner: Address;
    universalRouterAddress: Address; 
    eventId: Int;

    init(owner : Address, universalRouterAddress: Address) {
        self.owner = owner;
        self.universalRouterAddress = universalRouterAddress;
        self.eventId = -1;
    }

    // Function to receive funds
    receive() {}
    
    // Publish a blacklist warning
    receive(msg: BlacklistWarning) {
        let payload: Cell = beginCell()
                                .storeAddress(msg.address)
                                .storeRef(msg.info)
                            .endCell();
        let eventSignal: EventSignal = EventSignal{
            eventId: self.eventId,
            payload: payload
        };
        self.sendAlert(eventSignal);
    }
}
