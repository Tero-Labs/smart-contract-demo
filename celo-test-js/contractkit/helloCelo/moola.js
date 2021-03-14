const { newKit } = require('@celo/contractkit');
const kit = newKit('https://alfajores-forno.celo-testnet.org');
const LendingPoolAddressesProvider = require('../helloCelo/build/contracts/LendingPoolAddressesProvider.json');
const addressProvider = new kit.web3.eth.Contract(LendingPoolAddressesProvider, '0x6EAE47ccEFF3c3Ac94971704ccd25C7820121483');
const BigNumber = require('bignumber.js');

const LendingPool = require('../helloCelo/build/contracts/LendingPool.json');
const web3 = kit.web3;
const eth = web3.eth;

const INTEREST_RATE = {
    NONE: 0,
    STABLE: 1,
    VARIABLE: 2,
    1: 'STABLE',
    2: 'VARIABLE',
    0: 'NONE',
  };

function BN(num) {
    return new BigNumber(num);
}

const getLendingPoolReserveData = async (reserve, lendingPool) => {
    try {

        const configData = await lendingPool.methods.getReserveConfigurationData(reserve).call();

        const data = await lendingPool.methods.getReserveData(reserve).call();

        const parsedData = {
            LoanToValuePercentage: configData.ltv,
            LiquidationThreshold: configData.liquidationThreshold,
            LiquidationBonus: configData.liquidationBonus,
            InterestRateStrategyAddress: configData.interestRateStrategyAddress,
            UsageAsCollateralEnabled: configData.usageAsCollateralEnabled,
            UsageAsCollateralEnabled: configData.usageAsCollateralEnabled,
            BorrowingEnabled: configData.borrowingEnabled,
            StableBorrowRateEnabled: configData.stableBorrowRateEnabled,
            isActive: configData.isActive,
            TotalLiquidity: data.totalLiquidity,
            AvailableLiquidity: data.availableLiquidity,
            TotalBorrowsStable: data.totalBorrowsStable,
            TotalBorrowsVariable: data.totalBorrowsVariable,
            LiquidityRate: data.liquidityRate,
            VariableRate: data.variableBorrowRate,
            StableRate: data.stableBorrowRate,
            AverageStableRate: data.averageStableBorrowRate,
            UtilizationRate: data.utilizationRate,// Ut
            LiquidityIndex: data.liquidityIndex,
            VariableBorrowIndex: data.variableBorrowIndex,
            MToken: data.aTokenAddress,
            LastUpdate: (new Date(BN(data.lastUpdateTimestamp).multipliedBy(1000).toNumber())).toLocaleString(),
        };

        return parsedData;
    } catch (error) {
        console.log("Error: " + error);
    }

}

const getBLocks = async (fromBlockNumber, toBlockNumber) => {
    for (let i = fromBlockNumber; i < toBlockNumber; i++) {
        console.log("Block Number: " + i);
        let block = await web3.eth.getBlock(i)
            .catch((err) => { throw new Error(`Could not fetch block: ${err}`); });
        console.log('Block: ', block);
    }
}

const getLogs = async (fromBlockNumber, toBlockNumber) => {
    try {
        const logs = await web3.eth.getPastLogs({ fromBlock: fromBlockNumber, toBlock: toBlockNumber });
        // console.log("Logs: ");
        // console.log(logs);
        return logs;
    } catch (error) {
        console.log("Log error: " + error);
    }

}

const getCoins = async () => {
    const celoReserve = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
    const cusd = await kit.contracts.getStableToken();
    const cusdReserve = cusd.address;
    const coins = [
        { name: "Celo", reserveAddress: celoReserve },
        { name: "cUSD", reserveAddress: cusdReserve }
    ];
    return coins;
}

const getUserAccountData = async (lendingPool, addresses) => {

    for (let address of addresses) {
        console.log("Address: " + address);
        let userAccountData = await lendingPool.methods.getUserAccountData(address).call();
        let parsedUserAccountData = {
            TotalLiquidityETH: userAccountData.totalLiquidityETH,
            TotalCollateralETH: userAccountData.totalCollateralETH,
            TotalBorrowsETH: userAccountData.totalBorrowsETH,
            TotalFeesETH: userAccountData.totalFeesETH,
            AvailableBorrowsETH: userAccountData.availableBorrowsETH,
            CurrentLiquidationThreshold: userAccountData.currentLiquidationThreshold,
            LoanToValuePercentage: userAccountData.ltv,
            HealthFactor: userAccountData.healthFactor
        }
        console.table(parsedUserAccountData);
    }
}

const getUserReserveData = async (lendingPool, addresses) => {
    const coins = await getCoins();
    for (let address of addresses) {

        for (let coin of coins) {
            const data = await lendingPool.methods.getUserReserveData(coin.reserveAddress, address).call();
            const parsedData = {
                Deposited: data.currentATokenBalance,
                Borrowed: data.principalBorrowBalance,
                Debt: data.currentBorrowBalance,
                RateMode: INTEREST_RATE[data.borrowRateMode],
                BorrowRate: data.borrowRate,
                LiquidityRate: data.liquidityRate,
                OriginationFee: data.originationFee,
                BorrowIndex: data.variableBorrowIndex,
                LastUpdate: (new Date(BN(data.lastUpdateTimestamp).multipliedBy(1000).toNumber())).toLocaleString(),
                IsCollateral: data.usageAsCollateralEnabled,
            };
            console.log("Address: " + address + " Coin: " + coin.name);
            console.table(parsedData);
        }
    }

}

const getLendingPoolData = async (lendingPool) => {
    const coins = await getCoins();
    for (let coin of coins) {
        let data = await getLendingPoolReserveData(coin.reserveAddress, lendingPool);
        console.log("At " + new Date().toLocaleDateString(undefined, {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }) + ", global " + coin.name + " Lending pool data: ");
        console.table(data);
    }
}

(async () => {
    try {
        const address = await addressProvider.methods.getLendingPool().call();
        const lendingPool = new eth.Contract(LendingPool, address);
        setInterval(async () => {
            // console.log("\n\n\n\n\n\n-------------------------\n\n\n\n\n\n");
            const blocksLatest = await web3.eth.getBlock("latest")
                .catch((err) => { throw new Error(`Could not fetch latest block: ${err}`); });
            const latestBlockNumber = blocksLatest.number;
            const fromBlockNumber = latestBlockNumber - 11, toBlockNumber = latestBlockNumber - 10;
            console.log('Latest block: ', latestBlockNumber);
            await getLendingPoolData(lendingPool);
            await getBLocks(fromBlockNumber, toBlockNumber);
            let logs = await getLogs(fromBlockNumber, toBlockNumber);
            let addresses = logs.map((log) => log.address);
            let uniqueAddresses = [...new Set(addresses)]
            console.log("Addresses: ");
            console.log(addresses);
            console.log("Unique Addresses: ");
            console.log(uniqueAddresses);
            await getUserAccountData(lendingPool, uniqueAddresses);
            await getUserReserveData(lendingPool, uniqueAddresses);
        }, 5000);

    } catch (e) {
        console.error(e);
    }
})();