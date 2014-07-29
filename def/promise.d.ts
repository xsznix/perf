declare module promise {
	export class Promise {
		static resolve(value: any): Promise;
		static from(value: any): Promise;
		static cast(value: any): Promise;
		static denodeify(fn: Function, argumentCount: number): Promise;
		static nodeify(fn: Function): Function;
		static all(args: any[]): Promise;
		static reject(value: any): Promise;
		static race(values: any[]): Promise;
		done(onFulfilled: Function, onRejected: Function): void;
		nodeify(callback: Function): void;
		catch(onRejected: Function): Promise;
	}
}