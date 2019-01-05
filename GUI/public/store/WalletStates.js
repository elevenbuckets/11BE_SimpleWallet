'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _reflux = require('reflux');

var _reflux2 = _interopRequireDefault(_reflux);

var _Utils = require('../util/Utils');

var _WalletActions = require('../action/WalletActions');

var _WalletActions2 = _interopRequireDefault(_WalletActions);

var _loopasync = require('loopasync');

var _loopasync2 = _interopRequireDefault(_loopasync);

var _electron = require('electron');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class WalletStates extends _reflux2.default.Store {
	constructor() {
		super();

		this.state = {
			tokenBalance: [],
			passManaged: {},
			accounts: [],
			lesDelay: false,
			blockHeight: null,
			blockTime: null,
			highestBlock: 0,
			gasPrice: 0,
			address: null,
			selected_token_name: '',
			balances: { 'ETH': 0 },
			gasPriceOption: "high",
			customGasPrice: null,
			gasPriceInfo: null,
			tokenList: [],
			showingBlock: 0,
			syncInProgress: false
		};

		this.listenables = _WalletActions2.default;
		this.wallet = _electron.remote.getGlobal('wallet');

		// Token info initialization, when updating watch tokens, do the same below
		this.wallet.watchTokens().then(() => {
			return this.wallet.syncTokenInfo();
		}).then(() => {
			this.setState({ tokenList: this.wallet.TokenList });
		});

		this.wallet.client.subscribe('ethstats');
		this.setState({ gasPrice: this.wallet.configs.defaultGasPrice });

		this.addressUpdate = () => {
			if (this.state.lesDelay === true) return; // do nothing, since statusUpdate is doing it already
			console.log(`DEBUG: address Update is called`);
			this._count = 0;
			this._target = this.state.tokenList.length + 1;
			this._balances = { 'ETH': 0 };
			this._tokenBalance = [];

			this.wallet.linkAccount(this.state.address).then(r => {
				this.setState({ passManaged: { [this.state.address]: r.result } });
				(0, _loopasync2.default)(['ETH', ...this.state.tokenList], _WalletActions2.default.statusUpdate, 1);
			}).catch(err => {
				console.trace(err);
				//this.setState({address: null});
				//WalletActions.finishUpdate();
			});
		};

		this.wallet.handleStats = stats => {
			this.wallet.allAccounts().then(addrs => {
				if (addrs.length !== this.state.accounts.length) this.setState({ accounts: addrs });

				if (this.state.address !== null) {
					return this.addressUpdate();
				} else {
					this.setState({ balances: { 'ETH': 0 }, selected_token_name: '' });
				}
			});

			this.wallet.gasPriceEst().then(est => {
				this.setState(_extends({}, stats, { gasPriceInfo: est, gasPrice: est[this.state.gasPriceOption] }));
			});
		};

		this.wallet.client.on('ethstats', this.wallet.handleStats);

		this.wallet.watchTokens().then(rc => {
			this.wallet.syncTokenInfo().then(info => {
				this.setState({ tokenList: this.wallet.TokenList });
			});
		});

		this._count;
		this._target;
		this.retryTimer;
		this.wallet.handleStats({}); // Init
	}

	// Reflux Action responses
	onStartUpdate(address, canvas) {
		console.log(`DEBUG: calling start Update Reflux Action......`);

		clearTimeout(this.retryTimer);this.retryTimer = undefined;

		if (this.state.showingBlock != 0 && this.state.showingBlock < this.state.blockHeight) {
			console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!retrying status update soon...");
			this.setState({ address: address, lesDelay: true, tokenBalance: [], showingBlock: 0 }); // is this correct ???
			(0, _Utils.createCanvasWithAddress)(canvas, this.state.address);
			this.retryTimer = setTimeout(() => {
				return _WalletActions2.default.startUpdate(address, canvas);
			}, 997);
			return;
		}

		this.setState({ showingBlock: this.state.blockHeight });
		this._count = 0;
		this._target = this.state.tokenList.length + 1;
		this._balances = { 'ETH': 0 };
		this._tokenBalance = [];
		let stage = Promise.resolve();

		stage = stage.then(() => {
			this.setState({ address: address, lesDelay: true, tokenBalance: [] });
			(0, _Utils.createCanvasWithAddress)(canvas, this.state.address);
			return this.wallet.linkAccount(address); // define app specific 'userWallet' as class attribute if returns 'true'
		});

		stage = stage.then(r => {
			this.setState({ passManaged: { [this.state.address]: r.result } });
			(0, _loopasync2.default)(['ETH', ...this.state.tokenList], _WalletActions2.default.statusUpdate, 1);
		}).catch(err => {
			console.trace(err);
			//this.setState({address: null});
			//createCanvasWithAddress(canvas, '0x');
			//WalletActions.finishUpdate();
		});
	}

	onStatusUpdate(symbol) {
		if (symbol != 'ETH') {
			this.wallet.addrTokenBalance(symbol)(this.state.address).then(b => {
				let b9 = Number(this.wallet.toEth(b, this.wallet.TokenInfo[symbol].decimals).toFixed(9));
				if (b9 > 0) {
					let stats = { [symbol]: b9 };
					let a = [...this._tokenBalance, `${symbol}: ${b9}`];
					this._balances = _extends({}, this._balances, stats);
					this._tokenBalance = [...new Set(a)];
				}
				this._count++;
				if (this._count == this._target) _WalletActions2.default.finishUpdate();
			});
		} else {
			this.wallet.addrEtherBalance(this.state.address).then(b => {
				let b9 = Number(this.wallet.toEth(b, 18).toFixed(9));
				let stats = { [symbol]: b9 };
				this._balances = _extends({}, this._balances, stats);
				this._count++;
				if (this._count == this._target) _WalletActions2.default.finishUpdate();
			});
		}
	}

	onFinishUpdate() {
		this.setState({ lesDelay: false, balances: this._balances, tokenBalance: this._tokenBalance, showingBlock: this.state.blockHeight });
		this._balances = { 'ETH': 0 };
		this._tokenBalance = [];
	}

	onSelectedTokenUpdate(value) {
		this.setState({ selected_token_name: value });
	}

	onSend(fromAddr, addr, type, amount) {
		if (fromAddr !== this.wallet.userWallet) {
			console.log("no password");return;
		}
		let weiAmount = type === 'ETH' ? this.wallet.toWei(amount, 18).toString() : this.wallet.toWei(amount, this.wallet.TokenInfo[symbol].decimals).toString();
		console.log(`DEBUG: amount in wei: ${weiAmount}`);
		this.wallet.sendTx(type)(addr, weiAmount).catch(err => {
			console.trace(err);
		});
	}
}

exports.default = WalletStates;