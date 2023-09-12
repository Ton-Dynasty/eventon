import "@stdlib/deploy";
import "@stdlib/ownable";
import "./common/msg_types";
import "./common/alertable";
import "./example/msg_types";

contract Event with Deployable, Alertable {
    owner: Address;
    promiseEyeAddress: Address;
    eventId: Int;
    init(owner: Address, promiseEyeAddress: Address) {
        self.owner = owner;
        self.promiseEyeAddress = promiseEyeAddress;
        self.eventId = -1;
    }
    receive() {}
    receive(msg: EventTrigger) {
        self.sendAlert(msg.info);
    }

    get fun getPromiseEyeAddress(): Address {
        return self.promiseEyeAddress;
    }
}
