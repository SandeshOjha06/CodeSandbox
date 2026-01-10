import { or } from "drizzle-orm"

interface ConsoleLog {
    type: 'log' | 'error' | 'warn' | 'info'
    message: string
}

interface ExecutionMessage {
    code: string
    language: string
}

interface ExecutionResult {
    status: 'success' | 'error'
    logs: ConsoleLog[]
    executionTime: number
    error?: string
}

let logs: ConsoleLog[] = []

const originalLog = console.log
const originalError = console.error;
const originalWarn = console.warn;
// const originalInfo = console.info

function capture(type: 'log' | 'error' | 'warn' | 'info', args: any[]) {
    const msg = args.map((arg) => {
        if (typeof arg === 'object') {
            try {
                return JSON.stringify(arg, null, 2)
            } catch {
                return String(arg)
            }
        }
        return String(arg)
    })
        .join(' ')

    logs.push({ type, message : msg })

    if (type === 'error') originalError(...args)
    else if (type === 'warn') originalWarn(...args)
    else originalLog(...args)

}

console.log = (...args) => capture('log', args)
console.error = (...args) => capture('error', args)
console.warn = (...args) => capture('warn', args)
console.info = (...args) => capture('log', args)

//code execution
self.onmessage = (e: MessageEvent<ExecutionMessage>) => {
    const { code, language } = e.data

    logs = []
    const start = performance.now()

    try {
        if (language != 'javascript' && language !== 'typescript') {
            throw new Error(`${language} is not supproted`)
        }

        new Function(code)()

        self.postMessage({
            status: 'success',
            logs,
            executionTime: performance.now() - start,
            error: null
        } as ExecutionResult)
    } catch (error) {
        self.postMessage({
            status: 'error',
            logs,
            executionTime: performance.now() - start,
            error: (err as Error).message
         } as ExecutionResult)
    }
}
