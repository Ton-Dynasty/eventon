import "@stdlib/deploy";
import "@stdlib/ownable";
import "./common/msg_types";
import "./example/msg_types";

contract BlacklistSubscriber with Deployable, Ownable {
    owner: Address;
    messenger: Address;
    eventId: Int;

    blacklist: map<Int, Address>;
    blacklistLength: Int;

    init(owner: Address) {
        self.owner = owner;
        self.messenger = owner; // Use setMessenger to change messenger
        self.blacklistLength = 0;
        self.eventId = -1;
    }
    
    fun requireMessenger() {
        let ctx: Context = context();
        require(self.messenger == ctx.sender, "Only the messenger can call this function");
    }
    
    fun requireNotInBlacklist() {
        let ctx: Context = context();
        let i: Int = 0;
        while (i < self.blacklistLength) {
            let blackAddress: Address = self.blacklist.get(i)!!;
            require(blackAddress != ctx.sender, "Address is in blacklist");
            i = i + 1;
        }
    }
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
        self.blacklist.set(self.blacklistLength, blackAddress);
        self.blacklistLength = self.blacklistLength + 1;

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

    get fun getBlacklistLength(): Int {
        return self.blacklistLength;
    }

    get fun getMessenger(): Address {
        return self.messenger;
    }
}
