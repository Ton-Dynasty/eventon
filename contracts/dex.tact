import "@stdlib/deploy";
import "@stdlib/ownable";
import "./common/msg_types";
import "./example/msg_types";
/*
This dex contract is only for testing purposes.
*/
contract Dex with Deployable, Ownable {
    owner: Address;

    init(owner: Address) {
        self.owner = owner;
    }
    
    // Function to receive funds
    receive() {}

    // Function to receive trades signal
    receive(msg: Trade) {
        dump("Dex received a trade");
    }
}
