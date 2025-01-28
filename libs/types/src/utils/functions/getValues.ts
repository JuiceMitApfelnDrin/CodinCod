export function getValues<T extends Record<string, any>>(obj: T) {
	return Object.values(obj) as [(typeof obj)[keyof T]];
}
