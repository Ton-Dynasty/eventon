import "@stdlib/deploy";
import "@stdlib/ownable";
import "./msg_types";

trait Alertable {
    promiseEyeAddress: Address;
    fun sendAlert(msg: EventSignal) {
        send(SendParameters{
            to: self.promiseEyeAddress, 
            value: 0, 
            bounce: false,
            mode: SendRemainingValue,
            body: EventSignal{ 
                eventId: msg.eventId,
                payload: msg.payload
            }.toCell()
        });
    }
}

contract Event with Deployable, Ownable, Alertable {
    owner: Address;
    promiseEyeAddress: Address;
    init(owner: Address, promiseEyeAddress: Address) {
        self.owner = owner;
        self.promiseEyeAddress = promiseEyeAddress;
    }
    receive() {}
    receive(msg: EventTrigger) {
        self.requireOwner();
        self.sendAlert(msg.info);
    }

    get fun getPromiseEyeAddress(): Address {
        return self.promiseEyeAddress;
    }
}
