#!/usr/bin/env node
const solMint = 'So11111111111111111111111111111111111111112';
const infMint = '5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm';
const jitosolMint = 'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn';

const solInitAmount = 100000000000;
const jitosolRate = 1.10209574256

// 1. https://jup.ag/swap/SOL-INF
function step1_On_Jup(solAmount) {
  fetch('https://quote-api.jup.ag/v6/quote?' + new URLSearchParams({
    inputMint: solMint,
    outputMint: infMint,
    amount: solAmount,
  })
  ).then(response => response.json())
    .then(
      data => {
        var infAmount = data.outAmount;
        console.log("infAmount: ", infAmount);
        step2_On_Sanctum(infAmount)
      }
    )
}

// 2. https://app.sanctum.so/trade
function step2_On_Sanctum(infAmount) {
  fetch('https://sanctum-s-api.fly.dev/v1/swap/quote?' + new URLSearchParams({
    input: infMint,
    outputLstMint: jitosolMint,
    amount: infAmount,
    mode: 'ExactIn'
  })
  ).then(response => response.json())
    .then(
      data => {
        var jitoAmout = data.outAmount;
        console.log("jitoAmout: ", jitoAmout);
        step3_On_Jito_Immediately(jitoAmout);
        step3_On_Jito_Delayed(jitoAmout);
      }
    )
}

// 3. https://www.jito.network/staking/
function step3_On_Jito_Immediately(jitoAmout) {
  fetch('https://quote-api.jup.ag/v6/quote?' + new URLSearchParams({
    inputMint: jitosolMint,
    outputMint: solMint,
    amount: jitoAmout
  })
  ).then(response => response.json())
    .then(
      data => {
        var solImmAmount = data.outAmount;
        console.log("solImmAmount: ", solImmAmount);
      }
    )
}

function step3_On_Jito_Delayed(jitoAmout) {
  var solDelayAmount = Math.floor(jitoAmout * jitosolRate);
  console.log("solDelayAmount: ", solDelayAmount);
}


step1_On_Jup(solInitAmount);