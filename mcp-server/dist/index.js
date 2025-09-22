import { toolCallRequestSchema } from './schema/toolCallRequest.js';
import { formatZodError } from './core/validation.js';
import { echo, echoInputSchema } from './tools/echo.js';
import { timeNow } from './tools/time.js';
const tools = {
    'echo': { run: (args) => echo(echoInputSchema.parse(args)), inputSchema: echoInputSchema },
    'time.now': { run: () => timeNow() },
};
function listTools() {
    return Object.entries(tools).map(([name, t]) => ({
        name,
        description: name,
        inputSchema: t.inputSchema ? 'zod' : undefined,
    }));
}
async function handle(message) {
    if (message.method === 'listTools') {
        return { id: message.id, result: { tools: listTools() } };
    }
    if (message.method === 'callTool') {
        const { name, args } = message.params || {};
        if (!name || typeof name !== 'string') {
            return { id: message.id, error: { code: 'BAD_REQUEST', message: 'params.name required' } };
        }
        const tool = tools[name];
        if (!tool) {
            return { id: message.id, error: { code: 'NOT_FOUND', message: `tool ${name} not found` } };
        }
        try {
            const result = await tool.run(args);
            return { id: message.id, result };
        }
        catch (e) {
            return { id: message.id, error: { code: 'TOOL_ERROR', message: e.message || String(e) } };
        }
    }
    return { id: message.id, error: { code: 'METHOD_NOT_FOUND', message: message.method } };
}
function safeJSONParse(line) {
    try {
        return JSON.parse(line);
    }
    catch {
        return null;
    }
}
async function main() {
    process.stdin.setEncoding('utf-8');
    for await (const line of process.stdin) {
        const trimmed = line.trim();
        if (!trimmed)
            continue;
        const raw = safeJSONParse(trimmed);
        if (!raw) {
            process.stdout.write(JSON.stringify({ error: { code: 'PARSE_ERROR', message: 'invalid json' } }) + '\n');
            continue;
        }
        let request;
        try {
            request = toolCallRequestSchema.parse(raw);
        }
        catch (e) {
            process.stdout.write(JSON.stringify({ error: { code: 'VALIDATION_ERROR', issues: formatZodError(e) } }) + '\n');
            continue;
        }
        const response = await handle(request);
        process.stdout.write(JSON.stringify(response) + '\n');
    }
}
main().catch(err => {
    console.error('fatal', err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map