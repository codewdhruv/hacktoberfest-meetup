//Get funds from the user
//withdraw funds
//Set a minimum value in USD

//SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;
import "./PriceConverter.sol";
    error NotOwner();
contract Fundme{

    using PriceConverter for uint256;
    uint256 public constant minimumUsd=50 * 1e18; //(1*10)**18
    address[] public funders;
    mapping(address=> uint256) public addressToAmountFunded;
    AggregatorV3Interface public priceFeed;
  address public immutable owner;
    constructor(address priceFeedAddress){
        owner =msg.sender;
        priceFeed=AggregatorV3Interface(priceFeedAddress);
    }

    function fund() public payable{
        //want to able to set a minimum fund amount
        //1. How do we send eth to this contract?

        require(msg.value.getConversionRate(priceFeed) >= minimumUsd,"Didn't send enough");
        //18 decimals
        funders.push(msg.sender);
        addressToAmountFunded[msg.sender]+=msg.value;
    }
   
    function withdraw() public onlyOwner{
        
        //for loop
        //[1,2,3,4]
        for(uint256 funderIndex=0; funderIndex<funders.length; funderIndex++){
            //Code
            address funder=funders[funderIndex];
            addressToAmountFunded[funder]=0;
        }
        //rest the array
        funders =new address[](0);
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
        if(msg.sender !=owner ){
            revert NotOwner();
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
}