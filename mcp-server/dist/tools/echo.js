import { z } from 'zod';
export const echoInputSchema = z.object({ text: z.string() });
export async function echo(args) {
    return { text: args.text };
}
//# sourceMappingURL=echo.js.map