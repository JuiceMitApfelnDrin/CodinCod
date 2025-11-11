import { z } from "zod";

export const pistonExecutionResponseErrorSchema = z.object({
	message: z.string()
});
export type pistonExecutionResponseError = z.infer<
	typeof pistonExecutionResponseErrorSchema
>;
export function isPistonExecutionResponseError(
	supposedExecutionError: unknown
): supposedExecutionError is pistonExecutionResponseError {
	return pistonExecutionResponseErrorSchema.safeParse(supposedExecutionError)
		.success;
}
