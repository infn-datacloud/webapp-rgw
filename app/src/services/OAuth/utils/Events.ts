export type Callback<EventType extends unknown[]> = (...args: EventType) =>
	(Promise<void> | void);

export class UserEvent<EventType extends unknown[]> {
	private _callbacks: Callback<EventType>[] = [];

	public addObserver(cb: Callback<EventType>): () => void {
		this._callbacks.push(cb);
		return () => this.removeObserver(cb);
	}

	public removeObserver(cb: Callback<EventType>): void {
		const idx = this._callbacks.lastIndexOf(cb);
		if (idx >= 0) {
			this._callbacks.splice(idx, 1);
		}
	}

	public raise(...args: EventType): void {
		for (const cb of this._callbacks) {
			cb(...args);
		}
	}
}
