import { ethers } from "../ethers-5.2.min.js";
//获取Ethereum实例
export const getEthereum = () => {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    return {
      provider,
      signer,
    };
  } else {
    alert("Please install Metamask");
  }
};

export const getContract = (address, contractAbi, signer) => {
  const contract = new ethers.Contract(address, contractAbi, signer);
  return {
    contract,
  };
};

export const getBalance = async (contractAddress, provider) => {
  const balance = (await provider.getBalance(contractAddress)).toString();
  const ethBalance = ethers.utils.formatEther(balance);
  return ethBalance;
};
