import { Range2, Vec2 } from "goodcore";

export interface IRequestConfig {
	viewPort?: Range2;
	pxViewPort?: Range2;
	requestMargin?: Vec2;
	forceStream?: boolean;
	pxRequestMargin?: Vec2;
}
