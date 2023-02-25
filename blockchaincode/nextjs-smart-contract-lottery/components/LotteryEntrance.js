import { useNFTBalances, useWeb3Contract } from "react-moralis"
import { abi,contractAddresses } from "@/constants"
import {useMoralis} from "react-moralis"
import { useEffect,useState } from "react"
import {ethers} from "ethers"
import { useNotification } from "@web3uikit/core"
export default function LotteryEntrance(){
    const {chainId:chainIdHex,isWeb3Enabled}=useMoralis()
    const chainId=parseInt(chainIdHex)//THis will give the chainid 
    const dispatch=useNotification()
    const raffleAddress=chainId in contractAddresses ?contractAddresses[chainId][0]:null
    const [entranceFee, setentranceFee] = useState("0")
    const [numberPlayers, setnumberPlayers] = useState("0")
    const [recentWinner, setrecentWinner] = useState("0")
    const {
        runContractFunction: enterRaffle,
        data: enterTxResponse,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "enterRaffle",
        msgValue: entranceFee,
        params: {},
    })

const {runContractFunction: getEntranceFee}=useWeb3Contract({
        abi:abi,
        contractAddress:raffleAddress,
        functionName:"getEntranceFee",
        params:{},
    })
    const {runContractFunction: getNumberOfPlayers}=useWeb3Contract({
        abi:abi,
        contractAddress:raffleAddress,
        functionName:"getNumberOfPlayers",
        params:{},
    })
    const {runContractFunction: getRecentWinner}=useWeb3Contract({
        abi:abi,
        contractAddress:raffleAddress,
        functionName:"getRecentWinner",
        params:{},
    })

    async function updateUI(){
        const entranceFeeFromCall=(await getEntranceFee()).toString();
        const numberofPlayersFromCall=(await getNumberOfPlayers()).toString()    
        const recentWinnerFromCall=(await getRecentWinner()).toString();   
    setentranceFee(entranceFeeFromCall)
    setnumberPlayers(numberofPlayersFromCall)
    setrecentWinner(recentWinnerFromCall)
            // console.log(entranceFee)
        }
    //we are going to fetch the msgValue which is raffleEntrance fee value from getEntranceFee function  on every load of the page by useEffect 

    useEffect(()=>{
        //we need to wrap this in a function because useEffect doesnot support the await so here we need to wrap this in an async function
        if(isWeb3Enabled){
      
            updateUI()
        }
    },[isWeb3Enabled])


    const handleSuccess=async function(tx){
        await tx.wait(1)
        handleNewNotification(tx);
        updateUI()
    }
    const handleNewNotification=function(){
        dispatch({
            type:"info",
            message:"transaction complete",
            title:"Tx notification",
            position:"topR",
            icon:"bell"
        })
    }

    return(
        <div className="p-5">
        <h1 className="py-4 px-4 font-bold text-3xl">Lottery</h1>
        {raffleAddress ? (
            <>
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
                    onClick={async () =>
                        await enterRaffle({
                            // onComplete:
                            // onError:
                            onSuccess: handleSuccess,
                            onError: (error) => console.log(error),
                        })
                    }
                    disabled={isLoading || isFetching}
                >
                    {isLoading || isFetching ? (
                        <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                    ) : (
                        "Enter Raffle"
                    )}
                </button>
                <div>Entrance Fee: {ethers.utils.formatUnits(entranceFee, "ether")} ETH</div>
                <div>The current number of players is: {numberPlayers}</div>
                <div>The most previous winner was: {recentWinner}</div>
            </>
        ) : (
            <div>Please connect to a supported chain </div>
        )}
    </div>
             
    )
}