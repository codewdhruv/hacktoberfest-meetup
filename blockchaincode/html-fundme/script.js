
//in front end keyword javascript use import rather than using require method

import { ethers } from "./ethers-5.2.esm.min.js";
import {abi,contractAddress} from "./constants.js"

async function connect() {
    let connectButton=document.getElementById('connectButton')
    if (typeof window.ethereum !== "undefined") {
      try {
        await ethereum.request({ method: "eth_requestAccounts" })
      } catch (error) {
        console.log(error)
      }
      connectButton.innerHTML = "Connected"
      const accounts = await ethereum.request({ method: "eth_accounts" })
      console.log(accounts)
    } else {
      connectButton.innerHTML = "Please install MetaMask"
    }
  }

  //taking string from the input tag
  let inputTag=document.getElementById('ethAmount');
  

//To get the balance from the account
async function getBalance(){
    if (typeof window.ethereum != "undefined"){
        const provider=new ethers.providers.Web3Provider(window.ethereum);
        const balance=await provider.getBalance(contractAddress);
        //display balance here
        let displaybalance=document.getElementById('displayBalance');
        displaybalance.innerText="The balance which is funded is "+ethers.utils.formatEther(balance)+" Ether";
        // console.log(ethers.utils.formatEther(balance))//This is used to format the wei button
    }else{

    }
}


async function fund(){
    const ethAmmount=inputTag.value
   //For sending the transaction we need the below as prerequirities
    //    provider/conncetion to the blockchain
    //    signer / wallet / someone with some gas
    //    contract that  we are interacting with
    //    ^ABI and address
   const provider=new ethers.providers.Web3Provider(window.ethereum)
   const signer=provider.getSigner();
   const contract=new ethers.Contract(contractAddress,abi,signer);
   try{
   const transactionResponse=await contract.fund({value:ethers.utils.parseEther(ethAmmount)})
   //listen for the tx to be mined
   //listen for an event <- we haven't learnet about yet!
   //hey wait for the transaction to be mined
   await listenForTransaction(transactionResponse,provider)
   console.log('Done!')
   }
   catch(error){
    console.log(error)
   }

}

function listenForTransaction(transactionResponse,provider){
    console.log(`Mining ${transactionResponse.hash}....`)
    //listen for the transaction to finish
    //Ethers came with event listener we can use it to deal with this 
    return new Promise((resolve,reject)=>{

        provider.once(transactionResponse.hash,(transactionReceipt)=>{
            console.log(`Completed with ${transactionReceipt.confirmations} confirmations`)
            resolve();
        })
    })
}


  let connectButton=document.getElementById('connectButton')
  connectButton.addEventListener('click',connect)

  //fund button
  let fundBtn=document.getElementById('fundBtn');
fundBtn.addEventListener('click',fund)
let getBalanceBtn=document.getElementById('getBalanceBtn');
getBalanceBtn.addEventListener('click',getBalance)
