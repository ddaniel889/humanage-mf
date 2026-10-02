import { bootstrap } from '@angular-architects/module-federation-tools';
import { AppModule } from './app/app.module';

bootstrap(AppModule, {
  appType: 'microfrontend',
  production: false,
  ngZoneSharing: true,
  platformSharing: true,
})
.catch((err) => console.error(err));
