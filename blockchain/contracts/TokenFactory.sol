// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Token contract that will be created by the factory
contract CustomToken is ERC20, Ownable {
    constructor(
        string memory name, 
        string memory symbol, 
        uint256 initialSupply,
        address tokenOwner
    ) 
        ERC20(name, symbol) 
        Ownable(tokenOwner) 
    {
        _mint(tokenOwner, initialSupply);
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}

// Factory contract that creates tokens
contract TokenFactory is Ownable {
    event TokenCreated(address tokenAddress, string name, string symbol, address creator);
    
    // Array to keep track of created tokens
    address[] public createdTokens;
    
    // Mapping from creator to their tokens
    mapping(address => address[]) public userTokens;
    
    constructor() Ownable(msg.sender) {}
    
    function createToken(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) external returns (address) {
        // Deploy a new token contract
        CustomToken token = new CustomToken(
            name,
            symbol,
            initialSupply,
            msg.sender // The creator becomes the owner
        );
        
        address tokenAddress = address(token);
        
        // Store the token address
        createdTokens.push(tokenAddress);
        userTokens[msg.sender].push(tokenAddress);
        
        // Emit event
        emit TokenCreated(tokenAddress, name, symbol, msg.sender);
        
        return tokenAddress;
    }
    
    function getCreatedTokens() external view returns (address[] memory) {
        return createdTokens;
    }
    
    function getUserTokens(address user) external view returns (address[] memory) {
        return userTokens[user];
    }
}