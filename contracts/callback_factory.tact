import "@stdlib/deploy";        // Import deployment library
import "@stdlib/ownable";       // Import ownable library
import "./common/msg_types";    // Import custom message types
import "@stdlib/ownable";
import "./protocol_callback";

trait Producible with Ownable {
    owner: Address;
    get fun callbackInit(parameter: Cell): StateInit {
        let parser: Slice = parameter.beginParse();
        let parameterAddress: Address = parser.loadAddress(); // Owner of the callback
        let parameterInt: Int = parser.loadInt(32); // Option parameter Int
        return initOf ProtocolCallback(myAddress(), parameterAddress, parameterInt);
    }

    get fun callbackAddress(parameter: Cell): Address {
        let callbackInit: StateInit = self.callbackInit(parameter);
        return contractAddress(callbackInit);
    }

}
contract CallbackFactory with Deployable, Producible {
    owner: Address;
    numberOfCallback: Int;
    init(owner : Address) {
        self.owner = owner;      
        self.numberOfCallback = 0;  
    }

    /*
    User call this callback factory to create a default callback contract.
    */
    receive(msg: BuildCallback) {
        let ctx: Context = context();
        let udcAddress: Address = self.callbackAddress(msg.parameter);
        let init: StateInit = self.callbackInit(msg.parameter);

        // Deploy the callback contract for msg.sender (User)
        send(SendParameters{
            to: udcAddress,
            value: 0,
            mode: SendRemainingValue,
            bounce: true,
            body: BuildUDC {
                owner: ctx.sender
            }.toCell(),
            code: init.code, 
            data: init.data
        });

        emit(CreateUdcSuccess {
            walletAddress: ctx.sender,
            callbackAddress: udcAddress
        }.toCell());
        self.numberOfCallback = self.numberOfCallback + 1;
    }

    get fun numberOfCallback(): Int {
        return self.numberOfCallback;
    }
}
