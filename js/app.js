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

  var Converter = Vue.extend({
    name: 'Converter',
    template: '#converter-template',
    data: function() {
      return {
        ingredientName: 'flour',
        sourceAmount: 2.5,
        sourceUnit: 'cups',
        targetUnit: 'grams',
        targetAmount: 0
      };
    },
    created: function() {
      this.getConvertion();
    },
    methods: {
      getConvertion: function(entry) {
        var _self = this;
        // http://docs.mashape.com/javascript
        // https://market.mashape.com/spoonacular/recipe-food-nutrition#convert-amounts
        $.ajax({
            url: 'https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/convert', // The URL to the API. You can get this in the API page of the API you intend to consume
            type: 'GET', // The HTTP Method, can be GET POST PUT DELETE etc
            data: {
              ingredientName: _self.ingredientName,
              sourceAmount: _self.sourceAmount,
              sourceUnit: _self.sourceUnit,
              targetUnit: _self.targetUnit
            }, // Additional parameters here
            dataType: 'json',
            success: function(data) { 
              console.log(data); 
              _self.targetAmount = data.targetAmount;
            },
            error: function(err) { console.log(err); },
            beforeSend: function(xhr) {
              xhr.setRequestHeader("X-Mashape-Authorization", "lHXslBUpU4mshcahxgT6fZAnrcsOp1jp6wvjsnIdS5fRf4CBAr"); // Enter here your Mashape key
            }
        });
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
      },
      {
        path: '/convert',
        name: 'convert',
        component: Converter,
        meta: { title: 'Mål' }
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
