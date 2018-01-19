import { Initable, Range2, Vec2, IInitable } from "goodcore";
import { IRange2 } from "goodcore";
import { IRequestConfig } from "./IRequestConfig";

@Initable
export class RequestConfig implements IRequestConfig, IInitable<RequestConfig> {
	public init(obj: Partial<RequestConfig>): RequestConfig {
		throw new Error("Method not implemented.");
	}
	public _viewPort: Range2 = new Range2();
	private _pxViewPort: Range2 = new Range2();
	public _requestMargin: Vec2 = new Vec2(0, 0);
	private _loadPort: Range2 = new Range2();
	private _pxLoadPort: Range2 = new Range2();
	public _pxRequestMargin: Vec2 = new Vec2(0, 0);

	public get viewPort(): Range2 {
		return this._viewPort;
	}
	public set viewPort(v: Range2) {
		this._viewPort.set(v);
		this._loadPort = this.calculateLoadPort(this._viewPort, this._requestMargin);
		this._pxViewPort.zero();
		this._pxLoadPort.zero();
	}
	public get requestMargin(): Vec2 {
		return this._requestMargin;
	}
	public set requestMargin(v: Vec2) {
		this._requestMargin.set(v);
		this._loadPort = this.calculateLoadPort(this._viewPort, this._requestMargin);
	}
	public get pxViewPort(): Range2 {
		return this._pxViewPort;
	}
	public set pxViewPort(v: Range2) {
		this._pxViewPort.set(v);
		this._pxLoadPort = this.calculateLoadPort(this._pxViewPort, this._pxRequestMargin);
		this._viewPort.zero();
		this._loadPort.zero();
	}
	public get pxRequestMargin(): Vec2 {
		return this._pxRequestMargin;
	}
	public set pxRequestMargin(v: Vec2) {
		this._pxRequestMargin.set(v);
		this._pxLoadPort = this.calculateLoadPort(this._pxViewPort, this._pxRequestMargin);
	}
	public get loadPort(): IRange2 {
		return this._loadPort;
	}
	public set loadPort(v: IRange2) {
		this._loadPort.set(v);
		this._pxLoadPort.zero();
	}
	public get pxLoadPort(): IRange2 {
		return this._pxLoadPort;
	}
	public set pxLoadPort(v: IRange2) {
		this._pxLoadPort.set(v);
		this._loadPort.zero();
	}
	private calculateLoadPort(viewPort: Range2, requestMargin: Vec2): Range2 {
		let result: Range2 = viewPort.clone();
		result.pos.subtract(requestMargin);
		result.size.add(requestMargin.clone().multiply(2));
		let underflow = result.pos.clone().invert().max( {x: 0, y: 0} );
		result.pos.add(underflow);
		result.size.subtract(underflow);
		return result;		
	}
}
