import { BigNumber } from "bignumber.js";
export interface UTXO {
    txid: string;
    amount: BigNumber;
    index: number;
}
export declare function getUtxos(ground: any, btcAddress: string): Promise<UTXO[]>;
