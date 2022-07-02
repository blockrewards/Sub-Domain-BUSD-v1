var currentAddr = null;    // current address
var web3;
var usrBal;                // BNB in wallet
var contractBalance;       // Contract balance

var eggstohatch1Miner=0
var totalDeposits=0        // Total Deposits made (Not compounded but actual deposits)
var rewardsCutoffTime=0;   // 48 Hours. Rewards Accumulation cut-off. 48 * 60 * 60 seconds
var newBuyerBonusPercent = 0; // 120 = 20% bonus. 140 = 40% bonus.
var BNBPrice = 0;
var contract;
var priceFeedBNB;
var web3BNB;

var started = true;
var canSell = true;

// BNB price Feed
// BNB/USD Testnet: 0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526
// BNB/USD Mainnet: 0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE
const aggregatorV3InterfaceABI = [{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"description","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint80","name":"_roundId","type":"uint80"}],"name":"getRoundData","outputs":[{"internalType":"uint80","name":"roundId","type":"uint80"},{"internalType":"int256","name":"answer","type":"int256"},{"internalType":"uint256","name":"startedAt","type":"uint256"},{"internalType":"uint256","name":"updatedAt","type":"uint256"},{"internalType":"uint80","name":"answeredInRound","type":"uint80"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"latestRoundData","outputs":[{"internalType":"uint80","name":"roundId","type":"uint80"},{"internalType":"int256","name":"answer","type":"int256"},{"internalType":"uint256","name":"startedAt","type":"uint256"},{"internalType":"uint256","name":"updatedAt","type":"uint256"},{"internalType":"uint80","name":"answeredInRound","type":"uint80"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"version","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}];
const addrBNB = "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE"; // BNB price feed in USD. Chainlink Oracle. https://docs.bnbchain.org/docs/link

const minerAddress =  '0xFe28ea3d83C2b4e1445f0E845A830DDBDe706B73';
const minerAbi = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"inputs":[],"name":"ADJUSTED_REWARD_PERCENT","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"ADJUSTED_REWARD_PERCENT_NEWBUYERS","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"Blacklisted","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"CAPPED_DAILY_REWARD_AMOUNT","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"DEV_PERCENT","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"EGGS_TO_HATCH_1MINERS","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MARKETEGGS_BUY_INFLATION","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MARKETEGGS_HATCH_INFLATION","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MARKETEGGS_SELL_INFLATION","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MAX_REWARDS_ACCUMULATION_CUTOFF","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"REFERRAL_PERCENT","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bool","name":"isActive","type":"bool"}],"name":"SetBlacklistActive","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bool","name":"isSellCheckActive","type":"bool"}],"name":"SetSellCheckActive","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"capped_daily_reward_amount","type":"uint256"}],"name":"Set_Capped_DailyRewardAmount","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"value","type":"uint256"}],"name":"Set_Dev_Percent","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"value","type":"uint256"}],"name":"Set_MarketEggs_Buy_Inflation","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"value","type":"uint256"}],"name":"Set_MarketEggs_Hatch_Inflation","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"value","type":"uint256"}],"name":"Set_MarketEggs_Sell_Inflation","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"value","type":"uint256"}],"name":"Set_Referral_Percent","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"value","type":"uint256"}],"name":"Set_RewardRate_ExistingBuyers","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"value","type":"uint256"}],"name":"Set_RewardRate_NewBuyers","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"whale_tax_cutoff","type":"uint256"}],"name":"Set_WhaleTax_Cutoff","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"whale_tax","type":"uint256"}],"name":"Set_Whale_Tax","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"value","type":"uint256"}],"name":"Set_Withdraw_Cooldown","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"WHALE_TAX_CUTOFF","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"WHALE_TAX_PERCENT","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"WITHDRAW_COOLDOWN","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"Wallet","type":"address"},{"internalType":"bool","name":"isBlacklisted","type":"bool"}],"name":"blackListWallet","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address[]","name":"Wallet","type":"address[]"},{"internalType":"bool","name":"isBlacklisted","type":"bool"}],"name":"blackMultipleWallets","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"blacklistActive","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"ref","type":"address"}],"name":"buyEggs","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"eth","type":"uint256"},{"internalType":"uint256","name":"contractBalance","type":"uint256"}],"name":"calculateEggBuy","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"eth","type":"uint256"},{"internalType":"address","name":"adr","type":"address"}],"name":"calculateEggBuyWithBonus","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"eggs","type":"uint256"}],"name":"calculateEggSell","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"eggs","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"calculateEggSellForYield","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"Wallet","type":"address"}],"name":"checkIfBlacklisted","outputs":[{"internalType":"bool","name":"blacklisted","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"fundContract","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"getBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"getEggsYield","outputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"adr","type":"address"}],"name":"getEstimatedDailyReward","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"adr","type":"address"}],"name":"getMyEggs","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"adr","type":"address"}],"name":"getMyMiners","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getSiteInfo","outputs":[{"internalType":"uint256","name":"_totalStaked","type":"uint256"},{"internalType":"uint256","name":"_totalDeposits","type":"uint256"},{"internalType":"uint256","name":"_totalCompound","type":"uint256"},{"internalType":"uint256","name":"_totalRefBonus","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTimeStamp","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"adr","type":"address"}],"name":"getUserInfo","outputs":[{"internalType":"uint256","name":"_initialDeposit","type":"uint256"},{"internalType":"uint256","name":"_userDeposit","type":"uint256"},{"internalType":"uint256","name":"_miners","type":"uint256"},{"internalType":"uint256","name":"_lastHatch","type":"uint256"},{"internalType":"address","name":"_referrer","type":"address"},{"internalType":"uint256","name":"_referralsCount","type":"uint256"},{"internalType":"uint256","name":"_totalWithdrawn","type":"uint256"},{"internalType":"uint256","name":"_refRewardsinBNB","type":"uint256"},{"internalType":"uint256","name":"_farmerCompoundCount","type":"uint256"},{"internalType":"uint256","name":"_lastWithdrawTime","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"hatchEggs","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"marketEggs","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"seedMarket","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"sellCheck","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"sellEggs","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"totalCompound","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalDeposits","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalRefBonus","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalWithdrawn","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"adr","type":"address"}],"name":"userRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"uint256","name":"initialDeposit","type":"uint256"},{"internalType":"uint256","name":"userDeposit","type":"uint256"},{"internalType":"uint256","name":"miners","type":"uint256"},{"internalType":"uint256","name":"lastHatch","type":"uint256"},{"internalType":"address","name":"referrer","type":"address"},{"internalType":"uint256","name":"referralsCount","type":"uint256"},{"internalType":"uint256","name":"refRewardsinBNB","type":"uint256"},{"internalType":"uint256","name":"totalWithdrawn","type":"uint256"},{"internalType":"uint256","name":"farmerCompoundCount","type":"uint256"},{"internalType":"uint256","name":"lastWithdrawTime","type":"uint256"}],"stateMutability":"view","type":"function"}]

