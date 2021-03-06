from celo_sdk.kit import Kit
import json

with open("build/Contracts/HelloWorld.json") as f:
    contract_json = json.load(f)
abi = contract_json["abi"]

kit = Kit('https://alfajores-forno.celo-testnet.org')

account_address = "0x166c4fF56CC0ea0eCbfBE5576B0596441Db0a60d"

print("Current balance:", kit.w3.eth.getBalance(account_address))
hello_world_contract = kit.w3.eth.contract(address=account_address, abi=abi)

hello_world_contract.functions.setName("Moola").call()
name = hello_world_contract.functions.getName().call()
print("name:", name)
