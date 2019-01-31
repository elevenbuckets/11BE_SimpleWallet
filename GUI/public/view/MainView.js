'use strict';

// Major third-party modules

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _reflux = require('reflux');

var _reflux2 = _interopRequireDefault(_reflux);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _WalletStates = require('../store/WalletStates');

var _WalletStates2 = _interopRequireDefault(_WalletStates);

var _WalletActions = require('../action/WalletActions');

var _WalletActions2 = _interopRequireDefault(_WalletActions);

var _Transfer = require('./Transfer');

var _Transfer2 = _interopRequireDefault(_Transfer);

var _Accounts = require('./Accounts');

var _Accounts2 = _interopRequireDefault(_Accounts);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Views


// Reflux store
class MainView extends _reflux2.default.Component {
	constructor(props) {
		super(props);

		this.updateState = (key, e) => {
			this.setState({ [key]: e.target.value });
		};

		this.passAccRef = () => {
			return _reactDom2.default.findDOMNode(this.refs.Accounts).firstChild;
		};

		this.store = _WalletStates2.default;
	}

	render() {
		console.log("In MainView render(); syncInProgress = " + this.state.syncInProgress);

		if (this.state.connected === false) {
			document.body.style.background = "rgb(17, 31, 47)";
			return _react2.default.createElement(
				'div',
				{ className: 'container locked', style: { background: "rgb(17, 31, 47)" } },
				_react2.default.createElement(
					'div',
					{ className: 'item list', style: { background: "none" } },
					_react2.default.createElement(
						'div',
						{ style: { border: "2px solid white", padding: "40px", textAlign: "center" } },
						_react2.default.createElement('div', { className: 'loader syncpage' }),
						_react2.default.createElement('br', null),
						_react2.default.createElement(
							'p',
							{ style: { alignSelf: "flex-end", fontSize: "24px", marginTop: "10px" } },
							'Lost local Ethereum node connection ...'
						)
					)
				)
			);
		} else if (this.state.wait4peers === true) {
			document.body.style.background = "rgb(17, 31, 47)";
			return _react2.default.createElement(
				'div',
				{ className: 'container locked', style: { background: "rgb(17, 31, 47)" } },
				_react2.default.createElement(
					'div',
					{ className: 'item list', style: { background: "none" } },
					_react2.default.createElement(
						'div',
						{ style: { border: "2px solid white", padding: "40px", textAlign: "center" } },
						_react2.default.createElement('div', { className: 'loader syncpage' }),
						_react2.default.createElement('br', null),
						_react2.default.createElement(
							'p',
							{ style: { alignSelf: "flex-end", fontSize: "24px", marginTop: "10px" } },
							'Awaiting incomming blocks from peers ...'
						)
					)
				)
			);
		} else if (this.state.syncInProgress === true) {
			document.body.style.background = "linear-gradient(-180deg, rgb(17, 31, 47), rgb(24, 156, 195))";
			return _react2.default.createElement(
				'div',
				{ className: 'container locked', style: { background: "none" } },
				_react2.default.createElement(
					'div',
					{ className: 'item list', style: { background: "none" } },
					_react2.default.createElement(
						'div',
						{ style: { border: "2px solid white", padding: "40px", textAlign: "center" } },
						_react2.default.createElement('div', { className: 'loader' }),
						_react2.default.createElement('br', null),
						_react2.default.createElement(
							'p',
							{ style: { alignSelf: "flex-end", fontSize: "24px", marginTop: "10px" } },
							'Block syncing in progress ',
							this.state.blockHeight,
							' / ',
							this.state.highestBlock,
							' ...'
						)
					)
				)
			);
		} else {
			document.body.style.background = "rgb(11, 41, 57)";
			return _react2.default.createElement(
				'div',
				{ className: 'item container unlocked' },
				_react2.default.createElement(_Accounts2.default, { ref: 'Accounts' }),
				_react2.default.createElement(_Transfer2.default, null)
			);
		}
	}
}

// Reflux actions
exports.default = MainView;