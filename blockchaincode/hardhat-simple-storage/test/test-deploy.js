const {ethers}=require('hardhat')
const {assert,expect}=require('chai')


describe('SimpleStorage',()=>{
    let simpleStorageFactory,simpleStorage
    beforeEach(async function(){
         simpleStorageFactory=await ethers.getContractFactory("SimpleStorage");
         simpleStorage=await simpleStorageFactory.deploy();
    } )
    it("Should start with a favorite number of 0",async function(){
        const currentValue=await simpleStorage.retrieve();
        const expectedValue="0";
        //assert
        //expect
        assert.equal(currentValue.toString(),expectedValue)
        //by expect keyword
        // expect(currentValue.toString()).to.equal(expectedValue)
        //These upper line is same as the line with assert keyword so the output will be same
    })
    it("Should update when we call store",async function(){
        const expectedValue="7";
        const transactionResponse=await simpleStorage.store(expectedValue)
        await transactionResponse.wait(1);

        const currentValue=await simpleStorage.retrieve()
        assert.equal(currentValue.toString(),expectedValue)
    })
    it("Should update person when we call add person",async function(){
        const expectedValue="7";
        const expectedName="Souvik";
        const transactionResponse=await simpleStorage.addPerson("Souvik",expectedValue);
        await transactionResponse.wait(1);

        const currentviewPersonValue=await simpleStorage.viewPerson(expectedName);
        assert.equal(currentviewPersonValue.toString(),expectedValue);

    })
})