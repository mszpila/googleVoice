import React, { Component } from "react"
import './App.css';
import Web3 from 'web3';
import ToggleContract from './ethereum/build/contracts/Toggle.json';

import mic from './mic-icon.svg';
import micanimate from './loading-minified.gif';
import audioFX from './google beep.mp3';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
const recognition = new SpeechRecognition()

var synth = new SpeechSynthesisUtterance();
synth.text = 'Hello World';
synth.lang = 'en-US';
synth.rate = 1.2;

const audio = new Audio(audioFX);

recognition.continous = true
recognition.interimResults = true
recognition.lang = 'en-US' //'pl-PL'

class App extends Component {

  constructor() {
    super()
    this.state = {
      listening: true,
      result: '',
      img: mic,
      lightToggle: false,
      account: '',
      contract: null
    }
    // this.toggleListen = this.toggleListen.bind(this)
    // this.handleListen = this.handleListen.bind(this)
  }

  async checkingEthereum() {
    // if (window.ethereum) {
    //   // setting the provider for web3.js inside Web3(provider); window.ethereum will look for Metamask
    //   // there are many ways to connect to Metamask https://web3js.readthedocs.io/en/v1.2.0/web3.html#id4
    //   // wait to enable Metamask for this site
    //   await window.ethereum.enable()
    // } else {
    //     // no Metamask installed
    //     window.alert('Non-Ethereum browser detected. Consider installing MetaMask.')
    const infuraKey = process.env.INFURA_KEY;
    window.web3 = new Web3(`https://ropsten.infura.io/v3/${infuraKey}`)
  }

  async loadInfo() {
    const web3 = window.web3;
    const privKey = process.env.PRIVATE_KEY;
    const account = web3.eth.accounts.privateKeyToAccount(privKey);
    this.setState({ account: account });
    const networkId = await web3.eth.net.getId();
    const networkData = ToggleContract.networks[networkId];
    if(networkData) {
      const abi = ToggleContract.abi;
      const address = networkData.address //same as ToogleContract.networks[networkId].address;
      const contract = new web3.eth.Contract(abi, address)
      this.setState({ contract: contract});
      const state = await contract.methods.getState().call();
      this.setState({lightToggle: state});
      console.log(this.state.lightToggle);
      console.log(this.state.contract._address);
    } else {
      window.alert("Smart contract not deployed to detected network");
      this.setState({lightToggle: "Wrong network!"});
    }
  }

  async componentDidMount() {
    await this.checkingEthereum();
    await this.loadInfo();
    setInterval(() => this.loadInfo(), 1000)
  }

  toggleFunction2 = async event => {
    const contractAddress = this.state.contract._address;
    //const data = '0x915d5862';
    const data = this.state.contract.methods.switchTheLight().encodeABI(); // much better, https://web3js.readthedocs.io/en/v1.2.5/web3-eth-contract.html#methods-mymethod-encodeabi

    const rawTx = {
      // from: this.state.account.address,
      'to': contractAddress,
      // 'value': '0x00',
      'data': data,
      'chain': 'ropsten',
      // nonce: useNonce,
      // gasPrice: web3.eth.gasPrice(),
      'gas': '0x21272',
      // gasPrice: window.web3.eth.getGasPrice(),
      // nonce: 0,
      'hardfork': 'petersburg'
    };
    try {
      const sign = await window.web3.eth.accounts.signTransaction(rawTx, this.state.account.privateKey);
      const txDelivery = await window.web3.eth.sendSignedTransaction(sign.rawTransaction);
      console.log(txDelivery);
      synth.text = "The light has been changed successfully!";
      speechSynthesis.speak(synth);
    } 
    catch(err) {
      console.log(err)
      synth.text = "The light cannot be change due " + err;
      speechSynthesis.speak(synth)
    };
  }

  toggleFunction = (event) => {

    const contractAddress = this.state.contract._address;
    //const data = '0x915d5862';
    const data = this.state.contract.methods.switchTheLight().encodeABI(); // much better, https://web3js.readthedocs.io/en/v1.2.5/web3-eth-contract.html#methods-mymethod-encodeabi

    const rawTx = {
      // from: this.state.account.address,
      'to': contractAddress,
      // 'value': '0x00',
      'data': data,
      'chain': 'ropsten',
      // nonce: useNonce,
      // gasPrice: web3.eth.gasPrice(),
      'gas': '0x21272',
      // gasPrice: window.web3.eth.getGasPrice(),
      // nonce: 0,
      'hardfork': 'petersburg'
    };

    const privateSign = this.state.account.privateKey;

    const sign = new Promise(function(res,rej) {
      res(window.web3.eth.accounts.signTransaction(rawTx, privateSign));
    });

    sign.then(res => {
        console.log(res);
        return window.web3.eth.sendSignedTransaction(res.rawTransaction);
      })
      .then(res => {
          console.log(res);
          synth.text = "The light has been changed successfully!";
          speechSynthesis.speak(synth);
      })
      .catch(err => {
          console.log(err)
          synth.text = "The light cannot be change due " + err;
          speechSynthesis.speak(synth)
        }
      );
  }

  checkCommand = () => {
    if (this.state.result.toLowerCase().includes("turn on") && this.state.lightToggle === false) {
      this.toggleFunction2();
    } else if (this.state.result.toLowerCase().includes("turn on") && this.state.lightToggle === true) {
      synth.text = "The light is already on!";
      speechSynthesis.speak(synth);
    } else if (this.state.result.toLowerCase().includes("turn off") && this.state.lightToggle === true) {
      this.toggleFunction2();
    } else if (this.state.result.toLowerCase().includes("turn off") && this.state.lightToggle === false) {
      synth.text = "The light is already off!";
      speechSynthesis.speak(synth);
    } else if (this.state.result.toLowerCase().includes("switch")) {
      this.toggleFunction2();
    }
  }

  handleListen = () => {
    console.log(this.state.account);
    console.log(this.state.account.address);
    console.log('listening?', this.state.listening)

    if (this.state.listening) {
      this.setState({img: micanimate});
      recognition.start();
      audio.play();
      recognition.onend = () => {
        this.setState({img: mic});
        console.log("Stopped listening command");
        this.checkCommand();
      }

    } else {
      recognition.stop()
      recognition.onend = () => {
        console.log("Stopped listening per click")
      }
    }

    recognition.onstart = () => {
      console.log("Listening!")
    }

    let finalTranscript = ''
    recognition.onresult = event => {
      //input gif with voice
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalTranscript += transcript + ' ';
        else interimTranscript += transcript;
      }
      document.getElementById('interim').innerHTML = interimTranscript
      document.getElementById('final').innerHTML = finalTranscript
      console.log(finalTranscript);
      this.setState({result: finalTranscript});
    }
    
    recognition.onerror = event => {
      console.log("Error occurred in recognition: " + event.error)
    }

  }

  render() {
    return (
      <div className='container'>
        <div>The light is on: {String(this.state.lightToggle)}</div>
        <button className='button' id='start-button' onClick={this.handleListen}><img id="start_img" src={this.state.img} alt="Start"></img></button>
        <div id='interim' className='interim'></div>
        <div id='final' className='final'></div>
      </div>
    )
  }
}

export default App;
