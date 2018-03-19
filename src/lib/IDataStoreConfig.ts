import { Vec2 } from "goodcore/struct/Vec2";
import { Observable } from "rxjs/Observable";

import { IRange1 } from "./Dto/IRange1";

export interface IDataStoreConfig {
	pageSize?: Vec2;
	retainSize?: number; 
	endPointFn: ((payload: any) => Observable<any>) | null;
	pagePxRanges?: { x: IRange1[], y: IRange1[] };
}
