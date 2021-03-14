const { newKit } = require('@celo/contractkit');
kit = newKit('https://alfajores-forno.celo-testnet.org');
const LendingPoolAddressesProvider = require('../helloCelo/contracts/LendingPoolAddressesProvider.json');
const addressProvider = new kit.web3.eth.Contract(LendingPoolAddressesProvider, '0x6EAE47ccEFF3c3Ac94971704ccd25C7820121483');
const BigNumber = require('bignumber.js');

const LendingPool = require('../helloCelo/contracts/LendingPool.json');
const web3 = kit.web3;
const eth = web3.eth;

function BN(num) {
    return new BigNumber(num);
  }

const getLendingPoolReserveData = async () =>{
    const address = await addressProvider.methods.getLendingPool().call();
    const lendingPool = new eth.Contract(LendingPool, address);
  
    const celoReserve = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
    
    const configData = await lendingPool.methods.getReserveConfigurationData(celoReserve).call();
    
    const data = await lendingPool.methods.getReserveData(celoReserve).call();
    
    const parsedData = {
          LoanToValuePercentage: configData.ltv,
          LiquidationThreshold: configData.liquidationThreshold,
          LiquidationBonus: configData.liquidationBonus,
          InterestRateStrategyAddress: configData.interestRateStrategyAddress,
          UsageAsCollateralEnabled: configData.usageAsCollateralEnabled,
          UsageAsCollateralEnabled: configData.usageAsCollateralEnabled,
          BorrowingEnabled: configData.borrowingEnabled,
          StableBorrowRateEnabled: configData.stableBorrowRateEnabled,
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
}

(async () => {
    try {
        setInterval(async () => {
            let data = await getLendingPoolReserveData();
            console.log("At " + new Date().toLocaleDateString(undefined, {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }) + ", global Celo Lending pool data: ");
            console.table(data);
        }, 5000);
        
    } catch (e) {
        console.error(e);
    }
})();


