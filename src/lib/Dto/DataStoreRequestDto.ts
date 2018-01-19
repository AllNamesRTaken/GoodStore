import { Initable, Range2, IInitable } from "goodcore";

@Initable
export class DataStoreRequestDto implements IInitable<DataStoreRequestDto> {
	public init(obj: Partial<DataStoreRequestDto>): DataStoreRequestDto {
		throw new Error("Method not implemented.");
	}
	public sourceId: string;
	public requestId: number;
	public cellRequest: Range2;
}
