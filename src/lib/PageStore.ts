import {DataRow} from "./DataRow";
import {IDataCellDto} from "./Dto/IDataCellDto";
import {IDataRowDto} from "./Dto/IDataRowDto";
import {IDataStoreResponseDto} from "./Dto/IDataStoreResponseDto";

import { Arr, Dictionary, Pool, Range2, Rect, Util, Vec2, IPoolable } from "goodcore";
import { IRange2 } from "goodcore";
import { IRect } from "goodcore";
import { IVec2 } from "goodcore";
import { CallerInternal } from "./CallerInternal";
import { DataPage } from "./DataPage";
import { IRange1 } from "./Dto/IRange1";

export class PageStore {
	private _pagePxRanges: {
		x: IRange1[];
		y: IRange1[];
	};
	public isDebug: any = true;
	private _pagePool: Pool<DataPage>;
	private _pageLookup: Dictionary<DataPage>;
	private _pageQueue: DataPage[];
	private _requestedPages: Dictionary<DataPage>;
	private _cellsPerPage: Vec2; // size of a page in cells
	private _pagesPerCell: Vec2; // 1/_cellsPerPage
	private _totalPages: Vec2;
	private _totalCells: Vec2;
	private _totalPx: Vec2;
	private _retainSize: number; // number of pages to store
	private _usePx: boolean = true;
	private _dummyRect: Rect = new Rect();

	public get totalPx(): Vec2 {
		return this._totalPx;
	}
	public get totalCells(): Vec2 {
		return this._totalCells;
	}
	public get totalPages(): Vec2 {
		return this._totalPages;
	}

	public setPageSize(v: IVec2): void {
		if (!this._cellsPerPage.equals(v)) {
			this.emptyPageStore();
		}
		this._cellsPerPage.set(v);
		this._pagesPerCell.x = 1 / v.x;
		this._pagesPerCell.y = 1 / v.y;
	}

	constructor(pageSize: Vec2, retainSize: number, pagePxRanges: { x: IRange1[], y: IRange1[] } = null) {
		this._pagePool = new Pool(DataPage);
		this._pageLookup = new Dictionary<DataPage>();
		this._requestedPages = new Dictionary<DataPage>();
		this._pageQueue = new Array<DataPage>();
		this._cellsPerPage = new Vec2();
		this._pagesPerCell = new Vec2();
		this.setPageSize(pageSize);
		this._retainSize = retainSize;
		this._totalPages = new Vec2();
		this._totalCells = new Vec2();
		this._totalPx = new Vec2();
		this._pagePxRanges = pagePxRanges;
		this._usePx = pagePxRanges !== null;
	}

	public isRequestedDataLoaded(caller: CallerInternal): boolean {
		let result: boolean = false;
		const hasLoadPort = !(caller.loadPort as Range2).isZero;
		const hasPxLoadPort = !(caller.pxLoadPort as Range2).isZero;
		if (hasLoadPort || hasPxLoadPort) {
			const pages = hasLoadPort ? 
				this.cellRangeToPageRange(caller.loadPort) :
				this.pxRangeToPageRange(caller.pxLoadPort);
			result = pages.first((p) => !this._pageLookup.has(p.y * this._totalPages.x + p.x)) === null;
		}
		return result;
	}

