const { assert } = require('chai')
const {deployments, ethers, getNamedAccounts}=require('hardhat')

describe("Fundme",async function(){
    let fundMe
    let deployer
    let mockV3Aggregator
    beforeEach(async function(){
        //deploy our fundme contract
        // using Hardhat-deploy
        // const accounts=await ethers.getSigner();//By this way you can get the accounts
        // const accountOne=accounts[0];
         deployer=(await getNamedAccounts()).deployer//ways to get accounts on hardhat
        await   deployments.fixture(["all"])
        fundMe=await ethers.getContract("Fundme",deployer)
        mockV3Aggregator=await ethers.getContract("MockV3Aggregator",deployer)

    })
    describe("constructor",async function(){
     it("sets the aggregator address correctly",async function(){
        const response = await fundMe.priceFeed()
        assert.equal(response,mockV3Aggregator.address)
     })
    })
    describe("fund",async function(){
        it("Fails if you dont send enough ETH",async function(){
            await fundMe.fund()
        })
    })
})