import { ethers } from "./ethers-5.2.min.js";
import { abi, contractAddress } from "./utils/api.js";
import { mySubstring, isLoading } from "./utils/tools.js";
import { getEthereum, getContract, getBalance } from "./utils/contract.js";
const connectBtn = document.querySelector(".connect-btn"); //connect
const fundBtn = document.querySelector(".fund-btn"); //fund
const amountInput = document.querySelector(".fund-input"); //input
const balanceArea = document.querySelector(".balance"); //balance
const withDrawBtn = document.querySelector(".withdraw-btn"); //withdraw
const loadDom = document.querySelector(".load-container"); //loading

let contract;
const { provider } = getEthereum(contractAddress, abi);

isLoading(loadDom, false); //loading
//判断当前是否已链接
if (typeof window.sessionStorage.getItem("providerAddress") === "string") {
  const address = window.sessionStorage.getItem("providerAddress");
  connectBtn.innerHTML = await mySubstring(address, 4);
  contract = getContract(contractAddress, abi, getEthereum().signer).contract;
} else {
  connectBtn.innerHTML = "Connect";
}

//链接小狐狸
const connectHandle = async () => {
  if (typeof window.ethereum !== "undefined") {
    if (typeof window.sessionStorage.getItem("providerAddress") === "string") {
      return false;
    }
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
        params: [],
      });
      console.log("successfully connected....");
      window.sessionStorage.setItem("providerAddress", accounts[0]);
      connectBtn.innerHTML = await mySubstring(accounts[0], 4);
      contract = getContract(
        contractAddress,
        abi,
        getEthereum().signer
      ).contract;
    } catch (err) {
      alert(err.message);
    }
  } else {
    alert("Please install Metamask");
  }
};

connectBtn.onclick = connectHandle;

//获取余额
const getBalanceHandle = async () => {
  const balance = await getBalance(contractAddress, provider);
  balanceArea.innerHTML = Number(balance);
  if (!Number(balance)) {
    withDrawBtn.style.display = "none";
  } else {
    withDrawBtn.style.display = "block";
  }
  isLoading(loadDom, false); //取消loading
};

getBalanceHandle();

//fund
const fundHandle = async () => {
  const amount = amountInput.value;
  if (!amount) {
    alert("Please enter the amount");
    return false;
  }
  if (!window.sessionStorage.getItem("providerAddress")) {
    alert("Please connect");
    amountInput.value = "";
    return false;
  }
  try {
    isLoading(loadDom);
    const transactionResponse = await contract.fund({
      value: ethers.utils.parseEther(amount),
    });
    const confirmations = await transactionListen(transactionResponse);
    amountInput.value = "";
    getBalanceHandle();
  } catch (err) {
    alert(err.data?.message || err.message);
    amountInput.value = "";
    getBalanceHandle();
  }
};
fundBtn.onclick = fundHandle;

//提现(withdraw)
const withDrawHandle = async () => {
  if (!window.sessionStorage.getItem("providerAddress")) {
    alert("Please connect");
    return false;
  }
  try {
    isLoading(loadDom);
    const transactionResponse = await contract.withdraw();
    await transactionListen(transactionResponse);

    getBalanceHandle();
  } catch (err) {
    console.log(err);
    alert(err.data?.message || err.message);

    getBalanceHandle();
  }
};
withDrawBtn.onclick = withDrawHandle;

//监听小狐狸账号变化
ethereum.on("accountsChanged", async (accounts) => {
  if (accounts.length) {
    window.sessionStorage.setItem("providerAddress", accounts[0]);
    connectBtn.innerHTML = await mySubstring(accounts[0], 4);
    contract = getContract(contractAddress, abi, getEthereum().signer).contract;
  } else {
    window.sessionStorage.removeItem("providerAddress");
    connectBtn.innerHTML = "Connect";
    contract = null;
  }
});

//监听交易完成
const transactionListen = (transactionResponse) => {
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, async (tx) => {
      resolve(tx.confirmations);
    });
  });
};
