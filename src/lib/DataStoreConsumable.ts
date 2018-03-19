import { Range2 } from "goodcore/struct/Range2";
import { Rect } from "goodcore/struct/Rect";
import { Vec2 } from "goodcore/struct/Vec2";
import { Initable } from "goodcore/standard/mixins/Initable";
import { DataRow } from "./DataRow";

@Initable
export class DataStoreConsumable  implements IInitable<DataStoreConsumable> {
	init(obj: any, mapping?: any): this {
		throw new Error("Method not implemented.");
	}
	public totalCells: Vec2 = new Vec2();
	public totalPx: Vec2 = new Vec2();
	public loadPort: Range2|null = null;
	public pxScope: Rect = new Rect();
	public rows: DataRow[]|null = null;

}
