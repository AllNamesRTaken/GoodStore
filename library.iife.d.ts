import { Range2, Rect, Vec2 } from "goodcore";
import { Observable } from "rxjs/Observable";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { Subscription } from "rxjs/Subscription";

interface IRange1 {
	p: number; // start pixel position
	s: number; // pixel size
}
interface IPageInfoDto {
	id: number;
	pxScope: IRect;
	cellSize: IVec2;
}
interface IDataRowDto {
	i: number;
	h: number;
	c: IDataCellDto[];
	d: any; // should contain complete row information needed my the consumer,	
}
interface IDataCellDto {
	i: IVec2;
	w: number;
	d: any;
}
interface IDataStoreResponseDto {
	totalCells: IVec2; // available cells
	totalPx?: IVec2; // pixel size
	dataPort: IRange2; // cells returned
	pxScope?: IRect; // pixel start and stop of returned data
	r: IDataRowDto[]; // row and cell objects with data
	cellsPerPage?: IVec2; 
}
interface IDataStoreConfig {
	pageSize?: Vec2;
	retainSize: number; 
	endPointFn: (payload: any) => Observable<any>;
	pagePxRanges?: { x: IRange1[], y: IRange1[] };
}
interface IRequestConfig {
	viewPort?: Range2;
	pxViewPort?: Range2;
	requestMargin?: Vec2;
	forceStream?: boolean;
	pxRequestMargin?: Vec2;
}

declare namespace goodstore {
    export class DataStore {
        static DEFAULT_CONFIG: IDataStoreConfig;
        isDebug: boolean;
        constructor(config: IDataStoreConfig);
        load(caller: CallerInternal, force?: boolean): void;
        register(config: RequestConfig): CallerHandle;
    }

    export class DataStoreConsumable implements IInitable<DataStoreConsumable> {
        init(obj: Partial<DataStoreConsumable>): this;
        totalCells: Vec2;
        totalPx: Vec2;
        loadPort: Range2;
        pxScope: Rect;
        rows: DataRow[];
    }

    export class DataStoreRequestDto implements IInitable<DataStoreRequestDto> {
        init(obj: Partial<DataStoreRequestDto>): this;
        sourceId: string;
        requestId: number;
        cellRequest: IRange2;
    }

    export class RequestConfig implements IRequestConfig, IInitable<RequestConfig> {
        init(obj: Partial<RequestConfig>): this;
        viewPort: Range2;
        requestMargin: Vec2;
        pxViewPort: Range2;
        pxRequestMargin: Vec2;
        loadPort: IRange2;
        pxLoadPort: IRange2;
    }

    export class CallerHandle {
        readonly internal: CallerInternal;
        readonly stream: BehaviorSubject<DataStoreConsumable>;
        viewPort: Range2;
        pxViewPort: Range2;
        requestMargin: Vec2;
        constructor(id: number, store: DataStore, config: RequestConfig);
        load(config?: IRequestConfig): void;
        unregister(): void;
    }
    export class CallerInternal {
        ignoreFetch: number;
        fetchSubscription: Subscription;
        requestId: number;
        totalCells: Vec2;
        totalPx: Vec2;
        config: RequestConfig;
        readonly stream: BehaviorSubject<DataStoreConsumable>;
        loadPort: IRange2;
        pxLoadPort: IRange2;
        readonly fixedLoadPort: Range2;
        readonly fixedPxLoadPort: Range2;
        viewPort: Range2;
        pxViewPort: Range2;
        constructor(config: RequestConfig, stream: BehaviorSubject<DataStoreConsumable>);
        fixLoadPort(): void;
        ignoreOngoingFetch(): void;
        cancelOngoingFetch(): void;
        limitLoadPortByTotalCells(): void;
        limitPxLoadPortByTotalPx(): void;
    }

    export class DataRow implements IDataRowDto, IPoolable, IInitable<DataRow> {
        init(obj: Partial<DataRow>): this;
        __pool__: IPool<IPoolable>;
        release(): void;
        initPool(pool: IPool<IPoolable>): void;
        i: number;
        h: number;
        c: IDataCellDto[];
        d: any;
        constructor(length?: number);
    }
}

