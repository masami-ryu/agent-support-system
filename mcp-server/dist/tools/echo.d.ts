import { z } from 'zod';
export declare const echoInputSchema: z.ZodObject<{
    text: z.ZodString;
}, "strip", z.ZodTypeAny, {
    text: string;
}, {
    text: string;
}>;
export type EchoInput = z.infer<typeof echoInputSchema>;
export declare function echo(args: EchoInput): Promise<{
    text: string;
}>;
//# sourceMappingURL=echo.d.ts.map