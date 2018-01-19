import { Initable, Poolable, IPoolable, IPool, IInitable } from "goodcore";
import { IDataCellDto } from "./Dto/IDataCellDto";
import { IDataRowDto } from "./Dto/IDataRowDto";

@Poolable
@Initable
export class DataRow implements IDataRowDto, IPoolable, IInitable<DataRow> {
	public init(obj: Partial<DataRow>): DataRow {
		throw new Error("Method not implemented.");
	}
	public __pool__: IPool<IPoolable>;
	public release(): void {
		throw new Error("Method not implemented.");
	}
	public initPool(pool: IPool<IPoolable>): void {
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
