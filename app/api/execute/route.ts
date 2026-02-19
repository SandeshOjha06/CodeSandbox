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

// Check once at startup whether Docker is available
let dockerAvailable: boolean | null = null
function isDockerAvailable(): boolean {
  if (dockerAvailable !== null) return dockerAvailable
  try {
    execSync('docker info', { stdio: 'ignore', timeout: 3000 })
    dockerAvailable = true
  } catch {
    dockerAvailable = false
  }
  console.log(`[executor] Docker ${dockerAvailable ? 'available' : 'not available, using direct execution'}`)
  return dockerAvailable
}

export async function POST(request: Request) {
  try {
    const { code, language, input }: ExecutionRequest = await request.json()

    if (!code) {
      return Response.json({ error: 'No code provided' }, { status: 400 })
    }

    if (language === 'node' || language === 'javascript') {
      return execute(code, input, 'js')
    } else if (language === 'python') {
      return execute(code, input, 'py')
    } else {
      return Response.json({ error: `Language ${language} not supported` }, { status: 400 })
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return Response.json({ error: message }, { status: 500 })
  }
}

function execute(code: string, input: string | undefined, ext: 'js' | 'py'): Promise<Response> {
  return new Promise((resolve) => {
    const startTime = Date.now()
    const fileId = randomBytes(8).toString('hex')
    const fileName = `code-${fileId}.${ext}`
    const filePath = join(SANDBOX_DIR, fileName)

      ; (async () => {
        try {
          await mkdir(SANDBOX_DIR, { recursive: true })
          await writeFile(filePath, code, 'utf-8')

          let proc: ReturnType<typeof spawn>

          if (isDockerAvailable()) {
            // Docker mode: run in isolated container
            const image = ext === 'js' ? 'code-executor:latest' : 'python:3.11-alpine'
            const cmd = ext === 'js' ? 'node' : 'python'
            proc = spawn('docker', [
              'run', '--rm', '-i',
              '-v', `${SANDBOX_DIR}:/sandbox`,
              '--network', 'none',
              '--memory', '128m',
              '--cpus', '0.5',
              image, cmd, `/sandbox/${fileName}`,
            ])
          } else {
            // Direct mode: run on host (for Render / serverless)
            const cmd = ext === 'js' ? 'node' : getPythonBin()
            proc = spawn(cmd, [filePath])
          }

          let stdout = ''
          let stderr = ''
          let timedOut = false

          const timeout = setTimeout(() => {
            timedOut = true
            proc.kill()
          }, TIMEOUT)

          proc.stdout?.on('data', (data) => {
            stdout += data.toString()
            if (stdout.length > MAX_OUTPUT) stdout = stdout.slice(0, MAX_OUTPUT)
          })

          proc.stderr?.on('data', (data) => {
            stderr += data.toString()
            if (stderr.length > MAX_OUTPUT) stderr = stderr.slice(0, MAX_OUTPUT)
          })

          proc.on('close', async (exitCode) => {
            clearTimeout(timeout)
            const time = Date.now() - startTime
            try { await unlink(filePath) } catch { }

            resolve(Response.json({
              stdout,
              stderr: timedOut ? 'Execution timeout (10s limit)' : stderr,
              time,
              status: timedOut ? 'timeout' : exitCode === 0 ? 'success' : 'error',
            }))
          })

          if (input) proc.stdin?.write(input)
          proc.stdin?.end()
        } catch (error) {
          const time = Date.now() - startTime
          const message = error instanceof Error ? error.message : 'Unknown error'
          try { await unlink(filePath) } catch { }

          resolve(Response.json(
            { stdout: '', stderr: message.slice(0, MAX_OUTPUT), time, status: 'error' },
            { status: 500 }
          ))
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