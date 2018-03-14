import { Arr, Dictionary, Pool, Range2, Rect, Test, Timer, Util, Vec2 } from "goodcore";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { Observable } from "rxjs/Observable";
import { Subscription } from "rxjs/Subscription";
import { CallerHandle } from "./CallerHandle";
import { CallerInternal } from "./CallerInternal";
import { DataPage, IDataPageDictionary } from "./DataPage";
import { DataRow } from "./DataRow";
import { DataStoreConsumable } from "./DataStoreConsumable";
import { DataStoreRequestDto } from "./Dto/DataStoreRequestDto";
import { IDataRowDto } from "./Dto/IDataRowDto";
import { IDataStoreResponseDto } from "./Dto/IDataStoreResponseDto";
import { IRange1 } from "./Dto/IRange1";
import { IDataStoreConfig } from "./IDataStoreConfig";
import { PageStore } from "./PageStore";
import { RequestConfig } from "./RequestConfig";

export class DataStore {
	public static DEFAULT_CONFIG: IDataStoreConfig = {
		pageSize: new Vec2(10, 10),
		retainSize: 10,
		endPointFn: null
	};
	public isDebug = true;

	private _id: string = Util.newUUID();

	private _endPointFn: (payload: DataStoreRequestDto) => Observable<any>; // where we get the data
	private _usePx: boolean = true;
	private _requestCounter: number = 0; // how many outstand
	private _handleCounter: number = 0;
	private _callers: CallerInternal[] = [];
	private _pageStore: PageStore = null;
	constructor(config: IDataStoreConfig) {
		this._endPointFn = config.endPointFn ? config.endPointFn : DataStore.DEFAULT_CONFIG.endPointFn;
		this._pageStore = new PageStore(
			config.pageSize || DataStore.DEFAULT_CONFIG.pageSize,
			config.retainSize ? config.retainSize : DataStore.DEFAULT_CONFIG.retainSize,
			config.pagePxRanges
		);
	}

// Updates the viewport and loadport, 
// fetches new data if the loadport is outside loaded datapages or if the force flag i true
// re-fixate the loadport and streams new data to the consumer if the viewport is outside the current fixedloadport
	public load(caller: CallerInternal, force: boolean = false): void {
		Util.assert(Test.isFunction(this._endPointFn), "EndPoint is valid function", this.isDebug);
		Util.assert(caller.viewPort !== undefined, "ViewPort is defined", this.isDebug);

		if (this.loadPortHasChanged(caller) || force) {
			caller.limitLoadPortByTotalCells();
			caller.limitPxLoadPortByTotalPx();
			if (this._pageStore.isRequestedDataLoaded(caller)) {
				this.addDataToStream(caller, force);
				this._pageStore.cleanPageStore(this._callers); // Remove pages that are too old

			} else {
				caller.fetchSubscription = this.fetchData(caller).subscribe(
					(value: IDataStoreResponseDto) => {
						if (!Util.assert(value !== undefined, "Payload from server was empty in DataStore.load()", this.isDebug)) { return; }
						this.readPropertiesFromResponse(caller, value);
						caller.limitLoadPortByTotalCells();
						caller.limitPxLoadPortByTotalPx();
						this._pageStore.addDataToPageStore(this._callers, value);
						if (caller.ignoreFetch < caller.requestId) {
							this.addDataToStream(caller, force);
						}
					},
					(error: any) => {
						caller.cancelOngoingFetch();
						this.onDataFail(caller, error);
					}
				);		
			}
		}
	}
	private loadPortHasChanged(caller: CallerInternal) {
		const loadPort = caller.loadPort as Range2;
		const pxLoadPort = caller.pxLoadPort as Range2;
		return (!loadPort.isZero && !loadPort.equals(caller.fixedLoadPort)) ||
			(!pxLoadPort.isZero && !pxLoadPort.equals(caller.fixedPxLoadPort));
	}
	private readPropertiesFromResponse(caller: CallerInternal, value: IDataStoreResponseDto) {
		caller.totalCells = new Vec2().set(value.totalCells);
		this._usePx = !!value.pxScope;
		if (this._usePx) {
			caller.totalPx.set(value.totalPx);
		}
		if (value.cellsPerPage) {
			this._pageStore.setPageSize(value.cellsPerPage);
		}
		this._pageStore.readPropertiesFromResponse(value);

	}
	public register(config: RequestConfig): CallerHandle {
		const result = new CallerHandle(this._handleCounter, this, config);
		this._handleCounter += 1;
		this._callers.push(result.internal);
		return result;
	}

