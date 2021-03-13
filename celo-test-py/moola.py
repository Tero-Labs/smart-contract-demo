from web3 import Web3, HTTPProvider
from celo_sdk.kit import Kit
import json

with open("../celo-test-py/build/contracts/LendingPool.json") as f:
    contract_json = json.load(f)
# abi = contract_json["abi"]

kit = Kit('https://alfajores-forno.celo-testnet.org')

account_address = "0x6EAE47ccEFF3c3Ac94971704ccd25C7820121483"

lending_pool_contract = kit.w3.eth.contract(address=account_address, abi=contract_json)
lending_pool_contract.functions.getReserveConfigurationData('0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE').call()