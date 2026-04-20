import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  find,
  findAll,
  render,
  settled,
  triggerEvent,
} from '@ember/test-helpers';
import DragSortList from 'ember-drag-sort/components/drag-sort-list';
import trigger from 'ember-drag-sort/utils/trigger';
import sinon from 'sinon';

module('Integration | Component | drag-sort-list', function (hooks) {
  setupRenderingTest(hooks);

  test('it works', async function (assert) {
    const items = [{ name: 'foo' }, { name: 'bar' }, { name: 'baz' }];

    const dragEndCallback = sinon.spy();

    const additionalArgs = { parent: 'test' };

    await render(
      <template>
        <DragSortList
          @additionalArgs={{additionalArgs}}
          @items={{items}}
          @dragEndAction={{dragEndCallback}}
          as |item|
        >
          <div>
            {{item.name}}
          </div>
        </DragSortList>
      </template>,
    );

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
        draggedItem: items[0],
        sourceArgs: { parent: 'test' },
        sourceList: items,
        targetArgs: { parent: 'test' },
        targetList: items,
        sourceIndex: 0,
        targetIndex: 1,
      }),
    );
  });

  test('sorting with neither dragover nor dragenter', async function (assert) {
    const items = [{ name: 'foo' }, { name: 'bar' }, { name: 'baz' }];

    const dragEndCallback = sinon.spy();

    await render(
      <template>
        <DragSortList
          @items={{items}}
          @dragEndAction={{dragEndCallback}}
          as |item|
        >
          <div>
            {{item.name}}
          </div>
        </DragSortList>
      </template>,
    );

    const item0 = find('.dragSortItem');

    trigger(item0, 'dragstart');
    trigger(item0, 'dragend');

    await settled();

    assert.ok(dragEndCallback.notCalled);
  });

  test('drag handle', async function (assert) {
    const items = [{ name: 'foo' }, { name: 'bar' }, { name: 'baz' }];

    const dragEndCallback = sinon.spy();

    await render(
      <template>
        <DragSortList
          @items={{items}}
          @dragEndAction={{dragEndCallback}}
          @handle=".handle"
          as |item|
        >
          <div class="handle">handle</div>
          <div>
            {{item.name}}
          </div>
        </DragSortList>
      </template>,
    );

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
        draggedItem: items[0],
        sourceArgs: undefined,
        sourceList: items,
        targetArgs: undefined,
        targetList: items,
        sourceIndex: 0,
        targetIndex: 1,
      }),
    );
  });

  test('nested drag handle', async function (assert) {
    const items = [{ name: 'foo' }, { name: 'bar' }, { name: 'baz' }];

    const dragEndCallback = sinon.spy();

    await render(
      <template>
        <DragSortList
          @items={{items}}
          @dragEndAction={{dragEndCallback}}
          @handle=".handle"
          as |item|
        >
          <div class="handle">
            <div class="handle2">handle</div>
          </div>
          <div>
            {{item.name}}
          </div>
        </DragSortList>
      </template>,
    );

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
        draggedItem: items[0],
        sourceArgs: undefined,
        sourceList: items,
        targetArgs: undefined,
        targetList: items,
        sourceIndex: 0,
        targetIndex: 1,
      }),
    );
  });

  test('dragged item receives -isDragged class', async function (assert) {
    const items = [{ name: 'foo' }, { name: 'bar' }, { name: 'baz' }];

    const dragEndCallback = () => {};

    await render(
      <template>
        <DragSortList
          @items={{items}}
          @dragEndAction={{dragEndCallback}}
          as |item|
        >
          <div class="the-item">{{item.name}}</div>
        </DragSortList>
      </template>,
    );

    const itemElements = findAll('.dragSortItem');
    const [item0] = itemElements;

    assert.notOk(
      item0.classList.contains('-isDragged'),
      'item0 does not have -isDragged before drag starts',
    );

    trigger(item0, 'dragstart');
    await settled();

    assert.ok(
      item0.classList.contains('-isDragged'),
      'item0 has -isDragged after dragstart + settled',
    );

    trigger(item0, 'dragend');
    await settled();

    assert.notOk(
      item0.classList.contains('-isDragged'),
      'item0 loses -isDragged after dragend + settled',
    );
  });

  test('target item receives -isDraggingOver and -placeholderAfter when dragging down', async function (assert) {
    const items = [{ name: 'foo' }, { name: 'bar' }, { name: 'baz' }];

    const dragEndCallback = () => {};

    await render(
      <template>
        <DragSortList
          @items={{items}}
          @dragEndAction={{dragEndCallback}}
          as |item|
        >
          <div class="the-item">{{item.name}}</div>
        </DragSortList>
      </template>,
    );

    const itemElements = findAll('.dragSortItem');
    const [item0, item1] = itemElements;

    trigger(item0, 'dragstart');
    await settled();

    trigger(item1, 'dragover', false);
    await settled();

    assert.ok(
      item1.classList.contains('-isDraggingOver'),
      'item1 has -isDraggingOver when dragged over',
    );

    assert.ok(
      item1.classList.contains('-placeholderAfter'),
      'item1 has -placeholderAfter when dragging down',
    );

    assert.notOk(
      item1.classList.contains('-placeholderBefore'),
      'item1 does not have -placeholderBefore when dragging down',
    );

    trigger(item0, 'dragend');
    await settled();
  });

  test('target item receives -isDraggingOver and -placeholderBefore when dragging up', async function (assert) {
    const items = [{ name: 'foo' }, { name: 'bar' }, { name: 'baz' }];

    const dragEndCallback = () => {};

    await render(
      <template>
        <DragSortList
          @items={{items}}
          @dragEndAction={{dragEndCallback}}
          as |item|
        >
          <div class="the-item">{{item.name}}</div>
        </DragSortList>
      </template>,
    );

    const itemElements = findAll('.dragSortItem');
    const [item0, , item2] = itemElements;

    trigger(item2, 'dragstart');
    await settled();

    trigger(item0, 'dragover', true);
    await settled();

    assert.ok(
      item0.classList.contains('-isDraggingOver'),
      'item0 has -isDraggingOver when dragged over',
    );

    assert.ok(
      item0.classList.contains('-placeholderBefore'),
      'item0 has -placeholderBefore when dragging up',
    );

    assert.notOk(
      item0.classList.contains('-placeholderAfter'),
      'item0 does not have -placeholderAfter when dragging up',
    );

    trigger(item2, 'dragend');
    await settled();
  });

  test('list receives -isDragging and -isDraggingOver classes during drag', async function (assert) {
    const items = [{ name: 'foo' }, { name: 'bar' }, { name: 'baz' }];

    const dragEndCallback = () => {};

    await render(
      <template>
        <DragSortList
          @items={{items}}
          @dragEndAction={{dragEndCallback}}
          @group="test"
          as |item|
        >
          <div class="the-item">{{item.name}}</div>
        </DragSortList>
      </template>,
    );

    const list = document.querySelector('.dragSortList');
    const itemElements = findAll('.dragSortItem');
    const [item0, item1] = itemElements;

    assert.notOk(
      list.classList.contains('-isDragging'),
      'list does not have -isDragging before drag starts',
    );

    trigger(item0, 'dragstart');
    await settled();

    assert.ok(
      list.classList.contains('-isDragging'),
      'list has -isDragging during drag',
    );

    trigger(item1, 'dragover', false);
    await settled();

    assert.ok(
      list.classList.contains('-isDraggingOver'),
      'list has -isDraggingOver when items are dragged within it',
    );

    trigger(item0, 'dragend');
    await settled();

    assert.notOk(
      list.classList.contains('-isDragging'),
      'list loses -isDragging after dragend',
    );
  });

  test('CSS classes are cleaned up after drag ends', async function (assert) {
    const items = [{ name: 'foo' }, { name: 'bar' }, { name: 'baz' }];

    const dragEndCallback = () => {};

    await render(
      <template>
        <DragSortList
          @items={{items}}
          @dragEndAction={{dragEndCallback}}
          as |item|
        >
          <div class="the-item">{{item.name}}</div>
        </DragSortList>
      </template>,
    );

    const itemElements = findAll('.dragSortItem');
    const [item0, item1] = itemElements;

    trigger(item0, 'dragstart');
    await settled();
    trigger(item1, 'dragover', false);
    await settled();
    trigger(item0, 'dragend');
    await settled();

    for (const item of findAll('.dragSortItem')) {
      assert.notOk(
        item.classList.contains('-isDragged'),
        `${item.textContent.trim()} does not have -isDragged after drag ends`,
      );
      assert.notOk(
        item.classList.contains('-isDraggingOver'),
        `${item.textContent.trim()} does not have -isDraggingOver after drag ends`,
      );
      assert.notOk(
        item.classList.contains('-placeholderBefore'),
        `${item.textContent.trim()} does not have -placeholderBefore after drag ends`,
      );
      assert.notOk(
        item.classList.contains('-placeholderAfter'),
        `${item.textContent.trim()} does not have -placeholderAfter after drag ends`,
      );
    }
  });

  test('drag start action', async function (assert) {
    const items = [{ name: 'foo' }, { name: 'bar' }, { name: 'baz' }];

    const dragStartCallback = sinon.stub();

    dragStartCallback.callsFake(({ event, element }) => {
      event.dataTransfer.setDragImage(
        element.querySelector('.item-wrapper'),
        20,
        30,
      );
    });

    await render(
      <template>
        <DragSortList
          @items={{items}}
          @dragStartAction={{dragStartCallback}}
          as |item|
        >
          <div class="item-wrapper">
            {{item.name}}
          </div>
        </DragSortList>
      </template>,
    );

    const itemElements = findAll('.dragSortItem');
    const [item0] = itemElements;

    const dataTransfer = new DataTransfer();
    sinon.spy(dataTransfer, 'setDragImage');

    await triggerEvent(item0, 'dragstart', { dataTransfer });

    assert.ok(dragStartCallback.calledOnce);

    assert.ok(
      dragStartCallback.calledWithMatch({
        draggedItem: items[0],
        element: item0,
      }),
    );
    assert.ok(dataTransfer.setDragImage.called);
    assert.ok(
      dataTransfer.setDragImage.lastCall.calledWithExactly(
        item0.querySelector('.item-wrapper'),
        20,
        30,
      ),
    );
  });
});
