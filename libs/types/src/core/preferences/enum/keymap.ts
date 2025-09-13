import { z } from "zod";
import { getValues } from "../../../utils/functions/get-values.js";
import { keymap } from "../config/editor.config.js";

export const keymapSchema = z.enum(getValues(keymap));

export const keymaps = keymapSchema.options;
