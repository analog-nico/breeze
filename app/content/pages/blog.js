define(function () {

  var articles = {};

  function init() {
    Vue.component('br-articleList', {
      template: '<content></content>',
      created: function () {
        var self = this;
        require(['breeze', 'json!content/articles/index.json'], function (breeze, articleIndexJson) {

          self.$data = articleIndexJson;

          for ( var i = 0; i < articleIndexJson.articles.length; i+=1 ) {
            articles[articleIndexJson.articles[i].file.replace(/\.[^/.]+$/, '')] = articleIndexJson.articles[i];
          }

          breeze.router.on('/blog/:articleId', function (articleId) {

            if (!articles[articleId]) {
              breeze.navigateToHome();
              return;
            }

            breeze.pages['/article'].navigateTo({ articleId: articleId });

          });

        });
      },
      methods: {
        uri: function (articleFile) {
          // Remove file extension
          var uri = articleFile.replace(/\.[^/.]+$/, '');
          return '/blog/' + uri;
        }
      }
    });
  }

  return {
    init: init
  };

});