import { IDataRowDto } from "../src/lib/dto/IDataRowDto";
import { IPageInfoDto } from "../src/lib/dto/IPageInfoDto";
import { IRange1 } from "../src/lib/dto/IRange1";
interface IDataStoreResponseDto {
	totalCells: IVec2; // available cells
	totalPx?: IVec2; // pixel size
	dataPort: IRange2; // cells returned
	pxScope?: IRect; // pixel start and stop of returned data
	r: IDataRowDto[]; // row and cell objects with data
	cellsPerPage?: IVec2; 
}