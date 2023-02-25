//This is just a encryption setup to encrypt the private key so that anybody can't hack it
const ethers=require('ethers');
const fs=require('fs-extra');
require('dotenv').config();



const main=async()=>{
    const wallet=await new ethers.Wallet(process.env.PRIVATE_KEY);
    const encryptedJsonKey=await wallet.encrypt(
        process.env.PRIVATE_KEY_PASSWORD,
        process.env.PRIVATE_KEY
    )
    console.log(encryptedJsonKey)
    //Just passing the encrypted key to the new file
    fs.writeFileSync('./.encryptedKey.json',encryptedJsonKey)
}



main().then(()=>{
    console.log('successfully resolved all promises')
})
.catch((error)=>{
  console.log("error occured")
  console.log(error)
})