import { IDataRowDto } from "./IDataRowDto";
import { IPageInfoDto } from "./IPageInfoDto";
import { IRange1 } from "./IRange1";
export interface IDataStoreResponseDto {
	totalCells: IVec2; // available cells
	totalPx?: IVec2; // pixel size
	dataPort: IRange2; // cells returned
	pxScope?: IRect; // pixel start and stop of returned data
	r: IDataRowDto[]; // row and cell objects with data
	cellsPerPage?: IVec2; 
}