function loadContracts() {
    console.log('Loading contracts...')
    web3 = window.web3
    contract = new web3.eth.Contract(minerAbi, minerAddress);
	priceFeedBNB = new web3BNB.eth.Contract(aggregatorV3InterfaceABI, addrBNB);

    console.log('Done loading contracts.')
}

function myReferralLink(address) {
    var prldoc = document.getElementById('reflink');
    prldoc.textContent = window.location.origin + "?ref=" + address;
    var copyText = document.getElementById("reflink");
    copyText.value = prldoc.textContent;
}

// connect to metamask and refresh the data
async function connect() {
    console.log('Connecting to wallet...')
    try {
        if (started) {
            $('#buy-eggs-btn').attr('disabled', false)  // enable hire farmers
        }

		// opens metamask to login
        var accounts = await ethereum.request({ method: 'eth_requestAccounts' })
        if (accounts.length == 0) {
            console.log('Please connect to MetaMask.');
            $('#enableMetamask').html('Connect')
        } else if (accounts[0] !== currentAddr) {
            currentAddr = accounts[0];
            if (currentAddr !== null) {
                myReferralLink(currentAddr)
                console.log('Wallet connected = '+ currentAddr)

                loadContracts()
                refreshData()

                let shortenedAccount = currentAddr.replace(currentAddr.substring(3, 39), "***")
                $('#enableMetamask').html(shortenedAccount)
            }
            $('#enableMetamask').attr('disabled', true)
        }
    } catch (err) {
        if (err.code === 4001) {
            // EIP-1193 userRejectedRequest error
            // If this happens, the user rejected the connection request.
            alert('Please connect to MetaMask.');
        } else {
            console.error(err);
        }
        $('#enableMetamask').attr('disabled', false)
    }
}

