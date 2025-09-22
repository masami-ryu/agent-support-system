import { z } from 'zod';
export const toolCallRequestSchema = z.object({
    id: z.union([z.string(), z.number()]).optional(),
    method: z.string(),
    params: z.any().optional(),
});
//# sourceMappingURL=toolCallRequest.js.map