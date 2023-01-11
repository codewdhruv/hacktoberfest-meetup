//SPDX-License-Identifier: MIT
 //function to get the price in terms of usd
 pragma solidity ^0.8.8;
 import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
 library PriceConverter{
    function getPrice(AggregatorV3Interface priceFeed) internal view  returns(uint256){
        //Address  0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e
        //ABI
        // AggregatorV3Interface priceFeed=AggregatorV3Interface(0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e);
        (,int256 price,,,)=priceFeed.latestRoundData();
        //ETH in terms of USD
        //3000.00000000
        //If you check the documentation from where the code there it clearly said that it will return 8 decimal values so to just match this because upper value is 18 decimal . 
        //So here we need to multiply with 10^10 
        return uint256(price*1e10); //10**10=10000000000
    }
    //So the getConversionRate function used to convert the Ethereum to the USD
    function getConversionRate(uint256 ethAmount, AggregatorV3Interface priceFeed) internal  view returns(uint256){
        uint256 ethPrice=getPrice(priceFeed);
        //Here we divided it with 10^18 because the two variables are in the form of 1e18 that means result is in the form 1e36
        //But we need the answer in 1e18 form . So,we just divided it with 1e18
        uint256 ethAmountInUsd=(ethPrice * ethAmount) / 1e18; //if we don't divide it then it would be 36 decimal value
        return ethAmountInUsd;
    }
 }