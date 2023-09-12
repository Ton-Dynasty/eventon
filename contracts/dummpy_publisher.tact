import "@stdlib/deploy";
import "@stdlib/ownable";
import "./common/msg_types";
import "./common/alertable";


contract BugDetector with Deployable, Alertable {
    owner: Address;
    universalRouterAddress: Address;
    eventId: Int;

    init(owner : Address, universalRouterAddress: Address) {
        self.owner = owner;
        self.universalRouterAddress = universalRouterAddress;
        self.eventId = -1;
    }

    receive() {}
    
    receive(msg: "") {
        let sendPayload: Cell = beginCell()
                                    .storeAddress(msg.targetAdress)
                                    .storeRef(msg.bugInfo)
                                .endCell();
        let eventSignal: EventSignal = EventSignal{
            eventId: self.eventId,
            payload: sendPayload
        };
        self.sendAlert(eventSignal);
    }

}
