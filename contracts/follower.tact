import "@stdlib/deploy";
import "@stdlib/ownable";
import "./common/msg_types";
import "./example/msg_types";

contract Follower with Deployable, Ownable {
    owner: Address;
    messenger: Address;
    dex: Address; // Address of the DEX
    positionSize: Int; // Position size in USD
    eventId: Int;

    init(owner: Address, dex: Address) {
        self.owner = owner;
        self.dex = dex;
        self.messenger = owner; // Use setMessenger to change messenger
        self.positionSize = 100;
        self.eventId = -1;
    }

    // Function to receive funds
    receive() {}
    
    // Receiver ths trader order signal and send it to the DEX to copy trade
    receive(msg: EventSignal) {
        let cxt: Context = context();
        if(cxt.sender != self.messenger) {
            throw(1006); // Only messenger can send signal
        }
        let payload: Cell = msg.payload;
        let parser: Slice = payload.beginParse();
        let orderAction: Int = parser.loadInt(32); // Copy the trader order action
        let positionSize: Int = parser.loadInt(32); // Copy the trader position size

        let value: Int = ton("0.1");
        send(SendParameters{
            to: self.dex,
            value: value, 
            mode: SendPayGasSeparately, 
            bounce: true,
            body: Trade {
                orderAction: orderAction, // Copy the trader order action
                positionSize: self.positionSize // Replace to the position size of the follower
            }.toCell()
        });
    }

    receive(msg: SetMessenger) {
        self.requireOwner();
        self.messenger = msg.messenger;
        self.eventId = msg.eventId;
    }

    receive(msg: Trade) {
        self.requireOwner();
        self.positionSize = msg.positionSize;
    }

    get fun getMessenger(): Address {
        return self.messenger;
    }
}