	public limitPagesToLoad(pageRange: Range2): Range2 {
		// Checks from all directions if some pages are loaded already 
		// so that the pageRange requested can be made smaller
		const result = pageRange.clone();
		const pages = pageRange.toRect();
		let isNew = false;
		// top to bottom
		for (let i = pages.start.y; i < pages.stop.y; i += 1) {
			for (let j = pages.start.x; j < pages.stop.x; j += 1) {
				if (!this._pageLookup.has(i * this._cellsPerPage.x + j)
					&& !this._requestedPages.has(i * this._cellsPerPage.x + j)) {
					isNew = true;
					break;
				}
			}
			if (isNew) { break; }
			result.pos.y += 1;
			result.size.y -= 1;
		}
		isNew = false;
		// bottom to top
		for (let i = pages.stop.y; i > pages.start.y; i -= 1) {
			for (let j = pages.start.x; j < pages.stop.x; j += 1) {
				if (!this._pageLookup.has(i * this._cellsPerPage.x + j)
					&& !this._requestedPages.has(i * this._cellsPerPage.x + j)) {
					isNew = true;
					break;
				}
			}
			if (isNew) { break; }
			result.size.y -= 1;
		}
		isNew = false;
		// left to right
		for (let i = pages.start.x; i < pages.stop.x; i += 1) {
			for (let j = pages.start.y; j < pages.stop.y; j += 1) {
				if (!this._pageLookup.has(j * this._cellsPerPage.x + i)
					&& !this._requestedPages.has(j * this._cellsPerPage.x + i) ) {
					isNew = true;
					break;
				}
			}
			if (isNew) { break; }
			result.pos.x += 1;
			result.size.x -= 1;
		}
		isNew = false;
		// right to left
		for (let i = pages.stop.x; i > pages.start.x; i -= 1) {
			for (let j = pages.start.y; j < pages.stop.y; j += 1) {
				if (!this._pageLookup.has(j * this._cellsPerPage.x + i)
					&& !this._requestedPages.has(j * this._cellsPerPage.x + i)) {
					isNew = true;
					break;
				}
			}
			if (isNew) { break; }
			result.size.x -= 1;
		}
		return result;
	}

	private cellSpaceToPageSpaceX(v: number): number {
		return (v / this._cellsPerPage.x) | 0;
	}

	private cellSpaceToPageSpaceY(v: number): number {
		return (v / this._cellsPerPage.y) | 0;
	}

	private cellSpaceToInnerPageSpaceX(v: number): number {
		return v - (this._cellsPerPage.x * this.cellSpaceToPageSpaceX(v));
	}

	private cellSpaceToInnerPageSpaceY(v: number): number {
		return v - (this._cellsPerPage.y * this.cellSpaceToPageSpaceY(v));
	}

	public pxRangeToPageRange(pixels: IRange2): Range2 {
		Util.assert(!!this._pagePxRanges.x && !! this._pagePxRanges.y, "pagePxRanges does not contain valid ranges");
		let x1 = pixels.pos.x;
		let pageX1 = Arr.binarySearch<IRange1>(this._pagePxRanges.x, (el) => {
			return (el.p + el.s <= x1) ? -1 : 
				(el.p > x1) ? 1 : 
				0;
		});
		let y1 = pixels.pos.y;
		let pageY1 = Arr.binarySearch<IRange1>(this._pagePxRanges.y, (el) => {
			return (el.p + el.s <= y1) ? -1 : 
				(el.p > y1) ? 1 : 
				0;
		});
		let x2 = pixels.pos.x + pixels.size.x - 1;
		let pageX2 = Arr.binarySearch<IRange1>(this._pagePxRanges.x, (el) => {
			return (el.p + el.s <= x2) ? -1 : 
				(el.p > x2) ? 1 : 
				0;
		});
		let y2 = pixels.pos.y + pixels.size.y - 1;
		let pageY2 = Arr.binarySearch<IRange1>(this._pagePxRanges.y, (el) => {
			return (el.p + el.s <= y2) ? -1 : 
				(el.p > y2) ? 1 : 
				0;
		});
		let pages = new Rect(pageX1, pageY1, pageX2, pageY2, true).toRange2();
		return pages;
	}
	public cellRangeToPageRange(cells: IRange2): Range2 {
		let pages = new Range2().set(cells);
		const rect = pages.toRect(false, this._dummyRect).translate(this._pagesPerCell);
		rect.start.toInt();
		rect.stop.ceil();
		rect.toRange2(pages);
		return pages;
	}

