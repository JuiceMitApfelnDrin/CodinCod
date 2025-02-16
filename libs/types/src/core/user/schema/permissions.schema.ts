

import { z } from "zod";
import { getValues } from "../../../utils/functions/get-values.js";
import { permissionEnum } from "../enum/permissions-enum.js";

export const permissionSchema = z.enum(getValues(permissionEnum));

export type Permission = z.infer<typeof permissionSchema>;
