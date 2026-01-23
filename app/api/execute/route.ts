import { exec } from 'child_process'
import { promisify } from 'util'
import { writeFile, unlink, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomBytes } from 'crypto'

const execPromise = promisify(exec)

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

async function executeNode(code: string, input?: string): Promise<Response> {
  const startTime = Date.now()
  const fileId = randomBytes(8).toString('hex')
  const fileName = `code-${fileId}.js`
  const filePath = join(SANDBOX_DIR, fileName)

  try {
    // Create sandbox directory
    await mkdir(SANDBOX_DIR, { recursive: true })

    // Write code to file
    await writeFile(filePath, code, 'utf-8')

    // Execute with timeout
    const { stdout, stderr } = await execPromise(
      `docker run --rm -v ${SANDBOX_DIR}:/sandbox code-executor:latest node /sandbox/${fileName}`,
      { 
        timeout: TIMEOUT,
        maxBuffer: MAX_OUTPUT,
        ...(input && { input })
      }
    )

    const time = Date.now() - startTime

    return Response.json({
      stdout: stdout.slice(0, MAX_OUTPUT),
      stderr: stderr.slice(0, MAX_OUTPUT),
      time,
      status: 'success',
    })
  } catch (error) {
    const time = Date.now() - startTime
    let stderr = ''

    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        stderr = 'Execution timeout (10s limit)'
      } else {
        stderr = error.message
      }
    }

    return Response.json({
      stdout: '',
      stderr: stderr.slice(0, MAX_OUTPUT),
      time,
      status: 'timeout' in (error || {}) ? 'timeout' : 'error',
    })
  } finally {
    // Cleanup
    try {
      await unlink(filePath)
    } catch {}
  }
}

async function executePython(code: string, input?: string): Promise<Response> {
  const startTime = Date.now()
  const fileId = randomBytes(8).toString('hex')
  const fileName = `code-${fileId}.py`
  const filePath = join(SANDBOX_DIR, fileName)

  try {
    await mkdir(SANDBOX_DIR, { recursive: true })
    await writeFile(filePath, code, 'utf-8')

    const { stdout, stderr } = await execPromise(
      `docker run --rm -v ${SANDBOX_DIR}:/sandbox python:3.11-alpine python /sandbox/${fileName}`,
      { 
        timeout: TIMEOUT,
        maxBuffer: MAX_OUTPUT,
        ...(input && { input })
      }
    )

    const time = Date.now() - startTime

    return Response.json({
      stdout: stdout.slice(0, MAX_OUTPUT),
      stderr: stderr.slice(0, MAX_OUTPUT),
      time,
      status: 'success',
    })
  } catch (error) {
    const time = Date.now() - startTime
    let stderr = ''

    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        stderr = 'Execution timeout (10s limit)'
      } else {
        stderr = error.message
      }
    }

    return Response.json({
      stdout: '',
      stderr: stderr.slice(0, MAX_OUTPUT),
      time,
      status: 'timeout' in (error || {}) ? 'timeout' : 'error',
    })
  } finally {
    try {
      await unlink(filePath)
    } catch {}
  }
}