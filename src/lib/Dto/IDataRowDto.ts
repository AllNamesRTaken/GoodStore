// This is what the server has to deliver
import { IDataCellDto } from "./IDataCellDto";

export interface IDataRowDto {
	i: number;
	h: number;
	c: IDataCellDto[];
	d: any; // should contain complete row information needed my the consumer,	
}
