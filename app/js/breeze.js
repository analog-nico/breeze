require.config({
  paths : {
    text: 'bower_components/requirejs-plugins/lib/text',
    json: 'bower_components/requirejs-plugins/src/json'
  },
  urlArgs: "bust=" + Math.round(2147483647 * Math.random())
});

define('breeze', ['json!content/pages/menu.json'], function (menuJson) {

  var routingState = {
    currentPage: ''
  };

  function boot() {

    var routes = {};

    for ( var i = 0; i < menuJson.pages.length; i+=1 ) {
      menuJson.pages[i].uri = uri(menuJson.pages[i].file);
      menuJson.pages[i].navigate = navigate(menuJson.pages[i])
      routes[menuJson.pages[i].uri] = menuJson.pages[i].navigate;
    }

    var router = Router(routes);
    router.on(/.*/, function () {
      router.setRoute(menuJson.pages[0].uri);
    });
    router.init('#/' + menuJson.pages[0].uri);

    var content = new Vue({
      el: '#br-content',
      data: {
        routingState: routingState
      }
    });

    var menu = new Vue({
      el: '#br-menu',
      data: menuJson
    });

  }

  function uri(pageFile) {
    // Remove file extension
    return pageFile.replace(/\.[^/.]+$/, '');
  }

  function navigate(page) {
    return function () {
      if (!Vue.options.components[page.uri]) {
        require(['text!content/pages/' + page.file], function (pageSource) {
          Vue.component(page.uri, {
            template: marked(pageSource)
          });
          routingState.currentPage = page.uri;
        });
      } else {
        routingState.currentPage = page.uri;
      }
    };
  }

  return {
    boot: boot
  };

});

require(['breeze'], function (breeze) {
  breeze.boot();
});
