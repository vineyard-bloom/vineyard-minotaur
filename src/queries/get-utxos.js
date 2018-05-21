"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bignumber_js_1 = require("bignumber.js");
async function getUtxos(ground, btcAddress) {
    const addressId = (await ground.querySingle(`Select id FROM addresses WHERE address='${btcAddress}'`)).id;
    const rawReturns = ground.query(` SELECT transactions.txid, txouts.amount, txouts.index
      FROM txouts 
      LEFT JOIN txins ON txins."sourceTransaction" = txouts.transaction AND txins."sourceIndex" = txouts.index
      JOIN transactions ON transactions.id = txouts.transaction  
      WHERE NOT ("sourceTransaction" IS NOT NULL) AND txouts.address=${addressId}
      `);
    return rawReturns.map(result => {
        const { txid, amount, index } = result;
        return {
            txid: txid.trim(),
            amount: new bignumber_js_1.BigNumber(amount),
            index
        };
    });
}
exports.getUtxos = getUtxos;
//# sourceMappingURL=get-utxos.js.map