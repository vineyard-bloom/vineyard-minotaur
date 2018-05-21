"use strict";
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
async function createVillage(schema, config) {
    return {
        config: config,
        model: createModel(schema, config)
    };
}
exports.createVillage = createVillage;
//# sourceMappingURL=village.js.map