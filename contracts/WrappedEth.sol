// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./IWETH.sol";

import "hardhat/console.sol";


contract WrappedEth is ERC20, IWETH {
    constructor() ERC20("WrappedEth", "WETH") {}

    event Deposit(address indexed dst, uint256 wad);
    event Withdrawal(address indexed src, uint256 wad);

    function deposit() external payable {
        // balanceOf[msg.sender] += msg.value;
        super._mint(msg.sender,msg.value);
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint256 wad) external {
        require(balanceOf(msg.sender) >= wad);
        super._burn(msg.sender,wad);

        payable(msg.sender).transfer(wad);

        emit Withdrawal(msg.sender, wad);
    }
}