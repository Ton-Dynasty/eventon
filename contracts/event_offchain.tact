import "@stdlib/deploy";
import "@stdlib/ownable";
import "./common/msg_types";
import "./example/msg_types";

trait Alertable {
    universalRouterAddress: Address;
    fun sendAlert(msg: EventSignal) {
        send(SendParameters{
            to: self.universalRouterAddress, 
            value: 0, 
            bounce: false,
            mode: SendPayGasSeparately, // Different from onchain version
            body: EventSignal{ 
                eventId: msg.eventId,
                payload: msg.payload
            }.toCell()
        });
    }
}

contract OffchainEvent with Deployable, Alertable {
    publicKey: Int as uint256;
    universalRouterAddress: Address;
    seqno: Int as uint32;

    init(publicKey: Int, universalRouterAddress: Address) {
        self.publicKey = publicKey;
        self.universalRouterAddress = universalRouterAddress;
        self.seqno = 0;
    }

    get fun getPublicKey(): Int {
        return self.publicKey;
    }

    get fun seqno(): Int {
        return self.seqno;
    }

    // An empty receive function to accept ton transfer
    receive(){}

    // Push event to the contract by externalcall
    // The message should be verified by 
    external(msg: ExtMessage) {
        //dump("Enter the contract");
        // BUG: There may be some bug of `checkDataSignature`
        // The type is incompatible with the funC version
        let hash: Int = beginCell().storeUint(msg.seqno, 32).storeUint(msg.valid_until, 32).storeRef(msg.message_parameters.toCell()).endCell().hash();
        //dump("Before check signature");
        require(checkSignature(hash, msg.signature, self.publicKey), "Invalid Signature");
        //dump("After check signature");
        require(msg.seqno == self.seqno, "Invalid Seqno");
        //dump("After check seqno");
        require(now() <= msg.valid_until, "Invalid Time");
        //dump("After check time");
        acceptMessage();
        //dump("After accept message");
        // TODO: should parse message_parameters into OffchainEventSignal
        self.seqno = self.seqno + 1;
        let body: Cell = msg.message_parameters.body!!;
        let parser: Slice = body.beginParse();
        let eventId: Int = parser.loadUint(8);
        let payload: Cell = parser.loadRef();
        self.sendAlert(EventSignal{
            eventId: eventId,
            payload: payload
        });
    }
}
