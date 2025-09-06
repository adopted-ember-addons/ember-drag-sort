import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  find,
  findAll,
  render,
  settled,
  triggerEvent,
} from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import trigger from 'ember-drag-sort/utils/trigger';
import sinon from 'sinon';
import { A } from '@ember/array';

module('Integration | Component | drag-sort-list', function (hooks) {
  setupRenderingTest(hooks);

  test('it works', async function (assert) {
    const items = A([{ name: 'foo' }, { name: 'bar' }, { name: 'baz' }]);

    const dragEndCallback = sinon.spy();

    const additionalArgs = { parent: 'test' };

    this.setProperties({ additionalArgs, items, dragEndCallback });

    await render(hbs`
      {{#drag-sort-list
        additionalArgs = additionalArgs
        items          = items
        dragEndAction  = (action dragEndCallback)
        as |item|
      }}
        <div>
          {{item.name}}
        </div>
      {{/drag-sort-list}}
    `);

    const itemElements = findAll('.dragSortItem');
    const [item0, item1] = itemElements;

    trigger(item0, 'dragstart');
    trigger(item1, 'dragover', false);
    trigger(item0, 'dragend');

    await settled();

    assert.ok(dragEndCallback.calledOnce);

    assert.ok(
      dragEndCallback.calledWithExactly({
        group: undefined,
        draggedItem: items.objectAt(0),
        sourceArgs: { parent: 'test' },
        sourceList: items,
        targetArgs: { parent: 'test' },
        targetList: items,
        sourceIndex: 0,
        targetIndex: 1,
      })
    );
  });

  test('sorting with neither dragover nor dragenter', async function (assert) {
    const items = A([{ name: 'foo' }, { name: 'bar' }, { name: 'baz' }]);

    const dragEndCallback = sinon.spy();

    this.setProperties({ items, dragEndCallback });

    await render(hbs`
      {{#drag-sort-list
        items         = items
        dragEndAction = (action dragEndCallback)
        as |item|
      }}
        <div>
          {{item.name}}
        </div>
      {{/drag-sort-list}}
    `);

    const item0 = find('.dragSortItem');

    trigger(item0, 'dragstart');
    trigger(item0, 'dragend');

    await settled();

    assert.ok(dragEndCallback.notCalled);
  });

  test('drag handle', async function (assert) {
    const items = A([{ name: 'foo' }, { name: 'bar' }, { name: 'baz' }]);

    const dragEndCallback = sinon.spy();

    this.setProperties({ items, dragEndCallback });

    await render(hbs`
      {{#drag-sort-list
        items         = items
        dragEndAction = (action dragEndCallback)
        handle        = ".handle"
        as |item|
      }}
        <div class="handle">handle</div>
        <div>
          {{item.name}}
        </div>
      {{/drag-sort-list}}
    `);

    const itemElements = findAll('.dragSortItem');
    const [item0, item1] = itemElements;

    trigger(item0, 'dragstart');
    trigger(item1, 'dragover', false);
    trigger(item0, 'dragend');

    await settled();

    assert.ok(dragEndCallback.notCalled);

    trigger(item0.querySelector('.handle'), 'dragstart');
    trigger(item1, 'dragover', false);
    trigger(item0, 'dragend');

    await settled();

    assert.ok(dragEndCallback.calledOnce);

    assert.ok(
      dragEndCallback.calledWithExactly({
        group: undefined,
        draggedItem: items.objectAt(0),
        sourceArgs: undefined,
        sourceList: items,
        targetArgs: undefined,
        targetList: items,
        sourceIndex: 0,
        targetIndex: 1,
      })
    );
  });

  test('nested drag handle', async function (assert) {
    const items = A([{ name: 'foo' }, { name: 'bar' }, { name: 'baz' }]);

    const dragEndCallback = sinon.spy();

    this.setProperties({ items, dragEndCallback });

    await render(hbs`
      {{#drag-sort-list
        items         = items
        dragEndAction = (action dragEndCallback)
        handle        = ".handle"
        as |item|
      }}
        <div class="handle">
          <div class="handle2">handle</div>
        </div>
        <div>
          {{item.name}}
        </div>
      {{/drag-sort-list}}
    `);

    const itemElements = findAll('.dragSortItem');
    const [item0, item1] = itemElements;

    trigger(item0, 'dragstart');
    trigger(item1, 'dragover', false);
    trigger(item0, 'dragend');

    await settled();

    assert.ok(dragEndCallback.notCalled);

    trigger(item0.querySelector('.handle2'), 'dragstart');
    trigger(item1, 'dragover', false);
    trigger(item0, 'dragend');

    await settled();

    assert.ok(dragEndCallback.calledOnce);

    assert.ok(
      dragEndCallback.calledWithExactly({
        group: undefined,
        draggedItem: items.objectAt(0),
        sourceArgs: undefined,
        sourceList: items,
        targetArgs: undefined,
        targetList: items,
        sourceIndex: 0,
        targetIndex: 1,
      })
    );
  });

  test('drag start action', async function (assert) {
    const items = A([{ name: 'foo' }, { name: 'bar' }, { name: 'baz' }]);

    const dragStartCallback = sinon.stub();

    dragStartCallback.callsFake(({ event, element }) => {
      event.dataTransfer.setDragImage(
        element.querySelector('.item-wrapper'),
        20,
        30
      );
    });

    this.setProperties({ items, dragStartCallback });

    await render(hbs`
      {{#drag-sort-list
        items           = items
        dragStartAction = (action dragStartCallback)
        as |item|
      }}
        <div class="item-wrapper">
          {{item.name}}
        </div>
      {{/drag-sort-list}}
    `);

    const itemElements = findAll('.dragSortItem');
    const [item0] = itemElements;

    const dataTransfer = new DataTransfer();
    sinon.spy(dataTransfer, 'setDragImage');

    await triggerEvent(item0, 'dragstart', { dataTransfer });

    assert.ok(dragStartCallback.calledOnce);

    assert.ok(
      dragStartCallback.calledWithMatch({
        draggedItem: items.objectAt(0),
        element: item0,
      })
    );
    assert.ok(dataTransfer.setDragImage.called);
    assert.ok(
      dataTransfer.setDragImage.lastCall.calledWithExactly(
        item0.querySelector('.item-wrapper'),
        20,
        30
      )
    );
  });
});
