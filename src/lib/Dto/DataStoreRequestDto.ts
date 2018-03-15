import { Initable, Range2 } from "goodcore";

@Initable
export class DataStoreRequestDto implements IInitable<DataStoreRequestDto> {
	init(obj: any, mapping?: any): this {
		throw new Error("Method not implemented.");
	}
	public sourceId: string = "";
	public requestId: number = 0;
	public cellRequest: Range2|null = null;
}
