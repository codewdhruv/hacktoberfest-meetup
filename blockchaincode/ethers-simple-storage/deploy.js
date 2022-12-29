
//Deploy the contract Simple Storage by the javaScript

const ethers=require('ethers');
const fs=require('fs-extra')
const main=async()=>{

    //HTTP://127.0.0.1:7545
    const provider=new ethers.providers.JsonRpcProvider("HTTP://127.0.0.1:8545");
    console.log(provider)
    const wallet =new ethers.Wallet("0x10b9b531c19afcc47b6b201fba15c55b8940a4b46dc3cf5c638ca8743ddd2ea1",provider);
    const abi=fs.readFileSync("./SimpleStorage_sol_SimpleStorage.abi","utf-8");
    const binary=fs.readFileSync("./SimpleStorage_sol_SimpleStorage.bin","utf-8");
    const contractFactory= new ethers.ContractFactory(abi,binary,wallet);
     console.log("Deploying please wait")
     const contract=await contractFactory.deploy();
     console.log(contract)

}
main().then(()=>{
    console.log('successful')
})
.catch((error)=>{
  console.log("error occured")
  console.log(error)
})