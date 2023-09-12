import "@stdlib/deploy";         // Import deployment library
import "@stdlib/ownable";        // Import ownable library
import "./common/msg_types";    // Import custom message types
import "./example/msg_types";   // Import custom example message types
import "./child_router";        // Import child router contract


/*
The UniversalRouter contract facilitates the registration of protocols. 
It allows users to subscribe to events of these protocols, 
unsubscribe from them, and also establish a default callback contract.
Additionally, protocols can send messages to add new messengers to the child router.
*/
contract UniversalRouter with Deployable, Ownable {
    owner: Address;
    eventCount: Int;  // Counter to track the number of events. e.g., Oracle has ID 0, Chainlink has ID 1, etc.
    protocolToRouter: map<Address, Address>; // Mapping of protocol addresses to their respective child router addresses.
    eventIdToProtocol: map<Int, Address>; // Mapping of event IDs to the corresponding protocol addresses.
    protocolToEventId: map<Address, Int>; // Mapping of protocol addresses to their event IDs.
    minimumStake: Int;  // The minimum amount of stake required for each protocol.

    // Constructor for initializing the contract with the owner's address.
    init(owner: Address){
        self.owner = owner;
        self.eventCount = 0;
        self.minimumStake = 0;
    }

    // Default receive function.
    receive() {}

    /*
    Handles ProtocolRegister messages. When a protocol wishes to register itself, it sends this message.
    A new child router is then created for that protocol.
    */
    receive(msg: ProtcolRegister) {
        /// Ensures the protocol hasn't been registered already.
        if (self.protocolToRouter.get(msg.sourceAddress) != null) {
            throw(001);
        }

        let cxt: Context = context();
        let sourceAddress: Address = cxt.sender;
        self.eventIdToProtocol.set(self.eventCount, sourceAddress);
        self.protocolToEventId.set(sourceAddress, self.eventCount);

        // Build child router
        let childRouterAddress: Address = self.childRouterAddress(sourceAddress);
        self.protocolToRouter.set(sourceAddress, childRouterAddress);
        let value: Int = ton("0.1");
        let init: StateInit = self.getChildRouterInit(sourceAddress);
        send(SendParameters{
                to: childRouterAddress,
                value: 0,
                mode: SendRemainingValue,
                bounce: false,
                body: BuildChildRouter{
                    sourceAddress: sourceAddress,
                    template: msg.template,
                    maxUserStakeAmount: msg.maxUserStakeAmount,
                    subscribeFeePerTick: msg.subscribeFeePerTick,
                    eventId: self.eventCount,
                    sourceName: msg.sourceName
                }.toCell(),
                code: init.code, // attaching the state init will cause the message to deploy
                data: init.data
            }
        );
        self.eventCount = self.eventCount + 1;
    }

    /*
    Handles CreateBody messages. Users send this message to generate a default callback contract.
    */
    receive(msg: CreateBody){
        // Ensures the given event ID is registered.
        if (self.eventIdToProtocol.get(msg.eventId) == null) {
            throw(002); // Event ID does not exist
        }
        let cxt: Context = context();
        let walletAddress: Address = cxt.sender;
        let protocolAddress: Address = self.eventIdToProtocol.get(msg.eventId)!!; // Get the protocol address
        let childRouterAddress: Address = self.protocolToRouter.get(protocolAddress)!!; // Get the child router address
        send(SendParameters{to: childRouterAddress,
                value: 0,
                mode: SendRemainingValue,
                bounce: true,
                body: CreateBody{
                    walletAddress: walletAddress, // Owner address of callback contract
                    deadline: msg.deadline, // The deadline of the msg can delay
                    eventId: msg.eventId, // The even id which user want to subscribe
                    parameter: msg.parameter // Callback contract parameter
                }.toCell()
            }
        );
    }

    /*
    Handles SubscribeBody messages. Users send this message to subscribe to a protocol's event.
    */
    receive(msg: SubscribeBody) {
        // Check if this event id is registered
        if(self.eventIdToProtocol.get(msg.eventId) == null)
        {
            throw(002); // Event ID does not exist
        }
        let cxt: Context = context();
        let walletAddress: Address = cxt.sender;
        let protocolAddress: Address = self.eventIdToProtocol.get(msg.eventId)!!; // Get the protocol address
        let childRouterAddress: Address = self.protocolToRouter.get(protocolAddress)!!; // Get the child router address
        send(SendParameters{
            to: childRouterAddress,
            value: 0, 
            mode: SendRemainingValue, 
            bounce: true, 
            body: SubscribeBody {
                walletAddress: walletAddress, // Owner address of callback contract
                deadline: msg.deadline, // The deadline of the msg can delay
                eventId: msg.eventId, // The even id which user want to subscribe
                callbackAddress: msg.callbackAddress // The callback contract address writed by user
            }.toCell()
        });
    }

    /*
    Handles DeleteSubscriber messages. Users send this message to unsubscribe from a protocol's event.
    */
    receive(msg: DeleteSubscriber) {
        // Check if this event id is registered
        if(self.eventIdToProtocol.get(msg.eventId) == null)
        {
            throw(002); // Event ID does not exist
        }
        let cxt: Context = context();
        let walletAddress: Address = cxt.sender;
        let protocolAddress: Address = self.eventIdToProtocol.get(msg.eventId)!!; // Get the protocol address
        let childRouterAddress: Address = self.protocolToRouter.get(protocolAddress)!!; // Get the child router address
        send(SendParameters{
            to: childRouterAddress,
            value: 0, 
            mode: SendRemainingValue, 
            bounce: true, 
            body: DeleteSubscriber {
                walletAddress: walletAddress, // Owner address of callback contract
                eventId: msg.eventId, // The even id which user want to subscribe
                callbackAddress: msg.callbackAddress // The callback contract address writed by user
            }.toCell()
        });
    }

    /*
    Protocol sends EventSignal message to send the event signal to the subscribers.
    */
    receive(msg: EventSignal) {
        let cxt: Context = context();
        let protocolAddress: Address = cxt.sender;
        if (self.protocolToRouter.get(protocolAddress) == null) {
            throw(003); // Protocol's Router does not exist
        }
        let childRouterAddress: Address = self.protocolToRouter.get(protocolAddress)!!; // Get the child router address
        send(SendParameters{to: childRouterAddress,
                value: 0,
                mode: SendRemainingValue,
                bounce: false,
                body: EventSignal{
                    eventId: msg.eventId, // Protocol-defined event identifier to allow the callback contract to handle based on the ID.
                    payload: msg.payload // Optional information that the message sender can choose to send to the subscriber who subcribes to the event.
                }.toCell()
            }
        );
    }

    /*
    Handles AddMessenger messages. Protocols use this to add a new messenger to its child router.
    */
    receive(msg: AddMessenger){
        let cxt: Context = context();

        let protocolAddress: Address = cxt.sender;//msg.protocolAddress;
        if (self.protocolToRouter.get(protocolAddress) != null) {
            throw(004); // Protocol's Router does not exist
        }
        let childRouterAddress: Address = self.protocolToRouter.get(protocolAddress)!!; // Get the child router address
        send(SendParameters{to: childRouterAddress,
                value: 0,
                mode: SendPayGasSeparately,
                bounce: true,
                body: AddMessenger{
                    protocolAddress: msg.protocolAddress // Protocol address
                }.toCell()
            }
        );
    }

    // Get Methods

    // Gets the event ID associated with a protocol address.
    get fun protocolEventTd(protocolAddress: Address): Int? {
        return self.protocolToEventId.get(protocolAddress);
    }
    
    // Gets the child router's address based on the given source address.
    get fun childRouterAddress(sourceAddress: Address): Address {
        let childInit: StateInit = self.getChildRouterInit(sourceAddress);
        return contractAddress(childInit);
    }

    // Gets the initial state for the child router.
    get fun getChildRouterInit(sourceAddress: Address): StateInit {
        return initOf ChildRouter(myAddress(), sourceAddress, self.minimumStake);
    }

    // Gets the current event ID count.
    get fun eventId(): Int {
        return self.eventCount;
    }

    // Gets the child router's address for a given protocol.
    get fun getMapChildRouterAddress(sourceAddress: Address): Address {
        return self.protocolToRouter.get(sourceAddress)!!;
    }

    // Gets the protocol address associated with a given event ID.
    get fun getProtocolAddress(eventId: Int): Address {
        return self.eventIdToProtocol.get(eventId)!!;
    }

    // Gets the current balance of the contract.
    get fun getBalace(): Int {
        return myBalance();
    }
}
