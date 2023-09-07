import "@stdlib/deploy";
import "@stdlib/ownable";
import "./msg_types";

contract UserDefaultCallback with Deployable, Ownable {
    master: Address; // Master Address(Child Router Address)
    owner: Address; // Subscriber Address
    parameter: Cell;
    eventReceiveCount: Int;
    init(master: Address, owner: Address, parameter: Cell) {
        self.master = master;
        self.owner = owner;
        self.parameter = parameter;
        self.eventReceiveCount = 0;
    }
    
    receive(msg: BuildUDC) {
        
    }

    receive(msg: EventSignal) {
        self.eventReceiveCount = self.eventReceiveCount + 1;
        self.parameter.beginParse();
    }

    get fun eventReceiveCount(): Int {
        return self.eventReceiveCount;
    }
}

