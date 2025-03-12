import fs from 'node:fs/promises'
import process from 'node:process'
import { defineCommand } from 'citty'
import consola from 'consola'
import { join, resolve } from 'pathe'
import { importDirectory } from '@iconify/tools'
import { pascalCase } from 'scule'
import { createIndexFile, prettify, processSVG } from '../utils'
import type { TemplateGenerator } from '../utils'
import vueTemplate from '../transforms/vue'
import solidTemplate from '../transforms/solid'
import reactTemplate from '../transforms/react'

export const DEFAULT_SVGS_DIRNAME = 'svgs'
export const DEFAULT_ICONS_DIRNAME = 'lib'

const FRAMEWORKS = ['react', 'vue', 'solid'] as const
type Framework = typeof FRAMEWORKS[number]

const templates: Record<Framework, TemplateGenerator> = {
  vue: vueTemplate,
  solid: solidTemplate,
  react: reactTemplate,
}

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
    framework: {
      description: 'Target framework (react, vue, solid)',
      type: 'string',
      default: 'react',
    },
  },
  run: async ({ args }) => {
    const framework = args.framework as Framework
    if (!FRAMEWORKS.includes(framework)) {
      consola.error(`Invalid framework. Must be one of: ${FRAMEWORKS.join(', ')}`)
      process.exit(1)
    }

    const svgsDir = resolve(args.dir || DEFAULT_SVGS_DIRNAME)
    const iconsDir = resolve(DEFAULT_ICONS_DIRNAME)
    const template = templates[framework]
    const iconFiles: string[] = []

    try {
      consola.start(`Generating ${framework} components...`)
      const iconSet = await importDirectory(svgsDir)

      await iconSet.forEach(async (name, type) => {
        if (type !== 'icon')
          return

        const svg = iconSet.toSVG(name)
        if (!svg)
          return

        await processSVG(svg)
        const content = template.generateComponent(svg.toMinifiedString(), pascalCase(name))
        const iconFile = join(iconsDir, `${name}.${template.extension}`)
        const prettyContent = await prettify(content, iconFile)
        await fs.writeFile(iconFile, prettyContent)
        iconFiles.push(iconFile)
      })

      await createIndexFile(iconFiles, iconsDir)
      consola.success('Generation completed.')
    }
    catch (err) {
      consola.error((err as Error).toString())
      process.exit(1)
    }
  },
})
