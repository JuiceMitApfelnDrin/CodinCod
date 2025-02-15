import { z } from "zod";
import { getValues } from "../../../utils/functions/get-values.js";
import { keyBinding } from "../config/ide-config.js";

export const keyBindingSchema = z.enum(getValues(keyBinding));
