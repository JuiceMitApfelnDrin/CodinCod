import z from "zod";

export const messageSchema = z.string().min(1, "Message is required");
export type Message = z.infer<typeof messageSchema>;
