/* eslint-disable no-restricted-globals */
import './App.css';

import BankAbi from './Bank.json';
import { ethers,utils } from 'ethers';
import { useEffect,useState } from 'react';


const bankContractAdress ="0x5FbDB2315678afecb367f032d93F642f64180aa3"

function App() {

  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isBankerOwner, setIsBankerOwner] = useState(false);
  const [inputValue, setInputValue] = useState({ withdraw: "", deposit: "", bankName: "" });
  const [bankOwnerAddress, setBankOwnerAddress] = useState(null);
  const [customerTotalBalance, setCustomerTotalBalance] = useState(null);
  const [currentBankName, setCurrentBankName] = useState(null);
  const [customerAddress, setCustomerAddress] = useState(null);
  const [error, setError] = useState(null);

  const bankAbi=BankAbi.abi;
  
  //create function to check wallet is conneceted or not
  async function connectWallet(){ 
    if(window.ethereum){
      const accounts=await window.ethereum.request({
        method: "eth_requestAccounts"
      });
      const account=accounts[0];
      setIsWalletConnected(true);
      setCustomerAddress(accounts);
      console.log("Accountc onnected : ",account);
    }else{
      setError("Please install metamask wallet to use our Bank.");
      console.log("Metamask not detected");
    }
  }

  //getter
  async function get_Bank_Name(){
    if(window.ethereum){
      const providers=new ethers.providers.Web3Provider(window.ethereum); //we use metamask as a provider
      const signers=providers.getSigner();
      const bankContract=new ethers.Contract(bankContractAdress,bankAbi,signers);
      let bankName=await bankContract.bankName();
      bankName=utils.parseBytes32String(bankName);
      setCurrentBankName(bankName.toString());

    }
    else{
      console.log("Ethereum not found ,please insert metamask");
      setError("please insert metamask");
    }
  }

  async function set_Bank_Name(){
    // eslint-disable-next-line no-restricted-globals
    event.preventDefault();

    if(window.ethereum){
      const provider=ethers.providers.Web3Provider(window.ethereum);
      const signers = provider.getSigner();
      const bankContract=new ethers.Contract(bankContractAdress,bankAbi,signers);
      
      const txn =await bankContract.setBankName(utils.formatBytes32String(inputValue.bankName));
      console.log("Setting bank name");

      await txn.wait();
      console.log("Bank name changed",txn.hash);
      await get_Bank_Name();
    
    }else{
      console.log("Ethereum not found ,please insert metamask");
      setError("please insert metamask");
    }
  }

  async function get_Owner_Handler(){
    if(window.ethereum){
      const provider=new ethers.providers.Web3Provider(window.ethereum);
      const signers=provider.getSigner();
      const bankContract=new ethers.Contract(bankContractAdress,bankAbi,signers);

      let owner=await bankContract.bankOwner();
      setBankOwnerAddress(owner);

      const [account] = await window.ethereum.request({method : 'eth_requestAccounts' });
      if(owner.toLowerCase() === account.toLowerCase()){
        setIsBankerOwner(true);
      } 
    }else{
      console.log("Ethereum not found ,please insert metamask");
      setError("please insert metamask");
    }
  }

  async function customer_Balance_Handler(){
    if(window.ethereum){
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const bankContract = new ethers.Contract(bankContractAdress,bankAbi,signer);

      let balance = await bankContract.getCustomerBalance();
      setCustomerTotalBalance(utils.formatEther(balance));
      console.log("Retrieved balance ..",balance);

    }else{
      console.log("Ethereum not found ,please insert metamask");
      setError("please insert metamask");
    }
  }

  async function deposit_Money_Handler(){
    event.preventDefault();
    if(window.ethereum){
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer=provider.getSigner();
      const bankContract =new ethers.Contract(bankContractAdress,bankAbi,signer);

      const txn = await bankContract.depositMoney({ value : ethers.utils.parseEther(inputValue.deposit) }); 
      console.log("Depositing money ..");

      await txn.wait();
      console.log("Deposite money ... done ",txn.hash());
      customer_Balance_Handler();

    }else{
      console.log("Ethereum not found ,please insert metamask");
      setError("please insert metamask");
    }
  }

  async function withdraw_Money_Handler(){
    // eslint-disable-next-line no-restricted-globals
    event.preventDefault();

    if(window.ethereum){
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer =provider.getSigner();
      const bankContract = new ethers.Contract(bankContractAdress,bankAbi,signer);

      let myAddress=await signer.getAddress();
      console.log("provider signer.. : ", myAddress);

      
      let txn = await bankContract.withdrawMoney(myAddress,ethers.utils.parseEther(inputValue.withdraw));
      console.log("Withdrawing money ... ");

      await txn.wait();
      console.log("withdraw conplete ..");
      
      customer_Balance_Handler();
      
    }else{
      console.log("Ethereum not found ,please insert metamask");
      setError("please insert metamask");
    }
  }

  const handleInputChange = (event) => {
    setInputValue(prevFormData => ({ ...prevFormData,[event.target.name]: event.target.value}));
  };


  useEffect(()=>{
    connectWallet();
    get_Bank_Name();
    get_Owner_Handler();
    customer_Balance_Handler();

  },[isWalletConnected]);


  return (
    <main className="container App " >
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous"></link>
      <h2 className="headline"><span className="headline-gradient">DC_Bank Project</span> 💰</h2>
      <section className="customer-section px-10 pt-5 pb-10 row align-items-center" >
        {error && <p className="text-2xl text-red-700">{error}</p>}
        <div className="mt-5">
          {currentBankName === "" && isBankerOwner ?
            <p>"Setup the name of your bank." </p> :
            <p className="text-3xl font-bold">{currentBankName}</p>
          }
        </div>
        <div className="mt-7 mb-9">
          <form className="form-style  mb-3 container">
            <input
              type="text"
              className="input-style form-control col-auto  mb-3 "
              onChange={handleInputChange}
              name="deposit"
              placeholder="0.0000 ETH"
              value={inputValue.deposit}
            />
            <button
              className="btn-purple btn btn-primary form-control"
              onClick={deposit_Money_Handler}>Deposit Money In ETH</button>
          </form>
        </div>
        <div className="mt-10 mb-10">
          <form className="form-style container">
            <input
              type="text"
              className="input-style  form-control col-auto  mb-3"
              onChange={handleInputChange}
              name="withdraw"
              placeholder="0.0000 ETH"
              value={inputValue.withdraw}
            />
            <button
              className="btn-purple btn btn-primary form-control"
              onClick={withdraw_Money_Handler}>
              Withdraw Money In ETH
            </button>
          </form>
        </div>
        <div className="mt-5">
          <p><span className="font-bold">Customer Balance: </span>{customerTotalBalance}</p>
        </div>
        <div className="mt-5">
          <p><span className="font-bold">Bank Owner Address: </span>{bankOwnerAddress}</p>
        </div>
        <div className="mt-5">
          {isWalletConnected && <p><span className="font-bold">Your Wallet Address: </span>{customerAddress}</p>}
          <button className="btn-connect btn btn-primary mb-3" onClick={connectWallet}>
            {isWalletConnected ? "Wallet Connected 🔒" : "Connect Wallet 🔑"}
          </button>
        </div>
      </section>
      {
        isBankerOwner && (
          <section className="bank-owner-section">
            <h2 className="text-xl border-b-2 border-indigo-500 px-10 py-4 font-bold">Bank Admin Panel</h2>
            <div className="p-10">
              <form className="form-style">
                <input
                  type="text"
                  className="input-style "
                  onChange={handleInputChange}
                  name="bankName"
                  placeholder="Enter a Name for Your Bank"
                  value={inputValue.bankName}
                />
                <button
                  className="btn-grey btn btn-primary mb-3"
                  onClick={set_Bank_Name}>
                  Set Bank Name
                </button>
              </form>
            </div>
          </section>
        )
      }
      <script src="https://unpkg.com/react/umd/react.production.min.js" crossorigin></script>

      <script
        src="https://unpkg.com/react-dom/umd/react-dom.production.min.js"
        crossorigin></script>

      <script
        src="https://unpkg.com/react-bootstrap@next/dist/react-bootstrap.min.js"
        crossorigin></script>

    </main>
  );
}

export default App;
