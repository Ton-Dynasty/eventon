import "@stdlib/deploy";
import "@stdlib/ownable";
import "./common/msg_types";
import "./example/msg_types";

contract ProtocolCallback with Deployable, Ownable {
    master: Address; // Master Address(Child Router Address)
    owner: Address; // Subscriber Address
    seqo: Int; // Number of  event send to this contract
    
    init(master: Address, owner: Address, seqo: Int) {
        self.master = master;
        self.owner = owner;
        self.seqo = seqo;
    }
    
    // Function to receive funds
    receive() {}
    
    receive(msg: BuildUDC) {
        // Buiild UDC
    }
    
    receive(msg: EventSignal) {
        self.seqo = self.seqo + 1;
    }

    get fun evenSeqo(): Int {
        return self.seqo;
    }
}
