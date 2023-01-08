const { assert, expect } = require('chai');
const { network, getNamedAccounts, deployments, ethers } = require('hardhat');
const { isCallTrace } = require('hardhat/internal/hardhat-network/stack-traces/message-trace');
const {developmentChains,networkConfig}=require('../../helper-hardhat-config');

!developmentChains.includes(network.name)
? describe.skip:
describe("Raffle Unit Test",async function(){
    let raffle,vrfCoordinatorV2MOCK,raffleEntranceFee,deployer,interval
 
    beforeEach(async function(){
       deployer=(await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);//all tags so deploying the all contracts
        raffle = await ethers.getContract("Raffle",deployer);
        vrfCoordinatorV2MOCK=await ethers.getContract("VRFCoordinatorV2Mock",deployer);
         interval=await raffle.getInterval();
        raffleEntranceFee=await raffle.getEntranceFee();
    })

    describe("constructor",async function(){
        it("initializing the raffle correctly",async function(){
            const raffleState=await raffle.getRaffleState();
            
            assert.equal(raffleState.toString(),"0")
            assert.equal(interval.toString(),networkConfig[network.config.chainId]["interval"])
        })
    })
    describe("enterRaffle",async function(){
        it("reverts when you don't pay enough",async function(){
            await expect(raffle.enterRaffle()).to.be.revertedWith("Raffle__NotEnoughETHEntered")
        })
        it("records players when they enter",async function(){
            await raffle.enterRaffle({value:raffleEntranceFee});
            const playerFromContract=await raffle.getPlayer(0);
        
            assert.equal(playerFromContract,deployer)
       
        })
        it("emits event on enter",async function(){
            await expect(raffle.enterRaffle({value:raffleEntranceFee})).to.emit(raffle,"RaffleEnter");
            //This .to.emit function comes from the chai which is used to emit an event 
            //which takes two parameters like the contract here which is raffle and the event name which you want to call
        })
       it("doesn't allow entrance when raffle is calculating", async () => {
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  // for a documentation of the methods below, go here: https://hardhat.org/hardhat-network/reference
                 await network.provider.send("evm_increaseTime", [interval.toNumber() - 1])
                await network.provider.request({ method: "evm_mine", params: [] })
                //   // we pretend to be a keeper for a second
               
                 await raffle.performUpkeep([]); // changes the state to calculating for our comparison below
                  await expect(raffle.enterRaffle({ value: raffleEntranceFee })).to.be.revertedWith( // is reverted as raffle is calculating
                  "Raffle__NotOpen"
              )
            //error occured verify it later on
        })
    
    })
    describe("checkupkeep",async function(){
        it("return flase if people haven't sent any ETH",async function(){
            await network.provider.send("evm_increaseTime",[interval.toNumber() + 1])
            await network.provider.send("evm_mine",[]);
           const {upkeepNeeded}= await raffle.callStatic.checkUpkeep([]);
           assert(!upkeepNeeded)

        })
        it("returns false if raffle is not open",async function(){
            await raffle.enterRaffle({value:raffleEntranceFee});
            await network.provider.send("evm_increaseTime",[interval.toNumber() +1])
            await network.provider.send("evm_mine",[]);
            await raffle.performUpkeep([]);
            const raffleState=await raffle.getRaffleState();
            const {upkeepNeeded}=await raffle.callStatic.checkUpkeep([]);
            assert.equal(raffleState.toString(),"1");
             assert.equal(upkeepNeeded,false)
        })
    })
})