;(function () {

  var requirePluginPaths = {
    text: 'bower_components/requirejs-plugins/lib/text',
    json: 'bower_components/requirejs-plugins/src/json'
  };
  require.config({
    paths : requirePluginPaths,
    urlArgs: "bust=" + Math.round(2147483647 * Math.random())
  });

  define('breeze', function () {

    var breeze = {
      pages: {},
      router: Router(),
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
          breeze.router.on(pageIndexJson.pages[i].uri, pageIndexJson.pages[i].navigateTo);
          breeze.pages[pageIndexJson.pages[i].uri] = pageIndexJson.pages[i];
        }

        breeze.navigateToHome = function () {
          breeze.router.setRoute(pageIndexJson.pages[0].uri);
        };
        breeze.router.on(/.*/, breeze.navigateToHome);
        breeze.router.init('#' + pageIndexJson.pages[0].uri);

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
      return '/' + pageFile.replace(/\.[^/.]+$/, '');
    }

    function navigateTo(page) {

      var scripts = [];

      if (!!page.scripts) {
        for ( var i = 0; i < page.scripts.length; i+= 1 ) {
          scripts[i] = 'content/pages/' + page.scripts[i];
        }
      }

      function runScripts(method) {
        if (scripts.length !== 0) {
          require(scripts, function () {
            for ( var i = 0; i < arguments.length; i+= 1 ) {
              (arguments[i][method])();
            }
          });
        }
      }

      function runScriptsReverse(method) {
        if (scripts.length !== 0) {
          require(scripts, function () {
            for ( var i = arguments.length-1; i >= 0; i-= 1 ) {
              (arguments[i][method])();
            }
          });
        }
      }

      return function (parameters) {
        parameters = parameters || {};
        if (!Vue.options.components[page.uri]) {
          require((['text!content/pages/' + page.file]).concat(scripts), function (pageSource) {
            runScripts('init');
            Vue.component(page.uri, {
              template: marked(pageSource)
            });
            breeze.routingState.currentPage = page.uri;
            breeze.routingState.parameters = parameters;
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
