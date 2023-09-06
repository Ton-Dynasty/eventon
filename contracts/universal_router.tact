import "@stdlib/deploy";
import "@stdlib/ownable";
import "./msg_types";
import "./child_router";
contract UniversalRouter with Deployable, Ownable {

    owner: Address;
    eventCount: Int; // Event ID count, ex: Orcle->0, Chainlink->1, etc
    protocolToRouter: map<Address, Address>; // Protocol address -> Child Router address
    eventIdToProtocol: map<Int, Address>; // Event ID -> Protocol address
    count: Int;
    init(owner: Address) {
        self.owner = owner;
        self.eventCount=0;

    }

    receive(msg: ProtcolRegister) {
        // Check if protocol is already registered
        if(self.protocolToRouter.get(msg.sourceAddress) != null)
        {
            throw(001);
        }
        self.eventIdToProtocol.set(self.eventCount, msg.sourceAddress);
        self.eventCount = self.eventCount + 1;

        //Build child router
        let childRouterAddress: Address = self.getChildRouterAddress(msg.sourceAddress);
        self.protocolToRouter.set(msg.sourceAddress, childRouterAddress);
        let value: Int = ton("0.01");
        send(SendParameters{
            to: childRouterAddress,
            value: value, 
            mode: SendPayGasSeparately, 
            bounce: true, 
            body: BuildChildRouter {
                sourceAddress: msg.sourceAddress,
                template: msg.template
            }.toCell()
        });
        
    }

    // User Register Event
    receive(msg: DefaultRegister) {
        // Check if this event id is registered
        if(self.eventIdToProtocol.get(msg.eventId) != null)
        {
            throw(002); // Event ID does not exist
        }
        let protocolAddress: Address = self.eventIdToProtocol.get(msg.eventId)!!; // Get the protocol address
        let childRouterAddress: Address = self.protocolToRouter.get(protocolAddress)!!; // Get the child router address
        send(SendParameters{
            to: childRouterAddress,
            value: 0, 
            mode: SendPayGasSeparately, 
            bounce: true, 
            body: DefaultRegister {
                walletAddress: msg.walletAddress, // Owner address of callback contract
                deadline: msg.deadline, // The deadline of the msg can delay
                eventId: msg.eventId, // The even id which user want to subscribe
                parameter: msg.parameter // Callback contract parameter
            }.toCell()
        });
    }
    
    receive(msg: AdvancedRegister) {
        // Check if this event id is registered
        if(self.eventIdToProtocol.get(msg.eventId) != null)
        {
            throw(002); // Event ID does not exist
        }
        let protocolAddress: Address = self.eventIdToProtocol.get(msg.eventId)!!; // Get the protocol address
        let childRouterAddress: Address = self.protocolToRouter.get(protocolAddress)!!; // Get the child router address
        send(SendParameters{
            to: childRouterAddress,
            value: 0, 
            mode: SendPayGasSeparately, 
            bounce: true, 
            body: AdvancedRegister {
                walletAddress: msg.walletAddress, // Owner address of callback contract
                deadline: msg.deadline, // The deadline of the msg can delay
                eventId: msg.eventId, // The even id which user want to subscribe
                callbackAddress: msg.callbackAddress // The callback contract address writed by user
            }.toCell()
        });
    }

    receive(msg: EventSignal) {
        let cxt: Context = context();
        let protocolAddress: Address = cxt.sender;
        self.count = self.count + 1;
        if(self.protocolToRouter.get(protocolAddress) == null)
        {
            throw(003); // Protocol's Router does not exist
        }
        let childRouterAddress: Address = self.protocolToRouter.get(protocolAddress)!!; // Get the child router address
        send(SendParameters{
            to: childRouterAddress,
            value: 0, 
            mode: SendPayGasSeparately, 
            bounce: true, 
            body: EventSignal {
                eventId: msg.eventId, // Protocol-defined event identifier to allow the callback contract to handle based on the ID.
                payload: msg.payload // Optional information that the message sender can choose to send to the subscriber who subcribes to the event.
            }.toCell()
        });
    }

    receive(msg: AddMessenger) {
        let protocolAddress: Address = msg.protocolAddress;
        if(self.protocolToRouter.get(protocolAddress) != null)
        {
            throw(003); // Protocol's Router does not exist
        }
        let childRouterAddress: Address = self.protocolToRouter.get(protocolAddress)!!; // Get the child router address
        send(SendParameters{
            to: childRouterAddress,
            value: 0, 
            mode: SendPayGasSeparately, 
            bounce: true, 
            body: AddMessenger {
                protocolAddress: msg.protocolAddress // Protocol address
            }.toCell()
        });
    }
    // Get Methods

    //get the child router address
    get fun getChildRouterAddress(sourceAddress: Address): Address
    {
        let childInit: StateInit = self.getChildRouterInit(sourceAddress);
        return contractAddress(childInit);
    }

    // get the child router init
    get fun getChildRouterInit(sourceAddress: Address): StateInit {
        return initOf ChildRouter(myAddress(),sourceAddress);
    }
}
