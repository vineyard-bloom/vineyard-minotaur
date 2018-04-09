import { generateDiagrams, generateDocs } from 'vineyard-docs'

generateDiagrams('src/doc/diagrams', 'doc/diagrams')

generateDocs({
  project: {
    name: 'Vineyard Minotaur Documentation'
  },
  paths: {
    src: ['src'],
    content: 'src/doc/content',
    output: 'doc',
    tsconfig: './tsconfig.json',
  }
})