const { network, ethers } = require("hardhat");
const { developmentChains, networkConfig } = require("../helper-hardhat-config");
const {verify}=require('../utils/verify');
const VRF_SUB_FUND_AMOUNT=ethers.utils.parseEther("30")
module.exports=async function({getNamedAccounts,deployments}){
    const {deploy,log}=deployments;
    const {deployer}=await getNamedAccounts();
    const chainId=network.config.chainId;
    let vrfCoordinatorV2Address,subscriptionID,vrfCoordinatorV2MOCK;

    if(developmentChains.includes(network.name)){
         vrfCoordinatorV2MOCK=await ethers.getContract("VRFCoordinatorV2Mock");
        vrfCoordinatorV2Address=vrfCoordinatorV2MOCK.address;
       
        const transactionResponse=await vrfCoordinatorV2MOCK.createSubscription();
        const transactionReceipt=await transactionResponse.wait(1);
        subscriptionID=transactionReceipt.events[0].args.subId;
     
        //Fund the subscription
        //Usually , you'd need the link token on real network
        await vrfCoordinatorV2MOCK.fundSubscription(subscriptionID,VRF_SUB_FUND_AMOUNT)
    }
    else{
        vrfCoordinatorV2Address=networkConfig[chainId]["vrfCoordinatorV2"]
        subscriptionID=networkConfig[chainId]["subScriptionId"];
    }
    const entranceFee=networkConfig[chainId]["entranceFee"];
    const gasLane=networkConfig[chainId]["gasLane"]
    const callbackGasLimit=networkConfig[chainId]["callbackGasLimit"];
    const interval=networkConfig[chainId]["interval"];
    const args=[vrfCoordinatorV2Address,entranceFee,gasLane,subscriptionID,callbackGasLimit,interval];
    
    const raffle=await deploy("Raffle",{
        from:deployer,
        args:args,
        log:true,
        validConfirmations:network.config.blockConfirmations||1
    })
     // Programmatically adding a consumer for the vrfCoordinatorV2Mock
     if (developmentChains.includes(network.name)) {
        await vrfCoordinatorV2MOCK.addConsumer(subscriptionID.toNumber(), raffle.address)
    }
    if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
        log("Verifying......");
        await verify(raffle.address,args)
    }
    log('...................................................')
}

module.exports.tags = ["all", "raffle"]