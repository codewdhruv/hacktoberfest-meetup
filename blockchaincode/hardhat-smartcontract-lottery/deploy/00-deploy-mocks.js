const { network, ethers } = require('hardhat');
const {developmentChains,networkConfig}=require('../helper-hardhat-config')
const BASEFEE=ethers.utils.parseEther("0.005")//0.005 is premium that means 0.005 link per request
const GAS_PRICE_LINK=1e9//link per gascalculated value based on the gas price of the chains
//chainlink nodes pay the gasfees to give us randomness and do the external execution...
//
module.exports=async function({getNamedAccounts,deployments}){
    const{deploy,log}=deployments
    const {deployer}=await getNamedAccounts();
    const chainId=networkConfig.chainId;
    const args=[BASEFEE,GAS_PRICE_LINK]
    if(developmentChains.includes(network.name)){
        log("Local network detected! Deploying Mocks......")
        await deploy("VRFCoordinatorV2Mock",{
            from:deployer,
            log:true,
            args:args,
        })
        log("Mocks Deployed");
        log(".................");
    }
}

module.exports.tags=['all','mocks']