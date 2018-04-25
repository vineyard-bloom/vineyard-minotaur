"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const bignumber_js_1 = require("bignumber.js");
function getUtxos(ground, btcAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        const addressId = (yield ground.querySingle(`Select id FROM addresses WHERE address='${btcAddress}'`)).id;
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
    });
}
exports.getUtxos = getUtxos;
//# sourceMappingURL=get-utxos.js.map