// This is what the server has to deliver

import { IRect } from "goodcore";
import { IVec2 } from "goodcore";

export interface IPageInfoDto {
	id: number;
	pxScope: IRect;
	cellSize: IVec2;
}
