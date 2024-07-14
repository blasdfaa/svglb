import fs from 'node:fs/promises'
import prettier from 'prettier'
import path from 'pathe'

export async function prettify(content: string, filepath: string) {
  return prettier.format(content, { filepath })
}

export async function createIndexFile(files: string[], dirPath: string) {
  const indexFile = path.join(dirPath, 'index.ts')
  const content = files.map((f) => {
    const { name } = path.parse(f)
    return `export {default as ${name}} from './${name}'`
  }).join('\n')
  const prettyContent = await prettify(content, indexFile)
  await fs.writeFile(indexFile, prettyContent)
}
