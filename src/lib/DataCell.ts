import { Initable } from "goodcore/standard/mixins/Initable";
import { Poolable } from "goodcore/standard/mixins/Poolable";
import { Vec2 } from "goodcore/struct/Vec2";
import { IDataCellDto } from "./Dto/IDataCellDto";

// This class is no longer in use
// Instead we use the Dto in order to save objects
@Poolable
@Initable
export class DataCell implements IDataCellDto, IInitable<DataCell>, IPoolable {
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
	public i: IVec2 = {x: 0, y: 0};
	public w: number = 0;
	public d: any = null; // should contain complete information needed my the consumer,
}