	public pageRangeToCellRange(pages: IRange2): Range2 {
		return (new Range2()).set(pages).translate(this._cellsPerPage).toInt();
	}

	public pxRangeToCellRange(pixels: IRange2): Range2 {
		const pageRange = this.pxRangeToPageRange(pixels);
		const pages = this.getDataPagesForPageRange(pageRange);
		// check first and last page for corner cells making up the pixel range
		// First page first
		let pos = pages[0].pxScope.start.clone();
		let indexX1 = 0;
		Arr.until<IDataCellDto>(pages[0].r[0].c, 
			(el, i) => pixels.pos.x < pos.x + el.w, 
			(el, i) => { pos.x += el.w; ++indexX1; }
		);
		let indexY1 = 0;
		Arr.until<DataRow>(pages[0].r, 
			(el, i) => pixels.pos.y < pos.y + el.h, 
			(el, i) => { pos.y += el.h; ++indexY1; }
		);
		// Last page second
		pos = pages[pages.length - 1].pxScope.start.clone();
		let indexX2 = 0;
		Arr.until<IDataCellDto>(pages[pages.length - 1].r[0].c, 
			(el, i) => pixels.pos.x + pixels.size.x - 1 < pos.x + el.w, 
			(el, i) => { pos.x += el.w; ++indexX2; }
		);
		let indexY2 = 0;
		Arr.until<DataRow>(pages[pages.length - 1].r, 
			(el, i) => pixels.pos.y + pixels.size.y - 1 < pos.y + el.h, 
			(el, i) => { pos.y += el.h; ++indexY2; }
		);
		let start = pages[0].r[indexY1].c[indexX1].i; 
		let stop = pages[pages.length - 1].r[indexY2].c[indexX2].i; 
		let result =  new Rect(start.x, start.y, stop.x, stop.y, true).toRange2();
		return result;
	}

	public addDataToPageStore(
		callers: CallerInternal[], 
		payload: IDataStoreResponseDto
	): void {
		const pages: DataPage[] = this.partitionDataIntoPages(payload.r, payload.dataPort, payload.pxScope);
		pages.forEach((p: DataPage) => this.insertPage(p)); // Number of pages should be very low. forEach is perhaps ok.
		this.cleanPageStore(callers); // Remove pages that are too old
	}

	public readPropertiesFromResponse(payload: IDataStoreResponseDto) {
		if (!this._totalCells.equals(payload.totalCells)) {
			this._totalPages.set(payload.totalCells).scale(this._pagesPerCell);
			this._totalCells.set(payload.totalCells);
			if (this._usePx) {
				this._totalPx.set(payload.totalPx);
			}
		}
	}
	private emptyPageStore() {
		while (this._pageQueue.length > 0) {
			this.shiftPageQueue();
		}
	}

