require.config({
  paths : {
    text: 'bower_components/requirejs-plugins/lib/text',
    json: 'bower_components/requirejs-plugins/src/json'
  }
});

define('breeze', ['json!content/pages/menu.json!bust'], function (menuJson) {

  function boot() {

    console.log(menuJson);

    var menu = new Vue({
      el: '#br-menu',
      data: menuJson,
      methods: {
        uri: function (file) {
          // Remove file extension
          return file.replace(/\.[^/.]+$/, '');
        }
      }
    });

  }

  return {
    boot: boot
  };

});

require(['breeze'], function (breeze) {
  breeze.boot();
});
