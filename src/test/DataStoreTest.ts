import { should } from "chai";  // Using Should style
import { Arr, Range2, Rect, Timer, Util, Vec2 } from "goodcore";
import { Observable } from "rxjs/Observable";
import { Subscription } from "rxjs/Subscription";
import { Subscriber } from "rxjs/Subscriber";
import { DataStore } from "../lib/DataStore";
import { DataStoreConsumable } from "../lib/DataStoreConsumable";
import { DataStoreRequestDto } from "../lib/Dto/DataStoreRequestDto";
import { IDataStoreResponseDto } from "../lib/Dto/IDataStoreResponseDto";
import { IDataStoreConfig } from "../lib/IDataStoreConfig";
import { RequestConfig } from "../lib/RequestConfig";
import { mocDataResult1, mocDataResult2, mocDataResult3 } from "./MocResultData";
should();  // Modifies `Object.prototype`

describe("DataStore",
	function() {
		it("should load correct data when cell ports are used",
			function(done) {
				//Setup
				let mocDataResult = Arr.shallowCopy(mocDataResult1);
				
				let dsc: IDataStoreConfig = {
					pageSize: new Vec2(2, 2),
					retainSize: 4,
					endPointFn: (payload: DataStoreRequestDto): Observable<any> => {
						let result = new Observable<any>( (observable: Subscriber<any>) => { 
							observable.next(mocDataResult.shift()); 
						});
						return result;
					}
				};
				let ds = new DataStore(dsc);

				let handle = ds.register( new RequestConfig() );

				let req = 0;
				handle.stream.subscribe({
					next: (v: DataStoreConsumable) => {
						switch (req) {
							case 1:
								v.rows![0].c[2].d.should.equal(3, "cell 3 on row 1 should have data = 3");
								v.loadPort!.equals(new Range2(0, 0, 4, 2)).should.equal(true, "loadport should have correct value");
								v.pxScope.isZero.should.equal(true, "pxScope should be zero if no px to page lookup has been set in config");
								v.totalCells.equals(new Vec2(4, 6)).should.equal(true, "totalCells should have correct value") ;
								v.totalPx.isZero.should.equal(true, "totalPx should be zero if no px to page lookup has been set in config");
								v.rows![0].h.should.equal(10);
								v.rows![1].i.should.equal(1);
								v.rows![0].d.should.equal("rowData");
								v.rows![0].c[0].w.should.equal(10);
								v.rows![1].c[1].i.x.should.equal(1);
								v.rows![1].c[2].i.x.should.equal(2);
								break;
							case 2:
								v.rows![1].c[2].d.should.equal(72);
								break;
							case 3:
								v.rows![1].c[2].d.should.equal(272);
								break;
							case 4:
								v.rows![1].c[2].d.should.equal(131);
								done();
								break;
						}
						++req;
					}
				});
				
				//Test
				let viewPort = new Range2(0, 0, 4, 2);
				handle.load({ viewPort });
				viewPort.pos.y = 2;
				handle.load({ viewPort });
				viewPort.pos.y = 4;
				handle.load({ viewPort });
				viewPort.pos.y = 3;
				handle.load({ viewPort });

			}
		);
		it("should load correct data when using pxViewPort",
			function(done) {
				//Setup
				let mocDataResult = Arr.shallowCopy(mocDataResult1);
				
				let dsc: IDataStoreConfig = {
					pageSize: new Vec2(2, 2),
					retainSize: 4,
					endPointFn: (payload: DataStoreRequestDto): Observable<any> => {
						let result = new Observable<any>( (observable: Subscriber<any>) => { 
							observable.next(mocDataResult.shift()); 
						});
						return result;
					},
					pagePxRanges: { x: [ {p: 0, s: 20}, {p: 20, s: 20} ], y: [ {p: 0, s: 20}, {p: 20, s: 20}, {p: 40, s: 20} ]}
				};
				let ds = new DataStore(dsc);

				let handle = ds.register( new RequestConfig() );

				let req = 0;
				handle.stream.subscribe({
					next: (v: DataStoreConsumable) => {
						switch (req) {
							case 1:
								v.rows![0].c[2].d.should.equal(3);
								v.loadPort!.equals(new Range2(0, 0, 4, 2)).should.be.true;
								v.pxScope.equals(new Rect(0, 0, 39, 19)).should.be.true;
								v.totalCells.equals(new Vec2(4, 6)).should.be.true;
								v.totalPx.equals(new Vec2(200, 400)).should.be.true;
								v.rows![0].h.should.equal(10);
								v.rows![1].i.should.equal(1);
								v.rows![0].d.should.equal("rowData");
								v.rows![0].c[0].w.should.equal(10);
								v.rows![1].c[1].i.x.should.equal(1);
								v.rows![1].c[2].i.x.should.equal(2);
								break;
							case 2:
								v.rows![1].c[2].d.should.equal(72);
								break;
							case 3:
								v.rows![1].c[2].d.should.equal(272);
								break;
							case 4:
								v.rows![1].c[2].d.should.equal(131);
								done();
								break;
						}
						++req;
					}
				});
				
				//Test
				let pxViewPort = new Range2(0, 0, 40, 20);
				handle.load({ pxViewPort });
				pxViewPort.pos.y = 20;
				handle.load({ pxViewPort });
				pxViewPort.pos.y = 40;
				handle.load({ pxViewPort });
				pxViewPort.pos.y = 30;
				handle.load({ pxViewPort });

			}
		);
		it("should load make correct number of calls and retain the correct number of pages",
			function() {
				//Setup
				let mocDataResult = Arr.shallowCopy(mocDataResult1);

				let dsc: IDataStoreConfig = {
					pageSize: new Vec2(2, 2),
					retainSize: 4,
					endPointFn: (payload: DataStoreRequestDto): Observable<any> => {
						let result = new Observable<any>( (observable: Subscriber<any>) => { 
							observable.next(mocDataResult.shift()); 
						});
						return result;
					}
				};
				let ds = new DataStore(dsc);

				let handle = ds.register( new RequestConfig() );
				let fetchCounter = 0;

				Util.proxyFn(( ds as any), "fetchData", function(org, ...args: any[]) {
					fetchCounter += 1;
					return org(...args);
				});

				//Test
				let viewPort = new Range2(0, 0, 4, 2);
				handle.load({ viewPort });
				viewPort.pos.y = 2;
				handle.load({ viewPort });
				viewPort.pos.y = 4;
				handle.load({ viewPort });
				( ds as any)._pageStore._pageQueue.length.should.equal(4, "_pageQueue.length should be 4");
				viewPort.pos.y = 3;
				handle.load({ viewPort });
				( ds as any)._pageStore._pageQueue.length.should.equal(4, "_pageQueue.length should still be 4");
				fetchCounter.should.equal(3, "fetchCounter should be 3");

			}
		);
		it("should return the correct loadPort to a given retainMargin and corner cases",
			function(done) {
				//Setup
				let mocDataResult = Arr.shallowCopy(mocDataResult2);

				let dsc: IDataStoreConfig = {
					pageSize: new Vec2(2, 2),
					retainSize: 4,
					endPointFn: (payload: DataStoreRequestDto): Observable<any> => {
						let result = new Observable<any>( (observable: Subscriber<any>) => { 
							observable.next(mocDataResult.shift()); 
						});
						return result;
					}
				};
				let ds = new DataStore(dsc);

				let handle = ds.register( new RequestConfig().init( { requestMargin: new Vec2(1, 1) }) );

				let req = 0;
				handle.stream.subscribe({
					next: (v: DataStoreConsumable) => {
						switch (req) {
							case 1:
								v.rows![0].c[0].d.should.equal(1);
								v.rows!.length.should.equal(3);
								v.rows![0].c.length.should.equal(3);
								break;
							case 2:
								v.rows![0].c[0].d.should.equal(6);
								v.rows!.length.should.equal(3);
								v.rows![0].c.length.should.equal(3);
								v.rows![2].c[2].d.should.equal(82);
								done();
								break;
						}
						++req;
					}
				});
				
				//Test
				let viewPort = new Range2(0, 0, 2, 2);
				handle.load({ viewPort });
				viewPort.pos.x = 1;
				viewPort.pos.y = 1;
				// Does not deliver data since it is within the last fixed load scope
				handle.load({ viewPort });
				viewPort.pos.x = 2;
				viewPort.pos.y = 2;
				handle.load({ viewPort });

			}
		);
		it("should not evict currently viewed pages in multi caller setting",
			function() {
				//Setup
				let mocDataResult = Arr.shallowCopy(mocDataResult1);

				let dsc: IDataStoreConfig = {
					pageSize: new Vec2(2, 2),
					retainSize: 2,
					endPointFn: (payload: DataStoreRequestDto): Observable<any> => {
						let result = new Observable<any>( function(sub: Subscriber<any>) { 
							sub.next(mocDataResult.shift());
							sub.complete();
						});
						return result;
					}
				};
				let ds = new DataStore(dsc);
				let handle1 = ds.register( new RequestConfig().init( { requestMargin: new Vec2(0, 0) }) );
				let handle2 = ds.register( new RequestConfig().init( { requestMargin: new Vec2(0, 0) }) );

				//Test
				let viewPort1 = new Range2(0, 0, 4, 2);
				handle1.load({ viewPort: viewPort1 });
				let viewPort2 = new Range2(0, 2, 4, 2);
				handle2.load({ viewPort: viewPort2 });
				( ds as any)._pageStore._pageQueue.length.should.equal(4, "_pageQueue.length should be 4");				
				handle1.load({ viewPort: viewPort2 });
				( ds as any)._pageStore._pageQueue.length.should.equal(2, "_pageQueue.length should be 4");				
			}
		);
		it("should cancel ongoing call when new call commes before old returns",
			function(done) {
				//Setup
				let mocDataResult = Arr.shallowCopy(mocDataResult1);
				let canceled = 0;
				let dsc: IDataStoreConfig = {
					pageSize: new Vec2(2, 2),
					retainSize: 6,
					endPointFn: (payload: DataStoreRequestDto): Observable<any> => {
						let result = Observable.create( (sub: Subscriber<any>) => { 
							setTimeout(() => {
								if (!sub.closed) {
									sub.next(mocDataResult.shift());
									sub.complete();
									done();
								}
							}, 100);
							return () => {
								// unsubscribe
								++canceled;
							};
						});
						return result;
					}
				};
				let ds = new DataStore(dsc);
				let handle1 = ds.register( new RequestConfig().init( { requestMargin: new Vec2(0, 0) }) );

				//Test
				let viewPort1 = new Range2(0, 0, 4, 2);
				handle1.load({ viewPort: viewPort1 });
				handle1.load({ viewPort: viewPort1 });
				handle1.load({ viewPort: viewPort1 });
				canceled.should.equal(2);
			}
		);
		it("should return 10*10 pages with a total of 100*100 cells in less than 10ms",
			function() {
				//Setup
				let mocDataResult = Arr.shallowCopy(mocDataResult3);
				let canceled = 0;
				let dsc: IDataStoreConfig = {
					pageSize: new Vec2(10, 10),
					retainSize: 100,
					endPointFn: (payload: DataStoreRequestDto): Observable<any> => {
						let result = new Observable( (sub: Subscriber<any>) => { 
							sub.next(mocDataResult.shift());
						});
						return result;
					}
				};
				let ds = new DataStore(dsc);
				let myStore = ds.register( new RequestConfig().init( { requestMargin: new Vec2(0, 0) }) );

				let req = 0 ;
				myStore.stream.subscribe({
					next: (v: DataStoreConsumable) => {
						if (req > 0) {
							v.rows!.length.should.equal(100);
							v.rows![0].c.length.should.equal(100);
						}
						++req;
					}
				});

				//Test
				let viewPort1 = new Range2(0, 0, 100, 100);
				let count = 10;
				Timer.start();
				Util.loop(count, () => myStore.load({ viewPort: viewPort1, forceStream: true }) );
				Timer.stop();
				console.log(`avg over 10 runs = ${((Timer.time * count) | 0) / (count * count)}ms`);
				(Timer.time / count).should.be.lessThan(10);
			}
		);
		it("should return 2*2 pages with a total of 100*100 cells in less than 10ms",
			function() {
				//Setup
				let mocDataResult = Arr.shallowCopy(mocDataResult3);
				let canceled = 0;
				let dsc: IDataStoreConfig = {
					pageSize: new Vec2(50, 50),
					retainSize: 100,
					endPointFn: (payload: DataStoreRequestDto): Observable<any> => {
						let result = new Observable( (sub: Subscriber<any>) => { 
							sub.next(mocDataResult.shift());
						});
						return result;
					}
				};
				let ds = new DataStore(dsc);
				let myStore = ds.register( new RequestConfig().init( { requestMargin: new Vec2(0, 0) }) );

				let req = 0 ;
				myStore.stream.subscribe({
					next: (v: DataStoreConsumable) => {
						if (req > 0) {
							v.rows!.length.should.equal(100);
							v.rows![0].c.length.should.equal(100);
						}
						++req;
					}
				});

				//Test
				let viewPort1 = new Range2(0, 0, 100, 100);
				let count = 10;
				Timer.start();
				Util.loop(count, () => 
					myStore.load({ viewPort: viewPort1, forceStream: true }) 
				);
				Timer.stop();
				console.log(`avg over 10 runs = ${((Timer.time * count) | 0) / (count * count)}ms`);
				(Timer.time / count).should.be.lessThan(10);
			}
		);
	}
);
