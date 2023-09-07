import "@stdlib/deploy";
import "@stdlib/ownable";
import "./msg_types";
import "./event_types";
import "./user_default_callback";
import "./messenger";
contract ChildRouter with Deployable, Ownable {
    owner: Address; // Universal Address
    sourceAddress: Address;
    messengerId: Int;
    minimumStake: Int as uint256;
    stakes: map<Address, Int>;
    stakeShares: map<Address,Int as uint256>;
    totalStakeAmount: Int as coins;
    totalShares: Int as uint256;
    //idToMessenger: map<Int, Address>; // Do we need this?

    init(owner: Address,sourceAddress: Address, minimumStake: Int) {
        self.owner = owner;
        self.sourceAddress = sourceAddress;
        self.messengerId = 0;
        self.minimumStake = minimumStake;
        self.totalShares = 0;
        self.totalStakeAmount = 0;
    }

    receive(msg: BuildChildRouter) {
        self.requireOwner();
        //Build Messenger
        let messangerAddress: Address = self.getMessangerAddress(msg.sourceAddress, self.messengerId);
        let init: StateInit = self.getMessangerInit(msg.sourceAddress, self.messengerId);
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
        let udcAddress: Address = self.getUdcAddress(msg.walletAddress, msg.parameter);
        let init: StateInit = self.getUdcInit(msg.walletAddress, msg.parameter);
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

    receive(msg: AddStakeFor){
        let ctx: Context = context();
        require(ctx.value > self.minimumStake, "Stake must be greater than minimum stake");


        // Calculate the shares to be added
        // If there are no total shares, then the shares to be minted is equal to the amount
        // Otherwise, the shares to be minted is equal to the amount * total shares / total stake amount
        let sharesToMint: Int = 0;
        if (self.totalShares == 0) {
            sharesToMint = ctx.value;
        } else {
            sharesToMint = (ctx.value * self.totalShares) / self.totalStakeAmount;
        }

        // Update the total shares and the sender's shares
        self.stakes.set(msg.beneficiary, self.stakes.get(msg.beneficiary)!! + ctx.value);
        self.stakeShares.set(msg.beneficiary, self.stakeShares.get(msg.beneficiary)!! + sharesToMint);
        self.totalShares = self.totalShares + sharesToMint;
        self.totalStakeAmount = self.totalStakeAmount + ctx.value;

        emit(Staked{amount: ctx.value, staker:sender(), beneficiary: msg.beneficiary}.toCell());
    }

    receive(msg: RemoveStake){
        require(msg.amount > 0, "Amount must be greater than 0");

        let ctx: Context = context();
        let stakeAmount: Int? = self.stakes.get(sender());
        require(stakeAmount != null && stakeAmount!! > msg.amount, "Insufficient stake to remove");

        // Calculate the shares to be removed
        let stakesToRemove: Int = (msg.amount * self.totalShares) / self.totalStakeAmount;
        self.stakes.set(sender(), self.stakes.get(sender())!! - msg.amount);
        self.stakeShares.set(sender(), self.stakeShares.get(sender())!! - stakesToRemove);
        self.totalShares = self.totalShares - stakesToRemove;
        self.totalStakeAmount = self.totalStakeAmount - msg.amount;

        send(SendParameters{
            to: sender(),
            value: msg.amount, 
            mode: SendPayGasSeparately, 
            bounce: true
        });

        emit(Withdrawn{amount: msg.amount, receiver: sender()}.toCell());
    }


    // Calculage the reward for the user
    get fun calculateReward(addr: Address): Int {
        if (self.totalShares == 0 || self.stakes.get(addr) == null){
            return 0;
        }
        return (self.stakeShares.get(addr)!! * self.totalStakeAmount) / self.totalShares;
    }

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
