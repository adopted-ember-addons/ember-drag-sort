import * as QUnit from 'qunit';
import { setApplication } from '@ember/test-helpers';
import { setup } from 'qunit-dom';
import { start as qunitStart, setupEmberOnerrorValidation } from 'ember-qunit';
import { setTesting } from '@embroider/macros';
import { App, Router } from '../demo-app/app.gts';
import '../demo-app/styles.css';

Router.location = 'none';

export function start() {
  setTesting(true);
  setApplication(
    App.create({
      autoboot: false,
      rootElement: '#ember-testing',
    }),
  );
  setup(QUnit.assert);
  setupEmberOnerrorValidation();

  qunitStart();
}
