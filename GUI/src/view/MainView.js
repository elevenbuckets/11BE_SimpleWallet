'use strict';

// Major third-party modules
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Reflux from 'reflux';
import path from 'path';
import os from 'os';

// Reflux store
import WalletStates from '../store/WalletStates';

// Reflux actions
import WalletActions from '../action/WalletActions';

// Views
import Transfer from './Transfer';
import Accounts from './Accounts';

class MainView extends Reflux.Component {
    constructor(props) {
        super(props);
        this.store = WalletStates;
    }

    updateState = (key, e) => {
        this.setState({ [key]: e.target.value });
    }

    passAccRef = () => {
	return ReactDOM.findDOMNode(this.refs.Accounts).firstChild;
    }

    render() {
        console.log("In MainView render(); syncInProgress = " + this.state.syncInProgress);

	if ( this.state.syncInProgress === true ) 
        {
	    if (   
                   this.state.highestBlock === 0 
                || this.state.highestBlock === this.state.blockHeight ) 
            {
	            document.body.style.background = "rgb(17, 31, 47)";
		    return (
	                <div className="container locked" style={{ background: "rgb(17, 31, 47)"}}>
	                    <div className="item list" style={{ background: "none" }}>
	                        <div style={{ border: "2px solid white", padding: "40px", textAlign: "center" }}>
				    <div className="loader syncpage"></div><br/>
	                            <p style={{ alignSelf: "flex-end", fontSize: "24px", marginTop: "10px" }}>
	                                Awaiting incomming blocks from peers ...
				    </p>
	                        </div>
	                    </div>
	                </div>
		    );
	    } else {
	            document.body.style.background = "linear-gradient(-180deg, rgb(17, 31, 47), rgb(24, 156, 195))";
		    return (
	                <div className="container locked" style={{ background: "none"}}>
	                    <div className="item list" style={{ background: "none" }}>
	                        <div style={{ border: "2px solid white", padding: "40px", textAlign: "center" }}>
				    <div className="loader"></div><br/>
	                            <p style={{ alignSelf: "flex-end", fontSize: "24px", marginTop: "10px" }}>
	                                Block syncing in progress {this.state.blockHeight} / {this.state.highestBlock} ...
				    </p>
	                        </div>
	                    </div>
	                </div>
		    );
	    }
        } else if ( this.state.syncInProgress === false ) {
            document.body.style.background = "rgb(11, 41, 57)";
            return (
                <div className="container unlocked">
                    <Accounts ref="Accounts"/>
		    <Transfer />
                </div>
            )
        }
    }
}

export default MainView;