async function loadWeb3() {
    if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);

		// web3BNB = new Web3("https://data-seed-prebsc-1-s1.binance.org:8545"); // BSC Testnet. BNB PriceFeed
		web3BNB = new Web3("https://bsc-dataseed.binance.org/"); // BSC Mainnet. BNB PriceFeed

        $('#enableMetamask').attr('disabled', false)
        if (window.ethereum.selectedAddress !== null) {
            	await connect();

                setTimeout(function () {
                	controlLoop()
                	controlLoopFaster()
            	}, 1000)
        }
    } else {
        $('#enableMetamask').attr('disabled', true)
    }
}

window.addEventListener('load', function () {
    loadWeb3()

/* 	var randomNumber =  Math.floor( (Math.random() * 3) + 1 ),
	bodyClass = 'body-background-' + randomNumber,
	body = document.getElementsByTagName( 'body' )[0];

	// Apply the random body class to the body element
	body.classList.add( bodyClass ); */

})

$('#enableMetamask').click(function () {
    connect()
});

function controlLoop() {
    refreshData()
    setTimeout(controlLoop, 25000)
}

function controlLoopFaster() {
    setTimeout(controlLoopFaster, 30)
}

function roundNum(num) {
    if (num == 0) { return 0};
    if (num < 1) {
        return parseFloat(num).toFixed(4);
    }
    return parseFloat(parseFloat(num).toFixed(2));
}


