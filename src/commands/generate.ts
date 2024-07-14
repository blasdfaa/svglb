import fs from 'node:fs/promises'
import process from 'node:process'
import { defineCommand } from 'citty'
import consola from 'consola'
import { join, parse, resolve } from 'pathe'
import { pascalCase } from 'scule'
import { transform } from '@svgr/core'
import { createIndexFile, prettify } from '../utils'

export const DEFAULT_SVGS_DIRNAME = 'svgs'
export const DEFAULT_ICONS_DIRNAME = 'src'

export default defineCommand({
  meta: {
    name: 'generate',
    description: 'generate icon components',
  },
  args: {
    dir: {
      description: 'Icons directory path',
      type: 'string',
      alias: 'd',
    },
  },
  run: async ({ args }) => {
    const svgsDir = resolve(args.dir || DEFAULT_SVGS_DIRNAME)
    const iconsDir = resolve(DEFAULT_ICONS_DIRNAME)

    try {
      consola.start('Generating components...')

      const files = (await fs.readdir(svgsDir))
        .map(file => join(svgsDir, file))
        .sort((fileA, fileB) => (parse(fileA).name > parse(fileB).name ? 1 : -1))

      const iconFiles = await Promise.all(
        files.map(async (file) => {
          const id = parse(file).name
          const componentName = pascalCase(id)
          const code = await fs.readFile(file, 'utf8')
          const iconFile = join(iconsDir, `${componentName}.tsx`)
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

      await createIndexFile(iconFiles, iconsDir)
      consola.success('Generation completed.')
    }
    catch (err) {
      consola.error((err as Error).toString())
      process.exit(1)
    }
  },
})
