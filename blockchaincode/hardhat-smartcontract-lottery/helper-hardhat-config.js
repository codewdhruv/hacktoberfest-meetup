const {ethers}=require("hardhat")

const networkConfig={
    5:{
        name:goreli,
        vrfCoordinatorV2:"0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
        entranceFee:ethers.utils.parseEther("0.01")
    },
    31337:{
        name:"hardhat",
        entranceFee:ethers.utils.parseEther("0.01")
    }
}

const developmentChains=["localhost","hardhat"];

module.exports={
    networkConfig,
    developmentChains
    
}