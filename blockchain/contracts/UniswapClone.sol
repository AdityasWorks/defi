// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract UniswapClone is Ownable {
    using SafeERC20 for IERC20;

    address constant ZERO_ADDRESS = address(0);

    constructor() Ownable(msg.sender) {
        // Constructor now has the proper format
    }

    struct Pool {
        uint256 reserveA;
        uint256 reserveB;
    }

    mapping(address => mapping(address => Pool)) public pools;

    event LiquidityAdded(address indexed tokenA, address indexed tokenB, uint256 amountA, uint256 amountB);
    event LiquidityRemoved(address indexed tokenA, address indexed tokenB, uint256 amountA, uint256 amountB);
    event TokensSwapped(address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 amountOut);

    // Handle receiving ETH
    receive() external payable {}

    // Add liquidity for ETH and token
    function addLiquidity(address tokenA, address tokenB, uint256 amountA, uint256 amountB) external payable {
        // For ETH, check if msg.value matches amountA or amountB
        if (tokenA == ZERO_ADDRESS) {
            require(msg.value == amountA, "Incorrect ETH amount");
            if (tokenB != ZERO_ADDRESS) {
                IERC20(tokenB).safeTransferFrom(msg.sender, address(this), amountB);
            }
        } else if (tokenB == ZERO_ADDRESS) {
            require(msg.value == amountB, "Incorrect ETH amount");
            IERC20(tokenA).safeTransferFrom(msg.sender, address(this), amountA);
        } else {
            // Both are tokens
            IERC20(tokenA).safeTransferFrom(msg.sender, address(this), amountA);
            IERC20(tokenB).safeTransferFrom(msg.sender, address(this), amountB);
        }

        pools[tokenA][tokenB].reserveA += amountA;
        pools[tokenA][tokenB].reserveB += amountB;
        // Mirror pool data
        pools[tokenB][tokenA].reserveA += amountB;
        pools[tokenB][tokenA].reserveB += amountA;

        emit LiquidityAdded(tokenA, tokenB, amountA, amountB);
    }

    function removeLiquidity(address tokenA, address tokenB, uint256 amountA, uint256 amountB) external onlyOwner {
        require(pools[tokenA][tokenB].reserveA >= amountA, "Insufficient reserve A");
        require(pools[tokenA][tokenB].reserveB >= amountB, "Insufficient reserve B");

        pools[tokenA][tokenB].reserveA -= amountA;
        pools[tokenA][tokenB].reserveB -= amountB;
        // Mirror pool data
        pools[tokenB][tokenA].reserveA -= amountB;
        pools[tokenB][tokenA].reserveB -= amountA;

        // Handle ETH transfers
        if (tokenA == ZERO_ADDRESS) {
            payable(msg.sender).transfer(amountA);
            if (tokenB != ZERO_ADDRESS) {
                IERC20(tokenB).safeTransfer(msg.sender, amountB);
            }
        } else if (tokenB == ZERO_ADDRESS) {
            IERC20(tokenA).safeTransfer(msg.sender, amountA);
            payable(msg.sender).transfer(amountB);
        } else {
            // Both are tokens
            IERC20(tokenA).safeTransfer(msg.sender, amountA);
            IERC20(tokenB).safeTransfer(msg.sender, amountB);
        }

        emit LiquidityRemoved(tokenA, tokenB, amountA, amountB);
    }

    function swap(address tokenIn, address tokenOut, uint256 amountIn) external payable {
        require(amountIn > 0, "Amount must be greater than zero");
        
        // Handle ETH as input
        if (tokenIn == ZERO_ADDRESS) {
            require(msg.value == amountIn, "Incorrect ETH amount");
        } else {
            IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);
        }

        Pool storage pool = pools[tokenIn][tokenOut];
        
        uint256 amountOut = getAmountOut(amountIn, pool.reserveA, pool.reserveB);
        require(amountOut > 0, "Insufficient output amount");
        
        // Update pools
        pool.reserveA += amountIn;
        pool.reserveB -= amountOut;
        // Mirror pool data
        pools[tokenOut][tokenIn].reserveA -= amountOut;
        pools[tokenOut][tokenIn].reserveB += amountIn;
        
        // Transfer output tokens/ETH
        if (tokenOut == ZERO_ADDRESS) {
            payable(msg.sender).transfer(amountOut);
        } else {
            IERC20(tokenOut).safeTransfer(msg.sender, amountOut);
        }
        
        emit TokensSwapped(tokenIn, tokenOut, amountIn, amountOut);
    }

    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) public pure returns (uint256) {
        require(amountIn > 0, "Amount in must be greater than zero");
        require(reserveIn > 0 && reserveOut > 0, "Insufficient liquidity");

        uint256 amountInWithFee = amountIn * 997; // 0.3% fee
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = reserveIn * 1000 + amountInWithFee;
        return numerator / denominator;
    }
}