//
// Add package imports and setup here
//

// 1. Import ContractKit
const Web3 = require("web3");
const ContractKit = require('@celo/contractkit');

// 2. Init a new kit, connected to the alfajores testnet
const web3 = new Web3('https://alfajores-forno.celo-testnet.org')
const kit = ContractKit.newKitFromWeb3(web3)
//
// Read Accounts
//

async function readAccount(){
    // 3. Get the token contract wrappers
    let goldtoken = await kit.contracts.getGoldToken()
    let stabletoken = await kit.contracts.getStableToken()
    // 4. Address to look up
    let anAddress = '0xF28dCF3dd84bdA8F6Cec646EF7a4eFdb5Da5358D'
    // 5. Get Get token balances
    let celoBalance = await goldtoken.balanceOf(anAddress)
    let cUSDBalance = await stabletoken.balanceOf(anAddress)
    // Print balances
    console.log(`${anAddress} CELO balance: ${celoBalance.toString()}`)
    console.log(`${anAddress} cUSD balance: ${cUSDBalance.toString()}`)
}

//
// Create an Account
//

// 6. Import the getAccount function
const getAccount = require('./getAccount').getAccount

async function createAccount(){
    // 7. Get your account
    let account = await getAccount()

    // 8. Get the token contract wrappers
    let goldtoken = await kit.contracts.getGoldToken()
    let stabletoken = await kit.contracts.getStableToken()

    // 9. Get your token balances
    let celoBalance = await goldtoken.balanceOf(account.address)
    let cUSDBalance = await stabletoken.balanceOf(account.address)

    // Print your account info
    console.log(`Your account address: ${account.address}`)
    console.log(`Your account CELO balance: ${celoBalance.toString()}`)
    console.log(`Your account cUSD balance: ${cUSDBalance.toString()}`)
}

//
// Send CELO
//

async function send(){
    // 10. Get your account
    // 11. Add your account to ContractKit to sign transactions
    // 12. Specify recipient Address
    // 13. Specify an amount to send
    // 14. Get the token contract wrappers       
    // 15. Transfer CELO and cUSD from your account to anAddress
    // 16. Wait for the transactions to be processed
    // 17. Print receipts
    // 18. Get your new balances
    // 19. Print new balances
}

readAccount()
createAccount()
send()
