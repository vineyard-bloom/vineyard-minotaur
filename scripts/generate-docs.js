"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vineyard_docs_1 = require("vineyard-docs");
vineyard_docs_1.generateDiagrams('src/doc/diagrams', 'doc/diagrams');
vineyard_docs_1.generateDocs({
    project: {
        name: 'Vineyard Minotaur Documentation'
    },
    paths: {
        src: ['src'],
        content: 'src/doc/content',
        output: 'doc',
        tsconfig: './tsconfig.json',
    }
});
