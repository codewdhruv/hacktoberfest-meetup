const { assert } = require('chai');
const {getNamedAccounts,ethers, network}=require('hardhat');
const {developmentChains}=require('../../helper-hardhat-config');
//That below code refers that the we can run this testing on the local chain not in the 
//development chain so it tails that when it is local chain just skip it otherwise just test it
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