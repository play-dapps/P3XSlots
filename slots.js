window.addEventListener('load', async () => {
    // Modern dapp browsers...
    if (window.ethereum) {
        window.web3 = new Web3(ethereum);
		web3.reset();
        try {
            // Request account access if needed
            await ethereum.enable();
			
			
			let netId = await promisify(cb => web3.version.getNetwork(cb));
			switch (netId) {
			case "3":
				setup('0x035dAa384DD70A538320201Aa9439E6B72010772', '0xCD45A142d109BBC8b22Ff6028614027D1dB4E32F', '0xD60d353610D9a5Ca478769D371b53CEfAA7B6E4c');
				break;
			default:
				alert('P3XSlots is only on Ropsten for now');
				//setup('0x59891b95010267F7A3666dcB3221059a73E11AD1', '0x058a144951e062FC14f310057D2Fd9ef0Cf5095b', '0xD60d353610D9a5Ca478769D371b53CEfAA7B6E4c');
			}
			checkOldResult();
			
			var filter = web3.eth.filter('latest');
			filter.watch(function(error, result){
			  checkResult();
			});
			
			} catch (error) {
					console.log(error);
					alert('Reload this page and enable access to use this dapp!');
			}
    }
    // Non-dapp browsers...
    else {
        alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
});

let el = function(id){ return document.querySelector(id);};
let address;
let instance;
let slotsContract;
let slotsInstance;
let p3xInstance;
let playerBookInstance;

let txHash;

function start() {
	
	p3xInstance.transfer(address, web3.toWei(1, 'ether'), '0x00000000000000000000000048b4c15416ee807c55ce61eb948060e8f55ef87d000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000', function(error, result){
		if(!error) {
			startSpin();
			txHash = result;
		}
	})
}

async function isMined() {
	const txInfo = await promisify(cb => web3.eth.getTransaction(txHash, cb));
	if (txInfo != null && txInfo.blockNumber != null) {
		return true;
	} 
	return false;
}

async function checkOldResult() {
	startSpin();
	checkResult();
}

async function checkResult() {
	const activeSpin = await promisify(cb => slotsInstance.hasActiveSpin(cb));
	if(!activeSpin) {
		return;
	}
	
	if(txHash != null ) {
		const mined = await isMined(txHash);
		if(!mined) {
			return;
		}
	}
	
	const spin = await promisify(cb => slotsInstance.mySpin(cb));
	if(spin[0].c[0] != 42) {
		result1 = spin[0].c[0];
		mCasino1.stop();
	}
	
	if(spin[1].c[0] != 42) {
		result2 = spin[1].c[0];
		mCasino2.stop();
	}
	if(spin[2].c[0] != 42) {
		result3 = spin[2].c[0];
		mCasino3.stop();
	}
}

async function addressToName(address) {
	const pid = await promisify(cb => playerBookInstance.pIDxAddr_(address, cb));
	if(pid != 0) {
		const name = await promisify(cb =>  playerBookInstance.getPlayerName(pid, cb));
		if(name != 0) {
			return web3.toAscii(name);
		}
	}
	return address;
}

const promisify = (inner) =>
  new Promise((resolve, reject) =>
    inner((err, res) => {
      if (err) { reject(err) }

      resolve(res);
    })
  );

function setup(p3xHubAddress, p3xAddress, playerBookAddress) {
	address = p3xHubAddress;
	contract = web3.eth.contract([ { "constant": false, "inputs": [ { "name": "playerAddress", "type": "address" }, { "name": "value", "type": "uint256" } ], "name": "subPlayerBalance", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "withdrawBalance", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "numberOfPlayers", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "playerAddress", "type": "address" }, { "name": "value", "type": "uint256" }, { "name": "devFee", "type": "bool" } ], "name": "addPlayerBalance", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "address" } ], "name": "games", "outputs": [ { "name": "registered", "type": "bool" }, { "name": "amountGiven", "type": "uint256" }, { "name": "amountTaken", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "gameAddress", "type": "address" } ], "name": "removeGame", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "player", "type": "address" }, { "name": "value", "type": "uint256" }, { "name": "data", "type": "bytes" } ], "name": "tokenFallback", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "gameAddress", "type": "address" }, { "name": "devAdresses", "type": "address[]" }, { "name": "devFees", "type": "uint256[]" } ], "name": "addGame", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "address" } ], "name": "players", "outputs": [ { "name": "active", "type": "bool" }, { "name": "balance", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "numberOfGames", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" } ]);
	instance = contract.at(address);
	
	slotsContract = web3.eth.contract([ { "constant": true, "inputs": [], "name": "numberOfSpins", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "hasActiveSpin", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "value", "type": "uint256" } ], "name": "playWithBalance", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "address" } ], "name": "spins", "outputs": [ { "name": "value", "type": "uint256" }, { "name": "startBlock", "type": "uint256" }, { "name": "multiplier", "type": "uint256" }, { "name": "open", "type": "bool" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "playerAddress", "type": "address" }, { "name": "value", "type": "uint256" }, { "name": "gameData", "type": "bytes" } ], "name": "play", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "resolveSpin", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "mySpin", "outputs": [ { "name": "reel1", "type": "uint256" }, { "name": "reel2", "type": "uint256" }, { "name": "reel3", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "inputs": [ { "name": "gameHubAddress", "type": "address" } ], "payable": false, "stateMutability": "nonpayable", "type": "constructor" } ]);
	slotsInstance = slotsContract.at('0x48B4c15416EE807c55cE61eb948060e8F55Ef87d');
	
	p3xContract = web3.eth.contract([ { "constant":true, "inputs":[ { "name":"customerAddress", "type":"address" } ], "name":"dividendsOf", "outputs":[ { "name":"", "type":"uint256" } ], "payable":false, "stateMutability":"view", "type":"function" }, { "constant":false, "inputs":[ { "name":"amount", "type":"uint256" }, { "name":"withdrawAfter", "type":"bool" } ], "name":"sell", "outputs":[ { "name":"", "type":"uint256" } ], "payable":false, "stateMutability":"nonpayable", "type":"function" }, { "constant":true, "inputs":[ ], "name":"name", "outputs":[ { "name":"", "type":"string" } ], "payable":false, "stateMutability":"view", "type":"function" }, { "constant":false, "inputs":[ { "name":"spender", "type":"address" }, { "name":"value", "type":"uint256" } ], "name":"approve", "outputs":[ { "name":"", "type":"bool" } ], "payable":false, "stateMutability":"nonpayable", "type":"function" }, { "constant":true, "inputs":[ { "name":"accountHolder", "type":"address" } ], "name":"gauntletTypeOf", "outputs":[ { "name":"stakeAmount", "type":"uint256" }, { "name":"gType", "type":"uint256" }, { "name":"end", "type":"uint256" } ], "payable":false, "stateMutability":"view", "type":"function" }, { "constant":true, "inputs":[ { "name":"ethereumToSpend", "type":"uint256" } ], "name":"calculateTokensReceived", "outputs":[ { "name":"", "type":"uint256" } ], "payable":false, "stateMutability":"view", "type":"function" }, { "constant":true, "inputs":[ ], "name":"totalSupply", "outputs":[ { "name":"", "type":"uint256" } ], "payable":false, "stateMutability":"view", "type":"function" }, { "constant":false, "inputs":[ { "name":"ethToReinvest", "type":"uint256" } ], "name":"reinvestPartial", "outputs":[ { "name":"", "type":"uint256" } ], "payable":false, "stateMutability":"nonpayable", "type":"function" }, { "constant":true, "inputs":[ { "name":"tokensToSell", "type":"uint256" } ], "name":"calculateEthereumReceived", "outputs":[ { "name":"", "type":"uint256" } ], "payable":false, "stateMutability":"view", "type":"function" }, { "constant":false, "inputs":[ { "name":"from", "type":"address" }, { "name":"to", "type":"address" }, { "name":"value", "type":"uint256" } ], "name":"transferFrom", "outputs":[ { "name":"success", "type":"bool" } ], "payable":false, "stateMutability":"nonpayable", "type":"function" }, { "constant":false, "inputs":[ { "name":"to", "type":"address" }, { "name":"ignore", "type":"bool" } ], "name":"ignoreTokenFallback", "outputs":[ ], "payable":false, "stateMutability":"nonpayable", "type":"function" }, { "constant":true, "inputs":[ ], "name":"decimals", "outputs":[ { "name":"", "type":"uint8" } ], "payable":false, "stateMutability":"view", "type":"function" }, { "constant":true, "inputs":[ ], "name":"myDividends", "outputs":[ { "name":"", "type":"uint256" } ], "payable":false, "stateMutability":"view", "type":"function" }, { "constant":false, "inputs":[ { "name":"amount", "type":"uint256" }, { "name":"extGauntlet", "type":"address" } ], "name":"acquireExternalGauntlet", "outputs":[ ], "payable":false, "stateMutability":"nonpayable", "type":"function" }, { "constant":false, "inputs":[ ], "name":"withdraw", "outputs":[ ], "payable":false, "stateMutability":"nonpayable", "type":"function" }, { "constant":true, "inputs":[ ], "name":"myGauntletType", "outputs":[ { "name":"stakeAmount", "type":"uint256" }, { "name":"gType", "type":"uint256" }, { "name":"end", "type":"uint256" } ], "payable":false, "stateMutability":"view", "type":"function" }, { "constant":false, "inputs":[ { "name":"referrerName", "type":"string" } ], "name":"buy", "outputs":[ { "name":"", "type":"uint256" } ], "payable":true, "stateMutability":"payable", "type":"function" }, { "constant":false, "inputs":[ ], "name":"allowIgnoreTokenFallback", "outputs":[ ], "payable":false, "stateMutability":"nonpayable", "type":"function" }, { "constant":true, "inputs":[ ], "name":"stakingRequirement", "outputs":[ { "name":"", "type":"uint256" } ], "payable":false, "stateMutability":"view", "type":"function" }, { "constant":true, "inputs":[ { "name":"includeReferralBonus", "type":"bool" } ], "name":"myDividends", "outputs":[ { "name":"", "type":"uint256" } ], "payable":false, "stateMutability":"view", "type":"function" }, { "constant":false, "inputs":[ { "name":"r", "type":"uint256" } ], "name":"setReferralRequirement", "outputs":[ ], "payable":false, "stateMutability":"nonpayable", "type":"function" }, { "constant":true, "inputs":[ ], "name":"lastTotalBalance", "outputs":[ { "name":"", "type":"uint256" } ], "payable":false, "stateMutability":"view", "type":"function" }, { "constant":true, "inputs":[ { "name":"accountHolder", "type":"address" } ], "name":"balanceOf", "outputs":[ { "name":"balance", "type":"uint256" } ], "payable":false, "stateMutability":"view", "type":"function" }, { "constant":true, "inputs":[ { "name":"customerAddress", "type":"address" }, { "name":"includeReferralBonus", "type":"bool" } ], "name":"dividendsOf", "outputs":[ { "name":"", "type":"uint256" } ], "payable":false, "stateMutability":"view", "type":"function" }, { "constant":true, "inputs":[ { "name":"customerAddress", "type":"address" } ], "name":"refBonusOf", "outputs":[ { "name":"", "type":"uint256" } ], "payable":false, "stateMutability":"view", "type":"function" }, { "constant":true, "inputs":[ ], "name":"refHandlerAddress", "outputs":[ { "name":"", "type":"address" } ], "payable":false, "stateMutability":"view", "type":"function" }, { "constant":true, "inputs":[ ], "name":"symbol", "outputs":[ { "name":"", "type":"string" } ], "payable":false, "stateMutability":"view", "type":"function" }, { "constant":false, "inputs":[ { "name":"amount", "type":"uint256" }, { "name":"gType", "type":"uint8" }, { "name":"end", "type":"uint256" } ], "name":"acquireGauntlet", "outputs":[ ], "payable":false, "stateMutability":"nonpayable", "type":"function" }, { "constant":false, "inputs":[ ], "name":"donateDividends", "outputs":[ ], "payable":true, "stateMutability":"payable", "type":"function" }, { "constant":false, "inputs":[ { "name":"ref", "type":"address" } ], "name":"setReferrer", "outputs":[ ], "payable":false, "stateMutability":"nonpayable", "type":"function" }, { "constant":false, "inputs":[ { "name":"n", "type":"string" }, { "name":"s", "type":"string" } ], "name":"rebrand", "outputs":[ ], "payable":false, "stateMutability":"nonpayable", "type":"function" }, { "constant":true, "inputs":[ ], "name":"totalBalance", "outputs":[ { "name":"", "type":"uint256" } ], "payable":false, "stateMutability":"view", "type":"function" }, { "constant":false, "inputs":[ { "name":"shitCoin", "type":"address" } ], "name":"takeShitcoin", "outputs":[ ], "payable":false, "stateMutability":"nonpayable", "type":"function" }, { "constant":true, "inputs":[ ], "name":"myRefBonus", "outputs":[ { "name":"", "type":"uint256" } ], "payable":false, "stateMutability":"view", "type":"function" }, { "constant":false, "inputs":[ { "name":"ethToReinvest", "type":"uint256" }, { "name":"withdrawAfter", "type":"bool" } ], "name":"reinvestPartial", "outputs":[ { "name":"tokensCreated", "type":"uint256" } ], "payable":false, "stateMutability":"nonpayable", "type":"function" }, { "constant":false, "inputs":[ { "name":"refName", "type":"string" } ], "name":"setReferrer", "outputs":[ ], "payable":false, "stateMutability":"nonpayable", "type":"function" }, { "constant":false, "inputs":[ { "name":"to", "type":"address" }, { "name":"value", "type":"uint256" }, { "name":"data", "type":"bytes" } ], "name":"transfer", "outputs":[ { "name":"", "type":"bool" } ], "payable":false, "stateMutability":"nonpayable", "type":"function" }, { "constant":true, "inputs":[ { "name":"from", "type":"address" }, { "name":"value", "type":"uint256" }, { "name":"data", "type":"bytes" } ], "name":"tokenFallback", "outputs":[ ], "payable":false, "stateMutability":"pure", "type":"function" }, { "constant":true, "inputs":[ ], "name":"myBalance", "outputs":[ { "name":"", "type":"uint256" } ], "payable":false, "stateMutability":"view", "type":"function" }, { "constant":true, "inputs":[ { "name":"", "type":"address" } ], "name":"savedReferral", "outputs":[ { "name":"", "type":"address" } ], "payable":false, "stateMutability":"view", "type":"function" }, { "constant":true, "inputs":[ { "name":"sugardaddy", "type":"address" }, { "name":"spender", "type":"address" } ], "name":"allowance", "outputs":[ { "name":"remaining", "type":"uint256" } ], "payable":false, "stateMutability":"view", "type":"function" }, { "constant":false, "inputs":[ { "name":"amount", "type":"uint256" } ], "name":"sell", "outputs":[ { "name":"", "type":"uint256" } ], "payable":false, "stateMutability":"nonpayable", "type":"function" }, { "constant":false, "inputs":[ ], "name":"exit", "outputs":[ ], "payable":false, "stateMutability":"nonpayable", "type":"function" }, { "constant":true, "inputs":[ { "name":"accountHolder", "type":"address" } ], "name":"usableBalanceOf", "outputs":[ { "name":"balance", "type":"uint256" } ], "payable":false, "stateMutability":"view", "type":"function" }, { "constant":true, "inputs":[ { "name":"refName", "type":"string" } ], "name":"getAddressFromReferralName", "outputs":[ { "name":"", "type":"address" } ], "payable":false, "stateMutability":"view", "type":"function" }, { "constant":false, "inputs":[ ], "name":"acceptNewOwner", "outputs":[ ], "payable":false, "stateMutability":"nonpayable", "type":"function" }, { "constant":false, "inputs":[ { "name":"referrerAddress", "type":"address" } ], "name":"buy", "outputs":[ { "name":"", "type":"uint256" } ], "payable":true, "stateMutability":"payable", "type":"function" }, { "constant":true, "inputs":[ ], "name":"baseHourglass", "outputs":[ { "name":"", "type":"address" } ], "payable":false, "stateMutability":"view", "type":"function" }, { "constant":true, "inputs":[ ], "name":"myUsableBalance", "outputs":[ { "name":"balance", "type":"uint256" } ], "payable":false, "stateMutability":"view", "type":"function" }, { "constant":false, "inputs":[ { "name":"o", "type":"address" } ], "name":"setNewOwner", "outputs":[ ], "payable":false, "stateMutability":"nonpayable", "type":"function" }, { "constant":false, "inputs":[ ], "name":"reinvest", "outputs":[ { "name":"", "type":"uint256" } ], "payable":false, "stateMutability":"nonpayable", "type":"function" }, { "inputs":[ { "name":"h", "type":"address" }, { "name":"p", "type":"address" } ], "payable":false, "stateMutability":"nonpayable", "type":"constructor" }, { "payable":true, "stateMutability":"payable", "type":"fallback" }, { "anonymous":false, "inputs":[ { "indexed":true, "name":"tokenOwner", "type":"address" }, { "indexed":true, "name":"spender", "type":"address" }, { "indexed":false, "name":"tokens", "type":"uint256" } ], "name":"Approval", "type":"event" }, { "anonymous":false, "inputs":[ { "indexed":true, "name":"from", "type":"address" }, { "indexed":true, "name":"to", "type":"address" }, { "indexed":false, "name":"value", "type":"uint256" } ], "name":"Transfer", "type":"event" }, { "anonymous":false, "inputs":[ { "indexed":true, "name":"from", "type":"address" }, { "indexed":true, "name":"to", "type":"address" }, { "indexed":false, "name":"value", "type":"uint256" }, { "indexed":true, "name":"data", "type":"bytes" } ], "name":"Transfer", "type":"event" }, { "anonymous":false, "inputs":[ { "indexed":true, "name":"accountHolder", "type":"address" }, { "indexed":false, "name":"ethereumSpent", "type":"uint256" }, { "indexed":false, "name":"tokensCreated", "type":"uint256" }, { "indexed":false, "name":"tokensGiven", "type":"uint256" }, { "indexed":true, "name":"referrer", "type":"address" }, { "indexed":true, "name":"bitFlags", "type":"uint8" } ], "name":"onTokenPurchase", "type":"event" }, { "anonymous":false, "inputs":[ { "indexed":true, "name":"accountHolder", "type":"address" }, { "indexed":false, "name":"tokensDestroyed", "type":"uint256" }, { "indexed":false, "name":"ethereumEarned", "type":"uint256" } ], "name":"onTokenSell", "type":"event" }, { "anonymous":false, "inputs":[ { "indexed":true, "name":"accountHolder", "type":"address" }, { "indexed":false, "name":"earningsWithdrawn", "type":"uint256" }, { "indexed":false, "name":"refBonusWithdrawn", "type":"uint256" }, { "indexed":true, "name":"reinvestment", "type":"bool" } ], "name":"onWithdraw", "type":"event" }, { "anonymous":false, "inputs":[ { "indexed":true, "name":"donator", "type":"address" }, { "indexed":false, "name":"ethereumDonated", "type":"uint256" } ], "name":"onDonatedDividends", "type":"event" }, { "anonymous":false, "inputs":[ { "indexed":true, "name":"strongHands", "type":"address" }, { "indexed":false, "name":"stakeAmount", "type":"uint256" }, { "indexed":true, "name":"gauntletType", "type":"uint8" }, { "indexed":false, "name":"end", "type":"uint256" } ], "name":"onGauntletAcquired", "type":"event" }, { "anonymous":false, "inputs":[ { "indexed":true, "name":"strongHands", "type":"address" }, { "indexed":false, "name":"stakeAmount", "type":"uint256" }, { "indexed":true, "name":"extGauntlet", "type":"address" } ], "name":"onExternalGauntletAcquired", "type":"event" } ]);
	p3xInstance = p3xContract.at(p3xAddress);
	
	playerBookContract = web3.eth.contract([{"constant":false,"inputs":[],"name":"addMeToAllGames","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_whatFunction","type":"bytes32"}],"name":"deleteAnyProposal","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"pIDxAddr_","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"registrationFee_","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getNameFee","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"},{"name":"","type":"bytes32"}],"name":"plyrNames_","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"gameNames_","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"pIDxName_","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_nameString","type":"string"},{"name":"_affCode","type":"address"},{"name":"_all","type":"bool"}],"name":"registerNameXaddr","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"_gameAddress","type":"address"},{"name":"_gameNameStr","type":"string"}],"name":"addGame","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"pID_","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_pID","type":"uint256"}],"name":"getPlayerAddr","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_nameString","type":"string"},{"name":"_affCode","type":"bytes32"},{"name":"_all","type":"bool"}],"name":"registerNameXname","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"_nameStr","type":"string"}],"name":"checkIfNameValid","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_addr","type":"address"},{"name":"_name","type":"bytes32"},{"name":"_affCode","type":"bytes32"},{"name":"_all","type":"bool"}],"name":"registerNameXnameFromDapp","outputs":[{"name":"","type":"bool"},{"name":"","type":"uint256"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"_whatFunction","type":"bytes32"},{"name":"_signerA","type":"uint256"},{"name":"_signerB","type":"uint256"},{"name":"_signerC","type":"uint256"}],"name":"checkSignersByAddress","outputs":[{"name":"","type":"address"},{"name":"","type":"address"},{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_gameID","type":"uint256"}],"name":"addMeToGame","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_pID","type":"uint256"}],"name":"getPlayerName","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_nameString","type":"string"},{"name":"_affCode","type":"uint256"},{"name":"_all","type":"bool"}],"name":"registerNameXID","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"name":"plyrNameList_","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_whatFunction","type":"bytes32"}],"name":"checkData","outputs":[{"name":"","type":"bytes32"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_addr","type":"address"},{"name":"_name","type":"bytes32"},{"name":"_affCode","type":"address"},{"name":"_all","type":"bool"}],"name":"registerNameXaddrFromDapp","outputs":[{"name":"","type":"bool"},{"name":"","type":"uint256"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"_nameString","type":"string"}],"name":"useMyOldName","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"gID_","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_addr","type":"address"},{"name":"_name","type":"bytes32"},{"name":"_affCode","type":"uint256"},{"name":"_all","type":"bool"}],"name":"registerNameXIDFromDapp","outputs":[{"name":"","type":"bool"},{"name":"","type":"uint256"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"_fee","type":"uint256"}],"name":"setRegistrationFee","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"games_","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"gameIDs_","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"plyr_","outputs":[{"name":"addr","type":"address"},{"name":"name","type":"bytes32"},{"name":"laff","type":"uint256"},{"name":"names","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_pID","type":"uint256"}],"name":"getPlayerLAff","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_addr","type":"address"}],"name":"getPlayerID","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_whatFunction","type":"bytes32"},{"name":"_signerA","type":"uint256"},{"name":"_signerB","type":"uint256"},{"name":"_signerC","type":"uint256"}],"name":"checkSignersByName","outputs":[{"name":"","type":"bytes32"},{"name":"","type":"bytes32"},{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"playerID","type":"uint256"},{"indexed":true,"name":"playerAddress","type":"address"},{"indexed":true,"name":"playerName","type":"bytes32"},{"indexed":false,"name":"isNewPlayer","type":"bool"},{"indexed":false,"name":"affiliateID","type":"uint256"},{"indexed":false,"name":"affiliateAddress","type":"address"},{"indexed":false,"name":"affiliateName","type":"bytes32"},{"indexed":false,"name":"amountPaid","type":"uint256"},{"indexed":false,"name":"timeStamp","type":"uint256"}],"name":"onNewName","type":"event"}])
	playerBookInstance = playerBookContract.at(playerBookAddress);
}

async function checkMined(txHash) {
	txInfo = await promisify(cb => web3.eth.getTransaction(txHash, cb));
	if (txInfo != null && txInfo.blockNumber != null) {
		pending = false;
	} else {
		checkMined(txHash);
	}
}

function fetchResult() {
	instance.fetchResult(function(error, result){
		if(!error) {
			handlePending(result);
		}
	})
}

//button functions
function bet() {
	p3xInstance.transfer(address, web3.toWei(wager.value, 'ether'), web3.toHex(slider.noUiSlider.get()), function(error, result){
		if(!error) {
			handlePending(result);
		}
	})
}

function betVault() {
	instance.playFromVault(web3.toWei(wager.value, 'ether'), slider.noUiSlider.get(), function(error, result){
		if(!error) {
			handlePending(result);
		}
	})
}

function fundPot() {
	p3xInstance.transfer(address, web3.toWei(fundpot.value, 'ether'), '0x00', function(error, result){
	})
}

function withdrawEarnings() {
	instance.withdrawEarnings(function(error, result){
	})
}

function withdrawDividends() {
	instance.withdrawDividends(function(error, result){
	})
}