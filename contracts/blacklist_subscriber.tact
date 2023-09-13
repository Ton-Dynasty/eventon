import "@stdlib/deploy";
import "@stdlib/ownable";
import "./common/msg_types";
import "./example/msg_types";

contract BlacklistSubscriber with Deployable, Ownable {
    owner: Address;
    messenger: Address;
    eventId: Int;

    blacklist: map<Address, Int>;

    init(owner: Address) {
        self.owner = owner;
        self.messenger = owner; // Use setMessenger to change messenger
        self.eventId = -1;
    }
    
    fun requireMessenger() {
        let ctx: Context = context();
        require(self.messenger == ctx.sender, "Only the messenger can call this function");
    }
    
    fun requireNotInBlacklist() {
        let ctx: Context = context();
        if (self.blacklist.get(ctx.sender)!=null){
            let isExist: Int = self.blacklist.get(ctx.sender)!!;
            require(isExist != 1, "Address is in blacklist");
        }

    }
    
    //Function to receive funds
    receive(){
        // Check if the sender is not in blacklist
        self.requireNotInBlacklist();
    }   

    receive(msg: SetMessenger) {
        self.requireOwner();
        self.messenger = msg.messenger;
        self.eventId = msg.eventId;
    }

    receive(msg: EventSignal){
        self.requireMessenger();
        let payload: Cell = msg.payload;
        let parser: Slice = payload.beginParse();
        let blackAddress: Address = parser.loadAddress();
        // let blackInfo: String = parser.loadRef().asSlice().asString();
        // TODO may emit event
        self.blacklist.set(blackAddress, 1);
    }
    
    receive(msg: Transfer){
        self.requireOwner();
        self.requireNotInBlacklist();
        let to: Address = msg.to;
        let value: Int = msg.value;
        send(SendParameters{
            to: to, 
            value: value,
            mode: SendPayGasSeparately,
            bounce: false
        });
    }
    
    get fun getMessenger(): Address {
        return self.messenger;
    }
}
