import Head from "next/head";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import { providers, BigNumber, utils, Contract } from "ethers";
import {
  TOKEN_CONTRACT_ADDR,
  TOKEN_CONTRACT_ABI,
  NFT_CONTRACT_ADDR,
  NFT_CONTRACT_ABI,
} from "../constants";

export default function Home() {
  const zero = BigNumber.from(0);
  const [walletConnected, setWalletConnected] = useState(false);
  const [tokenAmount, setTokenAmount] = useState(zero);
  const [tokensMinted, setTokensMinted] = useState(zero);
  const [totalTokensMinted, setTotalTokensMinted] = useState(zero);
  const [loading, setLoading] = useState(false);
  const [tokensToBeClaimed, setTokensToBeClaimed] = useState(zero);
  const web3ModalRef = useRef();

  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 4) {
      console.log("Switch the network to Rinkeby Testnet.");
      throw new Error("Switch the network to Rinkeby Testnet.");
    }
    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (error) {
      console.log(error);
    }
  };

  
  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
      getTokensMinted();
      getTotalTokensMinted();
      getTokensToBeClaimed();
    }
  }, [walletConnected]);
  
  const claimToken = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDR,
        TOKEN_CONTRACT_ABI,
        signer
      );
      const tx = await tokenContract.claim();
      setLoading(true);
      await tx.wait();
      setLoading(false);
      await getTokensMinted();
      await getTotalTokensMinted();
      await getTokensToBeClaimed();
    } catch (error) {
      console.log(error);
    }
  };

  const mintToken = async (amount) => {
    try {
      const provider = await getProviderOrSigner(true);
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDR,
        TOKEN_CONTRACT_ABI,
        provider
      );
      const value = amount * 0.001;
      const tx = await tokenContract.mint(amount, {
        value: utils.parseEther(value.toString()),
      });
      setLoading(true);
      await tx.wait();
      setLoading(false);
      await getTokensMinted();
      await getTotalTokensMinted();
      await getTokensToBeClaimed();
    } catch (error) {
      console.log(error);
    }
  };
  
  const getTokensToBeClaimed = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(
        NFT_CONTRACT_ADDR,
        NFT_CONTRACT_ABI,
        provider
      );
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDR,
        TOKEN_CONTRACT_ABI,
        provider
      );
      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress();
      console.log(address);
      const balance = await nftContract.balanceOf(address);
      console.log(balance);

      if (balance === zero) {
        setTokensToBeClaimed(zero);
      } else {
        var amount = 0;
        for (var i = 0; i < balance; i++) {
          const tokenId = await nftContract.tokenOfOwnerByIndex(address, i);
          const tokenClaimed = await tokenContract.tokenIdsClaimed(tokenId);
          if (!tokenClaimed) {
            amount++;
          }
        }
        setTokensToBeClaimed(BigNumber.from(amount));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getTotalTokensMinted = async () => {
    try {
      const provider = await getProviderOrSigner();
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDR,
        TOKEN_CONTRACT_ABI,
        provider
      );
      const totalTokensMinted = await tokenContract.totalSupply();
      setTotalTokensMinted(totalTokensMinted);
    } catch (error) {
      console.log(error);
    }
  };

  const getTokensMinted = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDR,
        TOKEN_CONTRACT_ABI,
        signer
      );
      const address = signer.getAddress();
      const tokensMinted = await tokenContract.balanceOf(address);
      setTokensMinted(tokensMinted);
    } catch (error) {
      console.log(error);
    }
  };

  const renderButton = () => {
    // If we are currently waiting for something, return a loading button
    if (loading) {
      return (
        <div>
          <button className={styles.button}>Loading...</button>
        </div>
      );
    }

    if (tokensToBeClaimed > zero) {
      return (
        <div>
          <div className={styles.description}>
            {tokensToBeClaimed*10} Tokens can be claimed!
          </div>
          <button className={styles.button} onClick={claimToken}>
            Claim Tokens
          </button>
        </div>
      );
    }

    return (
      <div style={{ display: "flex-col" }}>
        <div>
          <input
            type="number"
            placeholder="Amount of Tokens"
            // BigNumber.from converts the `e.target.value` to a BigNumber
            onChange={(e) => setTokenAmount(BigNumber.from(e.target.value))}
            className={styles.input}
          />
        </div>

        <button
          className={styles.button}
          disabled={!(tokenAmount > 0)}
          onClick={() => mintToken(tokenAmount)}
        >
          Mint Tokens
        </button>
      </div>
    );
  };

  return (
    <div>
      <Head>
        <title>Crypto Devs</title>
        <meta name="description" content="ICO-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs ICO!</h1>
          <div className={styles.description}>
            You can claim or mint Crypto Dev tokens here
          </div>
          {walletConnected ? (
            <div>
              <div className={styles.description}>
                {/* Format Ether helps us in converting a BigNumber to string */}
                You have minted {utils.formatEther(tokensMinted)} Crypto Dev
                Tokens
              </div>
              <div className={styles.description}>
                {/* Format Ether helps us in converting a BigNumber to string */}
                Overall {utils.formatEther(totalTokensMinted)}/10000 have been
                minted!!!
              </div>
              {renderButton()}
            </div>
          ) : (
            <button onClick={connectWallet} className={styles.button}>
              Connect your wallet
            </button>
          )}
        </div>
        <div>
          <img className={styles.Image} src="./0.svg" alt="Crypto Devs" />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by Crypto Devs
      </footer>
    </div>
  );
}
