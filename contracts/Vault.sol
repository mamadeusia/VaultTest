// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./IWETH.sol"; // An interface for a WETH contract

contract EthAndERC20Vault {

    IWETH private weth;
    mapping(address => uint256) public ethBalances; 
    mapping(address => mapping(IERC20 => uint256)) public erc20Balances;

   constructor(address _wethAddress) {
        weth = IWETH(_wethAddress);
    }

    receive() external payable {}

    // ETH Deposit
    function depositETH() external payable {
        ethBalances[msg.sender] += msg.value;
    }

    // ETH Withdrawal
    function withdrawETH(uint256 amount) external {
        require(ethBalances[msg.sender] >= amount, "Insufficient ETH balance");
        ethBalances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }

    // ERC20 Deposit
    function depositERC20(IERC20 token, uint256 amount) external {
        require(token.transferFrom(msg.sender, address(this), amount));
        erc20Balances[msg.sender][token] += amount;
    }

    // ERC20 Withdrawal
    function withdrawERC20(IERC20 token, uint256 amount) external {
        require(erc20Balances[msg.sender][token] >= amount, "Insufficient token balance");
        erc20Balances[msg.sender][token] -= amount;
        token.transfer(msg.sender, amount);
    }

    // ETH -> WETH Wrapping
    function wrapETH() external {
        uint256 ethAmount = ethBalances[msg.sender];
        require(ethAmount > 0, "No ETH to wrap");

        ethBalances[msg.sender] = 0; 
        weth.deposit{value: ethAmount}(); 
        erc20Balances[msg.sender][weth] += ethAmount;
    }

    // WETH -> ETH Unwrapping
    function unwrapWETH(uint256 amount) external {
        require(erc20Balances[msg.sender][weth] >= amount, "Insufficient WETH balance");

        erc20Balances[msg.sender][weth] -= amount;
        weth.withdraw(amount); 
        ethBalances[msg.sender] += amount;
    }
}