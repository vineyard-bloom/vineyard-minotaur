import { generateDiagrams, generateDocs } from 'vineyard-docs'
import { DocGenerationConfig } from 'vineyard-docs/src/types'

generateDiagrams('src/doc/diagrams', 'doc/diagrams')

generateDocs({
  paths: {
    src: ['src'],
    content: 'src/doc/content',
    output: 'doc',
    tsconfig: './tsconfig.json',
  }
} as DocGenerationConfig)