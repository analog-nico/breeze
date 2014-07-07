define(function () {

  Vue.component('br-articleList', {
    template: '<content></content>',
    created: function () {
      this.$data = {};
      var self = this;
      require(['json!content/articles/index.json'], function (indexJson) {
        //self.$data = indexJson;
        self.$set('articles', indexJson.articles);
      });
    }
  });

  return {
    beforeShow: function () {
    },
    afterShow: function () {
    },
    hide: function () {
    }
  };

});