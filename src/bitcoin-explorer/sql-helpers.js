"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function selectTxidClause(txid) {
    return txid ? `(SELECT tx.id FROM transactions tx WHERE tx.txid = '${txid}')` : 'NULL';
}
exports.selectTxidClause = selectTxidClause;
function nullify(value) {
    return (value === undefined || value === null) ? 'NULL' : value;
}
exports.nullify = nullify;
function nullifyString(value) {
    return (value === undefined || value === null) ? 'NULL' : "'" + value + "'";
}
exports.nullifyString = nullifyString;
function CREATE_TX_IN(association, addressId) {
    const { txid, index, input } = association;
    return `(${selectTxidClause(txid)}, '${index}', ${selectTxidClause(input.txid)}, ${nullify(input.vout)}, ${input.scriptSig ? "'" + input.scriptSig.hex + "'" : 'NULL'}, ${input.scriptSig ? "'" + input.scriptSig.asm + "'" : 'NULL'}, ${input.sequence}, ${addressId || 'NULL'}, ${nullify(input.amount)}, ${nullify(input.valueSat)}, ${nullifyString(input.coinbase)},  NOW(), NOW())`;
}
exports.CREATE_TX_IN = CREATE_TX_IN;
function CREATE_TX_OUT(association, addressId) {
    const { output, txid, index } = association;
    return `(${selectTxidClause(txid)}, ${index}, '${output.scriptPubKey.hex}', '${output.scriptPubKey.asm}', '${addressId}', ${output.value}, NOW(), NOW())`;
}
exports.CREATE_TX_OUT = CREATE_TX_OUT;
function CREATE_TX(transaction) {
    return `(${transaction.status}, '${transaction.txid}', ${transaction.fee}, ${transaction.nonce}, 1, '${transaction.timeReceived.toISOString()}', ${transaction.blockIndex}, NOW(), NOW())`;
}
exports.CREATE_TX = CREATE_TX;
//# sourceMappingURL=sql-helpers.js.map