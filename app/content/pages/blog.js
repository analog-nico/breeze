define(function () {

  var articles = {};

  function registerRoutes(done) {

    if (articles.length > 0) {
      return;
    }

    require(['breeze', 'json!content/articles/index.json'], function (breeze, articleIndexJson) {

      for ( var i = 0; i < articleIndexJson.articles.length; i+=1 ) {
        articles[articleIndexJson.articles[i].file.replace(/\.[^/.]+$/, '')] = articleIndexJson.articles[i];
      }

      breeze.router.addRoute('#!/blog/:articleId', function () {

        var articleId = this.params['articleId'];

        if (!articles[articleId]) {
          breeze.navigateToHome();
          return;
        }

        breeze.pages['#!/article'].navigateTo({ articleId: articleId });

      });

      done();

    });

  }

  function init() {
    Vue.component('br-articleList', {
      template: '<content></content>',
      created: function () {
        var self = this;
        require(['json!content/articles/index.json'], function (articleIndexJson) {

          self.$data = articleIndexJson;
          registerRoutes(function () {});

        });
      },
      methods: {
        uri: function (articleFile) {
          // Remove file extension
          var uri = articleFile.replace(/\.[^/.]+$/, '');
          return '#!/blog/' + uri;
        }
      }
    });
  }

  return {
    registerRoutes: registerRoutes,
    init: init
  };

});