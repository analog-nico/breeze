;(function () {

  var requirePluginPaths = {
    text: 'bower_components/requirejs-plugins/lib/text',
    json: 'bower_components/requirejs-plugins/src/json'
  };
  require.config({
    paths : requirePluginPaths,
    urlArgs: "bust=" + Math.round(2147483647 * Math.random())
  });

  define('breeze/router', ['path'], function (Path) {

    return {
      addRoute: function (route, callback) {
        Path.map(route).to(callback);
      },
      set404Fallback: function (callback) {
        Path.rescue(callback);
      },
      startListening: function (defaultRoute) {
        Path.root(defaultRoute);
        Path.listen();
      },
      navigateTo: function (route) {
        location.hash = route;
        // TODO: Does not change the URL
        //Path.dispatch(route);
      },
      retryRouting: function (requestedRoute) {
        // Run router again (USES INTERNAL API)
        var matched_route = Path.match(requestedRoute, true);
        if (matched_route !== null) {
          matched_route.run();
        } else {
          Path.routes.rescue();
        }
      }
    };

  });

  define('breeze', ['breeze/router'], function (router) {

    var breeze = {
      pages: {},
      router: router,
      routingState: {
        currentPage: '',
        parameters: {}
      }
    };

    breeze.boot = function () {

      require(['json!content/pages/index.json', requirePluginPaths.text + '.js'], function (pageIndexJson) {

        for ( var i = 0; i < pageIndexJson.pages.length; i+=1 ) {
          pageIndexJson.pages[i].uri = uri(pageIndexJson.pages[i].file);
          pageIndexJson.pages[i].navigateTo = navigateTo(pageIndexJson.pages[i]);
          // TODO: Don't map non-topLevel pages
          breeze.router.addRoute(pageIndexJson.pages[i].uri, pageIndexJson.pages[i].navigateTo);
          breeze.pages[pageIndexJson.pages[i].uri] = pageIndexJson.pages[i];
        }

        var retryRouting = false;
        breeze.navigateToHome = function () {

          var requestedRoute = this.current || '';
          var routeSegments = requestedRoute.split('/');
          var scriptsOfTopLevelPage = getScripts(breeze.pages['#!/' + routeSegments[1]]);

          if (requestedRoute === '' || scriptsOfTopLevelPage.length === 0 || retryRouting === true) {
            retryRouting = false;
            breeze.router.navigateTo(pageIndexJson.pages[0].uri);
          }

          retryRouting = true;

          require(scriptsOfTopLevelPage, function () {
            runScriptsAsync(scriptsOfTopLevelPage, 'registerRoutes', function () {
              breeze.router.retryRouting(requestedRoute);
            });
          });

        };
        breeze.router.set404Fallback(breeze.navigateToHome);
        breeze.router.startListening(pageIndexJson.pages[0].uri);

        Vue.filter('TopLevel', function (list) {
          var newList = [];
          for ( var i = 0; i < list.length; i+=1 ) {
            if (list[i].topLevel === false) {
              continue;
            }
            newList[newList.length] = list[i];
          }
          return newList;
        });

        var menu = new Vue({
          el: '#br-menu',
          data: {
            pages: pageIndexJson.pages,
            routingState: breeze.routingState
          }
        });

        var content = new Vue({
          el: '#br-content',
          data: {
            routingState: breeze.routingState
          }
        });

      });

    };

    function uri(pageFile) {
      // Remove file extension
      return '#!/' + pageFile.replace(/\.[^/.]+$/, '');
    }

    function getScripts(page) {
      var scripts = [];
      if (!!page && !!page.scripts && page.scripts.length > 0) {
        for ( var i = 0; i < page.scripts.length; i+= 1 ) {
          scripts[i] = 'content/pages/' + page.scripts[i];
        }
      }
      return scripts;
    }

    function runScripts(scripts, method) {
      if (scripts.length !== 0) {
        require(scripts, function () {
          for ( var i = 0; i < arguments.length; i+= 1 ) {
            (arguments[i][method])();
          }
        });
      }
    }

    function runScriptsAsync(scripts, method, done) {
      if (scripts.length === 0) {
        done();
      } else {
        // TODO: Run all scripts, not just the first
        require([scripts[0]], function () {
          (arguments[0][method])(done);
        });
      }
    }

    function runScriptsReverse(scripts, method) {
      if (scripts.length !== 0) {
        require(scripts, function () {
          for ( var i = arguments.length-1; i >= 0; i-= 1 ) {
            (arguments[i][method])();
          }
        });
      }
    }

    function navigateTo(page) {

      return function (parameters) {
        parameters = parameters || {};

        if (!Vue.options.components[page.uri]) {

          var scripts = getScripts(page);

          require((['text!content/pages/' + page.file]).concat(scripts), function (pageSource) {

            runScripts(scripts, 'init');

            // Allow new components probably registered in runScripts(scripts, 'init'); to initialize first.
            Vue.nextTick(function () {

              Vue.component(page.uri, {
                template: marked(pageSource)
              });

              breeze.routingState.currentPage = page.uri;
              breeze.routingState.parameters = parameters;

            });

          });
        } else {
          breeze.routingState.currentPage = page.uri;
          breeze.routingState.parameters = parameters;
        }
      };

    }

    breeze.navigateToHome = function () {
      // Implementation will be provided during boot()
    };

    return breeze;

  });

  require(['breeze'], function (breeze) {
    breeze.boot();
  });

}());
