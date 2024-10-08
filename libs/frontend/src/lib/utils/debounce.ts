// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DebouncedFunction<T extends (...args: any[]) => any> = (
	...args: Parameters<T>
) => Promise<ReturnType<T>>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
	func: T,
	delay: number
): DebouncedFunction<T> {
	let timer: ReturnType<typeof setTimeout> | undefined;
	let resolveList: Array<(value: ReturnType<T> | PromiseLike<ReturnType<T>>) => void> = [];

	return (...args: Parameters<T>): Promise<ReturnType<T>> => {
		if (timer) {
			clearTimeout(timer);
		}

		return new Promise<ReturnType<T>>((resolve) => {
			resolveList.push(resolve);
			timer = setTimeout(async () => {
				const result = await func(...args);
				resolveList.forEach((res) => res(result));
				resolveList = [];
			}, delay);
		});
	};
}
