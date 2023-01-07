//Raffle
//Enter the lottery
//Pick a random winner(verifably random)
//winner to be selected every X minutes -> Completely automation

//Chainlink Oracle-> Randomness, Automated Execution (Chainlink Keeper)


//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AutomationCompatibleInterface.sol";




error Raffle__NotEnoughETHEntered();
error Raffle_TransferFailed();
error Raffle__NotOpen();
error Raffle__UpkeepNotNeeded(uint256 currentBalance, uint256 numPlayers, uint256 raffleState);

/**@title A sample Raffle Contract
 * @author Souvik Halder
 * @notice This contract is for creating a sample raffle contract
 * @dev This implements the Chainlink VRF Version 2
 */

contract  Raffle is VRFConsumerBaseV2,AutomationCompatibleInterface{
    //Type declaration
    enum RaffleState{
        OPEN,
        CALCULATING
    }
//uint256 0=OPEN 1=CALCULATING

    //state variables

    uint256 private immutable i_entranceFee;
    address payable[] private s_players;
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    bytes32 immutable private i_gasLane;
    uint64 private immutable i_subscriptionID;
    uint16 private constant REQUEST_CONFIRMATIONS=3;
    uint32 private immutable i_callbackGasLimit;
    uint32 private constant NUM_WORDS=1;

    //lottery variables
    address private s_recentWinner;
    bool private s_isOpen;
    RaffleState private s_raffleState;
    uint256 private s_lastTimeStamp;
    uint256 private immutable i_interval;
    //Events
    event RaffleEnter(address indexed player);
    event RequestedRaffleWinner(uint256);
    event WinnerPicked(address indexed winner);


    constructor(address vrfCoordinatorV2,uint256 entranceFee, bytes32 gasLane,
    uint64 subscriptionID,uint32 callbackGasLimit,uint256 interval
    ) VRFConsumerBaseV2(vrfCoordinatorV2) {
        i_entranceFee=entranceFee;
        i_vrfCoordinator=VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_gasLane=gasLane;
        i_subscriptionID=subscriptionID;
        i_callbackGasLimit=callbackGasLimit;
        s_raffleState=RaffleState.OPEN;
        s_lastTimeStamp=block.timestamp;
        i_interval=interval;
    }
    function  enterRaffle() public payable {
        //require msg.value > i_entranceFee, "Not enough ETH"
        if(msg.value<i_entranceFee){revert Raffle__NotEnoughETHEntered();}
        if(s_raffleState != RaffleState.OPEN){
            revert Raffle__NotOpen();
        }
        s_players.push(payable(msg.sender));
        //Emit an event when we update a dynamic array or mapping
        //Named events with the function name reveresed
        
        emit RaffleEnter(msg.sender);
    }
    function performUpkeep(bytes calldata) external override{
        //Request the random number
        //Once we get it do something with it
        // 2 transaction process
        (bool upkeepNeeded,)=checkUpkeep("");
        if(!upkeepNeeded){
            revert Raffle__UpkeepNotNeeded(address(this).balance,s_players.length,uint256(s_raffleState));
        }
        s_raffleState=RaffleState.CALCULATING;
        uint256 requestId= i_vrfCoordinator.requestRandomWords(
            i_gasLane,//gaslane
            i_subscriptionID,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        emit RequestedRaffleWinner(requestId);
    }
 /**
     * @dev This is the function that the Chainlink Keeper nodes call
     * they look for `upkeepNeeded` to return True.
     * the following should be true for this to return true:
     * 1. Our time interval should have passed
     * 2. The lottery should have atleast one player and have some ETH
     * 3. The contract has ETH.
     * 4. Implicity, your subscription is funded with LINK.
     * 5. The lottery should be in "open" state
     */
   function checkUpkeep(
        bytes memory /* checkData */
    )
        public
        view
        override
        returns (
            bool upkeepNeeded,
            bytes memory /* performData */
        )
    {
       bool isOpen=(RaffleState.OPEN==s_raffleState);
       //block.timestamp to get the timestamp
       //block.timestamp -last block timestamp
       bool timePassed=((block.timestamp - s_lastTimeStamp)>i_interval);
       bool hasPlayers=(s_players.length>0);
       bool hasBalance=address(this).balance>0;
        upkeepNeeded=(isOpen && timePassed && hasPlayers && hasBalance);

    }

    function fulfillRandomWords(uint256, uint256[] memory randomWords) internal override  {
        //s_players is size of 10
        //random number 202
        uint256 indexOfWinner=randomWords[0]% s_players.length;
        address payable recentWinner=s_players[indexOfWinner];
        s_recentWinner=recentWinner;
          //reset the players array
        s_players=new address payable[](0);
        s_raffleState=RaffleState.OPEN;
      
        s_lastTimeStamp=block.timestamp;
        (bool success,)=recentWinner.call{value:address(this).balance}("");
        //require success
        if(!success){
            revert Raffle_TransferFailed();
        }
        emit WinnerPicked(recentWinner);
    }

    function getEntranceFee() public view returns(uint256){
        return i_entranceFee;
    }
    function getPlayer(uint256 index) public view returns(address){
        return s_players[index];
    }
    function getRecentWinner() public view returns(address){
        return s_recentWinner;
    }
    function getRaffleState() public view returns(RaffleState){
        return s_raffleState;
    }
      function getNumWords() public pure returns (uint256) {
        return NUM_WORDS;
    }
    function getLastTimeStamp() public view returns (uint256) {
        return s_lastTimeStamp;
    }
    function getRequestConfirmation() public pure returns(uint256){
        return REQUEST_CONFIRMATIONS;
    }
}