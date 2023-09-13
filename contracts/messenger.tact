import "@stdlib/deploy";         // Import deployment library
import "@stdlib/ownable";        // Import ownable library
import "./common/msg_types";    // Import custom message types
import "./example/msg_types";   // Import custom example message types

/*
Messenger contract that sends event signals to its subscribers.
Subscribers can subscribe or unsubscribe from these event signals.
Fees are collected from subscribers for the services provided.
*/
contract Messenger with Deployable, Ownable {
    // State variables
    owner: Address;                     // Address of the router (Owner of the messenger)
    sourceAddress: Address;             // Address of the protocol source
    messengerId: Int;                   // Unique identifier for this messenger
    nextSubscriberId: Int;              // ID for the next subscriber
    idToSubscriber: map<Int, Address>;  // Mapping of Subscriber ID to its address
    hashToSubscriber: map<Int, Int>;    // Mapping of Hash (address & event ID) to subscription status
    hashToSubscribeFee: map<Int, Int>;  // Mapping of Hash (address & event ID) to subscription fee
    totalSubscriberNumber: Int;               // Total number of subscribers
    subscribeFeePerTick: Int;           // Fee per tick for subscription
    
    /*
    Constructor to initialize the messenger contract.
    Parameters:
        owner: Address of the router
        sourceAddress: Address of the protocol source
        messengerId: Unique identifier for the messenger
    */
    init(owner: Address, sourceAddress: Address, messengerId: Int) {
        self.owner = owner;
        self.sourceAddress = sourceAddress;
        self.messengerId = messengerId;
        self.nextSubscriberId = 0; 
        self.totalSubscriberNumber = 0;
        self.subscribeFeePerTick = 0;
    }

    // Function to receive funds
    receive() {}
    
    /*
    Handle BuildMessenger message type.
    This allows the owner to build the messenger.
    */
    receive (msg: BuildMessenger) {
        self.requireOwner();
        if (msg.sourceAddress != self.sourceAddress) {
            throw(1004); // This Source address doesn't match this messenger
        }
        self.subscribeFeePerTick = msg.subscribeFeePerTick;
        // Respond with a success message
        self.reply(ProtcolRegisterSuccess {
            sourceAddress: msg.sourceAddress, 
            eventId: msg.eventId,
            maxUserStakeAmount: msg.maxUserStakeAmount,
            subscribeFeePerTick: msg.subscribeFeePerTick,
            template: msg.template, 
            sourceName: msg.sourceName 
        }.toCell());
    }

    /*
    Handle EventSignal message type.
    This sends the event signal to all subscribed users.
    */
    receive (msg: EventSignal) {
        self.requireOwner();
        let i: Int = 0;
        let collected_fee: Int = 0;
        // Loop through all subscribers
        while(i < self.nextSubscriberId) {
            let subscriber: Address? = self.idToSubscriber.get(i);
            if(subscriber != null) {
                let hashResult: Int = beginCell().storeAddress(subscriber!!).storeInt(msg.eventId,8).endCell().asSlice().hash();
                let value: Int = ton("0.1");
                let fee: Int? = self.hashToSubscribeFee.get(hashResult);
                
                // Check if the subscriber has enough fee
                if (fee != null && fee!! > self.subscribeFeePerTick && self.subscribeFeePerTick >= value) {
                    // Send the event signal and collect fees
                    send(SendParameters{
                        to: subscriber!!,
                        value: value, 
                        mode: SendPayGasSeparately, 
                        bounce: true,
                        body: EventSignal {
                            eventId: msg.eventId,
                            payload: msg.payload
                        }.toCell()
                    });
                    collected_fee = collected_fee + (self.subscribeFeePerTick - value);
                }
            }
            i = i + 1;
        }
        
        // Send collected fees to the owner
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

    /*
    Handle CreateMsgSubscriber message type.
    This allows a subscriber to be added to the messenger.
    */
    receive(msg: CreateMsgSubscriber) {
        self.requireOwner();
        let ctx: Context = context();
        // Update mappings for the new subscriber
        self.idToSubscriber.set(self.nextSubscriberId, msg.callbackAddress);
        let hashResult: Int = beginCell().storeAddress(msg.callbackAddress).storeInt(msg.eventId,8).endCell().asSlice().hash();
        self.hashToSubscriber.set(hashResult, 1);
        self.hashToSubscribeFee.set(hashResult, ctx.value);
        self.nextSubscriberId = self.nextSubscriberId + 1;
        self.totalSubscriberNumber = self.totalSubscriberNumber + 1;
        
        // Emit an event for successful subscriber creation
        emit(CreateMsgSubscriberSuccess {
            callbackAddress: msg.callbackAddress
        }.toCell());
    }

    /*
    Handle DeleteSubscriber message type.
    This removes a subscriber from the messenger.
    */
    receive(msg: DeleteSubscriber) {
        self.requireOwner();
        
        // Check if the subscriber exists
        let hashResult: Int = beginCell().storeAddress(msg.callbackAddress).storeInt(msg.eventId,8).endCell().asSlice().hash();
        if (self.hashToSubscriber.get(hashResult) == null) {
            throw(1005); // Error: Subscriber not found
        }

        // Update mappings to remove the subscriber
        self.idToSubscriber.set(self.nextSubscriberId, null);
        self.hashToSubscriber.set(hashResult, 0);
        self.hashToSubscribeFee.set(hashResult, 0);
        self.totalSubscriberNumber = self.totalSubscriberNumber - 1;

        // Destroy the messenger if no subscribers remain
        if(self.totalSubscriberNumber == 0 ) {
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

    // Getter function to fetch subscriber address by its ID
    get fun idToSubscriber(id: Int): Address? {
        if (id >= self.nextSubscriberId) {
            return null;
        }
        return self.idToSubscriber.get(id)!!;
    }

    // Getter function to fetch the next subscriber ID
    get fun getsubId(): Int {
        return self.nextSubscriberId;
    }

    // Getter function to fetch the total subscriber count
    get fun totalSubscriberNumber(): Int {
        return self.totalSubscriberNumber;
    }   
}
