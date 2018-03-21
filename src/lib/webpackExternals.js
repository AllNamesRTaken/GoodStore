const rootPatterns = [{
    // rxjs/operators/map
    regex: /^goodstore\/Dto\//,
    root: ['goodstore']
  }, {
    // rxjs/observable/MulticastObservable
    regex: /^goodstore\/([A-Z].*)/,
    root: ['goodstore', '']
  }];
  
  function rootForRequest(path) {
    const match = rootPatterns.find((pattern, index, obj) => !!path.match(pattern.regex));
  
    if (match) {
      let m = path.match(match.regex);
      if (m.length > 1) {
        match.root[match.root.length - 1] = m[m.length - 1];
      }
      return [...match.root];
    }
  
    return 'goodstore';
  }
  
  function goodstoreExternalsFactory() {
  
    return function goodstoreExternals(context, request, callback) {
  
      if (request.startsWith('goodstore/')) {
        return callback(null, {
          root: rootForRequest(request),
          commonjs: request,
          commonjs2: request,
          amd: request
        });
      }
  
      callback();
  
    };
  
  }
  module.exports = goodstoreExternalsFactory;