(function() {
  var RecipeList = {
    name: 'RecipeList',
    template: '#recipe-list-template',
    data: function() {
      return {
        recipes: null
      };
    },
    created: function() {
      var _self = this;
      this.$store.dispatch('getRecipes').then(function(data) {
        _self.recipes = data;
      });
    }
  };

  var ShoppingList = {
    name: 'ShoppingList',
    template: '#shopping-list-template',
    computed: {
      favorites: function () {
        return this.$store.state.favorites;
      }
    },
    methods: {
      removeFromFavorites: function(favorite) {
        this.$store.dispatch('removeFavorite', favorite);
      }
    }
  };

  // var Entries = {
  //   name: 'Entries',
  //   template: '#my-entries',
  //   data: function() {
  //     return {
  //       entries: null
  //     };
  //   },
  //   computed: {
  //     contentTypeName: function() {
  //       var type;
  //       switch(this.$route.params.contentType) {
  //         case '1xYw5JsIecuGE68mmGMg20':
  //           type = 'image';
  //           break;
  //         case '38nK0gXXIccQ2IEosyAg6C':
  //           type = 'author';
  //           break;
  //         case '7leLzv8hW06amGmke86y8G':
  //           type = 'gallery';
  //           break;
  //       }
  //       return type;
  //     }
  //   },
  //   created: function() {
  //     this.getEntries();
  //   },
  //   methods: {
  //     getEntries: function() {
  //       var _self = this;
  //       this.$store.dispatch('getEntries', {
  //         content_type: _self.$route.params.contentType
  //       }).then(function(data) {
  //         _self.entries = data;
  //       });
  //     }
  //   },
  //   watch: {
  //     '$route' : 'getEntries'
  //   }
  // };

  var Entry = {
    data: function() {
      return {
        entry: null,
        image: null
      };
    },
    created: function() {
      this.getEntry();
    },
    methods: {
      getEntry: function() {
        var _self = this;
        var entryId = (typeof(this.entryId) !== 'undefined') ? this.entryId : _self.$route.params.entryId;
        this.$store.dispatch('getEntry', {
          entry_id: entryId
        }).then(function(data) {
          _self.entry = data;
          _self.getEntryAssets(data);
        });
      },
      getEntryAssets: function(entry) {}
    },
    watch: {
      '$route' : 'getEntry'
    }
  };

  var IngredientType = Vue.extend({
    name: 'Ingredient',
    props: ['entryId'],
    mixins: [Entry],
    data: function() {
      return {
        image: null
      };
    },
    methods: {
      getEntryAssets: function(entry) {
        var _self = this;
        // Reset image
        this.image = null;

        this.$store.dispatch('getAsset', {
          asset_id: entry.fields.image.sys.id
        }).then(function(data) {
          _self.image = data;
        });
      }
    }
  });

  var Ingredient = Vue.extend({
    name: 'Ingredient',
    template: '#ingredient-template',
    props: ['entryId'],
    mixins: [Entry],
    data: function() {
      return {
        image: null,
        ingredientType: null
      };
    },
    computed: {
      isFavorite: function () {
        return this.$store.state.favorites.indexOf(this.entry) !== -1;
      }
    },
    methods: {
      getEntryAssets: function(entry) {
        if(typeof(entry.fields.ingredientType) !== 'undefined') {
          this.getIngredientType(entry);
        }
      },
      getIngredientType: function(entry) {
        var _self = this;
        if(typeof(entry.fields.ingredientType) !== 'undefined') {
          this.$store.dispatch('getEntry', {
            entry_id: entry.fields.ingredientType.sys.id
          }).then(function(data) {
            _self.ingredientType = data;
            if(typeof(data.fields.image) !== 'undefined') {
              _self.getIngredientTypeImage(data);
            }
          });
        }
      },
      getIngredientTypeImage: function(entry) {
        var _self = this;
        this.$store.dispatch('getAsset', {
          asset_id: entry.fields.image.sys.id
        }).then(function(data) {
          _self.image = data;
        });
      },
      addToFavorites: function() {
        this.$store.dispatch('addFavorite', this.entry);
      },
      removeFromFavorites: function() {
        this.$store.dispatch('removeFavorite', this.entry);
      }
    }
  });

  // var Author = Vue.extend({
  //   name: 'Author',
  //   template: '#my-author',
  //   mixins: [Entry],
  //   data: function() {
  //     return {
  //       profilePhoto: null
  //     };
  //   },
  //   methods: {
  //     getEntryAssets: function(entry) {
  //       var _self = this;
  //       // Reset profilePhoto
  //       this.profilePhoto = null;

  //       this.$store.dispatch('getAsset', {
  //         asset_id: entry.fields.profilePhoto.sys.id
  //       }).then(function(data) {
  //         _self.profilePhoto = data;
  //       });

  //       // client.getAsset(entry.fields.profilePhoto.sys.id).then(function (profilePhoto) {
  //       //   _self.profilePhoto = profilePhoto;
  //       // });
  //     }
  //   }
  // });

  var Recipe = Vue.extend({
    name: 'Recipe',
    template: '#recipe-template',
    mixins: [Entry],
    components: {
      'ingredient': Ingredient
    },
    computed: {
      description: function() {
        return marked(this.entry.fields.description, { sanitize: true });
      }
    },
    methods: {
      getEntryAssets: function(entry) {
        var _self = this;
        // Reset coverImage
        this.image = null;

        _self.$route.meta.title = entry.fields.title;
        _self.$root.setTitle();

        if(typeof(entry.fields.images) !== 'undefined' && entry.fields.images.length) {
          this.$store.dispatch('getAsset', {
            asset_id: entry.fields.images[0].sys.id
          }).then(function(data) {
            _self.image = data;
          });
        }
      }
    }
  });

  var router = new VueRouter({
    routes: [
      {
        path: '/',
        component: RecipeList,
        name: 'recipe-list',
        meta: { title: 'Opskrifter' }
      },
      {
        path: '/:contentType/:entryId',
        name: 'recipe',
        component: Recipe
      },
      {
        path: '/shopping-list',
        name: 'shopping-list',
        component: ShoppingList,
        meta: { title: 'Indkøbsliste' }
      }
    ]
  });

  new Vue({
    el: '#app',
    store: store,
    router: router,
    data: function() {
      return {
        routeTitle: ''
      };
    },
    computed: {
      hasFavorites: function() {
        return this.$store.state.favorites.length > 0;
      }
    },
    watch: {
      '$route': 'setTitle'
    },
    methods: {
      setTitle: function() {
        this.routeTitle = this.$route.meta.title;
      }
    },
    created: function() {
      this.setTitle();
    },
    components: {
      'recipe-list': RecipeList,
      'recipe': Recipe,
      'shopping-list': ShoppingList
    }
  });
})();
