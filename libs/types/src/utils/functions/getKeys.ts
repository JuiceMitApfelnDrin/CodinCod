export function getKeys<T extends Record<string, any>>(obj: T) {
	return Object.keys(obj) as [keyof T, ...(keyof T)[]];
}