	public cleanPageStore(callers: CallerInternal[]) {
		// Should skip locked pages by moving them to the top of the queue
		let locked = this.calculateLockedPages(callers);
		let retainCount = Math.max(this._retainSize, locked.list.count);
		// Working on reversed _pageQueue so that we don't remove newly pushed first
		Arr.reverse(this._pageQueue);
		Arr.reverseUntil(this._pageQueue, 
			(el, i) => this._pageQueue.length <= retainCount, 
			(el, i) => {
				if (!locked.has("" + this._pageQueue[i].id)) {
					this.removePageFromQueue(this._pageQueue[i]);
				}
			}
		);
		Arr.reverse(this._pageQueue);
	}
	private removePageFromQueue(page: DataPage): void {
		Arr.remove(this._pageQueue, page);
		this.deletePageById(page.id);
		page.release();
	}
	private shiftPageQueue(): void {
		const toRemove = this._pageQueue.shift();
		this.deletePageById(toRemove.id);
		toRemove.release();
	}
	private deletePageById(pageId: number): void {
		const exists = this._pageLookup.has(pageId);
		if (exists) {
			this._pageLookup.delete(pageId);
		}
	}
	private partitionDataIntoPages(data: IDataRowDto[], cellPort: IRange2, pxScope: IRect): DataPage[] {
		const pageRect = this.cellRangeToPageRange(cellPort).toRect();
		const result: DataPage[] = new Array<DataPage>();

		let pageCountY = 0;
		for (let pageY = pageRect.start.y; pageY < pageRect.stop.y; ++pageY) {
			let pageCountX = 0;
			for (let pageX = pageRect.start.x; pageX < pageRect.stop.x; ++pageX) {
				const id = (pageY * this._totalPages.x) + pageX;
				const isNewPage = !this._pageLookup.has(id);
				if ( isNewPage ) {
					const dataPage = this._pagePool.get();
					// Replaced Init for GC reasons
					dataPage.id = id;
					dataPage.cellSize = this._cellsPerPage;
					if (this._usePx) {
						let pagePxX = this._pagePxRanges.x[pageX];
						let pagePxY = this._pagePxRanges.y[pageY];
						// Replaced Init for GC reasons
						let pagePxScope = dataPage.pxScope;
						pagePxScope.start.x = pagePxX.p;
						pagePxScope.start.y = pagePxY.p;
						pagePxScope.stop.x = pagePxX.p + pagePxX.s - 1;
						pagePxScope.stop.y = pagePxY.p + pagePxY.s - 1;
					}

					result.push(dataPage);
					const dataStartY = pageCountY * this._cellsPerPage.y;
					const dataStartX = pageCountX * this._cellsPerPage.x;
					const dataLimitY = dataStartY + this._cellsPerPage.y;
					const dataLimitX = dataStartX + this._cellsPerPage.x;
					let pageRowNum = 0;
					for (
						let i = dataStartY; 
						i < dataLimitY && i < data.length; 
						++i
					) {
						const row = data[i];
						const pageRow = dataPage.r[pageRowNum];
						// Replaced Init for GC reasons
						pageRow.h = row.h;
						pageRow.i = row.i;
						pageRow.d = row.d;
						let pageColNum = 0;
						for (
							let j = dataStartX; 
							j < dataLimitX && j < row.c.length; 
							++j
						) {
							pageRow.c[pageColNum] = row.c[j];
							++pageColNum;
						}
						++pageRowNum;
					}
				}
				++pageCountX;
			}
			++pageCountY;
		}
		return result;
	}
	private insertPage(page: DataPage): void {
		const isNew = !this._pageLookup.has(page.id);
		if (!isNew) {
			Arr.removeOneByFn(this._pageQueue, function(el: DataPage) {
				return el.id === page.id;
			});
		}
		this._pageQueue.push(page);
		this._pageLookup.set(page.id, page);
	}
	public calculateLockedPages(callers: CallerInternal[]): Dictionary<number> {
		let unique = new Dictionary<number>();
		Arr.forEach(
			Arr.flatten<number>(
				Arr.map(callers, (caller: CallerInternal) => {
					return this.getPageIdsForViewPort(caller.loadPort);
				})
			),
			(id: number) => unique.set(id, id)
		);
		return unique;
	}

