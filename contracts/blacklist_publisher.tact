
import "./common/alertable";
import "@stdlib/deploy";
import "./common/msg_types";
import "./example/msg_types";

// Blacklist publisher
// This contract is used to blacklist a publisher
contract BlacklistPublisher with Deployable, Alertable {
    owner: Address;
    promiseEyeAddress: Address; 
    eventId: Int;

    init(owner : Address, promiseEyeAddress: Address) {
        self.owner = owner;
        self.promiseEyeAddress = promiseEyeAddress;
        self.eventId = -1;
    }

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
