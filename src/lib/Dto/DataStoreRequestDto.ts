import { Range2 } from "goodcore/struct/Range2";
import { Initable } from "goodcore/standard/mixins/Initable";


@Initable
export class DataStoreRequestDto implements IInitable<DataStoreRequestDto> {
	init(obj: any, mapping?: any): this {
		throw new Error("Method not implemented.");
	}
	public sourceId: string = "";
	public requestId: number = 0;
	public cellRequest: Range2|null = null;
}
