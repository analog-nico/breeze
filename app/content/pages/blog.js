define(function () {

  return {
    init: function () {
      Vue.component('br-articleList', {
        template: '<content></content>',
        created: function () {
          var self = this;
          require(['json!content/articles/index.json'], function (indexJson) {
            self.$data = indexJson;
          });
        }
      });
    }
  }

});