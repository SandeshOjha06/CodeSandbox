import { spawn } from 'child_process'
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

interface ExecutionResponse {
  stdout: string
  stderr: string
  time: number
  status: 'success' | 'error' | 'timeout'
}

export async function POST(request: Request) {
  try {
    const { code, language, input }: ExecutionRequest = await request.json()

    if (!code) {
      return Response.json(
        { error: 'No code provided' },
        { status: 400 }
      )
    }

    if (language === 'node' || language === 'javascript') {
      return executeNode(code, input)
    } else if (language === 'python') {
      return executePython(code, input)
    } else {
      return Response.json(
        { error: `Language ${language} not supported` },
        { status: 400 }
      )
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return Response.json(
      { error: message },
      { status: 500 }
    )
  }
}

function executeNode(code: string, input?: string): Promise<Response> {
  return new Promise((resolve) => {
    const startTime = Date.now()
    const fileId = randomBytes(8).toString('hex')
    const fileName = `code-${fileId}.js`
    const filePath = join(SANDBOX_DIR, fileName)

      ; (async () => {
        try {
          // Create sandbox directory
          await mkdir(SANDBOX_DIR, { recursive: true })
          // Write code to file
          await writeFile(filePath, code, 'utf-8')

          // Use spawn to properly pipe stdin to Docker
          const docker = spawn('docker', [
            'run',
            '--rm',
            '-i',
            '-v',
            `${SANDBOX_DIR}:/sandbox`,
            'code-executor:latest',
            'node',
            `/sandbox/${fileName}`,
          ])

          let stdout = ''
          let stderr = ''
          let timedOut = false

          const timeout = setTimeout(() => {
            timedOut = true
            docker.kill()
          }, TIMEOUT)

          docker.stdout?.on('data', (data) => {
            stdout += data.toString()
            if (stdout.length > MAX_OUTPUT) {
              stdout = stdout.slice(0, MAX_OUTPUT)
            }
          })

          docker.stderr?.on('data', (data) => {
            stderr += data.toString()
            if (stderr.length > MAX_OUTPUT) {
              stderr = stderr.slice(0, MAX_OUTPUT)
            }
          })

          docker.on('close', async (code) => {
            clearTimeout(timeout)
            const time = Date.now() - startTime

            try {
              await unlink(filePath)
            } catch { }

            resolve(
              Response.json({
                stdout,
                stderr: timedOut ? 'Execution timeout (10s limit)' : stderr,
                time,
                status: timedOut ? 'timeout' : code === 0 ? 'success' : 'error',
              })
            )
          })

          // Write input to stdin
          if (input) {
            docker.stdin?.write(input)
          }
          docker.stdin?.end()
        } catch (error) {
          const time = Date.now() - startTime
          const message = error instanceof Error ? error.message : 'Unknown error'
          try {
            await unlink(filePath)
          } catch { }

          resolve(
            Response.json(
              {
                stdout: '',
                stderr: message.slice(0, MAX_OUTPUT),
                time,
                status: 'error',
              },
              { status: 500 }
            )
          )
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

          const docker = spawn('docker', [
            'run',
            '--rm',
            '-i',
            '-v',
            `${SANDBOX_DIR}:/sandbox`,
            'python:3.11-alpine',
            'python',
            `/sandbox/${fileName}`,
          ])

          let stdout = ''
          let stderr = ''
          let timedOut = false

          const timeout = setTimeout(() => {
            timedOut = true
            docker.kill()
          }, TIMEOUT)

          docker.stdout?.on('data', (data) => {
            stdout += data.toString()
            if (stdout.length > MAX_OUTPUT) {
              stdout = stdout.slice(0, MAX_OUTPUT)
            }
          })

          docker.stderr?.on('data', (data) => {
            stderr += data.toString()
            if (stderr.length > MAX_OUTPUT) {
              stderr = stderr.slice(0, MAX_OUTPUT)
            }
          })

          docker.on('close', async (code) => {
            clearTimeout(timeout)
            const time = Date.now() - startTime

            try {
              await unlink(filePath)
            } catch { }

            resolve(
              Response.json({
                stdout,
                stderr: timedOut ? 'Execution timeout (10s limit)' : stderr,
                time,
                status: timedOut ? 'timeout' : code === 0 ? 'success' : 'error',
              })
            )
          })

          // Write input to stdin
          if (input) {
            docker.stdin?.write(input)
          }
          docker.stdin?.end()
        } catch (error) {
          const time = Date.now() - startTime
          const message = error instanceof Error ? error.message : 'Unknown error'
          try {
            await unlink(filePath)
          } catch { }

          resolve(
            Response.json(
              {
                stdout: '',
                stderr: message.slice(0, MAX_OUTPUT),
                time,
                status: 'error',
              },
              { status: 500 }
            )
          )
        }
      })()
  })
}