import { Keypair, Connection } from "@solana/web3.js";
import bs58 from "bs58";

export const wallet = Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY || ''))
export const connection = new Connection(process.env.SOLANA_RPC || '')

