import type { TemplateGenerator } from '../utils'

const solidTemplate: TemplateGenerator = {
  extension: 'tsx',
  generateComponent(svg: string, name: string) {
    return `
import type { Component } from 'solid-js'

const ${name}: Component = (props) => {
  return ${svg.replace('<svg', '<svg {...props}')}
}

export default ${name}
`
  },
}

export default solidTemplate
