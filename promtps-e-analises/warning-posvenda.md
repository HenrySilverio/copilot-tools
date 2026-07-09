```bash
I459249@N83461498N4294D MINGW64 ~/Documents/Projetos/recr-fed-agc-posvenda (feature/GPCNLS-6651-test-CI)
$ npm run build

> recr-fed-agc-posvenda@0.0.1 build
> ng build --configuration production --base-href .

WARN [shared-mappings] Internal lib '@app/core' does not contain an entryPoint (barrel file).
WARN [shared-mappings] Internal lib '@app/domain' does not contain an entryPoint (barrel file).
WARN [shared-mappings] Internal lib '@app/feature' does not contain an entryPoint (barrel file).
WARN [shared-mappings] Internal lib '@app/shared' does not contain an entryPoint (barrel file).
WARN [shared-mappings] Internal lib '@core/config' does not contain an entryPoint (barrel file).
WARN [shared-mappings] Internal lib '@core/errors' does not contain an entryPoint (barrel file).
WARN [shared-mappings] Internal lib '@core/services' does not contain an entryPoint (barrel file).
WARN [shared-mappings] Internal lib '@shared/components' does not contain an entryPoint (barrel file).
WARN [shared-mappings] Internal lib '@shared/pipes' does not contain an entryPoint (barrel file).
WARN [shared-mappings] Internal lib '@shared/utils' does not contain an entryPoint (barrel file).
INFO Building federation artefacts
One or more browsers which are configured in the project's Browserslist configuration fall outside Angular's browser support for this version.
Unsupported browsers:
ios_saf 16.3, ios_saf 16.2, ios_saf 16.1, ios_saf 16.0
▲ [WARNING] File 'src\bootstrap-webcomponent.ts' not found in TypeScript compilation. [plugin angular-compiler]

  The file will be bundled and included in the output but will not be type-checked at build time. To
  remove this message you can add the file to the TypeScript program via the 'files' or 'include'
  property.

▲ [WARNING] File 'src\app\web-component.module.ts' not found in TypeScript compilation. [plugin angular-compiler]

  src/bootstrap-webcomponent.ts:1:7:
    1 │ import './app/web-component.module';
      ╵        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  The file will be bundled and included in the output but will not be type-checked at build time. To
  remove this message you can add the file to the TypeScript program via the 'files' or 'include'
  property.

INFO Preparing shared npm packages for the platform browser-shared
NOTE This only needs to be done once, as results are cached
NOTE Skip packages you don't want to share in your federation config
One or more browsers which are configured in the project's Browserslist configuration fall outside Angular's browser support for this version.
Unsupported browsers:
ios_saf 16.3, ios_saf 16.2, ios_saf 16.1, ios_saf 16.0

One or more browsers which are configured in the project's Browserslist configuration fall outside Angular's browser support for this version.
Unsupported browsers:
ios_saf 16.3, ios_saf 16.2, ios_saf 16.1, ios_saf 16.0
Initial chunk files   | Names         |  Raw size | Estimated transfer size
polyfills-DVMTI233.js | polyfills     |  65.38 kB |                21.28 kB
main-G37EFJGF.js      | main          |   3.62 kB |                 1.47 kB
chunk-2V00MS7J.js     | -             | 661 bytes |               661 bytes
styles-QV74ZKUN.css   | styles        |  66 bytes |                66 bytes

                      | Initial total |  69.73 kB |                23.47 kB

Lazy chunk files      | Names         |  Raw size | Estimated transfer size
chunk-77VMDUVN.js     | bootstrap     | 110.62 kB |                20.95 kB

Application bundle generation complete. [2.694 seconds] - 2026-07-09T14:57:26.718Z

Output location: C:\Users\i459249\Documents\Projetos\recr-fed-agc-posvenda\dist

> recr-fed-agc-posvenda@0.0.1 postbuild
> node mocks/scripts/postbuild.js

[INFO] Versao preenchida no index.html [ 0.0.1 ]
[INFO] DSYS preenchida no index.html [ https://static.bradesco.com.br ]
[INFO] Comentarios retirados do index.html.

I459249@N83461498N4294D MINGW64 ~/Documents/Projetos/recr-fed-agc-posvenda (feature/GPCNLS-6651-test-CI)
$ 
```