import "@stdlib/deploy";
import "@stdlib/ownable";
import "./msg_types";

trait Alertable with Ownable {
    owner: Address;
    promiseEyeAddress: Address;
    eventId: Int;
    fun sendAlert(msg: EventSignal) {
        //dump("send to promise eye");
        send(SendParameters{
            to: self.promiseEyeAddress, 
            value: 0, 
            bounce: false,
            mode: SendRemainingValue, // have think why use SendRemainingValue mode
            body: EventSignal{ 
                eventId: msg.eventId,
                payload: msg.payload
            }.toCell()
        });
    }

    receive(msg : ProtcolRegister) {
        self.requireOwner();
        send(SendParameters{
            to: self.promiseEyeAddress, 
            value: 0, 
            bounce: false,
            mode: SendRemainingValue, // have think why use SendRemainingValue mode
            body: ProtcolRegister{ 
                sourceAddress: myAddress(), // Protocol's address
                template: msg.template, // Callback contract for subscribers
                maxUserStakeAmount: msg.maxUserStakeAmount, // Maximum amount of stake that a user can stake for the protocol
                subscribeFeePerTick: msg.subscribeFeePerTick // Amount of fee that a subscriber has to pay for each tick
            }.toCell()
        });
    }

    receive(msg: SetEventId) {
        self.requireOwner();
        self.eventId = msg.eventId;
    }
}

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
