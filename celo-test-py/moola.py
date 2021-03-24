# from web3 import Web3, HTTPProvider
from celo_sdk.kit import Kit
import asyncio
import json

with open("../celo-test-py/build/contracts/LendingPoolAddressesProvider.json") as f:
    Lending_Pool_Addresses_Provider = json.load(f) 
with open("../celo-test-py/build/contracts/LendingPool.json") as f:
    Lending_Pool = json.load(f)
 
# abi = contract_json["abi"]

kit = Kit('https://alfajores-forno.celo-testnet.org')

account_address = "0x6EAE47ccEFF3c3Ac94971704ccd25C7820121483"
address_provider =  kit.w3.eth.contract(address=account_address, abi=Lending_Pool_Addresses_Provider)

INTEREST_RATE = {
    1: 'STABLE',
    2: 'VARIABLE',
    0: 'NONE'}

web3 = kit.w3
eth = web3.eth

def get_latest_block(): 
    web3.middleware_onion.clear()
    blocksLatest = web3.eth.getBlock("latest")
    return int(blocksLatest["number"], 16)
# addressProvider = kit.w3.eth.contract(address=account_address, abi=LendingPoolAddressesProvider)
# lending_pool_contract.functions.getReserveConfigurationData('0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE').call()
async def get_lending_pool_reservedata(reserve, lending_pool):
    config_data = await lending_pool.methods
address = address_provider.functions.getLendingPool().call()
print(address)
lending_pool = eth.contract(address= address, abi= Lending_Pool)
latestBlockNumber = get_latest_block()
print(latestBlockNumber)
