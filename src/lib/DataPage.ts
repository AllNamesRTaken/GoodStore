import { Initable } from "goodcore/standard/mixins/Initable";
import { Poolable } from "goodcore/standard/mixins/Poolable";
import { Rect } from "goodcore/struct/Rect";
import { Vec2 } from "goodcore/struct/Vec2";
import { DataRow } from "./DataRow";
import { IPageInfoDto } from "./Dto/IPageInfoDto";

export interface IDataPageDictionary {
	[index: number]: DataPage;
}
@Poolable
@Initable
export class DataPage implements IPageInfoDto, IInitable<DataPage>, IPoolable {
	init(obj: any, mapping?: any): this {
		throw new Error("Method not implemented.");
	}
	__pool__: IPool<IPoolable>;
	release(): void {
		throw new Error("Method not implemented.");
	}
	initPool(pool: IPool<IPoolable>): void {
		throw new Error("Method not implemented.");
	}
	private _id: number = 0;
	private _r: DataRow[] = [];
	private _pxScope: Rect = new Rect();
	private _cellSize: Vec2 = new Vec2();

	public get id(): number {
		return this._id;
	}
	public set id(v: number) {
		this._id = v;
	}
	public get r(): DataRow[] {
		return this._r;
	}
	public get pxScope(): Rect {
		return this._pxScope;
	}
	public set pxScope(v: Rect) {
		this._pxScope.set(v);
	}
	public get cellSize(): Vec2 {
		return this._cellSize;
	}
	public set cellSize(v: Vec2) {
		this._cellSize.set(v);
		this.initData(v);
	}

	constructor() {
		this._r = new Array<DataRow>();
	}
	public addRow(): DataRow {
		const result = new DataRow();
		this._r.push(result);
		return result;
	}
	private initData(size: Vec2) {
		let i = -1;
		if (this._r === undefined) {
			this._r = [];
		}
		let r = this._r;
		let j = r.length - 1;
		let k = Math.min(j, size.y);
		while (++j < size.y) {
			r.push(new DataRow(size.x));
		}
		if (r.length !== size.y) {
			r.length = size.y;
		}
		while (++i < k) {
			r[i].c.length = size.x;
		}
	}
}
