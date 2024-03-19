// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockToken is ERC20 {
    constructor(        
        address initialAccount,
        uint256 initialBalance
        ) ERC20("MockToken", "MTK") {
             _mint(initialAccount, initialBalance);
        }
}