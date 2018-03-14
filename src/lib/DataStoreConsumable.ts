import { Initable, Range2, Rect, Vec2 } from "goodcore";
import { DataRow } from "./DataRow";

@Initable
export class DataStoreConsumable  implements IInitable<DataStoreConsumable> {
	init(obj: any, mapping?: any): this {
		throw new Error("Method not implemented.");
	}
	public totalCells: Vec2 = new Vec2();
	public totalPx: Vec2 = new Vec2();
	public loadPort: Range2 = null;
	public pxScope: Rect = new Rect();
	public rows: DataRow[] = null;

}
