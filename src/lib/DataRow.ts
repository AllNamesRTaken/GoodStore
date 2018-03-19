import { Initable } from "goodcore/standard/mixins/Initable";
import { Poolable } from "goodcore/standard/mixins/Poolable";
import { IDataCellDto } from "./Dto/IDataCellDto";
import { IDataRowDto } from "./Dto/IDataRowDto";

@Poolable
@Initable
export class DataRow implements IDataRowDto, IInitable<DataRow>, IPoolable {
	__pool__: IPool<IPoolable>;
	release(): void {
		throw new Error("Method not implemented.");
	}
	initPool(pool: IPool<IPoolable>): void {
		throw new Error("Method not implemented.");
	}
	init(obj: any, mapping?: any): this {
		throw new Error("Method not implemented.");
	}
	public i: number = 0;
	public h: number = 0;
	public c: IDataCellDto[];
	public d: any = null; // should contain complete row information needed my the consumer,
	public constructor(length: number = 0) {
		this.c = new Array<IDataCellDto>(length);
	}
}
