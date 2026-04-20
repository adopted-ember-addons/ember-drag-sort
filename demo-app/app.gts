import EmberApp from 'ember-strict-application-resolver';
import EmberRouter from '@ember/routing/router';

// This is only necessary right now because we can't import compatModules in the new
// v2 addon blueprint. Once https://github.com/embroider-build/embroider/issues/2708 is fixed we can just use compatModules directly
import DragSortService from 'ember-drag-sort/services/drag-sort';

export class Router extends EmberRouter {
  location = 'history';
  rootURL = import.meta.env.BASE_URL;
}

export class App extends EmberApp {
  modules = {
    './router': Router,
    './services/drag-sort': DragSortService,
    ...import.meta.glob('./services/**/*', { eager: true }),
    ...import.meta.glob('./templates/**/*', { eager: true }),
    ...import.meta.glob('./controllers/**/*', { eager: true }),
    ...import.meta.glob('./components/**/*', { eager: true }),
  };
}

Router.map(function () {});
