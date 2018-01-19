function test() {
    //Setup
    let mocDataResult = goodcore.Arr.ShallowCopy(mocDataResult3);

    let dsc = {
        pageSize: new goodcore.Vec2(2, 2),
        retainSize: 4,
        endPointFn: (payload) => {
            let result = new Rx.Observable((observable) => {
                observable.next(mocDataResult.shift());
            });
            return result;
        }
    };
    let ds = new goodstore.DataStore(dsc);

    let myStore = ds.register(new goodstore.RequestConfig().Init({ requestMargin: new goodcore.Vec2(1, 1) }));

    let req = 0;

    let lastv = null;
    myStore.stream.subscribe({
        next: (v) => {
            if (req > 0) {
            }
            ++req;
        }
    });				//Test
    let viewPort1 = new goodcore.Range2(0, 0, 100, 100);
    let count = 10;
    goodcore.Timer.Start();
    goodcore.Util.Loop(count, () => {
        myStore.load({ viewPort: viewPort1, forceStream: true });
    });
    goodcore.Timer.Stop();
    console.log(`avg over 10 runs = ${((goodcore.Timer.Time * count) | 0) / (count * count)}ms`);
}
