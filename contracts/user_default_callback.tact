import "@stdlib/deploy";
import "@stdlib/ownable";
import "./common/msg_types";
import "./example/msg_types";

contract UserDefaultCallback with Deployable, Ownable {
    master: Address; // Master Address(Child Router Address)
    owner: Address; // Subscriber Address
    parameter: Cell; // Parameter to set this contract
    eventCount: Int; // Number of  event send to this contract
    
    init(master: Address, owner: Address, parameter: Cell) {
        self.master = master;
        self.owner = owner;
        self.parameter = parameter;
        self.eventCount = 0;
    }
    
    // Function to receive funds
    receive() {}
    
    receive(msg: BuildUDC) {
        // Buiild UDC
    }
    
    receive(msg: EventSignal) {
        self.eventCount = self.eventCount + 1;
    }

    get fun eventCount(): Int {
        return self.eventCount;
    }
}
