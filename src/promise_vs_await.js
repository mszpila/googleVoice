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

  /////////////////VS//////////////////

const privateSign = this.state.account.privateKey;

const sign = new Promise(function(res,rej) {
    res(window.web3.eth.accounts.signTransaction(rawTx, privateSign));
});

sign
    .then(res => {
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
    });