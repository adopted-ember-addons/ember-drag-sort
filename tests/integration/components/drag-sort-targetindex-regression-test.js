import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { findAll, render, triggerEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { A } from '@ember/array';

module(
  'Integration | Component | drag-sort targetIndex regression test',
  function (hooks) {
    setupRenderingTest(hooks);

    test('service targetIndex should not be set immediately on dragstart', async function (assert) {
      // This test prevents regression of the bug where targetIndex was being set
      // immediately on dragstart, which interfered with dragover events in modern Ember

      const items = A([
        { name: 'Item 1' },
        { name: 'Item 2' },
        { name: 'Item 3' },
      ]);

      this.setProperties({ items });

      await render(hbs`
      <DragSortList 
        @items={{this.items}} 
        @group="test"
        as |item|
      >
        <div class="the-item">{{item.name}}</div>
      </DragSortList>
    `);

      const dragSort = this.owner.lookup('service:drag-sort');
      const itemElements = findAll('.dragSortItem');

      // Initial state - targetIndex should be null
      assert.strictEqual(
        dragSort.targetIndex,
        null,
        'targetIndex should initially be null',
      );

      // Start dragging the second item (index 1)
      await triggerEvent(itemElements[1], 'dragstart', {
        dataTransfer: new DataTransfer(),
      });

      // CRITICAL: targetIndex should remain null after dragstart
      // It should only be set later during actual dragover events
      // The bug was setting targetIndex = index - 1 immediately, which caused
      // CSS class conflicts and prevented dragover events from firing properly
      assert.strictEqual(
        dragSort.targetIndex,
        null,
        'targetIndex should remain null after dragstart - it should only be set during dragover',
      );

      // Clean up
      await triggerEvent(itemElements[1], 'dragend');
    });
  },
);
