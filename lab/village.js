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
const vineyard_ground_1 = require("vineyard-ground");
function createModel(schema, config) {
    const databaseConfig = config.database;
    const client = new vineyard_ground_1.SequelizeClient(databaseConfig);
    const modeler = !databaseConfig.devMode
        ? new vineyard_ground_1.Modeler(schema, client)
        : new vineyard_ground_1.DevModeler(schema, client);
    const model = Object.assign({
        ground: modeler,
        db: modeler.getLegacyDatabaseInterface(),
    }, modeler.collections);
    return model;
}
function createVillage(schema, config) {
    return __awaiter(this, void 0, void 0, function* () {
        return {
            config: config,
            model: createModel(schema, config)
        };
    });
}
exports.createVillage = createVillage;
//# sourceMappingURL=village.js.map