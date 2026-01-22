// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title TokenSwap
 * @dev Simple token swap contract for Student Konnect
 */
contract TokenSwap is Ownable, ReentrancyGuard {
    // Exchange rate: 1 token A = rate token B (scaled by 1e18)
    mapping(address => mapping(address => uint256)) public exchangeRates;
    
    // Fee percentage (scaled by 100, e.g., 30 = 0.3%)
    uint256 public swapFeePercent = 30; // 0.3%
    
    // Fee collector address
    address public feeCollector;
    
    event Swap(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        uint256 fee
    );
    
    event ExchangeRateUpdated(
        address indexed tokenA,
        address indexed tokenB,
        uint256 rate
    );
    
    event FeeUpdated(uint256 newFee);
    
    constructor(address _feeCollector) Ownable(msg.sender) {
        feeCollector = _feeCollector;
    }
    
    /**
     * @dev Set exchange rate between two tokens
     * @param tokenA Address of token A
     * @param tokenB Address of token B
     * @param rate Exchange rate (scaled by 1e18)
     */
    function setExchangeRate(
        address tokenA,
        address tokenB,
        uint256 rate
    ) external onlyOwner {
        require(tokenA != address(0) && tokenB != address(0), "Invalid token address");
        require(rate > 0, "Rate must be greater than 0");
        
        exchangeRates[tokenA][tokenB] = rate;
        
        emit ExchangeRateUpdated(tokenA, tokenB, rate);
    }
    
    /**
     * @dev Update swap fee percentage
     * @param newFee New fee percentage (scaled by 100)
     */
    function setSwapFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee too high"); // Max 10%
        swapFeePercent = newFee;
        
        emit FeeUpdated(newFee);
    }
    
    /**
     * @dev Update fee collector address
     * @param newCollector New fee collector address
     */
    function setFeeCollector(address newCollector) external onlyOwner {
        require(newCollector != address(0), "Invalid address");
        feeCollector = newCollector;
    }
    
    /**
     * @dev Swap tokens
     * @param tokenIn Address of input token
     * @param tokenOut Address of output token
     * @param amountIn Amount of input token
     * @param minAmountOut Minimum amount of output token (slippage protection)
     */
    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut
    ) external nonReentrant returns (uint256 amountOut) {
        require(tokenIn != tokenOut, "Cannot swap same token");
        require(amountIn > 0, "Amount must be greater than 0");
        
        uint256 rate = exchangeRates[tokenIn][tokenOut];
        require(rate > 0, "Exchange rate not set");
        
        // Calculate output amount
        amountOut = (amountIn * rate) / 1e18;
        
        // Calculate and deduct fee
        uint256 fee = (amountOut * swapFeePercent) / 10000;
        amountOut = amountOut - fee;
        
        require(amountOut >= minAmountOut, "Slippage too high");
        
        // Transfer tokens
        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        IERC20(tokenOut).transfer(msg.sender, amountOut);
        
        // Transfer fee
        if (fee > 0) {
            IERC20(tokenOut).transfer(feeCollector, fee);
        }
        
        emit Swap(msg.sender, tokenIn, tokenOut, amountIn, amountOut, fee);
        
        return amountOut;
    }
    
    /**
     * @dev Get expected output amount for a swap
     * @param tokenIn Address of input token
     * @param tokenOut Address of output token
     * @param amountIn Amount of input token
     */
    function getAmountOut(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) external view returns (uint256 amountOut, uint256 fee) {
        uint256 rate = exchangeRates[tokenIn][tokenOut];
        require(rate > 0, "Exchange rate not set");
        
        amountOut = (amountIn * rate) / 1e18;
        fee = (amountOut * swapFeePercent) / 10000;
        amountOut = amountOut - fee;
        
        return (amountOut, fee);
    }
    
    /**
     * @dev Withdraw tokens (emergency only)
     * @param token Address of token to withdraw
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(
        address token,
        uint256 amount
    ) external onlyOwner {
        IERC20(token).transfer(owner(), amount);
    }
}
