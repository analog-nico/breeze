define(function () {

  return {
    init: function () {

      Vue.component('br-article', {
        template: '{{{content}}}',
        created: function () {
          var self = this;
          require(['breeze'], function (breeze) {
            require(['text!content/articles/' + breeze.routingState.parameters.articleId + '.md'], function (articleSource) {
              self.$set('content', marked(articleSource));
            });
          });
        }
      });

    }
  }

});