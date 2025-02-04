import { PistonRuntime } from "types";

export function findRuntime(runtimes: PistonRuntime[], language: string) {
	return runtimes.find((runtime) => runtime.language === language);
}