	private fetchData(caller: CallerInternal): Observable<any> {
		const dto = this.createRequestDTO(caller);
		caller.requestId = this._requestCounter;
		let data: any;
		caller.cancelOngoingFetch();
		return this._endPointFn(dto);
	}

	private createRequestDTO(caller: CallerInternal): DataStoreRequestDto {
		let pxRequest: Range2 = null;
		let cellRequest: Range2 = null;
		let pageRequest: Range2 = null;
		if (!caller.pxViewPort.isZero) {
			pageRequest = this._pageStore.pxRangeToPageRange(caller.pxLoadPort);
		} else {
			pageRequest = this._pageStore.cellRangeToPageRange(caller.loadPort);
		}
		pageRequest = this._pageStore.limitPagesToLoad(pageRequest);
		cellRequest = this._pageStore.pageRangeToCellRange(pageRequest);
		let foo = new DataStoreRequestDto();
		const result = new DataStoreRequestDto().init( {
			sourceId: this._id,
			requestId: this._requestCounter,
			cellRequest
		} );
		this._requestCounter += 1;
		return result;
	}

	private onDataFail(caller: CallerInternal, reason: any): void {
		throw new Error("Not Implemented");
	}

	private addDataToStream(caller: CallerInternal, force: boolean = false): void {
		if (!this.viewPortIsAlreadyStreamed(caller) || force) {
			caller.fixLoadPort();
			const loadPort = this._pageStore.getLoadPort(caller);
			const rows: DataRow[] = this._pageStore.assembleDataFromPages(caller);
			let pxScope = null;
			if (this._usePx) {
				pxScope = this.calculatePxRangeFromCellRange(loadPort);
			}
			let result = new DataStoreConsumable();
			result.init( { totalCells: this._pageStore.totalCells, totalPx: this._pageStore.totalPx, loadPort, rows, pxScope } );
			caller.stream.next(result);
		}
	}

	private viewPortIsAlreadyStreamed(caller: CallerInternal): boolean {
		return (!caller.viewPort.isZero && caller.fixedLoadPort.contains(caller.viewPort)) ||
			(!caller.pxViewPort.isZero && caller.fixedPxLoadPort.contains(caller.pxViewPort));
	} 

	private calculatePxRangeFromCellRange(loadPort: Range2): Rect {
		let result: Rect = new Rect();
		const dataPages = this._pageStore.getDataPagesForCellPort(loadPort);
		const loadRect = new Rect().fromRange2(loadPort);
		let startPx: Vec2 = dataPages[0].pxScope.start.clone();
		let stopPx: Vec2 = dataPages[dataPages.length - 1].pxScope.stop.clone();
		let leftIndex = dataPages[0].r[0].c[0].i.x;
		let rightIndex = dataPages[0].r[0].c[dataPages[0].r[0].c.length - 1].i.x;
		let topIndex = dataPages[0].r[0].i;
		let bottomIndex = dataPages[dataPages.length - 1].r[dataPages[dataPages.length - 1].r.length - 1].i;

		let cells = Arr.shallowCopy(dataPages[0].r[0].c);
		// left and right
		Arr.until(cells, 
			(cell, i) => i + leftIndex >= loadRect.start.x, 
			(cell, i) => startPx.x += cell.w );
		Arr.reverse(cells);
		Arr.until(cells, 
			(cell, i) => rightIndex - i >= loadRect.start.x, 
			(cell, i) => stopPx.x -= cell.w );

		// top and bottom
		let rows = Arr.shallowCopy(dataPages[0].r);
		Arr.until(rows, 
			(row, i) => i + topIndex >= loadRect.start.y, 
			(row, i) => startPx.y += row.h );
		Arr.reverse(rows);
		Arr.until(rows, 
			(row, i) => rightIndex - i >= loadRect.start.y, 
			(row, i) => stopPx.y -= row.h );

		result.start = startPx;
		result.stop = stopPx;
		return result;
	}

}
