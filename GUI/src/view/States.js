'use strict';

// Third-parties
import Reflux from 'reflux';
import React from 'react';
import { remote } from 'electron';

// Reflux store
import WalletStates from "../store/WalletStates";

// Reflux action
import WalletActions from '../action/WalletActions'

// constants utilities
import Constants from '../util/Constants';

class States extends Reflux.Component {
    constructor(props) {
        super(props);
        this.store = WalletStates;
        this.wallet = remote.getGlobal('wallet');

        this.state = {
            unixTime: 123213,
            localTime: null,
        }

        this.getDashInfo = () => 
	{
        	this.setState(() => {
            		return { localTime: new Date(), unixTime: Date.now() / 1000 };
        	})
    	}
    }

    componentWillMount() {
        super.componentWillMount();
        this.getDashInfo();
    }

    componentDidMount() {
        this.timer = setInterval(this.getDashInfo, 1000);
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        clearInterval(this.timer);
    }

    render = () => {
    	return (
                <div className="state slocked">
                    <div className="item tblockheight"><p>Block Height</p></div>
                    <div className="item tblockstamp"><p>Block Stamp</p></div>
                    <div className="item tlocaltime"><p>Local Time</p></div>
                    <div className="item tgasprice"><p>Gas Price</p></div>
                    <div className="item blockheight"><p id="cbh" >{this.state.blockHeight}</p></div>
                    <div className="item blockstamp"><p id="cbs">{this.state.blockTime}</p></div>
                    <div className="item localtime"><p id="clt">{String(this.state.localTime).substring(0,24)}</p></div>
                    <div className="item gasprice"><p id="cgp">{this.wallet.toEth(this.state.gasPrice, 9).toString()}</p></div>
                </div>
        );
    }
}

export default States;
