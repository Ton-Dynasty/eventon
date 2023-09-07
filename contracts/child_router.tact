import "@stdlib/deploy";
import "@stdlib/ownable";
import "./msg_types";
import "./user_default_callback";
import "./messenger";
contract ChildRouter with Deployable, Ownable {
    owner: Address; // Universal Address
    sourceAddress: Address;
    messengerId: Int;
    //idToMessenger: map<Int, Address>; // Do we need this?

    init(owner: Address,sourceAddress: Address) {
        self.owner = owner;
        self.sourceAddress = sourceAddress;
        self.messengerId = 0;
    }

    receive(msg: BuildChildRouter) {
        self.requireOwner();
        //Build Messenger
        let messangerAddress: Address = self.messangerAddress(msg.sourceAddress, self.messengerId);
        let init: StateInit = self.messangerInit(msg.sourceAddress, self.messengerId);
        self.messengerId = self.messengerId + 1;
        let value: Int = ton("0.01");
        send(SendParameters{
            to: messangerAddress,
            value: value, 
            mode: SendPayGasSeparately, 
            bounce: true,
            code: init.code, // attaching the state init will cause the message to deploy
            data: init.data
        });
    }

    receive(msg: DefaultRegister) {
        self.requireOwner();
        //Build Usder Default Callback contract(udc)
        let udcAddress: Address = self.udcAddress(msg.walletAddress, msg.parameter);
        let init: StateInit = self.udcInit(msg.walletAddress, msg.parameter);
        let value: Int = ton("0.01");
        send(SendParameters{
            to: udcAddress,
            value: value, 
            mode: SendPayGasSeparately, 
            bounce: true,
            code: init.code, // attaching the state init will cause the message to deploy
            data: init.data
        });
        // Save the udc address to the messanger contract
        let messangerAddress: Address = self.messangerAddress(self.sourceAddress, self.messengerId);
        send(SendParameters{
            to: messangerAddress,
            value: 0, 
            mode: SendPayGasSeparately, 
            bounce: true,
            body: CallbackAddress {
                callbackAddress: udcAddress
            }.toCell()
        });
        

    }
    
    receive(msg: AdvancedRegister) {
        self.requireOwner();
        // Save the callback contract address(writen by user) to the messanger contract
        let messangerAddress: Address = self.messangerAddress(self.sourceAddress, self.messengerId);
        send(SendParameters{
            to: messangerAddress,
            value: 0, 
            mode: SendPayGasSeparately, 
            bounce: true,
            body: CallbackAddress {
                callbackAddress: msg.callbackAddress
            }.toCell()
        });

    }

    receive(msg: EventSignal) {
        self.requireOwner();
        let i: Int = 0;
        while(i < self.messengerId) {
            let messangerAddress: Address = self.messangerAddress(self.sourceAddress, i);
            send(SendParameters{
                to: messangerAddress,
                value: 0, 
                mode: SendPayGasSeparately, 
                bounce: true,
                body: msg.toCell()
            });
            i = i + 1;
        }
    }

    receive(msg: AddMessenger) {
        self.requireOwner();
        //Build Messenger
        let messangerAddress: Address = self.messangerAddress(msg.protocolAddress, self.messengerId);
        self.messengerId = self.messengerId + 1;
        let value: Int = ton("0.01");
        send(SendParameters{
            to: messangerAddress,
            value: value, 
            mode: SendPayGasSeparately, 
            bounce: true
        });
    }
    // Get Methods

    //get the Messanger Contract Address
    get fun messangerAddress(sourceAddress: Address, messagenerId: Int): Address
    {
        let childInit: StateInit = self.messangerInit(sourceAddress, messagenerId);
        return contractAddress(childInit);
    }

    // get the User Default Callback Contract init
    get fun messangerInit(sourceAddress: Address, messagenerId: Int): StateInit {
        return initOf Messenger(myAddress(), sourceAddress, messagenerId);
    }

    //get the User Default Callback Contract Address
    get fun udcAddress(owner: Address, parameter: Cell): Address
    {
        let childInit: StateInit = self.udcInit(owner, parameter);
        return contractAddress(childInit);
    }

    // get the User Default Callback Contract init
    get fun udcInit(owner: Address, parameter: Cell): StateInit {
        return initOf UserDefaultCallback(myAddress(), owner, parameter);
    }
    
}
