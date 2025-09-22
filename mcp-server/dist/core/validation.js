import { ZodError } from 'zod';
export function formatZodError(error) {
    if (!(error instanceof ZodError))
        return [{ path: '', code: 'UNKNOWN', message: String(error) }];
    return error.issues.map(i => ({
        path: i.path.join('.') || '',
        code: i.code,
        message: i.message,
    }));
}
//# sourceMappingURL=validation.js.map