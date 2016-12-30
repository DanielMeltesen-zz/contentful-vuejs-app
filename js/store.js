var store = (function(Vue, Vuex) {
  'use strict';

  // root state object.
  // each Vuex instance is just a single state tree.
  var state = {
    api: {
      space: 'vrcn5uaoytfv',
      access_token: '2ec553827b8d5b58932695646411dcf796b8697d7ddddc34d4822235fa6a70ed',
      content_types: 'https://cdn.contentful.com/spaces/vrcn5uaoytfv/content_types',
      entries: 'https://cdn.contentful.com/spaces/vrcn5uaoytfv/entries/',
      assets: 'https://cdn.contentful.com/spaces/vrcn5uaoytfv/assets/'
    },
    favorites: []
  };

  // mutations are operations that actually mutates the state.
  // each mutation handler gets the entire state tree as the
  // first argument, followed by additional payload arguments.
  // mutations must be synchronous and can be recorded by plugins
  // for debugging purposes.
  var mutations = {
    addFavorite: function(state, favirite) {
      state.favorites.push(favirite);
    },
    removeFavorite: function(state, favirite) {
      var i = state.favorites.indexOf(favirite);
      if(i !== -1) state.favorites.splice(i, 1);
    },
    sortFavorites: function(state, sortBy) {
      function compare(a,b) {
        if (a[sortBy] < b[sortBy])
          return -1;
        if (a[sortBy] > b[sortBy])
          return 1;
        return 0;
      }
      state.favorites.sort(compare);
    },
  };

  // actions are functions that causes side effects and can involve
  // asynchronous operations.
  var actions = {
    addFavorite: function(context, character) {
      return context.commit('addFavorite', character);
    },
    removeFavorite: function(context, character) {
      return context.commit('removeFavorite', character);
    },
    sortFavorites: function(context, sortBy) {
      return context.commit('sortFavorites', sortBy);
    },
    getRecipes: function(context) {
      return Vue.http.get(
        context.state.api.entries,
        {
          params: {
            access_token : context.state.api.access_token,
            content_type : 'recipe'
          }
        }
      ).then(function(response) {
        // Parse response as JSON
        return response.json();
      });
    },
    getEntries: function(context, data) {
      return Vue.http.get(
        context.state.api.entries,
        {
          params: {
            access_token : context.state.api.access_token,
            content_type : data.content_type
          }
        }
      ).then(function(response) {
        // Parse response as JSON
        return response.json();
      });
    },
    getEntry: function(context, data) {
      return Vue.http.get(
        context.state.api.entries + data.entry_id,
        {
          params: {
            access_token : context.state.api.access_token
          }
        }
      ).then(function(response) {
        // Parse response as JSON
        return response.json();
      });
    },
    getAsset: function(context, data) {
      return Vue.http.get(
        context.state.api.assets + data.asset_id,
        {
          params: {
            access_token : context.state.api.access_token
          }
        }
      ).then(function(response) {
        // Parse response as JSON
        return response.json();
      });
    }
  };

  // getters are functions
  var getters = {};

  // A Vuex instance is created by combining the state, mutations, actions,
  // and getters.
  return new Vuex.Store({
    state: state,
    getters: getters,
    actions: actions,
    mutations: mutations
  });

})(Vue, Vuex);
