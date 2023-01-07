const { network } = require("hardhat");
const { developmentChains, networkConfig } = require("../helper-hardhat-config");

module.exports=async function({getNamedAccounts,deployments}){
    const {deploy,log}=deployments;
    const {deployer}=await getNamedAccounts();
    const chainId=network.config.chainId;
    let vrfCoordinatorV2Address

    if(developmentChains.includes(network.name)){
        const vrfCoordinatorV2MOCK=await ethers.getContract("VRFCoordinatorV2Mock");
        vrfCoordinatorV2Address=vrfCoordinatorV2MOCK.address;
    }
    else{
        vrfCoordinatorV2Address=networkConfig[chainId]["vrfCoordinatorV2"]
    }
    const entranceFee=networkConfig[chainId]["entranceFee"]
    const args=[vrfCoordinatorV2Address,entranceFee]
    const raffle=await deploy("Raffle",{
        from:deployer,
        args:[],
        log:true,
        validConfirmations:network.config.blockConfirmations||1
    })
}