import { z } from "zod";
import { paginatedQuerySchema } from "./paginated-query.schema.js";

export const paginatedQueryResponseSchema = paginatedQuerySchema.extend({
  totalPages: z.number().min(0).default(0),
  totalItems: z.number().min(0).default(0),
  items: z.array(z.any()),
});
export type PaginatedQueryResponse = z.infer<
  typeof paginatedQueryResponseSchema
>;
export function isPaginatedQueryResponse(
  data: unknown
): data is PaginatedQueryResponse {
  return paginatedQueryResponseSchema.safeParse(data).success;
}
