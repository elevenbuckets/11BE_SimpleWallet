"use strict";

// Third-parties
import Reflux from 'reflux';
import React from 'react';
import Dropdown from 'react-dropdown';
import { remote } from 'electron';

// Reflux store
import WalletStates from "../store/WalletStates";

// Reflux action
import WalletActions from '../action/WalletActions';

// Views
import TxObjects from './TxObjects';

// Utils
import { createCanvasWithAddress } from "../util/Utils";

class Transfer extends Reflux.Component {
  constructor(props) {
    super(props);
    this.store = WalletStates;
    this.state = { recipient: '' };
    this.wallet = remote.getGlobal('wallet');
  }

  handleSend = (addr, type, amount, gasNumber) => {
    WalletActions.send(this.state.address, addr, type, amount, gasNumber);
  }

  handleChange = (event) => {
    let addr = event.target.value;

    try {
      if ( 
        this.wallet.isAddress(addr) === true
	  && (this.wallet.toAddress(addr) == addr || this.wallet.toChecksumAddress(addr) == addr)
      ) {
    	      console.log('got addr: ' + addr);
	      addr = this.wallet.toAddress(addr);
              createCanvasWithAddress(this.refs.canvas, addr);
      } else {
        this.refs.canvas.getContext('2d').clearRect(0, 0, this.refs.canvas.width, this.refs.canvas.height);
      }
    } catch (err) {
      this.refs.canvas.getContext('2d').clearRect(0, 0, this.refs.canvas.width, this.refs.canvas.height);
    }

    this.setState({ recipient: addr });
  }

  render = () => {
    return (
      <div className="item TransferLayout">
        <label className="item TransferTo">
          Recipient:
          <input size={52} type='text' style=
          {{
            backgroundColor: "rgba(255,255,255,0)",
            border: "1px solid white",
            color: "white",
            fontWeight: "bold",
            fontSize: "24px",
            fontFamily: "monospace",
	    textAlign: "center",
	    marginLeft: "50px"
          }} onChange={this.handleChange} 
                value={this.state.recipient} placeholder="Ethereum Address" />
        </label>

        <canvas className="item ToAvatar" ref='canvas' width="96%" height="96%" style=
            {
              {
                border: "4px solid rgba(255,255,255,0.73)",
                borderRadius: "25em"
              }
            }
        />
        <TxObjects selected_token_name={this.state.selected_token_name} send_button_value="Send"
          handleSend={this.handleSend} recipient={this.state.recipient}/>
      </div>
    );
  }
}

export default Transfer;
