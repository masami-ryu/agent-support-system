import { z } from 'zod';
export declare const toolCallRequestSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
    method: z.ZodString;
    params: z.ZodOptional<z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    method: string;
    params?: any;
    id?: string | number | undefined;
}, {
    method: string;
    params?: any;
    id?: string | number | undefined;
}>;
export type ToolCallRequest = z.infer<typeof toolCallRequestSchema>;
//# sourceMappingURL=toolCallRequest.d.ts.map