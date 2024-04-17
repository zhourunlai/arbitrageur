import { Connection, Keypair, VersionedTransaction } from '@solana/web3.js';
import fetch from 'cross-fetch';
import { Wallet } from '@project-serum/anchor';
import bs58 from 'bs58';
import dotenv from 'dotenv'

dotenv.config()

const solMint = 'So11111111111111111111111111111111111111112';
const infMint = '5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm';
const jitosolMint = 'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn';
const solInitAmount = 100000000000;
const jitosolRate = 1.10261794793

const connection = new Connection(process.env.SOLANA_RPC || '');

const wallet = new Wallet(Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY || '')));


async function step1_On_Jup(solAmount) {
    // Swapping SOL to INF
    const quoteResponse = await (
        await fetch('https://quote-api.jup.ag/v6/quote?' + new URLSearchParams({
            inputMint: solMint,
            outputMint: infMint,
            amount: solAmount,
            slippageBps: '30',
          })
        )
    ).json();
    console.log({ quoteResponse })

    // https://station.jup.ag/docs/apis/swap-api
    const { swapTransaction } = await (
        await fetch('https://quote-api.jup.ag/v6/swap', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            quoteResponse,
            userPublicKey: wallet.publicKey.toString(),
            wrapAndUnwrapSol: true,
            // feeAccount is optional. Use if you want to charge a fee.  feeBps must have been passed in /quote API.
            // feeAccount: "fee_account_public_key"
        })
        })
    ).json();

    const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
    var transaction = VersionedTransaction.deserialize(swapTransactionBuf);
    console.log(transaction);

    transaction.sign([wallet.payer]);

    const rawTransaction = transaction.serialize()
    const txid = await connection.sendRawTransaction(rawTransaction, {
        skipPreflight: true,
        maxRetries: 2
    });
    await connection.confirmTransaction(txid);
    console.log(`https://solscan.io/tx/${txid}`);
}

step1_On_Jup( solInitAmount / 100000)

// async function step2_On_Sanctum(infAmount) {
//     // Swapping INF to jitoSOL
//     const quoteResponse = await (
//         await fetch('https://sanctum-s-api.fly.dev/v1/swap/quote?' + new URLSearchParams({
//             input: infMint,
//             outputLstMint: jitosolMint,
//             amount: infAmount,
//             mode: 'ExactIn'
//           })
//         )
//     ).json();
//     console.log({ quoteResponse })

//     // https://sanctum-s-api.fly.dev/#/LST%20Swaps/handle_swap
//     const { swapTransaction } = await (
//         await fetch('https://sanctum-s-api.fly.dev/v1/swap', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//             quoteResponse,
//             amount: infAmount,
//             userPublicKey: wallet.publicKey.toString(),
//             wrapAndUnwrapSol: true,
//             swapSrc: 'Stakedex',
//         })
//         })
//     ).json();

//     const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
//     var transaction = VersionedTransaction.deserialize(swapTransactionBuf);
//     console.log(transaction);

//     transaction.sign([wallet.payer]);

//     const rawTransaction = transaction.serialize()
//     const txid = await connection.sendRawTransaction(rawTransaction, {
//     skipPreflight: true,
//     maxRetries: 2
//     });
//     await connection.confirmTransaction(txid);
//     console.log(`https://solscan.io/tx/${txid}`);
// }