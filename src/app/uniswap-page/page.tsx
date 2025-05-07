"use client";

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useSearchParams } from 'next/navigation';
import SampleTokenABI from '../abis/SampleToken.json';
import UniswapCloneABI from '../abis/UniswapClone.json';

// Hardcoded sample token address
const SAMPLE_TOKEN_ADDRESS = "0xF5AE15caC5f4De01CCA0505241cDcC1a6Cf78F6b";
const UNISWAP_CLONE_ADDRESS = "0xFd297Ed908577A24b7dD18306f61101beC5325C5";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export default function UniswapPage() {
  const searchParams = useSearchParams();
  
  const [account, setAccount] = useState('');
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [tokenContract, setTokenContract] = useState(null);
  const [uniswapContract, setUniswapContract] = useState(null);
  const [tokenBalance, setTokenBalance] = useState('0');
  const [ethBalance, setEthBalance] = useState('0');
  const [swapAmount, setSwapAmount] = useState('');
  const [loadingSwap, setLoadingSwap] = useState(false);
  const [loadingAddLiquidity, setLoadingAddLiquidity] = useState(false);
  const [tokenAmount, setTokenAmount] = useState('');
  const [ethAmount, setEthAmount] = useState('');
  const [transactionStatus, setTransactionStatus] = useState('');
  const [customTokens, setCustomTokens] = useState([]);
  const [selectedToken, setSelectedToken] = useState({
    address: SAMPLE_TOKEN_ADDRESS,
    symbol: 'STK'
  });
  
  // Load custom tokens from localStorage and check for URL params
  useEffect(() => {
    const savedTokens = localStorage.getItem("customTokens");
    if (savedTokens) {
      setCustomTokens(JSON.parse(savedTokens));
    }
    
    // Check if a token was specified in the URL
    const tokenAddress = searchParams.get('tokenAddress');
    const tokenSymbol = searchParams.get('tokenSymbol');
    
    if (tokenAddress) {
      setSelectedToken({
        address: tokenAddress,
        symbol: tokenSymbol || 'TOKEN'
      });
    }
  }, [searchParams]);

  // Connect wallet
  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        
        setAccount(accounts[0]);
        setProvider(provider);
        setSigner(signer);
        
        const tokenContract = new ethers.Contract(selectedToken.address, SampleTokenABI, signer);
        const uniswapContract = new ethers.Contract(UNISWAP_CLONE_ADDRESS, UniswapCloneABI, signer);
        
        setTokenContract(tokenContract);
        setUniswapContract(uniswapContract);
        
        // Get initial balances
        updateBalances(accounts[0], provider, tokenContract);
      } else {
        alert("Please install MetaMask!");
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setTransactionStatus(`Error connecting wallet: ${error.message}`);
    }
  };

  // Select a different token
  const handleTokenSelect = (tokenAddress, tokenSymbol) => {
    setSelectedToken({
      address: tokenAddress,
      symbol: tokenSymbol
    });
    
    if (signer) {
      const tokenContract = new ethers.Contract(tokenAddress, SampleTokenABI, signer);
      setTokenContract(tokenContract);
      updateBalances(account, provider, tokenContract);
    }
  };

  // Update balances
  const updateBalances = async (address, provider, tokenContract) => {
    try {
      const ethBalance = await provider.getBalance(address);
      const tokenBalance = await tokenContract.balanceOf(address);
      
      setEthBalance(ethers.utils.formatEther(ethBalance));
      setTokenBalance(ethers.utils.formatUnits(tokenBalance, 18));
    } catch (error) {
      console.error("Error updating balances:", error);
      setTransactionStatus(`Error updating balances: ${error.message}`);
    }
  };

  // First get some tokens before adding liquidity
  const mintTokens = async () => {
    if (!tokenContract) return;
    
    try {
      setTransactionStatus("Minting tokens...");
      // Mint 1000 tokens to the user
      const tx = await tokenContract.mint(account, ethers.utils.parseEther("1000"));
      await tx.wait();
      
      updateBalances(account, provider, tokenContract);
      setTransactionStatus("Tokens minted successfully!");
    } catch (error) {
      console.error("Error minting tokens:", error);
      setTransactionStatus(`Error minting tokens: ${error.message}`);
    }
  };

  // Add liquidity
  const addLiquidity = async () => {
    if (!ethAmount || !tokenAmount || !signer || !uniswapContract || !tokenContract) return;
    
    try {
      setLoadingAddLiquidity(true);
      setTransactionStatus("Approving token spending...");
      
      const weiAmount = ethers.utils.parseEther(ethAmount);
      const tokenWeiAmount = ethers.utils.parseEther(tokenAmount);
      
      // Approve token spending
      const approveTx = await tokenContract.approve(UNISWAP_CLONE_ADDRESS, tokenWeiAmount);
      await approveTx.wait();
      
      setTransactionStatus("Adding liquidity...");
      
      // Add liquidity
      const tx = await uniswapContract.addLiquidity(
        selectedToken.address, // Token address
        ZERO_ADDRESS,         // ETH address (zero address)
        tokenWeiAmount,       // Token amount
        weiAmount,            // ETH amount
        { value: weiAmount }  // Send ETH with transaction
      );
      
      await tx.wait();
      setTransactionStatus("Liquidity added successfully!");
      
      // Update balances after adding liquidity
      updateBalances(account, provider, tokenContract);
      setEthAmount('');
      setTokenAmount('');
      setLoadingAddLiquidity(false);
    } catch (error) {
      console.error("Error adding liquidity:", error);
      setTransactionStatus(`Error adding liquidity: ${error.message}`);
      setLoadingAddLiquidity(false);
    }
  };

  // Swap ETH for tokens
  const swapEthForTokens = async () => {
    if (!swapAmount || !signer || !uniswapContract) return;
    
    try {
      setLoadingSwap(true);
      setTransactionStatus(`Swapping ETH for ${selectedToken.symbol}...`);
      
      const weiAmount = ethers.utils.parseEther(swapAmount);
      
      // Swap
      const tx = await uniswapContract.swap(
        ZERO_ADDRESS,           // ETH address (zero address)
        selectedToken.address,  // Token address
        weiAmount,              // Amount to swap
        { value: weiAmount }    // Send ETH with transaction
      );
      
      await tx.wait();
      setTransactionStatus("Swap completed successfully!");
      
      // Update balances after swap
      updateBalances(account, provider, tokenContract);
      setSwapAmount('');
      setLoadingSwap(false);
    } catch (error) {
      console.error("Error swapping:", error);
      setTransactionStatus(`Error swapping: ${error.message}`);
      setLoadingSwap(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-4 text-center">Uniswap Clone</h1>
      
      {/* Token Selector */}
      <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg p-4 rounded-lg mb-6 border border-gray-700">
        <h2 className="text-xl font-semibold mb-3">Select Token</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button 
            onClick={() => handleTokenSelect(SAMPLE_TOKEN_ADDRESS, 'STK')}
            className={`p-2 rounded-lg text-center ${selectedToken.address === SAMPLE_TOKEN_ADDRESS ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
          >
            Sample Token (STK)
          </button>
          
          {customTokens.map((token, index) => (
            <button
              key={index}
              onClick={() => handleTokenSelect(token.address, token.symbol)}
              className={`p-2 rounded-lg text-center ${selectedToken.address === token.address ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              {token.name} ({token.symbol})
            </button>
          ))}
        </div>
      </div>
      
      {!account ? (
        <div className="text-center">
          <button 
            onClick={connectWallet}
            className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      ) : (
        <div>
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg p-4 rounded-lg mb-6 border border-gray-700">
            <p className="text-gray-400 mb-1">Connected Account</p>
            <p className="font-mono text-sm truncate">{account}</p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-gray-400 mb-1">ETH Balance</p>
                <p className="text-xl font-semibold">{parseFloat(ethBalance).toFixed(4)} ETH</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">{selectedToken.symbol} Balance</p>
                <p className="text-xl font-semibold">{parseFloat(tokenBalance).toFixed(4)} {selectedToken.symbol}</p>
              </div>
            </div>
          </div>
          
          {/* Status Messages */}
          {transactionStatus && (
            <div className="bg-gray-700 p-3 rounded-lg mb-6 text-center">
              <p>{transactionStatus}</p>
            </div>
          )}
          
          {/* Mint Tokens Button */}
          <div className="mb-6 text-center">
            <button 
              onClick={mintTokens}
              className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition-colors"
            >
              Mint Test Tokens
            </button>
            <p className="text-sm text-gray-400 mt-2">
              Get some test tokens before adding liquidity
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Swap Panel */}
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg p-6 rounded-lg border border-gray-700">
              <h2 className="text-xl font-bold mb-4">Swap</h2>
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">ETH Amount</label>
                <input 
                  type="number" 
                  value={swapAmount} 
                  onChange={(e) => setSwapAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <button 
                onClick={swapEthForTokens}
                disabled={loadingSwap || !swapAmount}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-600"
              >
                {loadingSwap ? 'Swapping...' : `Swap ETH for ${selectedToken.symbol}`}
              </button>
            </div>
            
            {/* Liquidity Panel */}
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg p-6 rounded-lg border border-gray-700">
              <h2 className="text-xl font-bold mb-4">Add Liquidity</h2>
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">ETH Amount</label>
                <input 
                  type="number" 
                  value={ethAmount} 
                  onChange={(e) => setEthAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">{selectedToken.symbol} Amount</label>
                <input 
                  type="number" 
                  value={tokenAmount} 
                  onChange={(e) => setTokenAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <button 
                onClick={addLiquidity}
                disabled={loadingAddLiquidity || !ethAmount || !tokenAmount}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-600"
              >
                {loadingAddLiquidity ? 'Adding Liquidity...' : 'Add Liquidity'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}