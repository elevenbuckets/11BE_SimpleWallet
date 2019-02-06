"use strict";

// Third-parties
import Reflux from 'reflux';
import React from 'react';
import Dropdown from 'react-dropdown';

// Reflux store
import WalletStates from "../store/WalletStates";

// Reflux components
class TxObjects extends Reflux.Component {
  constructor(props) {
    super(props);
    this.store = WalletStates;
    // TODO: figure out why need this bind but Transfer.js does not 
    this.handleChangeAmount = this.handleChangeAmount.bind(this);
    this.handleChangeGas = this.handleChangeGas.bind(this);
    this.handleSend = this.handleSend.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  handleChangeAmount(event) {
    console.log('got event: ' + event.target.value);

    let value = event.target.value;
    if (isNaN(value)) {
      this.openModal("Please enter a number!")
      event.target.value = value.slice(0, -1);
    } else {
      let amount = event.target.value;

      console.log('got amount: ' + amount);
      this.setState(() => { return { amount: amount } });
    }
  }

  handleChangeGas(event) {
    console.log('got event: ' + event.target.value);

    let value = event.target.value;
    if (isNaN(value)) {
      this.openModal("Please enter a number!")
      event.target.value = value.slice(0, -1);
    } else {
      let gas = event.target.value;
      console.log('got gas: ' + gas);
      this.setState(() => { return { gas: gas } });
    }
  }

  handleSend(event) {
    console.log("sending event" + event);
    let type = this.state.selected_token_name ? this.state.selected_token_name : "ETH";
    this.props.handleSend(this.props.recipient, type, this.state.amount, this.state.gas);
  }

  handleClick() {
    console.log("in handle click change token name function ....");
    if (this.state.address === null) return this.setState({selected_token_name: ''});

    let list = Object.keys(this.state.balances).sort().filter((i) => {if (this.state.balances[i] > 0) return i});

    if (list.length === 0) return this.setState({selected_token_name: ''});

    let symbol = this.state.selected_token_name === '' ? 'ETH' : this.state.selected_token_name;
    let index = list.indexOf(symbol);
    let ans = index === (list.length - 1) ? list[0] : list[index+1];
    this.setState({selected_token_name: ans});
  }

  render = () => {
    let sendkind = this.state.selected_token_name !== '' ? this.state.selected_token_name : 'ETH';

    return (
      <form className="item TxObj">
        <table style={{margin: "0px"}}>
          <tbody>
            <tr>
              <td width='20%' style={{ whiteSpace: 'nowrap' }}>
                Types<br /><div style=
                {{ 
                  textAlign: 'center', 
                  width: "3.5em", 
                  margin: "10px 40px 0 75px", 
                  padding: "0px", 
                  border: "1px solid white",
                  cursor: "pointer"
                }} onClick={this.handleClick}>{sendkind}</div>
              </td>
              <td width='70%'>
                Amount<br /><div style={{ marginTop: "10px", marginLeft: "15px" }}><input type='text' size='32' style=
                {{
                  backgroundColor: "rgba(255,255,255,0)",
                  border: "1px solid white",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "24px",
                  width: "300px",
                  textAlign: "right",
                  paddingRight: "12px",
		  marginLeft: "76px"
                }} onChange={this.handleChangeAmount} /></div>
              </td>
              <td width='10%'>
		<input type="button" className="button" style={{margin: "40px 0 0 75px", fontSize: "22px"}} value={this.props.send_button_value} onClick={this.handleSend} />
	      </td>
            </tr>
          </tbody>
        </table>
      </form>
    );
  }
}

export default TxObjects;
