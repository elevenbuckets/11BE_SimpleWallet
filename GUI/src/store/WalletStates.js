import Reflux from 'reflux';
import { createCanvasWithAddress } from "../util/Utils";
import WalletActions from '../action/WalletActions';
import loopasync from 'loopasync';
import { remote } from 'electron';

class WalletStates extends Reflux.Store {
	constructor() {
		super();

		this.state = 
		{
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
		}

		this.listenables = WalletActions;
		this.wallet = remote.getGlobal('wallet');

		// Token info initialization, when updating watch tokens, do the same below
		this.wallet.watchTokens().then(() => {
			return this.wallet.syncTokenInfo();
		}).then(() => {
			this.setState({tokenList: this.wallet.TokenList})
		})

		this.wallet.client.subscribe('ethstats');
		this.setState({gasPrice: this.wallet.configs.defaultGasPrice});

		this.addressUpdate = () => {
			if (this.state.lesDelay === true) return; // do nothing, since statusUpdate is doing it already
			console.log(`DEBUG: address Update is called`);
			this._count = 0;
	        	this._target = this.state.tokenList.length + 1;
	        	this._balances = {'ETH': 0 };
	        	this._tokenBalance = [];
	
			this.wallet.linkAccount(this.state.address) 
			.then((r) => {
				this.setState({passManaged: {[this.state.address]: r.result}});
				loopasync(['ETH', ...this.state.tokenList], WalletActions.statusUpdate, 1);
			})
			.catch((err) => {
				console.trace(err);
					//this.setState({address: null});
					//WalletActions.finishUpdate();
			})
		}

		this.wallet.handleStats = (stats) => 
		{
			this.wallet.allAccounts().then((addrs) => {
				if (addrs.length !== this.state.accounts.length) this.setState({ accounts: addrs });

            			if (this.state.address !== null) {
                    			return this.addressUpdate();
            			} else {
                    			this.setState({balances: {'ETH': 0 }, selected_token_name: '' });
            			}
			});

			this.wallet.gasPriceEst().then((est) => {
				this.setState({...stats, gasPriceInfo: est, gasPrice: est[this.state.gasPriceOption]}); 
			})
		}

		this.wallet.client.on('ethstats', this.wallet.handleStats);

		this.wallet.watchTokens().then((rc) => {
			this.wallet.syncTokenInfo().then((info) => {
				this.setState({tokenList: this.wallet.TokenList});
			})
		})

		this._count;
        	this._target;
		this.retryTimer;
		this.wallet.handleStats({}); // Init
	}

	// Reflux Action responses
	onStartUpdate(address, canvas) {
		console.log(`DEBUG: calling start Update Reflux Action......`);
		
		clearTimeout(this.retryTimer); this.retryTimer = undefined;

	        if (this.state.showingBlock != 0 && this.state.showingBlock < this.state.blockHeight) {
	                console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!retrying status update soon...")
	                this.setState({ address: address, lesDelay: true, tokenBalance: [], showingBlock: 0 }); // is this correct ???
	                createCanvasWithAddress(canvas, this.state.address);
	                this.retryTimer = setTimeout(() => { return WalletActions.startUpdate(address, canvas) }, 997);
	                return
	        }

		this.setState({showingBlock: this.state.blockHeight});
		this._count = 0;
        	this._target = this.state.tokenList.length + 1;
        	this._balances = {'ETH': 0 };
        	this._tokenBalance = [];
        	let stage = Promise.resolve();

        	stage = stage.then(() => {
                	this.setState({ address: address, lesDelay: true, tokenBalance: [] });
                	createCanvasWithAddress(canvas, this.state.address);
			return this.wallet.linkAccount(address); // define app specific 'userWallet' as class attribute if returns 'true'
        	})

		stage = stage.then((r) => {
			this.setState({passManaged: {[this.state.address]: r.result} });
			loopasync(['ETH', ...this.state.tokenList], WalletActions.statusUpdate, 1);
		})
		.catch((err) => {
			console.trace(err);
			//this.setState({address: null});
                	//createCanvasWithAddress(canvas, '0x');
			//WalletActions.finishUpdate();
		})
	}

	onStatusUpdate(symbol) {
	        if (symbol != 'ETH') {
	           	this.wallet.addrTokenBalance(symbol)(this.state.address).then((b) => {
				let b9 = Number(this.wallet.toEth(b, this.wallet.TokenInfo[symbol].decimals).toFixed(9));
				if (b9 > 0) {
					let stats = {[symbol]: b9};
	                		let a = [ ...this._tokenBalance, `${symbol}: ${b9}`];
	                		this._balances = { ...this._balances, ...stats };
	                		this._tokenBalance = [ ...new Set(a)];
				}
	        		this._count++;
	        		if (this._count == this._target) WalletActions.finishUpdate();
		   	})
	        } else {
	           	this.wallet.addrEtherBalance(this.state.address).then((b) => {
				let b9 = Number(this.wallet.toEth(b, 18).toFixed(9));
	        		let stats = {[symbol]: b9};
	                	this._balances = { ...this._balances, ...stats };
	        		this._count++;
	        		if (this._count == this._target) WalletActions.finishUpdate();
		   	})
	        }

    	}

	onFinishUpdate() {
        	this.setState({lesDelay: false, balances: this._balances, tokenBalance: this._tokenBalance, showingBlock: this.state.blockHeight });
        	this._balances = {'ETH': 0 };
        	this._tokenBalance = [];
    	}

	onSelectedTokenUpdate(value) {
        	this.setState({ selected_token_name: value });
        }
}

export default WalletStates;
