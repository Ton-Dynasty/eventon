import "@stdlib/deploy";
import "@stdlib/ownable";
import "./common/msg_types";
import "./example/msg_types";
import "./common/alertable";

contract CopyTrading with Deployable, Alertable {
    owner: Address;
    universalRouterAddress: Address;
    messenger: Address;
    dex: Address;
    orderAction: Int;
    positionSize: Int;
    eventId: Int;

    init(owner: Address, universalRouterAddress: Address, dex: Address) {
        self.owner = owner;
        self.universalRouterAddress = universalRouterAddress;
        self.dex = dex;
        self.messenger = owner;
        self.orderAction = 1;
        self.positionSize = 50;
        self.eventId = 1;
    }
    // Function to receive funds
    receive() {}

    // Receive price from oracle and use its own strategy to trade
    receive(msg: EventSignal) {
        let cxt: Context = context();
        if(cxt.sender != self.messenger) {
            throw(1006); // Only messenger can send signal
        }
        let payload: Cell = msg.payload;
        let parser: Slice = payload.beginParse();
        let price: Int = parser.loadInt(32);
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

            let sendPayload: Cell = beginCell()
                    .storeInt(self.orderAction, 32)
                    .storeInt(self.positionSize, 32)
                    .endCell();

            let eventSignal: EventSignal = EventSignal{
                eventId: self.eventId,
                payload: sendPayload
            };
            self.sendAlert(eventSignal); // Send the trading operation signal to ones followers
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
