import { cp, mkdir, mkdtemp, rm } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const temporaryRoot = await mkdtemp(path.join(root, '.cloudflare-build-'))
const sourceCollections = path.join(root, 'src', 'pages', 'collections')
const publicCollections = path.join(root, 'public', 'collections')

function excludesCollections(sourcePath) {
  return sourcePath !== sourceCollections
    && !sourcePath.startsWith(`${sourceCollections}${path.sep}`)
    && sourcePath !== publicCollections
    && !sourcePath.startsWith(`${publicCollections}${path.sep}`)
}

async function runAstroBuild() {
  const child = spawn('pnpm', ['exec', 'astro', 'build'], {
    cwd: root,
    env: {
      ...process.env,
      ASTRO_BUILD_SRC_DIR: path.join(temporaryRoot, 'src'),
      ASTRO_BUILD_PUBLIC_DIR: path.join(temporaryRoot, 'public'),
    },
    stdio: 'inherit',
  })

  const exitCode = await new Promise((resolve, reject) => {
    child.once('error', reject)
    child.once('exit', (code, signal) => {
      if (signal) {
        reject(new Error(`Astro build terminated by signal ${signal}`))
        return
      }
      resolve(code ?? 1)
    })
  })

  if (exitCode !== 0) {
    throw new Error(`Astro build failed with exit code ${exitCode}`)
  }
}

try {
  await mkdir(path.join(temporaryRoot, 'src'), { recursive: true })
  await mkdir(path.join(temporaryRoot, 'public'), { recursive: true })

  await Promise.all([
    cp(path.join(root, 'src'), path.join(temporaryRoot, 'src'), {
      recursive: true,
      filter: excludesCollections,
    }),
    cp(path.join(root, 'public'), path.join(temporaryRoot, 'public'), {
      recursive: true,
      filter: excludesCollections,
    }),
  ])

  console.log('Building without src/pages/collections and public/collections')
  await runAstroBuild()
} finally {
  await rm(temporaryRoot, { recursive: true, force: true })
}
