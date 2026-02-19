import { spawn, execSync } from 'child_process'
import { writeFile, unlink, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomBytes } from 'crypto'

const SANDBOX_DIR = '/tmp/code-sandbox'
const TIMEOUT = 10000 // 10 seconds
const MAX_OUTPUT = 10000 // 10KB

interface ExecutionRequest {
  code: string
  language: string
  input?: string
}

// Detect if Docker is available on this host
function isDockerAvailable(): boolean {
  try {
    execSync('docker info --format json', { stdio: 'ignore', timeout: 3000 })
    return true
  } catch {
    return false
  }
}

const DOCKER_AVAILABLE = isDockerAvailable()

export async function POST(request: Request) {
  try {
    const { code, language, input }: ExecutionRequest = await request.json()

    if (!code) {
      return Response.json({ error: 'No code provided' }, { status: 400 })
    }

    if (language === 'node' || language === 'javascript') {
      return executeNode(code, input)
    } else if (language === 'python') {
      return executePython(code, input)
    } else {
      return Response.json({ error: `Language ${language} not supported` }, { status: 400 })
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return Response.json({ error: message }, { status: 500 })
  }
}

function spawnProcess(cmd: string, args: string[]): ReturnType<typeof spawn> {
  return spawn(cmd, args)
}

function runWithProcess(
  process: ReturnType<typeof spawn>,
  input: string | undefined,
  startTime: number,
  filePath: string
): Promise<Response> {
  return new Promise((resolve) => {
    let stdout = ''
    let stderr = ''
    let timedOut = false

    const timeout = setTimeout(() => {
      timedOut = true
      process.kill()
    }, TIMEOUT)

    process.stdout?.on('data', (data) => {
      stdout += data.toString()
      if (stdout.length > MAX_OUTPUT) stdout = stdout.slice(0, MAX_OUTPUT)
    })

    process.stderr?.on('data', (data) => {
      stderr += data.toString()
      if (stderr.length > MAX_OUTPUT) stderr = stderr.slice(0, MAX_OUTPUT)
    })

    process.on('close', async (code) => {
      clearTimeout(timeout)
      const time = Date.now() - startTime
      try { await unlink(filePath) } catch { }

      resolve(Response.json({
        stdout,
        stderr: timedOut ? 'Execution timeout (10s limit)' : stderr,
        time,
        status: timedOut ? 'timeout' : code === 0 ? 'success' : 'error',
      }))
    })

    if (input) process.stdin?.write(input)
    process.stdin?.end()
  })
}

function executeNode(code: string, input?: string): Promise<Response> {
  return new Promise((resolve) => {
    const startTime = Date.now()
    const fileId = randomBytes(8).toString('hex')
    const fileName = `code-${fileId}.js`
    const filePath = join(SANDBOX_DIR, fileName)

      ; (async () => {
        try {
          await mkdir(SANDBOX_DIR, { recursive: true })
          await writeFile(filePath, code, 'utf-8')

          const proc = DOCKER_AVAILABLE
            ? spawnProcess('docker', [
              'run', '--rm', '-i',
              '-v', `${SANDBOX_DIR}:/sandbox`,
              '--network', 'none',
              '--memory', '128m',
              '--cpus', '0.5',
              'code-executor:latest',
              'node', `/sandbox/${fileName}`,
            ])
            : spawnProcess('node', [filePath])

          resolve(await runWithProcess(proc, input, startTime, filePath))
        } catch (error) {
          const time = Date.now() - startTime
          const message = error instanceof Error ? error.message : 'Unknown error'
          try { await unlink(filePath) } catch { }
          resolve(Response.json({ stdout: '', stderr: message.slice(0, MAX_OUTPUT), time, status: 'error' }, { status: 500 }))
        }
      })()
  })
}

function executePython(code: string, input?: string): Promise<Response> {
  return new Promise((resolve) => {
    const startTime = Date.now()
    const fileId = randomBytes(8).toString('hex')
    const fileName = `code-${fileId}.py`
    const filePath = join(SANDBOX_DIR, fileName)

      ; (async () => {
        try {
          await mkdir(SANDBOX_DIR, { recursive: true })
          await writeFile(filePath, code, 'utf-8')

          // Try python3, then python as fallback
          const pythonBin = DOCKER_AVAILABLE ? null : getPythonBin()

          const proc = DOCKER_AVAILABLE
            ? spawnProcess('docker', [
              'run', '--rm', '-i',
              '-v', `${SANDBOX_DIR}:/sandbox`,
              '--network', 'none',
              '--memory', '128m',
              '--cpus', '0.5',
              'python:3.11-alpine',
              'python', `/sandbox/${fileName}`,
            ])
            : spawnProcess(pythonBin!, [filePath])

          resolve(await runWithProcess(proc, input, startTime, filePath))
        } catch (error) {
          const time = Date.now() - startTime
          const message = error instanceof Error ? error.message : 'Unknown error'
          try { await unlink(filePath) } catch { }
          resolve(Response.json({ stdout: '', stderr: message.slice(0, MAX_OUTPUT), time, status: 'error' }, { status: 500 }))
        }
      })()
  })
}

function getPythonBin(): string {
  try {
    execSync('python3 --version', { stdio: 'ignore' })
    return 'python3'
  } catch {
    return 'python'
  }
}