import { z } from "zod";

export const acceptedDateSchema = z.date().or(z.iso.datetime());
export type AcceptedDate = z.infer<typeof acceptedDateSchema>;
