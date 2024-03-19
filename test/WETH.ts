import { expect } from "chai";
import { ethers } from "hardhat";
import { WrappedEth } from "../typechain-types"; // Make sure the typechain types are generated

describe("WrappedEth", function () {
  let wrappedEthContract: WrappedEth;

  beforeEach(async function () {
    const WrappedEthFactory = await ethers.getContractFactory("WrappedEth");
    wrappedEthContract = await WrappedEthFactory.deploy();
    // await wrappedEthContract.deployed();
  });

  it("Should allow ETH deposits and update balances", async function () {
    const [owner] = await ethers.getSigners();
    const depositAmount = ethers.parseEther("1.0"); // 1 ETH

    await wrappedEthContract.connect(owner).deposit({ value: depositAmount });

    expect(await wrappedEthContract.balanceOf(owner.address)).to.equal(depositAmount);
  });

  it("Should allow ETH withdrawals and update balances", async function () {
    const [owner] = await ethers.getSigners();
    const depositAmount = ethers.parseEther("2.0");
    const withdrawalAmount = ethers.parseEther("1.0");
    depositAmount.valueOf()
    await wrappedEthContract.connect(owner).deposit({ value: depositAmount });
    await wrappedEthContract.connect(owner).withdraw(withdrawalAmount);

    expect(await wrappedEthContract.balanceOf(owner.address)).to.equal(depositAmount - withdrawalAmount);
  });

  it("Should emit Deposit and Withdrawal events", async function () {
    const [owner] = await ethers.getSigners();
    const depositAmount = ethers.parseEther("1.0");

    const depositTx = await wrappedEthContract.connect(owner).deposit({ value: depositAmount });
    await expect(depositTx)
      .to.emit(wrappedEthContract, "Deposit")
      .withArgs(owner.address, depositAmount);

    const withdrawalTx = await wrappedEthContract.connect(owner).withdraw(depositAmount);
    await expect(withdrawalTx)
      .to.emit(wrappedEthContract, "Withdrawal")
      .withArgs(owner.address, depositAmount);
  });

  it("Should prevent withdrawals exceeding balance", async function () {
    const [owner] = await ethers.getSigners();
    const withdrawalAmount = ethers.parseEther("1.0"); // No balance yet

    await expect(wrappedEthContract.connect(owner).withdraw(withdrawalAmount))
      .to.be.revertedWithoutReason() // Or a custom error
  });
});
