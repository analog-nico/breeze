define(function () {

  return {
    init: function () {
      Vue.component('br-articleList', {
        template: '<content></content>',
        created: function () {
          var self = this;
          require(['breeze', 'json!content/articles/index.json'], function (breeze, indexJson) {
            self.$data = indexJson;
            breeze.router.on('blog/:articleId', function (articleId) {
            });
          });
        },
        methods: {
          uri: function (articleFile) {
            // Remove file extension
            var uri = articleFile.replace(/\.[^/.]+$/, '');
            return 'blog/' + uri;
          }
        }
      });
    }
  }

});