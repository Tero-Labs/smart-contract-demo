from web3 import Web3, HTTPProvider
from celo_sdk.kit import Kit
import json

with open("../celo-test-py/build/contracts/LendingPoolAddressesProvider.json") as f:
    LendingPoolAddressesProvider = json.load(f) 
with open("../celo-test-py/build/contracts/LendingPool.json") as f:
    LendingPool = json.load(f)
   
# abi = contract_json["abi"]

kit = Kit('https://alfajores-forno.celo-testnet.org')

account_address = "0x6EAE47ccEFF3c3Ac94971704ccd25C7820121483"

addressProvider = kit.w3.eth.contract(address=account_address, abi=LendingPoolAddressesProvider)
lending_pool_contract.functions.getReserveConfigurationData('0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE').call()