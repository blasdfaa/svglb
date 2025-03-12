import fs from 'node:fs/promises'
import prettier from 'prettier'
import path from 'pathe'
import type { SVG } from '@iconify/tools'
import { cleanupSVG, isEmptyColor, parseColors, runSVGO } from '@iconify/tools'
import { pascalCase } from 'scule'

export interface TemplateGenerator {
  generateComponent: (svg: string, name: string) => string
  extension: string
}

export async function prettify(content: string, filepath: string) {
  return prettier.format(content, { filepath })
}

export async function createIndexFile(files: string[], dirPath: string) {
  const indexFile = path.join(dirPath, 'index.ts')
  const content = files.map((f) => {
    const { name } = path.parse(f)
    return `export {default as ${pascalCase(name)}} from './${name}'`
  }).join('\n')
  const prettyContent = await prettify(content, indexFile)
  await fs.writeFile(indexFile, prettyContent)
}

export async function processSVG(svg: SVG): Promise<SVG> {
  cleanupSVG(svg)
  parseColors(svg, {
    defaultColor: 'currentColor',
    callback: (attr, colorStr, color) => {
      return !color || isEmptyColor(color) ? colorStr : 'currentColor'
    },
  })
  runSVGO(svg)
  return svg
}
