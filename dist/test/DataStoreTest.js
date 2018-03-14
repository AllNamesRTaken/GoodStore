"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var goodcore_1 = require("goodcore");
var Rx = require("rxjs");
var DataStore_1 = require("../lib/DataStore");
var RequestConfig_1 = require("../lib/RequestConfig");
var MocResultData_1 = require("./MocResultData");
chai_1.should();
describe("DataStore", function () {
    it("should load correct data when cell ports are used", function (done) {
        var mocDataResult = goodcore_1.Arr.shallowCopy(MocResultData_1.mocDataResult1);
        var dsc = {
            pageSize: new goodcore_1.Vec2(2, 2),
            retainSize: 4,
            endPointFn: function (payload) {
                var result = new Rx.Observable(function (observable) {
                    observable.next(mocDataResult.shift());
                });
                return result;
            }
        };
        var ds = new DataStore_1.DataStore(dsc);
        var handle = ds.register(new RequestConfig_1.RequestConfig());
        var req = 0;
        handle.stream.subscribe({
            next: function (v) {
                switch (req) {
                    case 1:
                        v.rows[0].c[2].d.should.equal(3, "cell 3 on row 1 should have data = 3");
                        v.loadPort.equals(new goodcore_1.Range2(0, 0, 4, 2)).should.equal(true, "loadport should have correct value");
                        v.pxScope.isZero.should.equal(true, "pxScope should be zero if no px to page lookup has been set in config");
                        v.totalCells.equals(new goodcore_1.Vec2(4, 6)).should.equal(true, "totalCells should have correct value");
                        v.totalPx.isZero.should.equal(true, "totalPx should be zero if no px to page lookup has been set in config");
                        v.rows[0].h.should.equal(10);
                        v.rows[1].i.should.equal(1);
                        v.rows[0].d.should.equal("rowData");
                        v.rows[0].c[0].w.should.equal(10);
                        v.rows[1].c[1].i.x.should.equal(1);
                        v.rows[1].c[2].i.x.should.equal(2);
                        break;
                    case 2:
                        v.rows[1].c[2].d.should.equal(72);
                        break;
                    case 3:
                        v.rows[1].c[2].d.should.equal(272);
                        break;
                    case 4:
                        v.rows[1].c[2].d.should.equal(131);
                        done();
                        break;
                }
                ++req;
            }
        });
        var viewPort = new goodcore_1.Range2(0, 0, 4, 2);
        handle.load({ viewPort: viewPort });
        viewPort.pos.y = 2;
        handle.load({ viewPort: viewPort });
        viewPort.pos.y = 4;
        handle.load({ viewPort: viewPort });
        viewPort.pos.y = 3;
        handle.load({ viewPort: viewPort });
    });
    it("should load correct data when using pxViewPort", function (done) {
        var mocDataResult = goodcore_1.Arr.shallowCopy(MocResultData_1.mocDataResult1);
        var dsc = {
            pageSize: new goodcore_1.Vec2(2, 2),
            retainSize: 4,
            endPointFn: function (payload) {
                var result = new Rx.Observable(function (observable) {
                    observable.next(mocDataResult.shift());
                });
                return result;
            },
            pagePxRanges: { x: [{ p: 0, s: 20 }, { p: 20, s: 20 }], y: [{ p: 0, s: 20 }, { p: 20, s: 20 }, { p: 40, s: 20 }] }
        };
        var ds = new DataStore_1.DataStore(dsc);
        var handle = ds.register(new RequestConfig_1.RequestConfig());
        var req = 0;
        handle.stream.subscribe({
            next: function (v) {
                switch (req) {
                    case 1:
                        v.rows[0].c[2].d.should.equal(3);
                        v.loadPort.equals(new goodcore_1.Range2(0, 0, 4, 2)).should.be.true;
                        v.pxScope.equals(new goodcore_1.Rect(0, 0, 39, 19)).should.be.true;
                        v.totalCells.equals(new goodcore_1.Vec2(4, 6)).should.be.true;
                        v.totalPx.equals(new goodcore_1.Vec2(200, 400)).should.be.true;
                        v.rows[0].h.should.equal(10);
                        v.rows[1].i.should.equal(1);
                        v.rows[0].d.should.equal("rowData");
                        v.rows[0].c[0].w.should.equal(10);
                        v.rows[1].c[1].i.x.should.equal(1);
                        v.rows[1].c[2].i.x.should.equal(2);
                        break;
                    case 2:
                        v.rows[1].c[2].d.should.equal(72);
                        break;
                    case 3:
                        v.rows[1].c[2].d.should.equal(272);
                        break;
                    case 4:
                        v.rows[1].c[2].d.should.equal(131);
                        done();
                        break;
                }
                ++req;
            }
        });
        var pxViewPort = new goodcore_1.Range2(0, 0, 40, 20);
        handle.load({ pxViewPort: pxViewPort });
        pxViewPort.pos.y = 20;
        handle.load({ pxViewPort: pxViewPort });
        pxViewPort.pos.y = 40;
        handle.load({ pxViewPort: pxViewPort });
        pxViewPort.pos.y = 30;
        handle.load({ pxViewPort: pxViewPort });
    });
    it("should load make correct number of calls and retain the correct number of pages", function () {
        var mocDataResult = goodcore_1.Arr.shallowCopy(MocResultData_1.mocDataResult1);
        var dsc = {
            pageSize: new goodcore_1.Vec2(2, 2),
            retainSize: 4,
            endPointFn: function (payload) {
                var result = new Rx.Observable(function (observable) {
                    observable.next(mocDataResult.shift());
                });
                return result;
            }
        };
        var ds = new DataStore_1.DataStore(dsc);
        var handle = ds.register(new RequestConfig_1.RequestConfig());
        var fetchCounter = 0;
        goodcore_1.Util.proxyFn(ds, "fetchData", function (org) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            fetchCounter += 1;
            return org.apply(void 0, args);
        });
        var viewPort = new goodcore_1.Range2(0, 0, 4, 2);
        handle.load({ viewPort: viewPort });
        viewPort.pos.y = 2;
        handle.load({ viewPort: viewPort });
        viewPort.pos.y = 4;
        handle.load({ viewPort: viewPort });
        ds._pageStore._pageQueue.length.should.equal(4, "_pageQueue.length should be 4");
        viewPort.pos.y = 3;
        handle.load({ viewPort: viewPort });
        ds._pageStore._pageQueue.length.should.equal(4, "_pageQueue.length should still be 4");
        fetchCounter.should.equal(3, "fetchCounter should be 3");
    });
    it("should return the correct loadPort to a given retainMargin and corner cases", function (done) {
        var mocDataResult = goodcore_1.Arr.shallowCopy(MocResultData_1.mocDataResult2);
        var dsc = {
            pageSize: new goodcore_1.Vec2(2, 2),
            retainSize: 4,
            endPointFn: function (payload) {
                var result = new Rx.Observable(function (observable) {
                    observable.next(mocDataResult.shift());
                });
                return result;
            }
        };
        var ds = new DataStore_1.DataStore(dsc);
        var handle = ds.register(new RequestConfig_1.RequestConfig().init({ requestMargin: new goodcore_1.Vec2(1, 1) }));
        var req = 0;
        handle.stream.subscribe({
            next: function (v) {
                switch (req) {
                    case 1:
                        v.rows[0].c[0].d.should.equal(1);
                        v.rows.length.should.equal(3);
                        v.rows[0].c.length.should.equal(3);
                        break;
                    case 2:
                        v.rows[0].c[0].d.should.equal(6);
                        v.rows.length.should.equal(3);
                        v.rows[0].c.length.should.equal(3);
                        v.rows[2].c[2].d.should.equal(82);
                        done();
                        break;
                }
                ++req;
            }
        });
        var viewPort = new goodcore_1.Range2(0, 0, 2, 2);
        handle.load({ viewPort: viewPort });
        viewPort.pos.x = 1;
        viewPort.pos.y = 1;
        handle.load({ viewPort: viewPort });
        viewPort.pos.x = 2;
        viewPort.pos.y = 2;
        handle.load({ viewPort: viewPort });
    });
    it("should not evict currently viewed pages in multi caller setting", function () {
        var mocDataResult = goodcore_1.Arr.shallowCopy(MocResultData_1.mocDataResult1);
        var dsc = {
            pageSize: new goodcore_1.Vec2(2, 2),
            retainSize: 2,
            endPointFn: function (payload) {
                var result = new Rx.Observable(function (sub) {
                    sub.next(mocDataResult.shift());
                    sub.complete();
                });
                return result;
            }
        };
        var ds = new DataStore_1.DataStore(dsc);
        var handle1 = ds.register(new RequestConfig_1.RequestConfig().init({ requestMargin: new goodcore_1.Vec2(0, 0) }));
        var handle2 = ds.register(new RequestConfig_1.RequestConfig().init({ requestMargin: new goodcore_1.Vec2(0, 0) }));
        var viewPort1 = new goodcore_1.Range2(0, 0, 4, 2);
        handle1.load({ viewPort: viewPort1 });
        var viewPort2 = new goodcore_1.Range2(0, 2, 4, 2);
        handle2.load({ viewPort: viewPort2 });
        ds._pageStore._pageQueue.length.should.equal(4, "_pageQueue.length should be 4");
        handle1.load({ viewPort: viewPort2 });
        ds._pageStore._pageQueue.length.should.equal(2, "_pageQueue.length should be 4");
    });
    it("should cancel ongoing call when new call commes before old returns", function (done) {
        var mocDataResult = goodcore_1.Arr.shallowCopy(MocResultData_1.mocDataResult1);
        var canceled = 0;
        var dsc = {
            pageSize: new goodcore_1.Vec2(2, 2),
            retainSize: 6,
            endPointFn: function (payload) {
                var result = Rx.Observable.create(function (sub) {
                    setTimeout(function () {
                        if (!sub.closed) {
                            sub.next(mocDataResult.shift());
                            sub.complete();
                            done();
                        }
                    }, 100);
                    return function () {
                        ++canceled;
                    };
                });
                return result;
            }
        };
        var ds = new DataStore_1.DataStore(dsc);
        var handle1 = ds.register(new RequestConfig_1.RequestConfig().init({ requestMargin: new goodcore_1.Vec2(0, 0) }));
        var viewPort1 = new goodcore_1.Range2(0, 0, 4, 2);
        handle1.load({ viewPort: viewPort1 });
        handle1.load({ viewPort: viewPort1 });
        handle1.load({ viewPort: viewPort1 });
        canceled.should.equal(2);
    });
    it("should return 10*10 pages with a total of 100*100 cells in less than 10ms", function () {
        var mocDataResult = goodcore_1.Arr.shallowCopy(MocResultData_1.mocDataResult3);
        var canceled = 0;
        var dsc = {
            pageSize: new goodcore_1.Vec2(10, 10),
            retainSize: 100,
            endPointFn: function (payload) {
                var result = new Rx.Observable(function (sub) {
                    sub.next(mocDataResult.shift());
                });
                return result;
            }
        };
        var ds = new DataStore_1.DataStore(dsc);
        var myStore = ds.register(new RequestConfig_1.RequestConfig().init({ requestMargin: new goodcore_1.Vec2(0, 0) }));
        var req = 0;
        myStore.stream.subscribe({
            next: function (v) {
                if (req > 0) {
                    v.rows.length.should.equal(100);
                    v.rows[0].c.length.should.equal(100);
                }
                ++req;
            }
        });
        var viewPort1 = new goodcore_1.Range2(0, 0, 100, 100);
        var count = 10;
        goodcore_1.Timer.start();
        goodcore_1.Util.loop(count, function () { return myStore.load({ viewPort: viewPort1, forceStream: true }); });
        goodcore_1.Timer.stop();
        console.log("avg over 10 runs = " + ((goodcore_1.Timer.time * count) | 0) / (count * count) + "ms");
        (goodcore_1.Timer.time / count).should.be.lessThan(10);
    });
    it("should return 2*2 pages with a total of 100*100 cells in less than 10ms", function () {
        var mocDataResult = goodcore_1.Arr.shallowCopy(MocResultData_1.mocDataResult3);
        var canceled = 0;
        var dsc = {
            pageSize: new goodcore_1.Vec2(50, 50),
            retainSize: 100,
            endPointFn: function (payload) {
                var result = new Rx.Observable(function (sub) {
                    sub.next(mocDataResult.shift());
                });
                return result;
            }
        };
        var ds = new DataStore_1.DataStore(dsc);
        var myStore = ds.register(new RequestConfig_1.RequestConfig().init({ requestMargin: new goodcore_1.Vec2(0, 0) }));
        var req = 0;
        myStore.stream.subscribe({
            next: function (v) {
                if (req > 0) {
                    v.rows.length.should.equal(100);
                    v.rows[0].c.length.should.equal(100);
                }
                ++req;
            }
        });
        var viewPort1 = new goodcore_1.Range2(0, 0, 100, 100);
        var count = 10;
        goodcore_1.Timer.start();
        goodcore_1.Util.loop(count, function () {
            return myStore.load({ viewPort: viewPort1, forceStream: true });
        });
        goodcore_1.Timer.stop();
        console.log("avg over 10 runs = " + ((goodcore_1.Timer.time * count) | 0) / (count * count) + "ms");
        (goodcore_1.Timer.time / count).should.be.lessThan(10);
    });
});
//# sourceMappingURL=DataStoreTest.js.map