import EmberApp from 'ember-strict-application-resolver';
import EmberRouter from '@ember/routing/router';

import DragSortService from 'ember-drag-sort/services/drag-sort';

export class Router extends EmberRouter {
  location = 'history';
  rootURL = '/';
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
