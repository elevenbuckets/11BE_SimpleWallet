"use strict";

// Third-parties
import Reflux from 'reflux';
import React from 'react';
import Dropdown from 'react-dropdown';

// Reflux store
import WalletStates from "../store/WalletStates";

// Reflux action
import WalletActions from '../action/WalletActions';

// Reflux components 
class GenSheets extends Reflux.Component {
  constructor(props) {
    super(props);
    this.store = WalletStates;
    this.state = {
      tokenBalances: [],
    }
  }


  componentDidUpdate(prevProps, prevState) {
    if (this.state.address != prevState.address && this.state.tokenBalance.length == 0) {
	    WalletActions.selectedTokenUpdate('');
    }
  }

  handleChange = (event) => {
    console.log("event.value in GenSheets handleChange is " + event.value);
    let symbol = event.value.substring(0, event.value.indexOf(':'));
    console.log("Symbol in GenSheets handleChange is " + symbol);
    if (symbol != this.state.selected_token_name) WalletActions.selectedTokenUpdate(symbol);
  }

  // Should NOT change the original array content
  // only works with set (an array with no repeated element)
  ArrayRest = (array, element) => {
	let ans = [...array];
	ans.splice(array.indexOf(element),1);
	return ans;
  }

  render = () => {
    return (
      <div className="quickbalance">
          <div className="item teth"><p>ETHER</p></div>
          <div className="item beth">
           { this.state.lesDelay === true 
            ? <p style={{color: "white", fontSize: "22px"}}><span className="dot dotOne">-</span><span className="dot dotTwo">-</span><span className="dot dotThree">-</span></p> 
            : <p style={{color: "white", fontSize: "22px"}}>{this.state.balances['ETH']}</p> }
          </div>
          <div className="item terc20">
            <Dropdown disabled={this.state.lesDelay} 
	    options={ this.state.selected_token_name != '' 
		? this.ArrayRest(this.state.tokenBalance, `${this.state.selected_token_name}: ${this.state.balances[this.state.selected_token_name]}`) 
	        : this.state.tokenBalance } onChange={this.handleChange} value={this.state.selected_token_name} placeholder='ERC20'/>
	  </div>
	  <div className="item berc20">
          { this.state.lesDelay === true
            ? <p style={{fontSize: "22px"}}><span className="dot dotOne">-</span><span className="dot dotTwo">-</span><span className="dot dotThree">-</span></p>
            : <p style={{fontSize: '22px'}}>{ this.state.selected_token_name !== '' ? this.state.balances[this.state.selected_token_name] : this.state.tokenBalance.length }</p>
          }
	  </div>
      </div>
    );
  }
}

export default GenSheets;