	public assembleDataFromPages(caller: CallerInternal): DataRow[] {
		const result: DataRow[] = new Array<DataRow>();
		let loadPort = this.getLoadPort(caller);
		Util.loop(loadPort.size.y, (i) => 
			result.push(new DataRow(loadPort.size.x))
		);
		const dataPages = this.getDataPages(caller);
		const loadRect = loadPort.toRect();
		const pageRange = this.cellRangeToPageRange(loadPort);
		const viewSpace = new Vec2();
		const modelSpace = new Vec2();
		const pageSpace = new Vec2();
		const innerPageSpace = new Vec2();
		let dataPageNum: number;
		const modelRowCount = result.length;
		const modelColCount = result[0] === undefined ? 0 : result[0].c.length;
		const relativePageSpace = new Vec2();
		// loop over viewPort space
		// translate viewPort coort to Page coord
		// translate viewPort coord to PageSpace in the correct page
		// Set model space to 0,0
		// Fill model to the length of Min(model.length, viewPort.length)
		//  by reading from page at page space coord
		//TODO: use page pxScope and row/col width/height when assembling data from pages to create loadPort pxScope and add that to DataStoreConsumable
		//TODO: add totalPx and totalCells to DataStoreScope 
		for (
			viewSpace.y = loadRect.start.y; 
			viewSpace.y < loadRect.stop.y && modelSpace.y < modelRowCount; 
			viewSpace.y += 1, modelSpace.y += 1
		) {
			pageSpace.y = this.cellSpaceToPageSpaceY(viewSpace.y);
			modelSpace.x = 0;

			innerPageSpace.y = this.cellSpaceToInnerPageSpaceY(viewSpace.y);
			relativePageSpace.set(pageSpace).subtract(pageRange.pos);
			dataPageNum = relativePageSpace.y * pageRange.size.x + relativePageSpace.x;

			let rowInfo = dataPages[dataPageNum].r[innerPageSpace.y];
			result[modelSpace.y].init( { i: rowInfo.i, h: rowInfo.h, d: rowInfo.d } );
			for (
				viewSpace.x = loadRect.start.x; 
				viewSpace.x < loadRect.stop.x && modelSpace.x < modelColCount; 
				viewSpace.x += 1, modelSpace.x += 1
			) {
				pageSpace.x = this.cellSpaceToPageSpaceX(viewSpace.x);
				innerPageSpace.x = this.cellSpaceToInnerPageSpaceX(viewSpace.x);
				innerPageSpace.y = this.cellSpaceToInnerPageSpaceY(viewSpace.y);
				relativePageSpace.set(pageSpace).subtract(pageRange.pos);
				dataPageNum = relativePageSpace.y * pageRange.size.x + relativePageSpace.x;
				result[modelSpace.y].c[modelSpace.x] = dataPages[dataPageNum].r[innerPageSpace.y].c[innerPageSpace.x];
			}
		}

		return result;
	}
	private getPageIdsForViewPort(viewPort: IRange2): number[] {
		const pages = this.cellRangeToPageRange(viewPort);
		const result: number[] = [];
		pages.forEach((p) => {
			const pos = p.y * this._cellsPerPage.x + p.x;
			if (this._pageLookup.has(pos)) {
				result.push(this._pageLookup.get(pos).id);
			}
			return false;
		});
		return result;
	}
	public getLoadPort(caller: CallerInternal): Range2 {
		let byCells = !(caller.loadPort as Range2).isZero;
		return byCells ? 
			caller.loadPort as Range2 : 
			this.pxRangeToCellRange(caller.pxLoadPort as Range2);
	}
	private getDataPages(caller: CallerInternal): DataPage[] {
		let byCells = !(caller.loadPort as Range2).isZero;
		return byCells ? 
			this.getDataPagesForCellPort(caller.loadPort as Range2) :
			this.getDataPagesForPxPort(caller.pxLoadPort as Range2);
	}
	public getDataPagesForCellPort(port: Range2): DataPage[] {
		const pages = this.cellRangeToPageRange(port);
		return this.getDataPagesForPageRange(pages);
	}
	public getDataPagesForPxPort(port: Range2): DataPage[] {
		const pages = this.pxRangeToPageRange(port);
		return this.getDataPagesForPageRange(pages);
	}
	public getDataPagesForPageRange(pages: Range2): DataPage[] {
		const result: DataPage[] = new Array<DataPage>();
		pages.forEach((p) => {
			const pos = p.y * this._totalPages.x + p.x;
			if (this._pageLookup.has(pos)) {
				result.push(this._pageLookup.get(pos));
			}
			return false;
		});
		return result;
	}
}
