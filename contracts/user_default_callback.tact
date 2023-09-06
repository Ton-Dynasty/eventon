import "@stdlib/deploy";
import "@stdlib/ownable";
import "./msg_types";

contract UserDefaultCallback with Deployable, Ownable {
    master: Address; // Master Address(Child Router Address)
    owner: Address; // Subscriber Address
    parameter: Cell;
    init(master: Address, owner: Address, parameter: Cell) {
        self.master = master;
        self.owner = owner;
        self.parameter = parameter;
    }
    
    receive(msg: EventSignal) {
        self.parameter.beginParse();
    }
}
