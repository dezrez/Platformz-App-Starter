import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

// The record example is opt-in learning material, never the first app.
const component = new URLSearchParams(location.search).get('example') === 'records'
  ? import('./app/record-example.component').then(module => module.RecordExampleComponent)
  : Promise.resolve(AppComponent);
component.then(value => bootstrapApplication(value)).catch(() => {
  const root = document.querySelector('app-root');
  if (root) root.textContent = 'The app could not start. Ask your coding assistant to run npm run validate.';
});
