const { assert, expect } = require('chai');
const { network, getNamedAccounts, deployments, ethers } = require('hardhat');
const { isCallTrace } = require('hardhat/internal/hardhat-network/stack-traces/message-trace');
const { clearConfigCache } = require('prettier');
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
        it("returns false if enough time hasn't passed", async () => {
            await raffle.enterRaffle({ value: raffleEntranceFee })
            await network.provider.send("evm_increaseTime", [interval.toNumber() - 5]) // use a higher number here if this test fails
            await network.provider.request({ method: "evm_mine", params: [] })
            const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x") // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
            assert(!upkeepNeeded)
        })
        it("returns true if enough time has passed, has players, eth, and is open", async () => {
            await raffle.enterRaffle({ value: raffleEntranceFee })
            await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
            await network.provider.request({ method: "evm_mine", params: [] })
            const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x") // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
            assert(upkeepNeeded)
        })
    })
    describe("performUpkeep", function () {
        it("can only run if checkupkeep is true", async () => {
            await raffle.enterRaffle({ value: raffleEntranceFee })
            await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
            await network.provider.request({ method: "evm_mine", params: [] })
            const tx = await raffle.performUpkeep("0x") 
            assert(tx)
        })
        it("reverts if checkup is false", async () => {
            await expect(raffle.performUpkeep("0x")).to.be.revertedWith( 
                "Raffle__UpkeepNotNeeded"
            )
        })
        it("updates the raffle state and emits a requestId", async () => {
            // Too many asserts in this test!
            await raffle.enterRaffle({ value: raffleEntranceFee })
            await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
            await network.provider.request({ method: "evm_mine", params: [] })
            const txResponse = await raffle.performUpkeep("0x") // emits requestId
            const txReceipt = await txResponse.wait(1) // waits 1 block
            const raffleState = await raffle.getRaffleState() // updates state
            const requestId = txReceipt.events[1].args[0]
            assert(requestId.toNumber() > 0)
            assert(raffleState == 1) // 0 = open, 1 = calculating
        })
    })
    describe("fulfillRandomWords", function () {
        beforeEach(async () => {
            await raffle.enterRaffle({ value: raffleEntranceFee })
            await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
            await network.provider.request({ method: "evm_mine", params: [] })
        })
        it("can only be called after performupkeep", async () => {
            await expect(
                vrfCoordinatorV2MOCK.fulfillRandomWords(0, raffle.address) // reverts if not fulfilled
            ).to.be.revertedWith("nonexistent request")
            await expect(
                vrfCoordinatorV2MOCK.fulfillRandomWords(1, raffle.address) // reverts if not fulfilled
            ).to.be.revertedWith("nonexistent request")
        })

      // This test is too big...
      // This test simulates users entering the raffle and wraps the entire functionality of the raffle
      // inside a promise that will resolve if everything is successful.
      // An event listener for the WinnerPicked is set up
      // Mocks of chainlink keepers and vrf coordinator are used to kickoff this winnerPicked event
      // All the assertions are done once the WinnerPicked event is fired
 
    })
    // it("picks a winner, resets the lottery and sends money",async function(){
    //     const additionalEntrants=3
    //     const startingAccountIndex=1
    //       accounts=ethers.getSigner()
    //     for(let i=startingAccountIndex;i<startingAccountIndex+additionalEntrants;i++){
    //         const accountConnectedRaffle=raffle.connect(accounts[i]);
    //         await accountConnectedRaffle.enterRaffle({value:raffleEntranceFee})       
    //     }
    //     const startingTimeStamp= await raffle.getLastTimeStamp();
    //     //performUpkeep (mock being chainlink keepers)
    //     //fulfill random words (mocks being the chainlink VRF)
    //     //We will havae to wait for the fulfill randomwords to be called
    //     await new Promise(async(resolve,reject)=>{
    //         raffle.once("WinnerPicked",async()=>{
    //             console.log("Founded the event")
    //             try{
    //                 const recentWinner=await raffle.getRecentWinner();
                
    //                 const raffleState=await raffle.getRaffleState();
    //                 const endingTimeStamp=await raffle.getLastTimeStamp();
    //                 const numPlayers=await raffle.getNumberOfPlayers();
    //                 assert(numPlayers.toString(),"0");//The number of players should be zero
    //                 assert.equal(raffleState.toString(),"0")//raffle State should be equal to zero
    //                 assert(endingTimeStamp>startingTimeStamp)
                 
    //             }catch(e){
    //                 reject(e)
    //             }
    //             resolve()
    //         })
    //         //setting up the listener
    //         //below,we will fire the event and the listener will pick it up, and resolve
    //         const tx=await raffle.performUpkeep("0x");
    //         const txReceipt=await tx.wait(1);
    //         await vrfCoordinatorV2MOCK.fulfillRandomWords(txReceipt.events[1].args[0],
    //             raffle.address)
    //     })

    // })
})