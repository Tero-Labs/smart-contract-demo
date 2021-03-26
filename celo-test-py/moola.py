# from web3 import Web3, HTTPProvider
from celo_sdk.kit import Kit
import asyncio
from datetime import datetime
import json
with open("../celo-test-py/build/contracts/LendingPoolAddressesProvider.json") as f:
    Lending_Pool_Addresses_Provider = json.load(f) 
with open("../celo-test-py/build/contracts/LendingPool.json") as f:
    Lending_Pool = json.load(f)
# abi = contract_json["abi"]
kit = Kit('https://alfajores-forno.celo-testnet.org')

INTEREST_RATE = {
    1: 'STABLE',
    2: 'VARIABLE',
    0: 'NONE'
}
web3 = kit.w3
eth = web3.eth



def get_latest_block(): 
    web3.middleware_onion.clear()
    blocksLatest = web3.eth.getBlock("latest")
    return int(blocksLatest["number"], 16)

def get_coins():
    celo_reserve_address = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
    cusd_reserve_address = '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1'
    coins = [{
        'name':"Celo", "reserve_address": celo_reserve_address
    }, {
        'name':"cUSD", "reserve_address": cusd_reserve_address  
    }]
    return coins

def get_lending_pool_reserve_data(reserve_address, lending_pool):
    config_data = lending_pool.functions.getReserveConfigurationData(reserve_address).call()
    data = lending_pool.functions.getReserveData(reserve_address).call()
    parsed_data = {
        "reserveConfigParameter":{
            "LoanToValuePercentage": config_data[0],
            "LiquidationThreshold": config_data[1],
            "LiquidationBonus": config_data[2],
            "InterestRateStrategyAddress": config_data[3],
            "UsageAsCollateralEnabled": config_data[4],
            "BorrowingEnabled": config_data[5],
            "StableBorrowRateEnabled": config_data[6],
            "isActive": config_data[7]
        }, 
        "reservePoolGlobalInfo":{
            "TotalLiquidity": data[0],
            "AvailableLiquidity": data[1],
            "TotalBorrowsStable": data[2],
            "TotalBorrowsVariable": data[3],
            "LiquidityRate": data[4],
            "VariableRate": data[5],
            "StableRate": data[6],
            "AverageStableRate": data[7],
            "UtilizationRate": data[8],# Ut
            "LiquidityIndex": data[9],
            "VariableBorrowIndex": data[10],
            "MToken": data[11],
            "LastUpdate": data[12]
        } 
    }
    return parsed_data

def get_lending_pool_data(lending_pool):
    coins = get_coins()
    lending_pool_data = []
    for coin in coins:
        print(coin['name'])
        data = get_lending_pool_reserve_data(coin['reserve_address'], lending_pool)
        lending_pool_data.append({
            "CoinName": coin['name'],
            "Data": data 
        })
    return lending_pool_data
        
def log_all_data(lending_pool, from_block_number, to_block_number):
    lending_pool_data = get_lending_pool_data(lending_pool)
    print(lending_pool_data)
# addressProvider = kit.w3.eth.contract(address=account_address, abi=LendingPoolAddressesProvider)
# lending_pool_contract.functions.getReserveConfigurationData('0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE').call()


def main():
    lending_pool_address = "0x6EAE47ccEFF3c3Ac94971704ccd25C7820121483" #https://github.com/moolamarket/moola#alfajores-deployment-and-testing-log
    address_provider = kit.w3.eth.contract(address=lending_pool_address, abi=Lending_Pool_Addresses_Provider) 
    address = address_provider.functions.getLendingPool().call()
    lending_pool = eth.contract(address= address, abi= Lending_Pool)
    latest_block_number = get_latest_block()
    print('Latest block number: ',latest_block_number)
    from_block_number, to_block_number = latest_block_number-15, latest_block_number - 10
    log_all_data(lending_pool, from_block_number, to_block_number) 
  
  
if __name__=="__main__": 
    main() 