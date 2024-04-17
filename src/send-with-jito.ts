import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"
import base58 from "bs58"
import { searcherClient } from "jito-ts/dist/sdk/block-engine/searcher"
import { connection, wallet } from "./config"
import { buildJupTx, buildSanctumTx } from "./swap"
import { Bundle } from "jito-ts/dist/sdk/block-engine/types"
import { isError } from 'jito-ts/dist/sdk/block-engine/utils'


const BLOCK_ENGINE_URL = process.env.BLOCK_ENGINE_URL || ''
const JITO_TIP_DECIMALED = 0.001 * LAMPORTS_PER_SOL
const BUNDLE_TRANSACTION_LIMIT = 5



const jitoAuthWallet = Keypair.fromSecretKey(
    base58.decode(process.env.JITO_AUTH_PRIVATE_KEY || '')
)
console.log('auth wallet:', jitoAuthWallet.publicKey.toBase58())

const jitoSearchClient = searcherClient(BLOCK_ENGINE_URL, jitoAuthWallet, {
    'grpc.keepalive_timeout_ms': 4000,
})

// get random tip account
const tipAccounts = await jitoSearchClient.getTipAccounts()
const tipAccountAddress = tipAccounts[Math.floor(Math.random() * tipAccounts.length)]
const tipAccount = new PublicKey(tipAccountAddress)


const blockhash = await connection.getLatestBlockhash()

const swapOnJup = await buildJupTx(0.1 * LAMPORTS_PER_SOL)
const swapOnSanctum = await buildSanctumTx(0.08 * LAMPORTS_PER_SOL)

const swapBundle = new Bundle(
    [swapOnJup, swapOnSanctum],
    BUNDLE_TRANSACTION_LIMIT
)

const tippedBundle = swapBundle.addTipTx(
    wallet,
    JITO_TIP_DECIMALED,
    tipAccount,
    blockhash.blockhash
)

if (isError(tippedBundle)) {
    throw tippedBundle
}

const resp = await jitoSearchClient.sendBundle(tippedBundle)
console.log('JitoHash:', `https://explorer.jito.wtf/bundle/${resp}`)