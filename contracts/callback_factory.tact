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
    init(owner : Address) {
        self.owner = owner;        
    }

    receive(msg: BuildCallback) {
        let ctx: Context = context();
        let udcAddress: Address = self.callbackAddress(msg.parameter);
        let init: StateInit = self.callbackInit(msg.parameter);
        send(SendParameters{
            to: udcAddress,
            value: 0,
            mode: SendRemainingValue,
            bounce: true,
            body: BuildUDC {
                owner: ctx.sender
            }.toCell(),
            code: init.code, // Attaching the state init to deploy the message
            data: init.data
        });

        emit(CreateUdcSuccess {
            walletAddress: ctx.sender,
            callbackAddress: udcAddress
        }.toCell());
    }
}
