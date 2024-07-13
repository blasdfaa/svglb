import path from 'node:path'
import url from 'node:url'
import fs from 'node:fs/promises'
import process from 'node:process'
import prettier from 'prettier'
import { transform } from '@svgr/core'
import consola from 'consola'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

export const SVGS_DIR = path.resolve(__dirname, '..', 'svgs')
export const ICONS_DIR = path.resolve(__dirname, '..', 'src')

export function getComponentName(id: string) {
  return id.replace(/^\w|-\w/g, match => match.replace('-', '').toUpperCase())
}

export async function prettify(content: string, filepath: string) {
  return prettier.format(content, { filepath })
}

async function createIndexFile(files: string[]) {
  const indexFile = path.join(ICONS_DIR, 'index.ts')
  const content = files
    .map((file) => {
      const name = path.parse(file).name
      return `export {default as ${name}} from './${name}'`
    })
    .join('\n')
  const prettyContent = await prettify(content, indexFile)
  await fs.writeFile(indexFile, prettyContent)
}

async function run() {
  consola.start('Generating components...')

  const files = (await fs.readdir(SVGS_DIR))
    .map(file => path.join(SVGS_DIR, file))
    .sort((fileA, fileB) => (path.parse(fileA).name > path.parse(fileB).name ? 1 : -1))

  const iconFiles = await Promise.all(
    files.map(async (file) => {
      const id = path.parse(file).name
      const componentName = getComponentName(id)
      const code = await fs.readFile(file, 'utf8')
      const iconFile = path.join(ICONS_DIR, `${componentName}.tsx`)
      const content = await transform(
        code,
        { typescript: true, plugins: ['@svgr/plugin-jsx'] },
        { componentName },
      )

      const prettyContent = await prettify(content, iconFile)

      await fs.writeFile(iconFile, prettyContent)
      return iconFile
    }),
  )

  await createIndexFile(iconFiles)
  consola.success('Generation completed.')
}

run().catch((error) => {
  consola.error(error)
  process.exit(1)
})
