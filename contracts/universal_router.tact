import "@stdlib/deploy";
import "@stdlib/ownable";
import "./msg_types";
import "./child_router";

contract UniversalRouter with Deployable, Ownable {
    owner: Address;
    eventCount: Int; // Event ID count, ex: Orcle->0, Chainlink->1, etc
    protocolToRouter: map<Address, Address>; // Protocol address -> Child Router address
    eventIdToProtocol: map<Int, Address>; // Event ID -> Protocol address
    minimumStake: Int; // Minimum stake for each protocol
    init(owner: Address){
        self.owner = owner;
        self.eventCount = 0;
        self.minimumStake = 0;
    }

    receive(msg: ProtcolRegister){
        // Check if protocol is already registered
        if (self.protocolToRouter.get(msg.sourceAddress) != null) {
            throw(001);
        }
        self.eventIdToProtocol.set(self.eventCount, msg.sourceAddress);
        // Build child router
        let childRouterAddress: Address = self.childRouterAddress(msg.sourceAddress);
        self.protocolToRouter.set(msg.sourceAddress, childRouterAddress);
        let value: Int = ton("0.1");
        let init: StateInit = self.getChildRouterInit(msg.sourceAddress);
        send(SendParameters{to: childRouterAddress,
                value: 0,
                mode: SendRemainingValue,
                bounce: false,
                body: BuildChildRouter{sourceAddress: msg.sourceAddress,
                    template: msg.template,
                    maxUserStakeAmount: msg.maxUserStakeAmount,
                    subscribeFeePerTick: msg.subscribeFeePerTick
                }.toCell(),
                code: init.code, // attaching the state init will cause the message to deploy
                data: init.data
            }
        );
        self.eventCount = self.eventCount + 1;
    }

    // User Register Event
    receive(msg: CreateBody){
        // Check if this event id is registered
        if (self.eventIdToProtocol.get(msg.eventId) == null) {
            throw(002); // Event ID does not exist
        }
        let protocolAddress: Address = self.eventIdToProtocol.get(msg.eventId)!!; // Get the protocol address
        let childRouterAddress: Address = self.protocolToRouter.get(protocolAddress)!!; // Get the child router address
        send(SendParameters{to: childRouterAddress,
                value: 0,
                mode: SendRemainingValue,
                bounce: true,
                body: CreateBody{walletAddress: msg.walletAddress, // Owner address of callback contract
                    deadline: msg.deadline, // The deadline of the msg can delay
                    eventId: msg.eventId, // The even id which user want to subscribe
                    parameter: msg.parameter // Callback contract parameter
                }.toCell()
            }
        );
    }
    receive(msg: SubscribeBody) {
        // Check if this event id is registered
        if(self.eventIdToProtocol.get(msg.eventId) == null)
        {
            throw(002); // Event ID does not exist
        }
        let protocolAddress: Address = self.eventIdToProtocol.get(msg.eventId)!!; // Get the protocol address
        let childRouterAddress: Address = self.protocolToRouter.get(protocolAddress)!!; // Get the child router address
        send(SendParameters{
            to: childRouterAddress,
            value: 0, 
            mode: SendRemainingValue, 
            bounce: true, 
            body: SubscribeBody {
                walletAddress: msg.walletAddress, // Owner address of callback contract
                deadline: msg.deadline, // The deadline of the msg can delay
                eventId: msg.eventId, // The even id which user want to subscribe
                callbackAddress: msg.callbackAddress // The callback contract address writed by user
            }.toCell()
        });
    }
    receive(msg: DeleteSubscriber) {
        // Check if this event id is registered
        if(self.eventIdToProtocol.get(msg.eventId) == null)
        {
            throw(002); // Event ID does not exist
        }
        let protocolAddress: Address = self.eventIdToProtocol.get(msg.eventId)!!; // Get the protocol address
        let childRouterAddress: Address = self.protocolToRouter.get(protocolAddress)!!; // Get the child router address
        send(SendParameters{
            to: childRouterAddress,
            value: 0, 
            mode: SendRemainingValue, 
            bounce: true, 
            body: DeleteSubscriber {
                walletAddress: msg.walletAddress, // Owner address of callback contract
                eventId: msg.eventId, // The even id which user want to subscribe
                callbackAddress: msg.callbackAddress // The callback contract address writed by user
            }.toCell()
        });
    }

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
                body: EventSignal{eventId: msg.eventId, // Protocol-defined event identifier to allow the callback contract to handle based on the ID.
                    payload: msg.payload // Optional information that the message sender can choose to send to the subscriber who subcribes to the event.
                }.toCell()
            }
        );
    }

    receive(msg: AddMessenger){
        let protocolAddress: Address = msg.protocolAddress;
        if (self.protocolToRouter.get(protocolAddress) != null) {
            throw(004); // Protocol's Router does not exist
        }
        let childRouterAddress: Address = self.protocolToRouter.get(protocolAddress)!!; // Get the child router address
        send(SendParameters{to: childRouterAddress,
                value: 0,
                mode: SendPayGasSeparately,
                bounce: true,
                body: AddMessenger{protocolAddress: msg.protocolAddress // Protocol address
                }.toCell()
            }
        );
    }

    // Get Methods

    //get the child router address
    get fun childRouterAddress(sourceAddress: Address): Address {
        let childInit: StateInit = self.getChildRouterInit(sourceAddress);
        return contractAddress(childInit);
    }

    // get the child router init
    get fun getChildRouterInit(sourceAddress: Address): StateInit {
        return initOf ChildRouter(myAddress(), sourceAddress, self.minimumStake);
    }

    get fun eventId(): Int {
        return self.eventCount;
    }

    get fun getMapChildRouterAddress(sourceAddress: Address): Address {
        return self.protocolToRouter.get(sourceAddress)!!;
    }

    get fun getProtocolAddress(eventId: Int): Address {
        return self.eventIdToProtocol.get(eventId)!!;
    }
}