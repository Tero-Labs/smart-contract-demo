const { newKit } = require('@celo/contractkit');
const kit = newKit('https://alfajores-forno.celo-testnet.org');
const LendingPoolAddressesProvider = require('../helloCelo/build/contracts/LendingPoolAddressesProvider.json');
const addressProvider = new kit.web3.eth.Contract(LendingPoolAddressesProvider, '0x6EAE47ccEFF3c3Ac94971704ccd25C7820121483');
const BigNumber = require('bignumber.js');

const LendingPool = require('../helloCelo/build/contracts/LendingPool.json');
const web3 = kit.web3;
const eth = web3.eth;

function BN(num) {
    return new BigNumber(num);
}

const getLendingPoolReserveData = async (reserve) => {
    try {
        const address = await addressProvider.methods.getLendingPool().call();
        const lendingPool = new eth.Contract(LendingPool, address);

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


(async () => {
    try {
        const celoReserve = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

        const cusd = await kit.contracts.getStableToken();
        const cusdReserve = cusd.address;
        const coins = [
            { name: "Celo", reserveAddress: celoReserve },
            { name: "cUSD", reserveAddress: cusdReserve }
        ];

        setInterval(async () => {
            // console.log("\n\n\n\n\n\n-------------------------\n\n\n\n\n\n");
            const blocksLatest = await web3.eth.getBlock("latest")
            .catch((err) => { throw new Error(`Could not fetch latest block: ${err}`); });
            const latestBlockNumber = blocksLatest.number;
            console.log('Latest block: ', blocksLatest.number);
            for (let i = latestBlockNumber-11; i < latestBlockNumber-6; i++) {
                console.log("Block Number: " + i);
                let block = await web3.eth.getBlock(i)
                .catch((err) => { throw new Error(`Could not fetch block: ${err}`); });
                console.log('Block: ', block);
            }
            
            for (let coin of coins) {
                let data = await getLendingPoolReserveData(coin.reserveAddress);
                console.log("At " + new Date().toLocaleDateString(undefined, {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                }) + ", global "+ coin.name + " Lending pool data: ");
                console.table(data);
            }
        }, 5000);

    } catch (e) {
        console.error(e);
    }
})();


