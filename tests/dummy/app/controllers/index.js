import Controller from '@ember/controller';
import { A } from '@ember/array';
import { action } from '@ember/object';

import { dropTask, timeout } from 'ember-concurrency';
import RSVP from 'rsvp';
import { tracked } from '@glimmer/tracking';

export default class IndexController extends Controller {
  simple1 = A([
    { name: 'Foo' },
    { name: 'Bar' },
    { name: 'Baz' },
    { name: 'Quux' },
  ]);
  simple2 = A([{ name: 'Zomg' }, { name: 'Lol' }]);

  async1 = A([
    { name: 'Foo' },
    { name: 'Bar' },
    { name: 'Baz' },
    { name: 'Quux' },
  ]);
  async2 = A([{ name: 'Zomg' }, { name: 'Lol' }]);

  foreign1 = A([
    { name: 'Bar' },
    { name: 'Baz' },
    { name: 'Foo' },
    { name: 'Quux' },
  ]);
  foreign2 = A([{ name: 'Zomg' }, { name: 'Lol' }]);

  copies1 = A([{ name: 'Foo' }, { name: 'Bar' }, { name: 'Baz' }]);
  copies2 = A([{ name: 'Quux' }]);
  copies3 = A();

  table1 = A([
    { name: 'Foo' },
    { name: 'Bar' },
    { name: 'Baz' },
    { name: 'Quux' },
  ]);

  table2 = A([{ name: 'Zomg' }, { name: 'Lol' }]);

  horizontal1 = A([
    { name: 'Foo' },
    { name: 'Bar' },
    { name: 'Baz' },
    { name: 'Quux' },
    { name: 'Zomg' },
    { name: 'Lol' },
    { name: 'Quuz' },
    { name: 'Hello' },
    { name: 'World' },
  ]);

  horizontal2 = A([
    { name: 'Foo' },
    { name: 'Bar' },
    { name: 'Baz' },
    { name: 'Quux' },
  ]);

  rtl = A([
    { name: 'حلقة واحدة للحكم عليهم جميعان' },
    { name: 'حلقة واحدة للعثور عليهم' },
    { name: 'حلقة واحدة لجلب لهم' },
    { name: 'وفي الظلام لربطهم' },
  ]);

  dragImage = A([
    { name: 'Foo' },
    { name: 'Bar' },
    { name: 'Baz' },
    { name: 'Quux' },
  ]);

  nestedItem = {
    name: 'Foo',
    children: A([
      {
        name: 'Bar',
        children: A([
          {
            name: 'Baz',
            children: A([]),
          },
          {
            name: 'Quuz',
            children: A([]),
          },
        ]),
      },
      {
        name: 'Zomg',
        children: A([]),
      },
      {
        name: 'Lol',
        children: A([]),
      },
    ]),
  };

  nestedItems2 = {
    name: 'Foo',
    children: A([
      {
        name: 'Bar',
        children: A([
          {
            name: 'Baz',
            children: A([]),
          },
          {
            name: 'Quuz',
            children: A([]),
          },
        ]),
      },
      {
        name: 'Zomg',
        children: A([]),
      },
      {
        name: 'Lol',
        children: A([]),
      },
    ]),
  };

  sourceOnly1 = A([{ name: 'Foo' }, { name: 'Bar' }, { name: 'Baz' }]);

  sourceOnly2 = A([{ name: 'Quux' }]);

  @tracked networkFailure = false;

  @action
  dragEnd({ sourceList, sourceIndex, targetList, targetIndex }) {
    if (sourceList === targetList && sourceIndex === targetIndex) return;

    const item = sourceList.objectAt(sourceIndex);

    sourceList.removeAt(sourceIndex);
    targetList.insertAt(targetIndex, item);
  }

  @action
  determineForeignPosition({ draggedItem, items }) {
    return A(items.slice()) // create a copy of the list
      .addObject(draggedItem)
      .sortBy('name')
      .indexOf(draggedItem);
  }

  @action
  dragEnd2({ sourceList, sourceIndex, targetList, targetIndex }) {
    if (sourceList === targetList && sourceIndex === targetIndex) return;

    const unsortableList = this.copies1;

    let item = sourceList.objectAt(sourceIndex);

    if (sourceList === unsortableList)
      item = { ...item }; // shallow clone
    else sourceList.removeAt(sourceIndex);

    if (targetList !== unsortableList) targetList.insertAt(targetIndex, item);
  }

  @action
  determineForeignPosition2({ /*draggedItem, */ items }) {
    return items.length;
  }

  @action
  sourceOnlyDragEnd({ sourceList, sourceIndex, targetList, targetIndex }) {
    if (sourceList === targetList && sourceIndex === targetIndex) return;

    const sourceOnlyList = this.sourceOnly1;

    let item = sourceList.objectAt(sourceIndex);

    if (sourceList === sourceOnlyList) item = { ...item }; // shallow clone

    if (targetList !== sourceOnlyList) targetList.insertAt(targetIndex, item);
  }

  @action
  setDragImage({ event, element }) {
    const target = element.querySelector('.the-item');
    const { x, y } = element.getBoundingClientRect();

    // Set drag image, positioning it to align with `.the-item`'s position
    event.dataTransfer.setDragImage(
      target,
      event.clientX - x,
      event.clientY - y,
    );
  }

  updateNetworkFailure = (event) => {
    this.networkFailure = event.target.checked;
  };

  dragEndTask = dropTask(
    async ({ sourceList, sourceIndex, targetList, targetIndex }) => {
      if (sourceList === targetList && sourceIndex === targetIndex)
        return RSVP.resolve();

      const item = sourceList.objectAt(sourceIndex);

      sourceList.removeAt(sourceIndex);
      targetList.insertAt(targetIndex, item);

      await timeout(2000);

      if (this.networkFailure) {
        // Rollback
        targetList.removeAt(targetIndex);
        sourceList.insertAt(sourceIndex, item);

        return RSVP.reject({ message: 'Request timed out.' });
      }

      return RSVP.resolve();
    },
  );
}
