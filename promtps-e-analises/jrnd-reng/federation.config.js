const {
  withNativeFederation,
  shareAll,
} = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({
  name: 'recr-fed-agc-jrnd-reneg',
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
  'recr-fed-agc-jrnd-reneg': false,
  'zone.js': false,
  '@ngx-translate/core': false,
  '@ngx-translate/http-loader': false,
  skip: [
    'rxjs/ajax',
    'rxjs/fetch',
    'rxjs/testing',
    'rxjs/webSocket',
    'zone.js',
    '@ngx-translate/core',
    '@ngx-translate/http-loader',
    'recr-fed-agc-jrnd-reneg',
  ],
});