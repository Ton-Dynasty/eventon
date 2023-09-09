import "@stdlib/deploy";
import "@stdlib/ownable";
import "./msg_types";

contract UserDefaultCallback with Deployable, Ownable {
    master: Address; // Master Address(Child Router Address)
    owner: Address; // Subscriber Address
    parameter: Cell;
    eventCount: Int;
    init(master: Address, owner: Address, parameter: Cell) {
        self.master = master;
        self.owner = owner;
        self.parameter = parameter;
        self.eventCount = 0;
    }
    
    receive(msg: BuildUDC) {
        
    }
    
    receive(msg: EventSignal) {
        // self.parameter.beginParse();
        self.eventCount = self.eventCount + 1;
    }

    get fun eventCount(): Int {
        return self.eventCount;
    }
}
