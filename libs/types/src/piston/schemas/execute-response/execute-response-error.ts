import { z } from "zod";

export const pistonExecuteResponseErrorSchema = z.object({
	message: z.string()
});
export type pistonExecuteResponseError = z.infer<typeof pistonExecuteResponseErrorSchema>;
export function isPistonExecuteResponseError(
	supposedExecutionError: unknown
): supposedExecutionError is pistonExecuteResponseError {
	return pistonExecuteResponseErrorSchema.safeParse(supposedExecutionError).success;
}
