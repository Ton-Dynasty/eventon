import "@stdlib/deploy";
import "@stdlib/ownable";
import "./common/msg_types";
import "./common/alertable";
import "./example/msg_types";

/*
This contract is acting like a protocol.
This contract will send event signal to the universal router and to its subscribers.
*/
contract Event with Deployable, Alertable {
    owner: Address;
    universalRouterAddress: Address;
    eventId: Int; // This protocol's event id

    init(owner: Address, universalRouterAddress: Address) {
        self.owner = owner;
        self.universalRouterAddress = universalRouterAddress;
        self.eventId = -1;
    }

    // Function to receive funds
    receive() {}
    
    // Event Trigger means something happened, and this protocol will send this event sinal to its subscribers.
    receive(msg: EventTrigger) {
        self.requireOwner();
        self.sendAlert(msg.info);
    }

    // Get Methods

    // Get the Universal Router address
    get fun getuniversalRouterAddress(): Address {
        return self.universalRouterAddress;
    }
}
