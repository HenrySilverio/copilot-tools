```json
{
  "name": "fed-node-npm-template",
  "version": "0.0.1",
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "start:mock": "node mocks/backend.js",
    "build": "ng build --configuration production --base-href .",
    "postbuild": "node mocks/scripts/postbuild.js",
    "watch": "ng build --watch --configuration development",
    "test": "jest --detectOpenHandles --verbose"
  },
  "private": false,
  "dependencies": {
    "@angular-architects/native-federation": "21.2.3",
    "@angular/animations": "21.2.0",
    "@angular/cdk": "21.2.0",
    "@angular/common": "21.2.0",
    "@angular/compiler": "21.2.0",
    "@angular/core": "21.2.0",
    "@angular/elements": "21.2.0",
    "@angular/forms": "21.2.0",
    "@angular/platform-browser": "21.2.0",
    "@angular/platform-browser-dynamic": "21.2.0",
    "@angular/router": "21.2.0",
    "@ngrx/operators": "21.0.0",
    "@ngrx/signals": "21.0.0",
    "angular-google-tag-manager": "1.13.0",
    "es-check": "7.2.1",
    "es-module-shims": "1.5.12",
    "jsbarcode": "3.12.3",
    "rxjs": "~7.8.0",
    "tslib": "2.3.0",
    "zone.js": "~0.15.0"
  },
"devDependencies": {
  "@angular-devkit/build-angular": "~21.2.0",
  "@angular/cli": "~21.2.0",
  "@angular/compiler-cli": "~21.2.0",
  "@ngrx/eslint-plugin": "~21.0.0",
  "@types/jest": "~30.0.0",
  "angular-eslint": "~21.2.0",
  "typescript-eslint": "~8.47.0",
  "eslint": "^9.20.0",
  "jest": "~30.2.0",
  "jest-environment-jsdom": "~30.2.0",
  "jest-preset-angular": "~15.0.0",
  "prettier": "^3.2.5",
  "typescript": "~5.9.3"
}
  "overrides": {
    "@chialab/esbuild-plugin-commonjs": "0.18.3",
    "electron-to-chromium": "1.4.733",
    "picomatch": "2.3.1"
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "html"
  ],
  "browserslist": [
    "last 2 Chrome versions",
    "last 2 Firefox versions",
    "Safari >= 17",
    "iOS >= 16"
  ],
  "prettier": {
    "singleQuote": true,
    "printWidth": 180
  }
}
```