"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vineyard_docs_1 = require("vineyard-docs");
vineyard_docs_1.generateDiagrams('src/doc/diagrams', 'doc/diagrams');
vineyard_docs_1.generateDocs({
    paths: {
        src: ['src'],
        content: 'src/doc/content',
        output: 'doc',
        tsconfig: './tsconfig.json',
    }
});
//# sourceMappingURL=generate-docs.js.map