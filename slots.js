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
			//case "1":
			//	setup('0x399529C2a759dE7D84Fa8FAa4642cE7D5CA911e1', '0x349fD87eAf9FBA5d24e16bbB1d211B9203157A63', '000000000000000000000000349fd87eaf9fba5d24e16bbb1d211b9203157a6300000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000020');
			//	break;
			case "3":
				setup('0xb5e6AFC25E50d7f03c1AD8026874fe47E04A5714', '0xb3440f9C7AD5d4422b4c8835d121dc9667c21713', '0xCD45A142d109BBC8b22Ff6028614027D1dB4E32F', '000000000000000000000000b3440f9C7AD5d4422b4c8835d121dc9667c2171300000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000020');
				break;																																																																							   											
			default:																																																																							   										
				alert('Switch to Ropsten to play Slots!');
			}
			gameLoop();
			
			var filter = web3.eth.filter('latest');
			filter.watch(function(error, result){
			  gameLoop();
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
let hubInstance;
let slotsContract;
let slotsInstance;
let p3xContract;
let p3xInstance;
let bytes;
let bytesOne = '0000000000000000000000000000000000000000000000000de0b6b3a7640000';
let bytesDotFive = '00000000000000000000000000000000000000000000000006f05b59d3b20000';

let txHash;

let numberOfBets;
let finished;
let index = 0;
let reel1;
let reel2;
let reel3;
let result1;
let result2;
let result3;

function gameLoop() {
	checkButtons();
	populateField();
	getLatestWins();
}

async function checkButtons() {
	if(txHash != null) {
		const mined = await isMined(txHash);
		if(!mined) {
			return;
		}
	}
	
	const hasActiveSpin = await promisify(cb => slotsInstance.hasActiveSpin(cb));
	if(hasActiveSpin && !finished) {
		el('#play').hidden = true;
		el('#spin').hidden = false;
	} else {
		el('#play').hidden = false;
		el('#spin').hidden = true;
	}
}

function play() {
	el('#vaultSwitch').checked ? playBank() : playWallet();
}

function playWallet() {
	p3xInstance.transfer(address, web3.toWei(getTotalAmount(), 'ether'), '0x' + getBytes(), function(error, result){
		if(!error) {
			onTxSent(result);
		}
	})
}

function playBank() {
	slotsInstance.playWithBalance(web3.toWei(getTotalAmount(), 'ether'), web3.toWei(getSelectedAmount(), 'ether'), function(error, result){
		if(!error) {
			onTxSent(result);
		}
	})
}

function onTxSent(result) {
	el('#result').innerHTML  = "Waiting for transaction ...";
	txHash = result;
	index = 0;
	el('#play').hidden = true;
	el('#validate').hidden = true;
}

async function isMined() {
	const txInfo = await promisify(cb => web3.eth.getTransaction(txHash, cb));
	if (txInfo != null && txInfo.blockNumber != null) {
		const blockNumber = await promisify(cb => web3.eth.getBlockNumber(cb));
		el('#result').innerHTML  = "Waiting for next block ...";
		if(blockNumber > txInfo.blockNumber) {
			finished = false;
			txHash = null;
			el('#result').innerHTML  = "";
			return true;
		}
	} 
	return false;
}

async function spin() {
	el('#spin').disabled = true;
	if(index == 0) {
		finished = false;
		const spin = await promisify(cb => slotsInstance.mySpin(cb));
		numberOfBets = spin[0];
		reel1 = spin[1];
		reel2 = spin[2];
		reel3 = spin[3];
	}

	el('#result').innerHTML  = "";
	
	result1 = reel1[index].toNumber();
	result2 = reel2[index].toNumber();
	result3 = reel3[index].toNumber();
	
	index++;
	
	startSpin();
}

function withdraw() {
	hubInstance.withdrawBalance(function(error, result){
	})
}

function withdrawFunds() {
	hubInstance.withdrawFundingBalancePartial(web3.toWei(el('#fund').value, 'ether'), function(error, result){
	})
}

function validate() {
	slotsInstance.resolveSpin(function(error, result){
		if(!error) {
			el('#validate').hidden = true;
			el('#result').innerHTML  = "Validating...";
		}
	})
}

function fund() {
	p3xInstance.transfer(address, web3.toWei(el('#fund').value, 'ether'), '', function(error, result){
	})
}

function getSelectedAmount() {
	return el('#one').checked ? 1 : 0.5;
}

function getTotalAmount() {
	return getSelectedAmount() * el('#games').value;
}

function getBytes() {
	return bytes + (el('#one').checked ? bytesOne : bytesDotFive);
}

function calcWin() {
	let multiplier = 0;
	if(result1 + result2 + result3 == 0) {
		multiplier = 20;
    } else if(result1 == result2 && result1 == result3) {
		multiplier = 7;
    } else if(result1 + result2 == 0 || result1 + result3 == 0 || result2 + result3 == 0) {
       multiplier = 2;
    } else if(result1 == 0 || result2 == 0 || result3 == 0) {
       multiplier = 1;
    }
	
	if(multiplier != 0) {
		el('#result').innerHTML = "WIN: " + ((multiplier * 10) * (getSelectedAmount() * 10) / (100)) + " P3X!";
	} else {
		el('#result').innerHTML = "";
	}
	
	if(index == numberOfBets) {
		finished = true;
		el('#play').hidden = false;
		el('#spin').hidden = true;
		el('#validate').hidden = false;
	}
}

async function populateField() {
	const accounts = await promisify(cb => web3.eth.getAccounts(cb));
	const playerBalance = await promisify(cb => p3xInstance.myBalance(cb));
	
	el('#playerWallet').innerHTML = web3.fromWei(playerBalance).toFixed(4) + ' P3X';
		
	const player = await promisify(cb => hubInstance.players(accounts[0], cb));
	
	el('#playerBank').innerHTML = web3.fromWei(player[0]).toFixed(2) + ' P3X';
	if(player[0] > 0) {
		el('#withdraw').hidden = false;
	} else {
		el('#withdraw').hidden = true;
	}
	
	el('#contribution').innerHTML = web3.fromWei(player[1]).toFixed(2) + ' P3X';
	
	const totalFundingBalances = await promisify(cb => hubInstance.totalFundingBalances(cb));
	
	el('#fundedtotal').innerHTML = web3.fromWei(totalFundingBalances).toFixed(2) + ' P3X';
	
	if(player[1] > 0) {
		el('#withdrawfundsbutton').hidden= false;
	} else {
		el('#withdrawfundsbutton').hidden= true;
	}
	
	const totalTokenBalance = await promisify(cb => hubInstance.totalSupply(cb));
	
	el('#tokenstotal').innerHTML = web3.fromWei(totalTokenBalance).toFixed(2);
	
	const shareholder = await promisify(cb => hubInstance.shareholders(accounts[0], cb));
	
	el('#mytokens').innerHTML = web3.fromWei(shareholder[0]).toFixed(2) + ' P3X';
	
	el('#mydividends').innerHTML = web3.fromWei(shareholder[1]).toFixed(2) + ' ETH';
	
	/* if(player[1] > 0) {
		el('#withdrawdividendsbutton').hidden= false;
	} else {
		el('#withdrawdividendsbutton').hidden= true;
	} */
}

async function getLatestWins() {
	const events = await promisify(cb => slotsInstance.Win({}, { fromBlock: 'latest' - 10000, toBlock: 'latest' }).get(cb));
	for(let i = 0; i < events.length && i < 7; i++) {
		const theEvent = events[events.length - 1 - i].args;
		const playerAddress = theEvent.player;
		const player = await promisify(cb => hubInstance.players(playerAddress, cb));
		el('#w' + i).innerHTML = playerAddress.substring(0, 10);
		el('#a' + i).innerHTML = web3.fromWei(theEvent.amount).toFixed(2) + ' P3X';
		
		el('#w' + i + 'r1').className = "payoutInner slot" + theEvent.reel1 + "_s";
		el('#w' + i + 'r2').className = "payoutInner slot" + theEvent.reel2 + "_s";
		el('#w' + i + 'r3').className = "payoutInner slot" + theEvent.reel3 + "_s";
	}
}

function enableFundWithdraw() {
	if(el('#fund').value > 0) {
		el('#fundbutton').disabled = false;
		el('#withdrawfundsbutton').disabled = false;
	} else {
		el('#fundbutton').disabled = true;
		el('#withdrawfundsbutton').disabled = true;
	}
}

function enableBuyName() {
	if(el('#vanity').value != "") {
		el('#buyname').disabled = false;
	} else {
		el('#buyname').disabled = true;
	}
}

const promisify = (inner) =>
  new Promise((resolve, reject) =>
    inner((err, res) => {
      if (err) { reject(err) }

      resolve(res);
    })
  );

function setup(hubAddress, slotsAddress, p3xAddress, data) {
	bytes = data;
	
	address = hubAddress;
	hubContract = web3.eth.contract([ { "constant": false, "inputs": [ { "name": "gameAddress", "type": "address" } ], "name": "addGame", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "playerAddress", "type": "address" }, { "name": "value", "type": "uint256" } ], "name": "addPlayerBalance", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "playerAddress", "type": "address" }, { "name": "amount", "type": "uint256" } ], "name": "addShareholderTokens", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "gameAddress", "type": "address" } ], "name": "removeGame", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "playerAddress", "type": "address" }, { "name": "value", "type": "uint256" } ], "name": "subPlayerBalance", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "player", "type": "address" }, { "name": "amount", "type": "uint256" }, { "name": "data", "type": "bytes" } ], "name": "tokenFallback", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "withdrawBalance", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "howMuch", "type": "uint256" } ], "name": "withdrawBalancePartial", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "withdrawDividends", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "withdrawFundingBalance", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "howMuch", "type": "uint256" } ], "name": "withdrawFundingBalancePartial", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "payable": true, "stateMutability": "payable", "type": "fallback" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "player", "type": "address" }, { "indexed": false, "name": "amount", "type": "uint256" } ], "name": "Withdraw", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "funder", "type": "address" }, { "indexed": false, "name": "amount", "type": "uint256" } ], "name": "Fund", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "player", "type": "address" }, { "indexed": false, "name": "amount", "type": "uint256" } ], "name": "WithdrawFunding", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "game", "type": "address" } ], "name": "AddGame", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "game", "type": "address" } ], "name": "RemoveGame", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "player", "type": "address" }, { "indexed": true, "name": "amount", "type": "uint256" } ], "name": "Mint", "type": "event" }, { "constant": true, "inputs": [ { "name": "", "type": "address" } ], "name": "games", "outputs": [ { "name": "registered", "type": "bool" }, { "name": "amountGiven", "type": "uint256" }, { "name": "amountTaken", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "numberOfGames", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "address" } ], "name": "players", "outputs": [ { "name": "balance", "type": "uint256" }, { "name": "fundingBalance", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "address" } ], "name": "shareholders", "outputs": [ { "name": "tokens", "type": "uint256" }, { "name": "outstandingDividends", "type": "uint256" }, { "name": "lastDividendPoints", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "totalFundingBalances", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "totalOutstandingDividends", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "totalPlayerBalances", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" } ]);
	hubInstance = hubContract.at(address);
	
	p3xContract = web3.eth.contract([ { "constant":true, "inputs":[ { "name":"customerAddress", "type":"address" } ], "name":"dividendsOf", "outputs":[ { "name":"", "type":"uint256" } ], "payable":false, "stateMutability":"view", "type":"function" }, { "constant":false, "inputs":[ { "name":"amount", "type":"uint256" }, { "name":"withdrawAfter", "type":"bool" } ], "name":"sell", "outputs":[ { "name":"", "type":"uint256" } ], "payable":false, "stateMutability":"nonpayable", "type":"function" }, { "constant":true, "inputs":[ ], "name":"name", "outputs":[ { "name":"", "type":"string" } ], "payable":false, "stateMutability":"view", "type":"function" }, { "constant":false, "inputs":[ { "name":"spender", "type":"address" }, { "name":"value", "type":"uint256" } ], "name":"approve", "outputs":[ { "name":"", "type":"bool" } ], "payable":false, "stateMutability":"nonpayable", "type":"function" }, { "constant":true, "inputs":[ { "name":"accountHolder", "type":"address" } ], "name":"gauntletTypeOf", "outputs":[ { "name":"stakeAmount", "type":"uint256" }, { "name":"gType", "type":"uint256" }, { "name":"end", "type":"uint256" } ], "payable":false, "stateMutability":"view", "type":"function" }, { "constant":true, "inputs":[ { "name":"ethereumToSpend", "type":"uint256" } ], "name":"calculateTokensReceived", "outputs":[ { "name":"", "type":"uint256" } ], "payable":false, "stateMutability":"view", "type":"function" }, { "constant":true, "inputs":[ ], "name":"totalSupply", "outputs":[ { "name":"", "type":"uint256" } ], "payable":false, "stateMutability":"view", "type":"function" }, { "constant":false, "inputs":[ { "name":"ethToReinvest", "type":"uint256" } ], "name":"reinvestPartial", "outputs":[ { "name":"", "type":"uint256" } ], "payable":false, "stateMutability":"nonpayable", "type":"function" }, { "constant":true, "inputs":[ { "name":"tokensToSell", "type":"uint256" } ], "name":"calculateEthereumReceived", "outputs":[ { "name":"", "type":"uint256" } ], "payable":false, "stateMutability":"view", "type":"function" }, { "constant":false, "inputs":[ { "name":"from", "type":"address" }, { "name":"to", "type":"address" }, { "name":"value", "type":"uint256" } ], "name":"transferFrom", "outputs":[ { "name":"success", "type":"bool" } ], "payable":false, "stateMutability":"nonpayable", "type":"function" }, { "constant":false, "inputs":[ { "name":"to", "type":"address" }, { "name":"ignore", "type":"bool" } ], "name":"ignoreTokenFallback", "outputs":[ ], "payable":false, "stateMutability":"nonpayable", "type":"function" }, { "constant":true, "inputs":[ ], "name":"decimals", "outputs":[ { "name":"", "type":"uint8" } ], "payable":false, "stateMutability":"view", "type":"function" }, { "constant":true, "inputs":[ ], "name":"myDividends", "outputs":[ { "name":"", "type":"uint256" } ], "payable":false, "stateMutability":"view", "type":"function" }, { "constant":false, "inputs":[ { "name":"amount", "type":"uint256" }, { "name":"extGauntlet", "type":"address" } ], "name":"acquireExternalGauntlet", "outputs":[ ], "payable":false, "stateMutability":"nonpayable", "type":"function" }, { "constant":false, "inputs":[ ], "name":"withdraw", "outputs":[ ], "payable":false, "stateMutability":"nonpayable", "type":"function" }, { "constant":true, "inputs":[ ], "name":"myGauntletType", "outputs":[ { "name":"stakeAmount", "type":"uint256" }, { "name":"gType", "type":"uint256" }, { "name":"end", "type":"uint256" } ], "payable":false, "stateMutability":"view", "type":"function" }, { "constant":false, "inputs":[ { "name":"referrerName", "type":"string" } ], "name":"buy", "outputs":[ { "name":"", "type":"uint256" } ], "payable":true, "stateMutability":"payable", "type":"function" }, { "constant":false, "inputs":[ ], "name":"allowIgnoreTokenFallback", "outputs":[ ], "payable":false, "stateMutability":"nonpayable", "type":"function" }, { "constant":true, "inputs":[ ], "name":"stakingRequirement", "outputs":[ { "name":"", "type":"uint256" } ], "payable":false, "stateMutability":"view", "type":"function" }, { "constant":true, "inputs":[ { "name":"includeReferralBonus", "type":"bool" } ], "name":"myDividends", "outputs":[ { "name":"", "type":"uint256" } ], "payable":false, "stateMutability":"view", "type":"function" }, { "constant":false, "inputs":[ { "name":"r", "type":"uint256" } ], "name":"setReferralRequirement", "outputs":[ ], "payable":false, "stateMutability":"nonpayable", "type":"function" }, { "constant":true, "inputs":[ ], "name":"lastTotalBalance", "outputs":[ { "name":"", "type":"uint256" } ], "payable":false, "stateMutability":"view", "type":"function" }, { "constant":true, "inputs":[ { "name":"accountHolder", "type":"address" } ], "name":"balanceOf", "outputs":[ { "name":"balance", "type":"uint256" } ], "payable":false, "stateMutability":"view", "type":"function" }, { "constant":true, "inputs":[ { "name":"customerAddress", "type":"address" }, { "name":"includeReferralBonus", "type":"bool" } ], "name":"dividendsOf", "outputs":[ { "name":"", "type":"uint256" } ], "payable":false, "stateMutability":"view", "type":"function" }, { "constant":true, "inputs":[ { "name":"customerAddress", "type":"address" } ], "name":"refBonusOf", "outputs":[ { "name":"", "type":"uint256" } ], "payable":false, "stateMutability":"view", "type":"function" }, { "constant":true, "inputs":[ ], "name":"refHandlerAddress", "outputs":[ { "name":"", "type":"address" } ], "payable":false, "stateMutability":"view", "type":"function" }, { "constant":true, "inputs":[ ], "name":"symbol", "outputs":[ { "name":"", "type":"string" } ], "payable":false, "stateMutability":"view", "type":"function" }, { "constant":false, "inputs":[ { "name":"amount", "type":"uint256" }, { "name":"gType", "type":"uint8" }, { "name":"end", "type":"uint256" } ], "name":"acquireGauntlet", "outputs":[ ], "payable":false, "stateMutability":"nonpayable", "type":"function" }, { "constant":false, "inputs":[ ], "name":"donateDividends", "outputs":[ ], "payable":true, "stateMutability":"payable", "type":"function" }, { "constant":false, "inputs":[ { "name":"ref", "type":"address" } ], "name":"setReferrer", "outputs":[ ], "payable":false, "stateMutability":"nonpayable", "type":"function" }, { "constant":false, "inputs":[ { "name":"n", "type":"string" }, { "name":"s", "type":"string" } ], "name":"rebrand", "outputs":[ ], "payable":false, "stateMutability":"nonpayable", "type":"function" }, { "constant":true, "inputs":[ ], "name":"totalBalance", "outputs":[ { "name":"", "type":"uint256" } ], "payable":false, "stateMutability":"view", "type":"function" }, { "constant":false, "inputs":[ { "name":"shitCoin", "type":"address" } ], "name":"takeShitcoin", "outputs":[ ], "payable":false, "stateMutability":"nonpayable", "type":"function" }, { "constant":true, "inputs":[ ], "name":"myRefBonus", "outputs":[ { "name":"", "type":"uint256" } ], "payable":false, "stateMutability":"view", "type":"function" }, { "constant":false, "inputs":[ { "name":"ethToReinvest", "type":"uint256" }, { "name":"withdrawAfter", "type":"bool" } ], "name":"reinvestPartial", "outputs":[ { "name":"tokensCreated", "type":"uint256" } ], "payable":false, "stateMutability":"nonpayable", "type":"function" }, { "constant":false, "inputs":[ { "name":"refName", "type":"string" } ], "name":"setReferrer", "outputs":[ ], "payable":false, "stateMutability":"nonpayable", "type":"function" }, { "constant":false, "inputs":[ { "name":"to", "type":"address" }, { "name":"value", "type":"uint256" }, { "name":"data", "type":"bytes" } ], "name":"transfer", "outputs":[ { "name":"", "type":"bool" } ], "payable":false, "stateMutability":"nonpayable", "type":"function" }, { "constant":true, "inputs":[ { "name":"from", "type":"address" }, { "name":"value", "type":"uint256" }, { "name":"data", "type":"bytes" } ], "name":"tokenFallback", "outputs":[ ], "payable":false, "stateMutability":"pure", "type":"function" }, { "constant":true, "inputs":[ ], "name":"myBalance", "outputs":[ { "name":"", "type":"uint256" } ], "payable":false, "stateMutability":"view", "type":"function" }, { "constant":true, "inputs":[ { "name":"", "type":"address" } ], "name":"savedReferral", "outputs":[ { "name":"", "type":"address" } ], "payable":false, "stateMutability":"view", "type":"function" }, { "constant":true, "inputs":[ { "name":"sugardaddy", "type":"address" }, { "name":"spender", "type":"address" } ], "name":"allowance", "outputs":[ { "name":"remaining", "type":"uint256" } ], "payable":false, "stateMutability":"view", "type":"function" }, { "constant":false, "inputs":[ { "name":"amount", "type":"uint256" } ], "name":"sell", "outputs":[ { "name":"", "type":"uint256" } ], "payable":false, "stateMutability":"nonpayable", "type":"function" }, { "constant":false, "inputs":[ ], "name":"exit", "outputs":[ ], "payable":false, "stateMutability":"nonpayable", "type":"function" }, { "constant":true, "inputs":[ { "name":"accountHolder", "type":"address" } ], "name":"usableBalanceOf", "outputs":[ { "name":"balance", "type":"uint256" } ], "payable":false, "stateMutability":"view", "type":"function" }, { "constant":true, "inputs":[ { "name":"refName", "type":"string" } ], "name":"getAddressFromReferralName", "outputs":[ { "name":"", "type":"address" } ], "payable":false, "stateMutability":"view", "type":"function" }, { "constant":false, "inputs":[ ], "name":"acceptNewOwner", "outputs":[ ], "payable":false, "stateMutability":"nonpayable", "type":"function" }, { "constant":false, "inputs":[ { "name":"referrerAddress", "type":"address" } ], "name":"buy", "outputs":[ { "name":"", "type":"uint256" } ], "payable":true, "stateMutability":"payable", "type":"function" }, { "constant":true, "inputs":[ ], "name":"baseHourglass", "outputs":[ { "name":"", "type":"address" } ], "payable":false, "stateMutability":"view", "type":"function" }, { "constant":true, "inputs":[ ], "name":"myUsableBalance", "outputs":[ { "name":"balance", "type":"uint256" } ], "payable":false, "stateMutability":"view", "type":"function" }, { "constant":false, "inputs":[ { "name":"o", "type":"address" } ], "name":"setNewOwner", "outputs":[ ], "payable":false, "stateMutability":"nonpayable", "type":"function" }, { "constant":false, "inputs":[ ], "name":"reinvest", "outputs":[ { "name":"", "type":"uint256" } ], "payable":false, "stateMutability":"nonpayable", "type":"function" }, { "inputs":[ { "name":"h", "type":"address" }, { "name":"p", "type":"address" } ], "payable":false, "stateMutability":"nonpayable", "type":"constructor" }, { "payable":true, "stateMutability":"payable", "type":"fallback" }, { "anonymous":false, "inputs":[ { "indexed":true, "name":"tokenOwner", "type":"address" }, { "indexed":true, "name":"spender", "type":"address" }, { "indexed":false, "name":"tokens", "type":"uint256" } ], "name":"Approval", "type":"event" }, { "anonymous":false, "inputs":[ { "indexed":true, "name":"from", "type":"address" }, { "indexed":true, "name":"to", "type":"address" }, { "indexed":false, "name":"value", "type":"uint256" } ], "name":"Transfer", "type":"event" }, { "anonymous":false, "inputs":[ { "indexed":true, "name":"from", "type":"address" }, { "indexed":true, "name":"to", "type":"address" }, { "indexed":false, "name":"value", "type":"uint256" }, { "indexed":true, "name":"data", "type":"bytes" } ], "name":"Transfer", "type":"event" }, { "anonymous":false, "inputs":[ { "indexed":true, "name":"accountHolder", "type":"address" }, { "indexed":false, "name":"ethereumSpent", "type":"uint256" }, { "indexed":false, "name":"tokensCreated", "type":"uint256" }, { "indexed":false, "name":"tokensGiven", "type":"uint256" }, { "indexed":true, "name":"referrer", "type":"address" }, { "indexed":true, "name":"bitFlags", "type":"uint8" } ], "name":"onTokenPurchase", "type":"event" }, { "anonymous":false, "inputs":[ { "indexed":true, "name":"accountHolder", "type":"address" }, { "indexed":false, "name":"tokensDestroyed", "type":"uint256" }, { "indexed":false, "name":"ethereumEarned", "type":"uint256" } ], "name":"onTokenSell", "type":"event" }, { "anonymous":false, "inputs":[ { "indexed":true, "name":"accountHolder", "type":"address" }, { "indexed":false, "name":"earningsWithdrawn", "type":"uint256" }, { "indexed":false, "name":"refBonusWithdrawn", "type":"uint256" }, { "indexed":true, "name":"reinvestment", "type":"bool" } ], "name":"onWithdraw", "type":"event" }, { "anonymous":false, "inputs":[ { "indexed":true, "name":"donator", "type":"address" }, { "indexed":false, "name":"ethereumDonated", "type":"uint256" } ], "name":"onDonatedDividends", "type":"event" }, { "anonymous":false, "inputs":[ { "indexed":true, "name":"strongHands", "type":"address" }, { "indexed":false, "name":"stakeAmount", "type":"uint256" }, { "indexed":true, "name":"gauntletType", "type":"uint8" }, { "indexed":false, "name":"end", "type":"uint256" } ], "name":"onGauntletAcquired", "type":"event" }, { "anonymous":false, "inputs":[ { "indexed":true, "name":"strongHands", "type":"address" }, { "indexed":false, "name":"stakeAmount", "type":"uint256" }, { "indexed":true, "name":"extGauntlet", "type":"address" } ], "name":"onExternalGauntletAcquired", "type":"event" } ]);
	p3xInstance = p3xContract.at(p3xAddress);
	
	slotsContract = web3.eth.contract([ { "constant": false, "inputs": [ { "name": "playerAddress", "type": "address" }, { "name": "totalBetValue", "type": "uint256" }, { "name": "gameData", "type": "bytes" } ], "name": "play", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "totalBetValue", "type": "uint256" }, { "name": "betValue", "type": "uint256" } ], "name": "playWithBalance", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "resolveSpin", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "newMaxBet", "type": "uint256" } ], "name": "setMaxBet", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "name": "gameHubAddress", "type": "address" } ], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "player", "type": "address" }, { "indexed": false, "name": "amount", "type": "uint256" }, { "indexed": false, "name": "reel1", "type": "uint256" }, { "indexed": false, "name": "reel2", "type": "uint256" }, { "indexed": false, "name": "reel3", "type": "uint256" } ], "name": "Win", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "player", "type": "address" }, { "indexed": false, "name": "amount", "type": "uint256" } ], "name": "Loss", "type": "event" }, { "constant": true, "inputs": [], "name": "hasActiveSpin", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "maxBet", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "mySpin", "outputs": [ { "name": "numberOfBets", "type": "uint256" }, { "name": "reel1", "type": "uint256[10]" }, { "name": "reel2", "type": "uint256[10]" }, { "name": "reel3", "type": "uint256[10]" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "address" } ], "name": "playerSpin", "outputs": [ { "name": "betValue", "type": "uint256" }, { "name": "numberOfBets", "type": "uint256" }, { "name": "startBlock", "type": "uint256" }, { "name": "open", "type": "bool" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSpins", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" } ]);
	slotsInstance = slotsContract.at(slotsAddress);
}