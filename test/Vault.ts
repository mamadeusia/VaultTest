import {
    time,
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";


describe("Vault Contract", function() {

    const ONE_GWEI = 1_000_000_000;

    async function deployVaultContract() {
        const weth = await hre.ethers.deployContract("WrappedEth")
        
        const vault = await hre.ethers.deployContract("EthAndERC20Vault",[weth])
        const [owner, otherAccount] = await hre.ethers.getSigners();

        const erc20Mock = await hre.ethers.deployContract("MockToken",[otherAccount, 10000])

        return { vault, weth, erc20Mock, owner, otherAccount }
    }

    describe("Eth Functionality", function() {

      it("Should receive ethereum by depositETH method", async function () {
        const { vault, otherAccount } = await loadFixture(deployVaultContract);
        
        await vault.connect(otherAccount).depositETH({value: ONE_GWEI});
        
        expect(await vault.ethBalances(otherAccount.address)).to.be.equal(ONE_GWEI);
      });

      it("Should return error if insufficient value has been sent to sc", async function () {
        const { vault, owner,otherAccount } = await loadFixture(deployVaultContract);

        await otherAccount.sendTransaction({
          to: vault, 
          value: ONE_GWEI,
        });
        
        await expect(vault.connect(otherAccount).withdrawETH(2*ONE_GWEI)).be.revertedWith(
          "Insufficient ETH balance"
        );
      });

      it("Should withdraw money if money has been sent before", async function() {
        const { vault, owner,otherAccount } = await loadFixture(deployVaultContract);

        await vault.connect(otherAccount).depositETH({value: ONE_GWEI});

        const balanceBeforeTx = await hre.ethers.provider.getBalance(otherAccount)
        
        // vault.withdrawETH
        const tx = await vault.connect(otherAccount).withdrawETH(1*ONE_GWEI);
        const receipt = await tx.wait();
        if (receipt === null) {
          expect.fail;
        } else {
          const gasUsed = Number(receipt.gasPrice.toString())*Number(receipt.cumulativeGasUsed.toString()) ;

          expect(await hre.ethers.provider.getBalance(otherAccount)).to.be.equal(balanceBeforeTx + BigInt(ONE_GWEI) - BigInt(gasUsed));
        }

      });

      it("Should wrap/unwrapETH", async function() {
        const { vault, weth, owner,otherAccount } = await loadFixture(deployVaultContract);
       
        await vault.connect(otherAccount).depositETH({value: ONE_GWEI});

        await vault.connect(otherAccount).wrapETH();
                
        // balance of vault smart contract should be increased
        expect(await weth.balanceOf(vault)).to.be.equal(ONE_GWEI);

        await vault.connect(otherAccount).unwrapWETH(ONE_GWEI);
        expect(await weth.balanceOf(vault)).to.be.equal(0);

        expect(await vault.ethBalances(otherAccount)).to.be.equal(ONE_GWEI);
      }); 
      
    }); 

    describe("Token Functionality", function() {
      it("Should deposite/withdraw ERC20 token after they approved and gave allowance",async function() {
        const { vault, erc20Mock,owner,otherAccount } = await loadFixture(deployVaultContract);
          // should approve before depositETH 
          const TOKEN_ALLOWANCE = 100;
          const OtherAccountInitialTokenBalance = await erc20Mock.balanceOf(otherAccount);
          await erc20Mock.connect(otherAccount).approve(vault,TOKEN_ALLOWANCE);
          
          expect(await erc20Mock.allowance(otherAccount,vault)).to.be.equal(TOKEN_ALLOWANCE);
          
          await vault.connect(otherAccount).depositERC20(erc20Mock,TOKEN_ALLOWANCE);

          expect(await erc20Mock.balanceOf(otherAccount)).to.be.equal(OtherAccountInitialTokenBalance - BigInt(TOKEN_ALLOWANCE));

          await vault.connect(otherAccount).withdrawERC20(erc20Mock,TOKEN_ALLOWANCE);

          expect(await erc20Mock.balanceOf(otherAccount)).to.be.equal(OtherAccountInitialTokenBalance );

      });

      it("Should error deposite ERC20 without approval",async function() {
        const { vault, erc20Mock,owner,otherAccount } = await loadFixture(deployVaultContract);
          // should approve before depositETH 
          const TOKEN_ALLOWANCE = 100; 

          await expect( vault.connect(otherAccount).depositERC20(erc20Mock,TOKEN_ALLOWANCE)).be.reverted
      });

    }); 



});