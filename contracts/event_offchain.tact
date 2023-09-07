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
    promiseEyeAddress: Address;
    seqno: Int as uint32;

    init(publicKey: Int, promiseEyeAddress: Address) {
        self.publicKey = publicKey;
        self.promiseEyeAddress = promiseEyeAddress;
        self.seqno = 0;
    }

    get fun getPublicKey(): Int {
        return self.publicKey;
    }

    // Push event to the contract by externalcall
    // The message should be verified by 
    external(msg: OffchainEventSignal) {
        // BUG: There may be some bug of `checkDataSignature`
        // The type is incompatible with the funC version
        let hash: Int = beginCell().storeUint(msg.seqno, 32).storeUint(msg.valid_until, 32).storeUint(msg.eventId, 8).storeRef(msg.payload).endCell().hash();
        require(checkSignature(hash, msg.signature, self.publicKey), "Invalid Signature");
        require(msg.seqno == self.seqno, "Invalid Seqno");
        require(now() <= msg.valid_until, "Invalid Time");
        acceptMessage();
        self.seqno = self.seqno + 1;
        self.sendAlert(EventSignal{
            eventId: msg.eventId,
            payload: msg.payload
        });
    }
}
