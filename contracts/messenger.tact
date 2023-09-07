import "@stdlib/deploy";
import "@stdlib/ownable";
import "./msg_types";

contract Messenger with Deployable, Ownable {
    owner: Address; // Router Address
    sourceAddress: Address; // Protocal Address
    messengerId: Int;
    subscriberId: Int;
    idToSubscriber: map<Int, Address>;

    init(owner: Address, sourceAddress: Address,messengerId: Int) {
        self.owner = owner;
        self.sourceAddress = sourceAddress;
        self.messengerId = messengerId;
        self.subscriberId = 0;
    }

    receive (msg: BuildMessenger) {
        if (msg.sourceAddress != self.sourceAddress) {
            throw(007);
        }
    }

    receive (msg: EventSignal) {
        let i: Int = 0;
        let collected_fee: Int = 0;
        let value: Int = ton("0.1");
        while(i < self.subscriberId) {
            let subscriber: Address = self.idToSubscriber.get(i)!!;
            // TODO: check if subscriber is still subscribed (there is enough fee for this subscriber)
            send(SendParameters{
                to: subscriber,
                value: value, 
                mode: SendPayGasSeparately, 
                bounce: true,
                body: EventSignal {
                    eventId: msg.eventId,
                    payload: msg.payload
                }.toCell()
            });
            // TODO: collect fee from subscriber
            i = i + 1;
        }
        // TODO: Send collected fee to child router
        send(SendParameters{
            to: self.owner,
            value: collected_fee,
            mode: SendPayGasSeparately,
            body: CollectFee{
                messengerId: self.messengerId,
                fee: collected_fee
            }.toCell()
        });
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

    get fun getsubId(): Int {
        return self.subscriberId;
    }
}
