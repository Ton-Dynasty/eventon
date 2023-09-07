import "@stdlib/deploy";
import "@stdlib/ownable";
import "./msg_types";

contract Messenger with Deployable, Ownable {
    owner: Address; // Router Address
    sourceAddress: Address; // Protocal Address
    messagenerId: Int;
    subscriberId: Int;
    idToSubscriber: map<Int, Address>;

    init(owner: Address, sourceAddress: Address,messagenerId: Int) {
        self.owner = owner;
        self.sourceAddress = sourceAddress;
        self.messagenerId = messagenerId;
        self.subscriberId = 0;
    }

    receive (msg: EventSignal) {
        let i: Int = 0;
        while(i < self.subscriberId) {
            let subscriber: Address = self.idToSubscriber.get(i)!!;
            send(SendParameters{
                to: subscriber,
                value: 0, 
                mode: SendPayGasSeparately, 
                bounce: true,
                body: msg.toCell()
            });
            i = i + 1;
        }
    }

    receive(msg: CallbackAddress) {
        self.requireOwner();
        self.idToSubscriber.set(self.subscriberId, msg.callbackAddress);
        self.subscriberId = self.subscriberId + 1;
    }


    get fun idToSubscriber(id: Int): Address? {
        if (id >= self.subscriberId) {
            return null;
        }
        return self.idToSubscriber.get(id)!!;
    }

}
