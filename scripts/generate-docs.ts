import { generateDiagrams, generateDocs } from 'vineyard-docs'

generateDiagrams('src/doc/diagrams', 'doc/diagrams')

generateDocs({
  paths: {
    src: ['src'],
    content: 'src/doc/content',
    output: 'doc',
    tsconfig: './tsconfig.json',
  }
})