//Get funds from the user
//withdraw funds
//Set a minimum value in USD

//SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;
import "./PriceConverter.sol";
    error Fundme__NotOwner();
contract Fundme{

    using PriceConverter for uint256;
    uint256 public constant minimumUsd=50 * 1e18; //(1*10)**18
    address[] private s_funders;
    mapping(address=> uint256) private s_addressToAmountFunded;
    AggregatorV3Interface private s_priceFeed;
  address public immutable i_owner;
    constructor(address priceFeedAddress){
        i_owner =msg.sender;
        s_priceFeed=AggregatorV3Interface(priceFeedAddress);
    }

    function fund() public payable{
        //want to able to set a minimum fund amount
        //1. How do we send eth to this contract?

        require(msg.value.getConversionRate(s_priceFeed) >= minimumUsd,"Didn't send enough");
        //18 decimals
        s_funders.push(msg.sender);
        s_addressToAmountFunded[msg.sender]+=msg.value;
    }
   
    function withdraw() public onlyOwner{
        
        //for loop
        //[1,2,3,4]
        for(uint256 funderIndex=0; funderIndex<s_funders.length; funderIndex++){
            //Code
            address funder=s_funders[funderIndex];
            s_addressToAmountFunded[funder]=0;
        }
        //rest the array
        s_funders =new address[](0);
        //actually withdraw the funds
        //transfer
        //by using transfer method we can send ethereum to the who call the withdraw() function 
        //msg.sender=address
        //payable(msg.sender)=payable address
        // payable(msg.sender).transfer(address(this).balance);
        //send
        // bool sendSuccess =payable(msg.sender).send(address(this).balance);
        // require(sendSuccess,"Send Failed");
        //call
        (bool callSuccess,)=payable(msg.sender).call{value:address(this).balance}("");
        require(callSuccess,"call Failed");
    }
    modifier onlyOwner{
        // require(msg.sender==owner,"sender is not owner");
        //The below code is custome error and it is more code efficient
        if(msg.sender !=i_owner ){
            revert Fundme__NotOwner();
        }
        _;
    }
    //What happens if someone sends this contract ETH without calling the fund function
    //Two special functions
    receive() external payable{
        fund();
    }
    fallback() external payable{
        fund();
    }
    function cheaperWithdraw() public payable onlyOwner{
        address[] memory funders=s_funders;
        //mapping can't be in memory
        for(uint256 funderIndex=0;funderIndex<funders.length;funderIndex++){
            address funder=funders[funderIndex];
            s_addressToAmountFunded[funder]=0;
        }
        s_funders=new address[](0);
        (bool success,)=i_owner.call{value:address(this).balance}("");
        require(success);
    }
  
 function getAddressToAmountFunded(address fundingAddress)
        public
        view
        returns (uint256)
    {
        return s_addressToAmountFunded[fundingAddress];
    }
    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}