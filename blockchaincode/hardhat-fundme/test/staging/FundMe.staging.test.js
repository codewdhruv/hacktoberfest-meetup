const { assert } = require('chai');
const {getNamedAccounts,ethers, network}=require('hardhat');
const {developmentChains}=require('../../helper-hardhat-config');
//That below code refers that the we can run this testing on the Testnet chain not in the 
//local chain
developmentChains.includes(network.name) 
? describe.skip
: describe("FundMe",async function(){
    let fundMe
    let deployer
    const sendValue=ethers.utils.parseEther("1")
    beforeEach(async function(){
        deployer=(await getNamedAccounts()).deployer
        fundMe=await ethers.getContract("Fundme",deployer)
    })
    it("allows people to fund and withdraw",async function(){
        await fundMe.fund({value:sendValue})
        await fundMe.withdraw()
        const endingBalance =await fundMe.provider.getBalance(fundMe.address);
        assert.equal(endingBalance.toString(),"0")
    })
})