const { withNativeFederation, shareAll } = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({
  name: 'recr-fed-agc-posvenda',
  shared: {
    ...shareAll({
      singleton: true,
      strictVersion: false,
      requiredVersion: 'auto',
    }),
  },
  exposes: {
    './component': './src/app/app.component.ts',
    './bootstrap-webcomponent': './src/bootstrap-webcomponent.ts',
  },
  skip: [
    'rxjs/ajax', 'rxjs/fetch', 'rxjs/testing', 'rxjs/webSocket', 'zone.js',
    '@ngx-translate/core', '@ngx-translate/http-loader', 'recr-fed-agc-posvenda',
    // internos deste remote não são libs federadas:
    (name) => name.startsWith('@app/') || name.startsWith('@core/') || name.startsWith('@shared/'),
  ],
});