function refreshData() {
    console.log('Refreshing data...')

	getBNBPrice(setBNBPrice);

	contract.methods.ADJUSTED_REWARD_PERCENT_NEWBUYERS().call().then(newBuyerBonusPerct => {
        newBuyerBonusPercent = Number(newBuyerBonusPerct) - 100;

		if(newBuyerBonusPercent == 0) {
			$("#new-buyer-bonus-percent").html(`New Buyer Bonus`);
			$("#new-buyer-bonus-percent-2").html(`Action Panel`);
			$('#limited-time-offer').addClass('d-none');
			$('#limited-time-offer').removeClass('d-inline-block');
		} else if (newBuyerBonusPercent > 0 && newBuyerBonusPercent <= 10) {
			$("#new-buyer-bonus-percent").html(`${newBuyerBonusPercent}% New Buyer Bonus`);
			$("#new-buyer-bonus-percent-2").html(`Buyer Bonus: ${newBuyerBonusPercent}%`);
			$('#limited-time-offer').addClass('d-none');
			$('#limited-time-offer').removeClass('d-inline-block');
		} else {
			$("#new-buyer-bonus-percent").html(`${newBuyerBonusPercent}% New Buyer Bonus`);
			$("#new-buyer-bonus-percent-2").html(`Buyer Bonus: ${newBuyerBonusPercent}%`);
			$('#limited-time-offer').removeClass('d-none');
			$('#limited-time-offer').addClass('d-inline-block');
		}
    }).catch((err) => {
        console.log('ADJUSTED_REWARD_PERCENT_NEWBUYERS', err);
    });


	contract.methods.EGGS_TO_HATCH_1MINERS().call().then(eggs => {
        eggstohatch1Miner = eggs
        var dailyPercentBase = Number((86400 / eggstohatch1Miner) * 100);
		var adjustedDailyPercent = dailyPercentBase;

		contract.methods.ADJUSTED_REWARD_PERCENT().call().then(adjustedRewardPercent => {
			adjustedDailyPercent = (dailyPercentBase * adjustedRewardPercent)/100;
			adjustedDailyPercent = adjustedDailyPercent.toFixed();
			var apr = adjustedDailyPercent * 365;
			$("#daily-rate").html(`${adjustedDailyPercent}% Daily Return ~ ${apr}% APR`);
		}).catch((err) => {
			console.log('ADJUSTED_REWARD_PERCENT', err);
		});
    }).catch((err) => {
        console.log('EGGS_TO_HATCH_1MINERS', err);
    });

    contract.methods.REFERRAL_PERCENT().call().then(r => {
        var refPercent = Number(r);
        $("#ref-bonus").html(`${refPercent}% Referral Rewards paid in BNB`)
        $("#ref-percent").html(`${refPercent}%`)
    }).catch((err) => {
        console.log(err);
    });

	contract.methods.DEV_PERCENT().call().then(dev => {
        var devfee = Number(dev);
        $("#devfee").html(`${devfee}% Dev & Marketing`)
    }).catch((err) => {
        console.log(err);
    });

	contract.methods.CAPPED_DAILY_REWARD_AMOUNT().call().then(cap => {
        var cappedDailyReward = Number(cap)/1e18;
		cappedDailyReward = parseFloat((cappedDailyReward).toFixed(1));

        $("#capped-daily-rewards").html(`${cappedDailyReward} BNB/Day Capped Daily Rewards`)
    }).catch((err) => {
        console.log(err);
    });

	contract.methods.MAX_REWARDS_ACCUMULATION_CUTOFF().call().then(rewardsCutoff => {
        rewardsCutoffTime = rewardsCutoff;
    }).catch((err) => {
        console.log('MAX_REWARDS_ACCUMULATION_CUTOFF', err);
    })

	/** How many miners and eggs per day user will recieve for 1 BNB deposit **/
	contract.methods.getEggsYield(web3.utils.toWei('1')).call().then(result => {
		var miners = result[0];
		var bnb = result[1];
		var amt = readableBNB(bnb, 4);

		var minersFormatted = parseFloat(miners).toLocaleString("en-US");

		$("#example-miners").html(minersFormatted)
		$("#example-bnb").html(roundNum(amt))
	}).catch((err) => {
		console.log(err);
	});

	if (started) {
        contract.methods.getBalance().call().then(balance => {
            contractBalance = balance;
            var amt = web3.utils.fromWei(balance);
            $('#contract-balance').html(roundNum(amt));
        }).catch((err) => {
            console.log(err);
        });

        contract.methods.getSiteInfo().call().then(result => {
            var staked = web3.utils.fromWei(result._totalStaked);
            $('#total-staked').html(roundNum(staked));
            $('#total-players').html(result._totalDeposits);
            var ref = web3.utils.fromWei(result._totalRefBonus);
            if (ref > 0) {
                ref = roundNum(ref);
				$("#total-ref").html(`${ref} BNB`);
            } else {
                $('#total-ref').html(`0 BNB`);
            }
        }).catch((err) => {
            console.log(err);
        });
    }

	// BNB in wallet
	web3.eth.getBalance(currentAddr).then(userBalance => {
		usrBal = userBalance;
		var amt = web3.utils.fromWei(userBalance);
		$("#user-balance").html(roundNum(amt));
	}).catch((err) => {
		console.log(err);
	});

	contract.methods.getUserInfo(currentAddr).call().then(user => {
        var initialDeposit = user._initialDeposit;            // Initially Deposit
        var userDeposit = user._userDeposit;				  // Total Compounded Deposit including Initial Deposit
        var miners = user._miners;							  // Your miners
		var lastHatch = user._lastHatch;				      // last time sold(ate beans) or hatched(re-baked) or bought. Seconds passed since last epoch
        var totalWithdrawn = user._totalWithdrawn;			  // TotalWithdrawn
		var farmerCompoundCount = user._farmerCompoundCount;  // total # of times I compounded
		var referralsCount = user._referralsCount;            // how many people i referred
		var refRewardsinBNB = user._refRewardsinBNB;          // Total BNB paid to me as Referrals
		var lastWithdrawTime = user._lastWithdrawTime;
        console.log('last withdraw time = ' + lastWithdrawTime)

        var now = new Date().getTime() / 1000;   //js time is in milliseconds. seconds since last epoch

        console.log('farmerCompoundCount = ' + farmerCompoundCount)

		if (miners > 0) {
			var rewardsCutoffDiff = (+lastHatch + +rewardsCutoffTime) - now;
			if (rewardsCutoffDiff > 0) {    // 24 hours rewards still accumulating
				setRewardsCutoffTimer(lastHatch);
			} else {
				$("#sell-timer").html("");
				$("#sellBtn").attr('disabled', false);
			}
			$("#compoundBtn").attr('disabled', false);
		}

        if (miners > 0) {
            $("#your-miners").html(parseFloat(miners).toLocaleString("en-US"));
            contract.methods.userRewards(currentAddr).call().then(function (earnings) { //same as userRewards. Will give you current accumulated rewards right now
                var bnbMined = readableBNB(earnings, 4)
				$("#mined").html(`${bnbMined} BNB`);
            }).catch((err) => {
                console.log('userRewards', err);
                throw err;
            });
        } else {
			$("#mined").html(`0 BNB`);
        }

		if (refRewardsinBNB > 0) {
			var refBNB = refRewardsinBNB / 1e18;
			refBNB = parseFloat((refBNB).toFixed(4));

            $("#ref-rewards-bnb").html(refBNB);
            $('#ref-count').html(referralsCount);
        } else {
            $("#ref-rewards-bnb").html("0");
            $('#ref-count').html('0');
        }

		setInitialDeposit(initialDeposit);
        setTotalDeposit(userDeposit);
        setTotalWithdrawn(totalWithdrawn);

        if (miners > 0) {
            var eggsPerDay = 24*60*60 * miners ;
            contract.methods.calculateEggSellForYield(eggsPerDay, web3.utils.toWei('0')).call().then(earnings => {
                var eggsBNB = readableBNB(earnings, 4)
                $("#eggs-per-day").html(eggsBNB);
            }).catch((err) => {
                console.log('calculateEggSellForYield', err);
                throw err;
            });
        }

    }).catch((err) => {
        console.log('getUserInfo', err);
    });

	updateBuyPrice();
    console.log('Done refreshing data...')
}

