const { withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

module.exports = withModuleFederationPlugin({

  name: 'mf_humanage_leaves',

  filename: "remoteEntry.js",

  exposes: {
    './bootstrap': './src/bootstrap.ts',
  },

  shared: {},

});
