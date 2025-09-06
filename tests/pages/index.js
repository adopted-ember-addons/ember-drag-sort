import { create, text, visitable } from 'ember-cli-page-object';

import { dragSortList } from 'dummy/tests/pages/components/drag-sort-list';

function list(scope) {
  return { ...dragSortList({ title: text() }), scope };
}

export default create({
  visit: visitable('/'),

  simple1: list('#simple-1'),
  simple2: list('#simple-2'),
  foreign1: list('#foreign-1'),
  foreign2: list('#foreign-2'),
  copies1: list('#copies-1'),
  copies2: list('#copies-2'),
  sourceOnly1: list('#source-only-1'),
  sourceOnly2: list('#source-only-2'),
});
