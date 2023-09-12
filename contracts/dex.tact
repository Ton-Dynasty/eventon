import "@stdlib/deploy";
import "@stdlib/ownable";
import "./common/msg_types";
import "./example/msg_types";
contract Dex with Deployable, Ownable {
    owner: Address;
    init(owner: Address) {
        self.owner = owner;
    }
    receive() {}
    receive(msg: Trade) {
        dump("Dex received a trade");
    }
}
