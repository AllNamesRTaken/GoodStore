import { Range2, Vec2 } from "goodcore";
import { IRange2 } from "goodcore";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { Subscription } from "rxjs/Subscription";
import { DataStoreConsumable } from "./DataStoreConsumable";
import { IRequestConfig } from "./IRequestConfig";
import { RequestConfig } from "./RequestConfig";

export class CallerInternal {
	private _config: RequestConfig;
	private _stream: BehaviorSubject<DataStoreConsumable>;
	private _fixedLoadPort: Range2 = new Range2();
	private _fixedPxLoadPort: Range2 = new Range2();
	public ignoreFetch: number;
	public fetchSubscription: Subscription;
	public requestId: number;
	public totalCells: Vec2 = new Vec2(-1, -1);
	public totalPx: Vec2 = new Vec2(-1, -1);

	public get config(): RequestConfig {
		return this._config;
	}
	public set config(v: RequestConfig) {
		this._config = v;
	}
	public get stream(): BehaviorSubject<DataStoreConsumable> {
		return this._stream;
	}

	public get loadPort(): IRange2 {
		return this.config.loadPort;
	}
	public set loadPort(v: IRange2) {
		this.config.loadPort = v;
	}
	public get pxLoadPort(): IRange2 {
		return this.config.pxLoadPort;
	}
	public set pxLoadPort(v: IRange2) {
		this.config.pxLoadPort = v;
	}
	public get fixedLoadPort(): Range2 {
		return this._fixedLoadPort;
	}
	public get fixedPxLoadPort(): Range2 {
		return this._fixedLoadPort;
	}
	public get viewPort(): Range2 {
		return this.config.viewPort;
	}
	public set viewPort(v: Range2) {
		if (!this.config.viewPort.equals(v)) {
			this.ignoreOngoingFetch();
		}
		this.config.viewPort = v;
	}
	public get pxViewPort(): Range2 {
		return this.config.pxViewPort;
	}
	public set pxViewPort(v: Range2) {
		if (!this.config.pxViewPort.equals(v)) {
			this.ignoreOngoingFetch();
		}
		this.config.pxViewPort = v;
	}

	constructor(config: RequestConfig, stream: BehaviorSubject<DataStoreConsumable>) {
		this._config = config;
		this._stream = stream;
		this.fetchSubscription = null;
		this.ignoreFetch = -1;
		this.requestId = -1;
	}

	public fixLoadPort(): void {
		if ((this.config.pxLoadPort as Range2).isZero) {
			this._fixedLoadPort.set(this.config.loadPort);
			this._fixedPxLoadPort.zero();
		} else {
			this._fixedPxLoadPort.set(this.config.pxLoadPort);
			this._fixedLoadPort.zero();
		}
	}
	public ignoreOngoingFetch(): void {
		if (this.fetchSubscription !== null) {
			this.ignoreFetch = this.requestId;
		}
	}
	public cancelOngoingFetch() {
		if (this.fetchSubscription !== null) {
			this.fetchSubscription.unsubscribe();
			this.fetchSubscription = null;
		}
	}

	public limitLoadPortByTotalCells(): void {
		this.limitPortByTotal(this.loadPort, this.totalCells);
	}
	public limitPxLoadPortByTotalPx(): void {
		this.limitPortByTotal(this.pxLoadPort, this.totalPx);
	}
	private limitPortByTotal(port: IRange2, total: Vec2) {
		if (!(port as Range2).isZero && !total.equals( {x: -1, y: -1})) {
			let overflow = (port as Range2).toRect().stop.subtract(total).max(new Vec2(0, 0));
			(port.size as Vec2).subtract(overflow);
		}
	}
}
