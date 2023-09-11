import "@stdlib/deploy";
import "@stdlib/ownable";
import "./common/msg_types";
import "./example/msg_types";
import "./common/alertable";


contract BugDetector with Deployable, Alertable {
    owner: Address;
    promiseEyeAddress: Address;
    eventId: Int;

    init(owner : Address, promiseEyeAddress: Address) {
        self.owner = owner;
        self.promiseEyeAddress = promiseEyeAddress;
        self.eventId = -1;
    }

    receive() {}
    
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
