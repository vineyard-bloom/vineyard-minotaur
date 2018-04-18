import { AssociatedInput, AssociatedOutput } from "./bitcoin-explorer";
import { blockchain } from "vineyard-blockchain/src/blockchain";
import MultiTransaction = blockchain.MultiTransaction;
export declare function selectTxidClause(txid: string | undefined): string;
export declare function nullify(value: any): any;
export declare function nullifyString(value: string | undefined | null): string;
export declare function CREATE_TX_IN(association: AssociatedInput, addressId: number | undefined): string;
export declare function CREATE_TX_OUT(association: AssociatedOutput, addressId: number): string;
export declare function CREATE_TX(transaction: MultiTransaction): string;
