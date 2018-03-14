import { Range2, Vec2 } from "goodcore";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { CallerInternal } from "./CallerInternal";
import { DataStore } from "./DataStore";
import { DataStoreConsumable } from "./DataStoreConsumable";
import { IRequestConfig } from "./IRequestConfig";
import { RequestConfig } from "./RequestConfig";
export class CallerHandle {
	private _id: number;
	private _store: DataStore;
	private _internal: CallerInternal;
	private _stream: BehaviorSubject<DataStoreConsumable>;
	private _force: boolean = false;

	public get internal(): CallerInternal {
		return this._internal;
	}
	public get stream(): BehaviorSubject<DataStoreConsumable> {
		return this._stream;
	}
	public get viewPort(): Range2 {
		return this._internal.viewPort;
	}
	public set viewPort(v: Range2) {
		this._internal.viewPort = v;
	}
	public get pxViewPort(): Range2 {
		return this._internal.pxViewPort;
	}
	public set pxViewPort(v: Range2) {
		this._internal.pxViewPort = v;
	}
	public get requestMargin(): Vec2 {
		return this._internal.config.requestMargin;
	}
	public set requestMargin(v: Vec2) {
		this._internal.config.requestMargin = v;
	}

	constructor(
		id: number, 
		store: DataStore,
		config: RequestConfig
	) {
		this._id = id;
		this._store = store;
		this._stream = new BehaviorSubject<DataStoreConsumable>(null);
		this._internal = new CallerInternal(config, this._stream);
	}

	public load(config?: IRequestConfig) {
		this.readConfig(config);
		this._store.load(this.internal, this._force);
	}
	public unregister(): void {
		throw new Error("not implemented");
	}
	private readConfig(config?: IRequestConfig) {
		if (config !== undefined) {
			if (config.requestMargin !== undefined) {
				this.internal.config.requestMargin = config.requestMargin;
			}
			if (config.viewPort !== undefined) {
				this.viewPort = config.viewPort;
			}
			if (config.pxViewPort !== undefined) {
				this.pxViewPort = config.pxViewPort;
			}
			this._force = config.forceStream === true;
		}

	}
}
