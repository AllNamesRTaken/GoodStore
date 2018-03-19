import { Range2 } from "goodcore/struct/Range2";
import { Vec2 } from "goodcore/struct/Vec2";


export interface IRequestConfig {
	viewPort?: Range2;
	pxViewPort?: Range2;
	requestMargin?: Vec2;
	forceStream?: boolean;
	pxRequestMargin?: Vec2;
}
