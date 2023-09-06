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
        let messangerAddress: Address = self.getMessangerAddress(msg.sourceAddress, self.messengerId);
        self.messengerId = self.messengerId + 1;
        let value: Int = ton("0.01");
        send(SendParameters{
            to: messangerAddress,
            value: value, 
            mode: SendPayGasSeparately, 
            bounce: true
        });
    }

    receive(msg: DefaultRegister) {
        self.requireOwner();
        //Build Usder Default Callback contract(udc)
        let udcAddress: Address = self.getUdcAddress(msg.walletAddress, msg.parameter);
        let value: Int = ton("0.01");
        send(SendParameters{
            to: udcAddress,
            value: value, 
            mode: SendPayGasSeparately, 
            bounce: true
        });
        // Save the udc address to the messanger contract
        let messangerAddress: Address = self.getMessangerAddress(self.sourceAddress, self.messengerId);
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
        let messangerAddress: Address = self.getMessangerAddress(self.sourceAddress, self.messengerId);
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
            let messangerAddress: Address = self.getMessangerAddress(self.sourceAddress, i);
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
        let messangerAddress: Address = self.getMessangerAddress(msg.protocolAddress, self.messengerId);
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
    get fun getMessangerAddress(sourceAddress: Address, messagenerId: Int): Address
    {
        let childInit: StateInit = self.getMessangerInit(sourceAddress, messagenerId);
        return contractAddress(childInit);
    }

    // get the User Default Callback Contract init
    get fun getMessangerInit(sourceAddress: Address, messagenerId: Int): StateInit {
        return initOf Messenger(myAddress(), sourceAddress, messagenerId);
    }

    //get the User Default Callback Contract Address
    get fun getUdcAddress(owner: Address, parameter: Cell): Address
    {
        let childInit: StateInit = self.getUdcInit(owner, parameter);
        return contractAddress(childInit);
    }

    // get the User Default Callback Contract init
    get fun getUdcInit(owner: Address, parameter: Cell): StateInit {
        return initOf UserDefaultCallback(myAddress(), owner, parameter);
    }
}
