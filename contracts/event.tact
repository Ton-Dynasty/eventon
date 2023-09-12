import "@stdlib/deploy";
import "@stdlib/ownable";
import "./common/msg_types";
import "./common/alertable";
import "./example/msg_types";

contract Event with Deployable, Alertable {
    owner: Address;
    universalRouterAddress: Address;
    eventId: Int;
    init(owner: Address, universalRouterAddress: Address) {
        self.owner = owner;
        self.universalRouterAddress = universalRouterAddress;
        self.eventId = -1;
    }
    receive() {}
    receive(msg: EventTrigger) {
        self.requireOwner();
        self.sendAlert(msg.info);
    }

    get fun getuniversalRouterAddress(): Address {
        return self.universalRouterAddress;
    }
}
