"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import TokenFactoryABI from '../abis/TokenFactory.json';
import CustomTokenABI from '../abis/CustomToken.json';
import dotenv from "dotenv";
dotenv.config();


const TOKEN_FACTORY_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_FACTORY_ADDRESS 

export default function TokenProfiles() {
  interface Token {
    header: string;
    chainId: string;
    description?: string;
    url: string;
  }

  // State for existing token profiles
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for custom tokens
  const [customTokens, setCustomTokens] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenSupply, setTokenSupply] = useState("1000000");
  const [creatingToken, setCreatingToken] = useState(false);
  const [account, setAccount] = useState("");
  const [message, setMessage] = useState("");

  // Load existing tokens from API and custom tokens from localStorage
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://api.dexscreener.com/token-boosts/top/v1"
        );
        const data = await response.json();
        setTokens(data.tokens || data || []);
      } catch (error) {
        console.error("Error fetching tokens:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Load custom tokens from local storage
    const savedTokens = localStorage.getItem("customTokens");
    if (savedTokens) {
      setCustomTokens(JSON.parse(savedTokens));
    }
  }, []);

  // Connect wallet
  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
      } else {
        alert("Please install MetaMask!");
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  // Create new token using the token factory
  const createToken = async () => {
    if (!tokenName || !tokenSymbol || !tokenSupply) {
      setMessage("Please fill all fields");
      return;
    }

    setCreatingToken(true);
    setMessage("Creating token...");

    try {
      if (!window.ethereum) throw new Error("No crypto wallet found");
      
      await connectWallet();
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      // Create token using the factory contract
      const tokenFactory = new ethers.Contract(TOKEN_FACTORY_ADDRESS, TokenFactoryABI, signer);
      
      const tx = await tokenFactory.createToken(
        tokenName,
        tokenSymbol,
        ethers.utils.parseEther(tokenSupply)
      );
      
      setMessage("Transaction submitted, waiting for confirmation...");
      const receipt = await tx.wait();
      
      // Get the token address from the event logs
      const event = receipt.events?.find(e => e.event === 'TokenCreated');
      const tokenAddress = event?.args?.tokenAddress;
      
      setMessage(`Token created at ${tokenAddress}`);

      // Save to local storage
      const newToken = {
        name: tokenName,
        symbol: tokenSymbol,
        address: tokenAddress,
        supply: tokenSupply,
        createdAt: new Date().toISOString(),
        creator: account
      };
      
      const updatedTokens = [...customTokens, newToken];
      setCustomTokens(updatedTokens);
      localStorage.setItem("customTokens", JSON.stringify(updatedTokens));

      // Reset form
      setTokenName("");
      setTokenSymbol("");
      setTokenSupply("1000000");
      setShowModal(false);
      
    } catch (error) {
      console.error("Error creating token:", error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setCreatingToken(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-center">
          Token Profiles
        </h1>
        <button
          onClick={() => {
            connectWallet();
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Create Token
        </button>
      </div>

      {/* Custom Tokens Section */}
      {customTokens.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Custom Tokens</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {customTokens.map((token, index) => (
              <div key={index} className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-lg shadow-lg overflow-hidden hover:scale-105 transition-transform duration-300 border border-gray-700">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-bold">{token.name}</h3>
                    <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                      {token.symbol}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-4 truncate">
                    {token.address}
                  </p>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">Supply:</span>
                    <span className="text-sm font-semibold">{Number(token.supply).toLocaleString()}</span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <a
                      href={`/uniswap-page?tokenAddress=${token.address}&tokenSymbol=${token.symbol}`}
                      className="text-sm bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded w-full text-center"
                    >
                      Trade
                    </a>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(token.address);
                        setMessage("Token address copied to clipboard");
                        setTimeout(() => setMessage(""), 2000);
                      }}
                      className="text-sm bg-gray-600 hover:bg-gray-700 text-white py-1 px-3 rounded"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DexScreener Tokens */}
      <h2 className="text-xl font-semibold mb-4">Latest Token Profiles</h2>
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : tokens.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tokens.map((token, index) => (
            <a key={index} href={token.url} target="_blank" rel="noopener noreferrer">
              <article className="relative isolate flex flex-col justify-end overflow-hidden rounded-2xl px-8 pb-8 pt-40 max-w-sm mx-auto shadow-lg hover:scale-105 transition-transform duration-300">
                <img
                  src={token.header}
                  alt="Token Header"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40"></div>
                <h3 className="z-10 text-3xl font-bold text-white">{token.chainId}</h3>
                <p className="z-10 text-sm leading-6 text-gray-300 mt-2 min-h-[3rem] line-clamp-2">
                  {token.description || "No description available."}
                </p>
              </article>
            </a>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No tokens found.</p>
      )}

       {/* Create Token Modal */}
       {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Create New Token</h2>
            
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Token Name</label>
              <input
                type="text"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                placeholder="My Token"
                className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Token Symbol</label>
              <input
                type="text"
                value={tokenSymbol}
                onChange={(e) => setTokenSymbol(e.target.value)}
                placeholder="MTK"
                className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Initial Supply</label>
              <input
                type="text"
                value={tokenSupply}
                onChange={(e) => setTokenSupply(e.target.value)}
                placeholder="1000000"
                className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            
            {message && (
              <div className="mb-4 p-3 bg-gray-700 rounded-lg text-center">
                {message}
              </div>
            )}
            
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={createToken}
                disabled={creatingToken}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:bg-gray-600"
              >
                {creatingToken ? "Creating..." : "Create Token"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}