function copyRef() {
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val($('#reflink').text()).select();
    document.execCommand("copy");
    $temp.remove();
    $("#copied").html("<i class='ri-checkbox-circle-line'> copied!</i>").fadeOut('10000ms')
}

function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) { return pair[1]; }
    }
    return (false);
}

function setInitialDeposit(initialDeposit) {
    totalDeposits = initialDeposit;
    var initialBNB = readableBNB(initialDeposit, 2);
    $("#initial-deposit").html(initialBNB);
}

function setTotalDeposit(totalDeposit) {
    var totalBNB = readableBNB(totalDeposit, 2);
    $("#total-deposit").html(totalBNB);
}

function setTotalWithdrawn(totalWithdrawn) {
    var totalBNB = readableBNB(totalWithdrawn, 2);
    $("#total-withdrawn").html(totalBNB);
}

let y;
function setRewardsCutoffTimer(lastHatch) {
	$("#sellBtn").attr('disabled', true);
    var time = new Date().getTime();
    var cutoff = (+lastHatch + +rewardsCutoffTime) - (+time/1000);  // time remaining for 24 hour rewards to accumulate
    var countDownDate = new Date(+time + +cutoff * 1000).getTime();

    clearInterval(y)
    y = setInterval(function() {
        var currentTime = new Date().getTime();
        // Find the distance between now and the count down date
        var distance = countDownDate - currentTime;

        // Time calculations for days, hours, minutes and seconds
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60) + days*24); // seconds in a day remaining/seconds in an hour = hours remaining + days*24
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        if (hours < 10) { hours = '0' + hours; }
        if (minutes < 10) { minutes = '0' + minutes; }
        if (seconds < 10) { seconds = '0' + seconds; }

        $("#sell-timer").html(`${hours}:${minutes}:${seconds}`);

        // If the count down is finished, write some text
        if (distance < 0) {
            clearInterval(y);
            $("#sell-timer").html("");
			$("#sellBtn").attr('disabled', false);
        }
    }, 1000, 1);
}

