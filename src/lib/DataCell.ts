import { Initable, Poolable, Vec2, IPoolable, IPool } from "goodcore";
import { IVec2 } from "goodcore";
import { IDataCellDto } from "./Dto/IDataCellDto";

// This class is no longer in use
// Instead we use the Dto in order to save objects
@Poolable
@Initable
export class DataCell implements IDataCellDto, IPoolable {
	public __pool__: IPool<IPoolable>;
	public release(): void {
		throw new Error("Method not implemented.");
	}
	public initPool(pool: IPool<IPoolable>): void {
		throw new Error("Method not implemented.");
	}
	public i: IVec2 = {x: 0, y: 0};
	public w: number = 0;
	public d: any = null; // should contain complete information needed my the consumer,
}
