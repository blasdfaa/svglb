import process from 'node:process'
import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { defineCommand } from 'citty'
import consola from 'consola'
import { resolve } from 'pathe'
import { installDependencies } from 'nypm'

export default defineCommand({
  meta: {
    name: 'init',
    description: 'Create new project',
  },
  args: {
    cwd: {
      type: 'positional',
      description: 'Project directory',
      default: '.',
    },
  },
  run: async ({ args }) => {
    const cwd = resolve(args.cwd)
    const templateDir = resolve(
      fileURLToPath(import.meta.url),
      '../..',
        `template-react`,
    )

    try {
      consola.start('Creating project...')
      await fs.cp(templateDir, cwd, { recursive: true })
      consola.success('Project created on: ', cwd)
    }
    catch (error) {
      consola.error((error as Error).toString())
      process.exit(1)
    }

    const shouldInstallDeps = await consola.prompt(
      'Do you want to install dependencies?',
      {
        options: ['yes', 'no'],
        type: 'confirm',
      },
    )

    if (shouldInstallDeps) {
      try {
        consola.start('Installing dependencies...')
        await installDependencies({ cwd, silent: true })
        consola.success('Installation completed.')
      }
      catch (err) {
        consola.error((err as Error).toString())
        process.exit(1)
      }
    }
    else {
      consola.info('Skipping install dependencies step.')
    }
  },
})
