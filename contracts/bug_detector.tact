import "@stdlib/deploy";
import "@stdlib/ownable";
import "./common/msg_types";
import "./example/msg_types";
import "./common/alertable";

/*
This contract is used to detect bugs in other smart contracts.
When find a bug, it will send a warning to the universal router and send this warning to its subscribers.
*/
contract BugDetector with Deployable, Alertable {
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
    
    /*
    Receive smart contract bug warning and send this warning to the universal router
    */
    receive(msg: BugWarning) {
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
