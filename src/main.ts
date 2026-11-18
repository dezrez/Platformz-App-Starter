import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent).catch(() => {
  const root = document.querySelector('app-root');
  if (root) root.textContent = 'The app could not start. Ask your coding assistant to run npm run validate.';
});
