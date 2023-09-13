// Required imports
import "@stdlib/deploy";         // Import deployment library
import "@stdlib/ownable";        // Import ownable library
import "./common/msg_types";    // Import custom message types
import "./example/msg_types";   // Import custom example message types
import "./user_default_callback"; // Import user default callback contract
import "./messenger";            // Import messenger contract

contract ChildRouter with Deployable, Ownable {
    // State Variables
    owner: Address;                             // Universal Address
    sourceAddress: Address;                     // Protocol's address
    messengerId: Int;                           // Messenger's ID (default: 0)
    minimumStake: Int as uint256;               // Minimum stake amount
    stakes: map<Address, Int>;                  // The total stake amount of each user
    stakeShares: map<Address,Int as uint256>;   // The total stake shares of each user
    totalStakeAmount: Int as coins;             // The total stake amount (default: 0)
    maxUserStakeAmount: Int as coins;           // The max total users' stake amount (default: 0)
    totalShares: Int as uint256;                // The total shares (default: 0)
    messengerState: map<Int, Int>;              // The state of the messenger
    eventId: Int;                               // The event id (default: -1)

    /*
    Constructor
    Parameters:
        owner: The owner of the contract
        sourceAddress: The protocol's address
        minimumStake: The minimum stake amount
    */
    init(owner: Address, sourceAddress: Address, minimumStake: Int) {
        self.owner = owner;
        self.sourceAddress = sourceAddress;
        self.messengerId = 0;
        self.minimumStake = minimumStake;
        self.totalShares = 0;
        self.totalStakeAmount = 0;
        self.maxUserStakeAmount = 0;
        self.eventId = -1;
    }

    // Default receive function to receive funds
    receive() {}

    // Handle BuildChildRouter message type
    receive(msg: BuildChildRouter) {
        self.requireOwner();
        let ctx: Context = context();

        // Check if the sender has staked more than the minimum required
        require(ctx.value > self.minimumStake, "Stake must be greater than minimum stake");

        // Set the max user stake amount
        self.maxUserStakeAmount = msg.maxUserStakeAmount;

        // Update the total shares and the protocol's shares
        self.stakes.set(self.sourceAddress, ctx.value);
        
        // Set event id to this child router
        self.eventId = msg.eventId;

        // Build Messenger
        let messengerAddress: Address = self.messengerAddress(self.sourceAddress, self.messengerId);
        let init: StateInit = self.messengerInit(self.sourceAddress, self.messengerId);
        self.messengerState.set(self.messengerId, 1);

        send(SendParameters{
            to: messengerAddress,
            value: 0,
            mode: SendRemainingValue,
            bounce: false,
            body: BuildMessenger {
                sourceAddress: msg.sourceAddress,               // Protocol's address
                eventId: msg.eventId,                           // The event id to subscribe to
                maxUserStakeAmount: msg.maxUserStakeAmount,     // Maximum stake per user
                subscribeFeePerTick: msg.subscribeFeePerTick,   // Subscription fee per tick
                template: msg.template,                         // Callback contract for subscribers
                sourceName: msg.sourceName                      // Protocol's name
            }.toCell(),
            code: init.code, // Attaching the state init to deploy the message
            data: init.data
        });
    }

    // Handle ProtcolRegisterSuccess message type
    receive(msg: ProtcolRegisterSuccess) {
        // Emit an event for successful protocol registration
        emit(ProtcolRegisterSuccess{
            sourceAddress: msg.sourceAddress,               // Protocol's address
            eventId: msg.eventId,                           // The event id to subscribe to
            maxUserStakeAmount: msg.maxUserStakeAmount,     // Maximum stake per user
            subscribeFeePerTick: msg.subscribeFeePerTick,   // Subscription fee per tick
            template: msg.template,                         // Callback contract for subscribers
            sourceName: msg.sourceName                      // Protocol's name
        }.toCell());
    }

    // Handle CreateBody message type
    receive(msg: CreateBody) {
        self.requireOwner();
        
        // Build User Default Callback contract (udc)
        let udcAddress: Address = self.udcAddress(msg.walletAddress, msg.parameter);
        let init: StateInit = self.udcInit(msg.walletAddress, msg.parameter);
        
        send(SendParameters{
            to: udcAddress,
            value: 0,
            mode: SendRemainingValue,
            bounce: true,
            body: BuildUDC {
                owner: msg.walletAddress
            }.toCell(),
            code: init.code, // Attaching the state init to deploy the message
            data: init.data
        });

        emit(CreateUdcSuccess {
            walletAddress: msg.walletAddress,
            callbackAddress: udcAddress
        }.toCell());
    }

    // Handle SubscribeBody message type
    receive(msg: SubscribeBody) {
        self.requireOwner();
        if (msg.eventId != self.eventId) {
            throw(1003); // This child router is not for this event
        }
        // Save the callback contract address (written by user) to the messenger contract
        let messengerAddress: Address = self.messengerAddress(self.sourceAddress, self.messengerId);
        send(SendParameters{
            to: messengerAddress,
            value: 0,
            mode: SendRemainingValue,
            bounce: false,
            body: CreateMsgSubscriber {
                walletAddress: msg.walletAddress,
                callbackAddress: msg.callbackAddress,
                eventId: self.eventId
            }.toCell()
        });
    }

    // Handle DeleteSubscriber message type
    receive(msg: DeleteSubscriber) {
        self.requireOwner();
        if (msg.eventId != self.eventId) {
            throw(1003); // This child router is not for this event
        }
        // Remove the subscriber by sending a DeleteSubscriber message to the messenger contract
        let messengerAddress: Address = self.messengerAddress(self.sourceAddress, self.messengerId);
        send(SendParameters{
            to: messengerAddress,
            value: 0,
            mode: SendRemainingValue,
            bounce: false,
            body: DeleteSubscriber {
                walletAddress: msg.walletAddress,
                callbackAddress: msg.callbackAddress,
                eventId: self.eventId
            }.toCell()
        });
    }

    // Handle DestroyMessenger message type
    receive(msg: DestroyMessenger) {
        self.messengerState.set(msg.messengerId, null);
    }

    // Handle EventSignal message type
    receive(msg: EventSignal) {
        self.requireOwner();
        let i: Int = 0;
        while (i <= self.messengerId) {
            if (self.messengerState.get(i) == 1) {
                let messengerAddress: Address = self.messengerAddress(self.sourceAddress, i);
                let value: Int = ton("0.018"); // Problem: value is hardcoded, consider using a variable
                send(SendParameters{
                    to: messengerAddress,
                    value: value,
                    mode: SendPayGasSeparately,
                    bounce: false,
                    body: EventSignal {
                        eventId: self.eventId,
                        payload: msg.payload
                    }.toCell()
                });
            }
            i = i + 1;
        }
    }

    // Handle AddMessenger message type
    receive(msg: AddMessenger) {
        self.requireOwner();
        // Build Messenger
        let messengerAddress: Address = self.messengerAddress(msg.protocolAddress, self.messengerId);
        self.messengerId = self.messengerId + 1;
        send(SendParameters{
            to: messengerAddress,
            value: 0,
            mode: SendRemainingValue,
            bounce: false
        });
    }

    // Handle AddStakeFor message type
    receive(msg: AddStakeFor) {
        let ctx: Context = context();
        // Check if the sender has staked more than the minimum required
        require(ctx.value > self.minimumStake, "Stake must be greater than minimum stake");

        // Calculate the user's total stake amount
        let protocolStakeAmount: Int = self.stakes.get(self.sourceAddress)!!;
        let userStakeTotalAmount: Int = self.totalStakeAmount - protocolStakeAmount;

        // If the sender is not the protocol, check the max total user stake amount
        if (msg.beneficiary != self.sourceAddress) {
            userStakeTotalAmount = userStakeTotalAmount + ctx.value;
            require(userStakeTotalAmount <= self.maxUserStakeAmount, "User stake amount exceeds the max user stake amount");
        }

        // Calculate the shares to be added
        let sharesToMint: Int = 0;
        if (self.totalShares == 0) {
            sharesToMint = ctx.value;
        } else {
            sharesToMint = (ctx.value * self.totalShares) / self.totalStakeAmount;
        }

        // Update user's stake and shares
        self.stakes.set(msg.beneficiary, self.stakes.get(msg.beneficiary)!! + ctx.value);
        self.stakeShares.set(msg.beneficiary, self.stakeShares.get(msg.beneficiary)!! + sharesToMint);
        self.totalShares = self.totalShares + sharesToMint;
        self.totalStakeAmount = self.totalStakeAmount + ctx.value;

        // Emit a Staked event
        emit(Staked{amount: ctx.value, staker: sender(), beneficiary: msg.beneficiary}.toCell());
    }

    /*
    Remove the stake of the sender
    */
    receive(msg: RemoveStake) {
        require(msg.amount > 0, "Amount must be greater than 0");

        // Check if the sender has staked more than the minimum required
        let ctx: Context = context();
        let stakeAmount: Int? = self.stakes.get(sender());
        require(stakeAmount != null && stakeAmount!! > msg.amount, "Insufficient stake to remove");

        // Calculate the shares to be removed
        let stakesToRemove: Int = (msg.amount * self.totalShares) / self.totalStakeAmount;
        self.stakes.set(sender(), self.stakes.get(sender())!! - msg.amount);
        self.stakeShares.set(sender(), self.stakeShares.get(sender())!! - stakesToRemove);
        self.totalShares = self.totalShares - stakesToRemove;
        self.totalStakeAmount = self.totalStakeAmount - msg.amount;

        // Send the withdrawn amount back to the sender
        send(SendParameters{
            to: sender(),
            value: msg.amount,
            mode: SendPayGasSeparately,
            bounce: true
        });

        // Emit a Withdrawn event
        emit(Withdrawn{amount: msg.amount, receiver: sender()}.toCell());
    }

    // Handle CollectFee message type
    receive(msg: CollectFee) {
        self.totalStakeAmount = self.totalStakeAmount + msg.fee;
    }

    // Get Methods
    // Calculate the reward for the user
    get fun calculateReward(addr: Address): Int {
        if (self.totalShares == 0 || self.stakes.get(addr) == null){
            return 0;
        }
        return (self.stakeShares.get(addr)!! * self.totalStakeAmount) / self.totalShares;
    }

    // Get the Messenger Contract Address
    get fun messengerAddress(sourceAddress: Address, messengerId: Int): Address {
        let childInit: StateInit = self.messengerInit(sourceAddress, messengerId);
        return contractAddress(childInit);
    }

    // Get the Messenger Contract Init
    get fun messengerInit(sourceAddress: Address, messengerId: Int): StateInit {
        return initOf Messenger(myAddress(), sourceAddress, messengerId);
    }

    // Get the User Default Callback Contract Address
    get fun udcAddress(owner: Address, parameter: Cell): Address {
        let childInit: StateInit = self.udcInit(owner, parameter);
        return contractAddress(childInit);
    }

    // Get the User Default Callback Contract Init
    get fun udcInit(owner: Address, parameter: Cell): StateInit {
        return initOf UserDefaultCallback(myAddress(), owner, parameter);
    }

    // Get the current Messenger ID
    get fun messengerId(): Int {
        return self.messengerId;
    }

    // Get the state of a specific messenger
    get fun getMessengerState(messengerId: Int): Int? {
        return self.messengerState.get(messengerId);
    }

    // Get the balance of this contract
    get fun getBalance(): Int {
        return myBalance();
    }
}
