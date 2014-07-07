require.config({
  paths : {
    text: 'bower_components/requirejs-plugins/lib/text',
    json: 'bower_components/requirejs-plugins/src/json'
  },
  urlArgs: "bust=" + Math.round(2147483647 * Math.random())
});

define('breeze', ['json!content/pages/index.json'], function (menuJson) {

  var router = Router();
  var routingState = {
    currentPage: '',
    parameters: {}
  };
  var pages = {};

  function boot() {

    for ( var i = 0; i < menuJson.pages.length; i+=1 ) {
      menuJson.pages[i].uri = uri(menuJson.pages[i].file);
      menuJson.pages[i].navigateTo = navigateTo(menuJson.pages[i]);
      router.on(menuJson.pages[i].uri, menuJson.pages[i].navigateTo);
      pages[menuJson.pages[i].uri] = menuJson.pages[i];
    }

    router.on(/.*/, function () {
      router.setRoute(menuJson.pages[0].uri);
    });
    router.init('#/' + menuJson.pages[0].uri);

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
      data: menuJson
    });

    var content = new Vue({
      el: '#br-content',
      data: {
        routingState: routingState
      }
    });

  }

  function uri(pageFile) {
    // Remove file extension
    return pageFile.replace(/\.[^/.]+$/, '');
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
        require(scripts, function () {
          runScripts('init');
          require(['text!content/pages/' + page.file], function (pageSource) {
            Vue.component(page.uri, {
              template: marked(pageSource)
            });
            routingState.currentPage = page.uri;
            routingState.parameters = parameters;
          });
        });
      } else {
        routingState.currentPage = page.uri;
        routingState.parameters = parameters;
      }
    };
  }

  return {
    boot: boot,
    router: router,
    pages: pages
  };

});

require(['breeze'], function (breeze) {
  breeze.boot();
});
