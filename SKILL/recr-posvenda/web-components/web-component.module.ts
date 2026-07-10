import { createApplication } from '@angular/platform-browser';
import { appConfig } from './app.config';
import { AppComponent } from './app.component';
import { createCustomElement } from '@angular/elements';

(async () => {
  try {
    const app = await createApplication(appConfig);

    const appElement = createCustomElement(AppComponent, {
      injector: app.injector,
    });

    customElements.define('recr-fed-agc-posvenda', appElement);
    console.log(`✅ Web component "recr-fed-agc-posvenda" registered successfully.`);
  } catch (error) {
    console.error('❌ Error creating web component:', error);
  }
})();
