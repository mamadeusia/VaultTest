# Sample Vault SC

Simple smart contract with following functionality:
Users may deposit and later withdraw ETH. They may not withdraw more than they have individually deposited (no negative balances).


Users may deposit and withdraw ERC20 tokens of their choosing. Again, they may not withdraw more than they have deposited of a given token.



After depositing ETH, users may wrap their ETH into WETH within the vault (i.e. without first withdrawing). Similarly, users may unwrap their WETH into ETH within the vault.


```shell
npx hardhat test
```
