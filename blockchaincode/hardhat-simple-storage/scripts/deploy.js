//imports
const {ethers,run,network}=require('hardhat');


//async main
let main=async()=>{
  const SimpleStorageFactory=await ethers.getContractFactory("SimpleStorage");
  console.log('Deploying Contract');
  const simpleStorage=await SimpleStorageFactory.deploy();
  await simpleStorage.deployed();
  console.log(`Deployed Contract to ${simpleStorage.address}`);
  //What happens if we deploy to hardhat network
  if(network.config.chainId===5 && process.env.ETHERSCAN_API_KEY){
    console.log('Working block txes...');
     await simpleStorage.deployTransaction.wait(6);
      await verify(simpleStorage.address,[]);
  }
    //Interacting with the contract
    const currentValue= await simpleStorage.retrieve();
    console.log(`The current value is ${currentValue}`)
    //Update the current value
    const transactionResponse=await simpleStorage.store(7)
    await transactionResponse.wait(1);
    const updatedValue=await simpleStorage.retrieve();

    console.log(`The updated value is ${updatedValue}`)
}

//verify function
const verify=async(contractAddress,args)=>{
     console.log("Verifying Contract....");
     try{
     await run("verify:verify",{
      address:contractAddress,
      constructorArguments:args,
     })
    }
    catch(error){
      if(error.message.toLowerCase().includes("already verified")){
        console.log('Already Verified');
      }
      else{
        console.log(error)
      }
    }
}


//main
main().then(()=>{
  console.log('Compilation Successful');
})
.catch((err)=>{
  console.log('The error occured here');
})