function updateBuyPrice(bnb) {
    if (bnb == undefined || !bnb) {
        bnb = document.getElementById('bnb-deposit').value;
    }
    contract.methods.calculateEggBuyWithBonus(web3.utils.toWei(bnb), currentAddr).call({ from: currentAddr}).then(eggs => {
		var minersFormatted = parseFloat(eggs/eggstohatch1Miner).toFixed(0);
		minersFormatted = parseFloat(minersFormatted).toLocaleString("en-US");
        $("#eggs-to-buy").html(minersFormatted);
    });
}

function buyBlocks(){
    var spendDoc = document.getElementById('bnb-deposit')
    var bnb = spendDoc.value;

    var amt = web3.utils.toWei(bnb);

    if(+amt > usrBal) {
		alert("you do not have " + bnb + " BNB in your wallet");
        return
    }

    let ref = getQueryVariable('ref');

	let f = ref;

    if (bnb > 0) {
        if (!web3.utils.isAddress(ref)) { ref = currentAddr }
        contract.methods.buyEggs(ref).send({ from: currentAddr, value: amt }).then(result => {
            refreshData()
        }).catch((err) => {
            console.log(err)
        });
    }

}

function compound(){
    if (canSell) {
        canSell = false;
        console.log(currentAddr)
        contract.methods.hatchEggs().send({ from: currentAddr}).then(result => {
            refreshData()
        }).catch((err) => {
            console.log(err)
        });
        setTimeout(function(){
            canSell = true;
        },10000);
    } else {
        console.log('Cannot hatch yet...')
    }
}

function sellRewards(){
    if (canSell) {
        canSell = false;
        console.log('Selling');
        contract.methods.sellEggs().send({ from: currentAddr }).then(result => {
            refreshData()
        }).catch((err) => {
            console.log(err)
        });
        setTimeout(function(){
            canSell = true;
        },10000);
    } else {
        console.log('Cannot sell yet...')
    }
}

function setBNBPrice(bnbPrice) {
	const obj = JSON.parse(bnbPrice);
	if(obj && obj.binancecoin.usd){
		BNBPrice = obj.binancecoin.usd; // Getting BNB Price via CoinGecko
		setBlocksPerThousandDollars() ;
	} else {
		// Fallback to getting BNB Price via Chainlink BSC Mainnet.
		// https://docs.bnbchain.org/docs/link. https://docs.bnbchain.org/docs/rpc/
		/* priceFeedBNB.methods.latestRoundData().call()
		.then((roundData) => {
			if(roundData && roundData.answer) {
				BNBPrice = parseFloat((roundData.answer/1e8).toFixed(2));
				setBlocksPerThousandDollars();
			}
			console.log("Latest Round Data", roundData)
		}).catch((err) => {
			console.log('priceFeedBNB', err);
		}); */
	}
}

function setBlocksPerThousandDollars() {
	noOfBNBPerThousandDollars = parseFloat((1000/BNBPrice).toFixed(4)).toString();

	/** How many miners and eggs per day user will recieve for XX BNB deposit **/
	contract.methods.getEggsYield(web3.utils.toWei(noOfBNBPerThousandDollars)).call().then(result => {
		var miners = result[0];
		var bnb = result[1];
		var amt = readableBNB(bnb, 4);

		var minersFormatted = parseFloat(miners).toLocaleString("en-US");
		$("#miners-per-thousand").html(minersFormatted);
	}).catch((err) => {
		console.log(err);
	});
}


function getBNBPrice(callback) {
	const url = "https://api.coingecko.com/api/v3/simple/price?ids=binancecoin,usd&vs_currencies=usd";
	httpGetAsync(url,callback);
}

function httpGetAsync(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
		if (xmlHttp.readyState == 4) {
			var status = xmlHttp.status;
			if (status === 0 || (status >= 200 && status < 400)) {
				callback(xmlHttp.responseText);
			} else {
				callback(null);
			}
		}
    }
    xmlHttp.open("GET", theUrl, true);
    xmlHttp.send(null);
}

function readableBNB(amount, decimals) {  // WEI to BNB
    var num = amount / 1e18;
    if (num < 1) {
        decimals = 6
    }
    return parseFloat((num).toFixed(decimals));
}
