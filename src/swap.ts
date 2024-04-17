import { Connection, Keypair, VersionedTransaction } from '@solana/web3.js';
import { Wallet } from '@project-serum/anchor';
import bs58 from 'bs58';

const solMint = 'So11111111111111111111111111111111111111112';
const infMint = '5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm';
const jitosolMint = 'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn';
const oneAmount = 1000000000;
const slippageBps = '30'
const jitosolRate = 1.10261794793

const connection = new Connection(process.env.SOLANA_RPC || '');

const wallet = new Wallet(Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY || '')));


export async function buildJupTx(solAmount: number) {
    // Swapping SOL to INF
    const quoteResponse = await (
        await fetch('https://quote-api.jup.ag/v6/quote?' + new URLSearchParams({
            inputMint: solMint,
            outputMint: infMint,
            amount: solAmount.toString(),
            slippageBps: slippageBps,
        })
        )
    ).json();
    // console.log(quoteResponse);

    console.log(`Swapping ${solAmount / oneAmount} SOL to ${quoteResponse.outAmount / oneAmount} INF`);

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
                dynamicComputeUnitLimit: true,
            })
        })
    ).json();
    // console.log(swapTransaction);

    const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
    const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

    transaction.sign([wallet.payer]);

    return transaction
    // const rawTransaction = transaction.serialize()
    // const txid = await connection.sendRawTransaction(rawTransaction, {
    //     skipPreflight: true,
    //     maxRetries: 2
    // });
    // await connection.confirmTransaction(txid);
    // console.log(`https://solscan.io/tx/${txid}`);

    // step2_On_Sanctum(quoteResponse.outAmount);
}

export async function buildSanctumTx(infAmount: number) {
    // Swapping INF to jitoSOL
    const quoteResponse = await (
        await fetch('https://sanctum-s-api.fly.dev/v1/swap/quote?' + new URLSearchParams({
            input: infMint,
            outputLstMint: jitosolMint,
            amount: infAmount.toString(),
            mode: 'ExactIn'
        })
        )
    ).json();
    // console.log(quoteResponse);

    console.log(`Swapping ${infAmount / oneAmount} INF to ${quoteResponse.outAmount / oneAmount} jitoSOL`);

    // https://sanctum-s-api.fly.dev/#/LST%20Swaps/handle_swap
    const swapTransaction = await (
        await fetch('https://sanctum-s-api.fly.dev/v1/swap', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                input: infMint,
                outputLstMint: jitosolMint,
                amount: quoteResponse.inAmount,
                quotedAmount: quoteResponse.outAmount,
                swapSrc: quoteResponse.swapSrc,
                mode: 'ExactIn',
                signer: wallet.publicKey.toString(),
            })
        })
    ).json();
    // console.log(swapTransaction);

    const swapTransactionBuf = Buffer.from(swapTransaction.tx, 'base64');
    const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

    transaction.sign([wallet.payer]);

    return transaction

    // const rawTransaction = transaction.serialize()
    // const txid = await connection.sendRawTransaction(rawTransaction, {
    //     skipPreflight: true,
    //     maxRetries: 2
    // });
    // await connection.confirmTransaction(txid);
    // console.log(`https://solscan.io/tx/${txid}`);
}

if (import.meta.path == Bun.main) {
    // run both step1 and step2
    // buildJupTx(oneAmount * 0.001)

    // only run step2
    // step2_On_Sanctum( oneAmount * 0.001 )
}

