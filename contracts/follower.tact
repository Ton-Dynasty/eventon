import "@stdlib/deploy";
import "@stdlib/ownable";
import "./msg_types";

contract Follower with Deployable, Ownable {
    owner: Address;
    messenger: Address;
    dex: Address;
    orderAction: Int;
    positionSize: Int;
    eventId: Int;

    init(owner: Address, dex: Address) {
        self.owner = owner;
        self.dex = dex;
        self.messenger = owner; // Use setMessenger to change messenger
        self.orderAction = 1;
        self.positionSize = 100;
        self.eventId = -1;
    }

    receive() {}
    
    receive(msg: EventSignal) {
        // let cxt: Context = context();
        // if(cxt.sender != self.messenger) {
        //     throw(009); // Only messenger can send signal;
        // }
        // let payload: Cell = msg.payload;
        // let parser: Slice = payload.beginParse();
        // let price: Int = parser.loadUint(32);
        // if(price < 1600) {
        //     let value: Int = ton("0.1");
        //     send(SendParameters{
        //         to: self.dex,
        //         value: value, 
        //         mode: SendPayGasSeparately, 
        //         bounce: true,
        //         body: Trade {
        //             orderAction: self.orderAction,
        //             positionSize: self.positionSize
        //         }.toCell()
        //     });

        //     payload = beginCell()
        //             .storeUint(8, self.orderAction)
        //             .storeUint(8, self.positionSize)
        //             .endCell();

        //     let eventSignal: EventSignal = EventSignal{
        //         eventId: self.eventId,
        //         payload: payload
        //     };
        // }
    }

    receive(msg: SetMessenger) {
        self.requireOwner();
        self.messenger = msg.messenger;
        self.eventId = msg.eventId;
    }

    receive(msg: Trade) {
        self.requireOwner();
        self.orderAction = msg.orderAction;
        self.positionSize = msg.positionSize;
    }

    get fun getMessenger(): Address {
        return self.messenger;
    }
}
