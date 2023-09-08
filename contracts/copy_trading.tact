import "@stdlib/deploy";
import "@stdlib/ownable";
import "./msg_types";

trait Alertable {
    promiseEyeAddress: Address;
    fun sendAlert(msg: EventSignal) {
        send(SendParameters{
            to: self.promiseEyeAddress, 
            value: 0, 
            bounce: false,
            mode: SendRemainingValue,
            body: EventSignal{ 
                eventId: msg.eventId,
                payload: msg.payload
            }.toCell()
        });
    }
}

message Trade {
    orderAction: Int; // long or short, long:1, short:2
    positionSize: Int;
}
contract CopyTrading with Deployable, Ownable, Alertable {
    owner: Address;
    promiseEyeAddress: Address;
    messenger: Address;
    dex: Address;
    orderAction: Int;
    positionSize: Int;
    eventId: Int;

    init(owner: Address, promiseEyeAddress: Address, dex: Address) {
        self.owner = owner;
        self.promiseEyeAddress = promiseEyeAddress;
        self.dex = dex;
        self.messenger = owner;
        self.orderAction = 1;
        self.positionSize = 100;
        self.eventId = 0;
    }

    receive(msg: EventSignal) {
        let cxt: Context = context();
        if(cxt.sender != self.messenger) {
            throw(009); // Only messenger can send signal;
        }
        let payload: Cell = msg.payload;
        let parser: Slice = payload.beginParse();
        let price: Int = parser.loadUint(32);
        if(price < 1600) {
            let value: Int = ton("0.1");
            send(SendParameters{
                to: self.dex,
                value: value, 
                mode: SendPayGasSeparately, 
                bounce: true,
                body: Trade {
                    orderAction: self.orderAction,
                    positionSize: self.positionSize
                }.toCell()
            });

            payload = beginCell()
                    .storeUint(8, self.orderAction)
                    .storeUint(8, self.positionSize)
                    .endCell();

            let eventSignal: EventSignal = EventSignal{
                eventId: self.eventId,
                payload: payload
            };
            self.sendAlert(eventSignal);
        }
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
