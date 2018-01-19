import { Initable, Range2, Rect, Vec2, IInitable } from "goodcore";
import { DataRow } from "./DataRow";

@Initable
export class DataStoreConsumable implements IInitable<DataStoreConsumable> {
	public init(obj: Partial<DataStoreConsumable>): DataStoreConsumable {
		throw new Error("Method not implemented.");
	}
	public totalCells: Vec2 = new Vec2();
	public totalPx: Vec2 = new Vec2();
	public loadPort: Range2 = null;
	public pxScope: Rect = new Rect();
	public rows: DataRow[] = null;

}
