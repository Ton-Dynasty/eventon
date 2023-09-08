import "@stdlib/deploy";
import "@stdlib/ownable";
import "./msg_types";

contract Messenger with Deployable, Ownable {
    owner: Address; // Router Address
    sourceAddress: Address; // Protocal Address
    messengerId: Int;
    subscriberId: Int;
    idToSubscriber: map<Int, Address>;
    hashToSubscriber: map<Int, Int>;
    subscriberCount: Int;

    init(owner: Address, sourceAddress: Address,messengerId: Int) {
        self.owner = owner;
        self.sourceAddress = sourceAddress;
        self.messengerId = messengerId;
        self.subscriberId = 0;
        self.subscriberCount = 0;
    }

    receive (msg: BuildMessenger) {
        if (msg.sourceAddress != self.sourceAddress) {
            throw(007);
        }
    }

    receive (msg: EventSignal) {
        let i: Int = 0;
        let collected_fee: Int = 0;
        while(i < self.subscriberId) {
            let subscriber: Address? = self.idToSubscriber.get(i);
            if(subscriber != null)
            {
                // TODO: check if subscriber is still subscribed (there is enough fee for this subscriber)
                let value: Int = ton("0.1");
                send(SendParameters{
                    to: subscriber!!,
                    value: value, 
                    mode: SendPayGasSeparately, 
                    bounce: true,
                    body: msg.toCell()
                });
                // TODO: collect fee from subscriber
            }
            
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

    receive(msg: CreateMsgSubscriber) {
        self.requireOwner();
        self.idToSubscriber.set(self.subscriberId, msg.callbackAddress);
        self.subscriberId = self.subscriberId + 1;
        let hashResult: Int = beginCell().storeAddress(msg.walletAddress).storeAddress(msg.callbackAddress).endCell().asSlice().hash();
        self.hashToSubscriber.set(hashResult, 1);
        self.subscriberCount = self.subscriberCount + 1;
    }

    receive(msg: DeleteSubscriber) {
        self.requireOwner();
        let hashResult: Int = beginCell().storeAddress(msg.walletAddress).storeAddress(msg.callbackAddress).endCell().asSlice().hash();
        if (self.hashToSubscriber.get(hashResult) == null) {
            throw(008); // not subscribed yet
        }
        self.idToSubscriber.set(self.subscriberId, null);
        self.hashToSubscriber.set(hashResult, 0);
        self.subscriberCount = self.subscriberCount - 1;
        if(self.subscriberCount == 0 ) {
            send(SendParameters{
                to: self.owner,
                value: 0, 
                mode: SendRemainingBalance + SendDestroyIfZero, 
                bounce: true,
                body: DestroyMessenger {
                    messengerId: self.messengerId
                }.toCell()
            });
        }
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

    get fun getSubCount(): Int {
        return self.subscriberCount;
    }
}
