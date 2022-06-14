import Head from 'next/head'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import styles from '../styles/Home.module.css'
import Web3Modal, { providers } from 'web3modal'
import { walletlink } from 'web3modal/dist/providers/connectors'

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  const web3ModalRef = useRef();
  
  
  const getProviderOrSigner = async (needSigner=false)=>{
    const provider = await web3ModalRef.current.connect();
    const web3Provider = await providers.web3Provider(provider);
    const {chainId}=await web3Provider.getNetwork();
    if(chainId!==4){
      console.log("Switch the network to Rinkeby Testnet.")
      throw new Error("Switch the network to Rinkeby Testnet.");
    }
    if(needSigner){
      const signer = await web3Provider.getSinger();
      return signer;
    }
    return web3Provider;
  }

  const 


  const connectWallet = async()=>{
    try {
      
      await getProviderOrSigner();
      setWalletConnected(true);
      
    } catch (error) {
      console.log(error);
    }
  }

  
  
  
  useEffect(()=>{
    if(!walletConnected){
      
      web3ModalRef.current = new Web3Modal({
        network:"rinkeby",
        providerOptions:{},
        disableInjectedProvider:false
      });
      connectWallet();

    }
  },[]);




  return (
    <div>
      <Head>
        <title>ICO</title>
        <meta name="description" content="ICO-DApp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
    
      <div className={styles.main}>
        <div>
          Welcome to the CryptoDev Token ICO
        </div>
        {
          walletConnected ?
          <div> {}/10000 Tokens have been minted.
          </div>:
          <button onClick={connectWallet} className={styles.button}>
            Connect Wallet
          </button>
        }
      </div>
      
    </div>
  )
}
