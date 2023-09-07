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
        let messengerAddress: Address = self.messengerAddress(self.sourceAddress, self.messengerId);
        let init: StateInit = self.messengerInit(self.sourceAddress, self.messengerId);
        send(SendParameters{
            to: messengerAddress,
            value: 0, 
            mode: SendRemainingValue, 
            bounce: false,
            body: BuildMessenger {
                sourceAddress: msg.sourceAddress // Protocol's address
            }.toCell(),
            code: init.code, // attaching the state init will cause the message to deploy
            data: init.data
        });
    }

    receive(msg: DefaultRegister) {
        self.requireOwner();
        // Build Usder Default Callback contract(udc)
        let udcAddress: Address = self.udcAddress(msg.walletAddress, msg.parameter);
        let init: StateInit = self.udcInit(msg.walletAddress, msg.parameter);
        send(SendParameters{
            to: udcAddress,
            value: 0,
            mode: SendRemainingValue, 
            bounce: false,
            code: init.code, // attaching the state init will cause the message to deploy
            data: init.data
        });
        
        // Save the udc address to the messenger contract
        let messengerAddress: Address = self.messengerAddress(self.sourceAddress, self.messengerId);
        send(SendParameters{
            to: messengerAddress,
            value: 0, 
            mode: SendRemainingValue, 
            bounce: false,
            body: CallbackAddress {
                callbackAddress: udcAddress
            }.toCell()
        });
        

    }
    
    receive(msg: AdvancedRegister) {
        self.requireOwner();
        // Save the callback contract address(writen by user) to the messenger contract
        let messengerAddress: Address = self.messengerAddress(self.sourceAddress, self.messengerId);
        send(SendParameters{
            to: messengerAddress,
            value: 0, 
            mode: SendRemainingValue, 
            bounce: false,
            body: CallbackAddress {
                callbackAddress: msg.callbackAddress
            }.toCell()
        });

    }

    receive(msg: EventSignal) {
        self.requireOwner();
        let i: Int = 0;
        while(i < self.messengerId) {
            let messengerAddress: Address = self.messengerAddress(self.sourceAddress, i);
            send(SendParameters{
                to: messengerAddress,
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
        let messengerAddress: Address = self.messengerAddress(msg.protocolAddress, self.messengerId);
        self.messengerId = self.messengerId + 1;
        let value: Int = ton("0.01");
        send(SendParameters{
            to: messengerAddress,
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

    receive(msg: CollectFee){
        self.totalStakeAmount = self.totalStakeAmount + msg.fee;
    }

    // Calculage the reward for the user
    get fun calculateReward(addr: Address): Int {
        if (self.totalShares == 0 || self.stakes.get(addr) == null){
            return 0;
        }
        return (self.stakeShares.get(addr)!! * self.totalStakeAmount) / self.totalShares;
    }

    //get the Messenger Contract Address
    get fun messengerAddress(sourceAddress: Address, messengerId: Int): Address
    {
        let childInit: StateInit = self.messengerInit(sourceAddress, messengerId);
        return contractAddress(childInit);
    }

    // get the User Default Callback Contract init
    get fun messengerInit(sourceAddress: Address, messengerId: Int): StateInit {
        return initOf Messenger(myAddress(), sourceAddress, messengerId);
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
    
    get fun messengerId(): Int {
        return self.messengerId;
    }
}
