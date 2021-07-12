# Smart Contract Demo

This repository contains smart contract demo to interact with celo-blockchain.

The [Python Demo](https://github.com/Tero-Labs/smart-contract-demo/tree/master/celo-test-py) uses the [Python ContractKit](https://github.com/blaize-tech/celo-sdk-py) developed by [Blaize Tech](https://github.com/blaize-tech). 

Some lending pool configuration parameters have been tweaked in the [JS Demo](https://github.com/Tero-Labs/smart-contract-demo/tree/master/celo-test-js) to fetch user account data.

## Getting Started: Python Demo

To install:

```bash
pip install .
```

You need in Python version 3.8 or higher.

To start working with python contractkit you need a `Kit` instance:

```python
from celo_sdk.kit import Kit

kit = Kit('https://alfajores-forno.celo-testnet.org')
```

To access web3:

```python
kit.w3.eth.getBalance(some_address)
```

## Setting Default Tx Options

`Kit` allows you to set default transaction options:

```python
from celo_sdk.kit import Kit

kit = Kit('https://alfajores-forno.celo-testnet.org')
currency_address = kit.base_wrapper.registry.load_contract_by_name('StableToken')['address']
kit.wallet_fee_currency = currency_address
```

## Interacting with CELO & cUSD

celo-blockchain has two initial coins: CELO and cUSD (stableToken).
Both implement the ERC20 standard, and to interact with them is as simple as:

```python
gold_token = kit.base_wrapper.create_and_get_contract_by_name('GoldToken')
balance = gold_token.balance_of(address)
```

To send funds:

```python
one_gold = kit.w3.toWei(1, 'ether')
tx_hash = gold_token.transfer(address, one_gold)
```

To interact with cUSD, is the same but with a different contract:

```python
stable_token = kit.base_wrapper.create_and_get_contract_by_name('StableToken')
```

If you would like to pay fees in cUSD, set the gas price manually:

```python
stable_token = kit.base_wrapper.create_and_get_contract_by_name('StableToken')
gas_price_contract = kit.base_wrapper.create_and_get_contract_by_name('GasPriceMinimum')
gas_price_minimum = gas_price_contract.get_gas_price_minimum(stable_token.address)
gas_price = int(gas_price_minimum * 1.3) # Wiggle room if gas price minimum changes before tx is sent
kit.wallet_fee_currency = stable_token.address # Default to paying fees in cUSD
kit.wallet_gas_price = gas_price

tx = stable_token.transfer(recipient, wei_transfer_amount)
```