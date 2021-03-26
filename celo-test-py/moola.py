# from web3 import Web3, HTTPProvider
from celo_sdk.kit import Kit
import asyncio
from datetime import datetime
import json
import time
with open("../celo-test-py/build/contracts/LendingPoolAddressesProvider.json") as f:
    Lending_Pool_Addresses_Provider = json.load(f) 
with open("../celo-test-py/build/contracts/LendingPool.json") as f:
    Lending_Pool = json.load(f)
# abi = contract_json["abi"]
kit = Kit('https://alfajores-forno.celo-testnet.org')
DELAY_IN_SEC = 10 
INTEREST_RATE =[ 'NONE','STABLE','VARIABLE' ]
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
            "LastUpdate": datetime.fromtimestamp(data[12]).strftime("%m/%d/%Y, %H:%M:%S")
        } 
    }
    return parsed_data

def get_lending_pool_data(lending_pool):
    coins = get_coins()
    lending_pool_data = []
    for coin in coins:
        # print(coin['name'])
        data = get_lending_pool_reserve_data(coin['reserve_address'], lending_pool)
        lending_pool_data.append({
            "CoinName": coin['name'],
            "Data": data 
        })
    return lending_pool_data

def get_blocks(from_block_number, to_block_number):
    blocks = []
    for i in range(from_block_number, to_block_number+1):
        # print("Block Number: " + str(i))
        block = eth.getBlock(hex(i))
        # print(block)
        blocks.append(block)
    return blocks

def get_logs(from_block_number, to_block_number):
    logs = eth.getLogs({'fromBlock': hex(from_block_number), 'toBlock': hex(to_block_number)})
    return logs

def get_user_account_data(lending_pool, unique_addresses):
    all_user_account_data = []
    for address in unique_addresses:
        user_account_data = lending_pool.functions.getUserAccountData(web3.toChecksumAddress(address)).call()
        parsedUserAccountData = {
            "TotalLiquidityETH": user_account_data[0],
            "TotalCollateralETH": user_account_data[1],
            "TotalBorrowsETH": user_account_data[2],
            "TotalFeesETH": user_account_data[3],
            "AvailableBorrowsETH": user_account_data[4],
            "CurrentLiquidationThreshold": user_account_data[5],
            "LoanToValuePercentage": user_account_data[6],
            "HealthFactor": user_account_data[7]
        }
        all_user_account_data.append({
            "UserAddress": address,
            "UserData": parsedUserAccountData 
        })
    return all_user_account_data

def get_user_reserve_data(lending_pool, unique_addresses):
    coins = get_coins()
    all_user_reserve_data = []
    for coin in coins:
        reserve_specific_user_reserve_data = {"Coin": coin["name"], "Data":[]}
        for address in unique_addresses:
            user_reserve_data = lending_pool.functions.getUserReserveData(coin['reserve_address'], web3.toChecksumAddress(address)).call()
            
            parsed_data = {
                "Deposited": user_reserve_data[0],
                "Borrowed": user_reserve_data[1],
                "Debt": user_reserve_data[2],
                "RateMode": INTEREST_RATE[user_reserve_data[3]],
                "BorrowRate": user_reserve_data[4],
                "LiquidityRate": user_reserve_data[5],
                "OriginationFee": user_reserve_data[6],
                "BorrowIndex": user_reserve_data[7],
                "LastUpdate": user_reserve_data[8],
                "IsCollateral": user_reserve_data[9], 
            }
           
            reserve_specific_user_reserve_data["Data"].append({
                "UserAddress": address,
                "UserReserveData": parsed_data
            })
        all_user_reserve_data.append(reserve_specific_user_reserve_data)
    return all_user_reserve_data

def log_all_data(lending_pool, from_block_number, to_block_number):
    lending_pool_data = get_lending_pool_data(lending_pool)
    # print(lending_pool_data)
    blocks = get_blocks(from_block_number, to_block_number)
    logs = get_logs(from_block_number, to_block_number)
    addresses = [log['address'] for log in logs] 
    unique_addresses = list(set(addresses)) 
    # print("Addresses: ")
    # print(addresses)
    # print("Unique Addresses: ")
    # print(unique_addresses) 
    all_user_account_data = get_user_account_data(lending_pool, unique_addresses)
    all_user_reserve_data = get_user_reserve_data(lending_pool, unique_addresses)
    # print(all_user_reserve_data)
    # reserves = lending_pool.functions.getReserves().call()
    # print(reserves)
    # print(all_user_account_data)
    all_data = {
        "UniqueAddresses": unique_addresses,
        "FromBlock": from_block_number,
        "ToBlock": to_block_number,
        # "BLocks": bLocks,
        "LendingPoolData": lending_pool_data,
        "AllUserAccountData": all_user_account_data,
        "AllUserReserveData": all_user_reserve_data
    }
    print(all_data)
    return all_data


def main():
    lending_pool_address = "0x6EAE47ccEFF3c3Ac94971704ccd25C7820121483" #https://github.com/moolamarket/moola#alfajores-deployment-and-testing-log
    address_provider = kit.w3.eth.contract(address=lending_pool_address, abi=Lending_Pool_Addresses_Provider) 
    address = address_provider.functions.getLendingPool().call()
    lending_pool = eth.contract(address= address, abi= Lending_Pool)
    latest_block_number = get_latest_block()
    print('Latest block number: ',latest_block_number)
    from_block_number, to_block_number = latest_block_number-15, latest_block_number - 10
    all_data = log_all_data(lending_pool, from_block_number, to_block_number) 
    current_block_latest = to_block_number
    while True:
        time.sleep(DELAY_IN_SEC)
        latest_block_number = get_latest_block()
        if current_block_latest != latest_block_number-10:
            from_block_number = current_block_latest + 1
            to_block_number = latest_block_number - 10
            all_data = log_all_data(lending_pool, from_block_number, to_block_number) 
            current_block_latest = to_block_number
        

if __name__=="__main__": 
    main() 