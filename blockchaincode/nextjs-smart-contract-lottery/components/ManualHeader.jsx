import { Button } from '@web3uikit/core'
import { useEffect } from 'react'
import {useMoralis} from 'react-moralis'
export default function ManualHeader(){
    const {enableWeb3,isWeb3Enabled,account,Moralis,deactivateWeb3,isWeb3EnableLoading}=useMoralis()
    let connected=false
    //This below code is even simpler to connect with the web 3

    useEffect(() => {
     if(isWeb3Enabled)  return
     if(typeof window !=="undefined"){
        if(window.localStorage.getItem("connected")){
            enableWeb3()
        }
        }
    }, [isWeb3Enabled])
    //if there is nothing in the dependency array
    //then it will run one time on load and if there is something in the dependency array then it will load anytime the value of the dependency array changes
    useEffect(()=>{
        Moralis.onAccountChanged((account)=>{
            console.log(`Account changed to ${account}`)
            if(account==null){
                window.localStorage.removeItem("connected")
                deactivateWeb3();
                console.log("NULL account found")
            }
        })
    },[])
    return (
        <div>
            {account?(<div>Connected to {account.slice(0,6)}...{account.slice(account.length-4)}</div>):(<Button
             onClick={async()=>{
                await enableWeb3()
                window.localStorage.setItem("connected","injected")
                }}
                disabled={isWeb3EnableLoading}
                theme="primary" type="button" text="Launch Dapp"/>)}
            
            </div>
    )
}

//we are going to use react-morails to 