const {task}=require('hardhat/config');
task('block-number','Prints the current block number').setAction(
    //You can also do this as same
    //const blockTask=async function()=>{}
    // async function blockTask(){}
    async(taskArgs,hre)=>{
            const blockNumber=await hre.ethers.provider.getBlockNumber();
            console.log(`Current Block Number is ${blockNumber}`)
    }
    
)