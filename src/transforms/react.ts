import type { TemplateGenerator } from '../utils'

const reactTemplate: TemplateGenerator = {
  extension: 'tsx',
  generateComponent(svg: string, name: string) {
    return `
import * as React from 'react'

export interface ${name}Props extends React.SVGProps<React.SVGSVGElement> {}

const ${name} = (props: ${name}Props) => {
  return ${svg.replace('<svg', '<svg {...props}')}
}

export default ${name}
`
  },
}

export default reactTemplate
