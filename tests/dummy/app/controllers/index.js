/* eslint-disable ember/no-arrow-function-computed-properties */

import Controller from '@ember/controller';
import { A } from '@ember/array';

import { task, timeout } from 'ember-concurrency';
import RSVP from 'rsvp';
import { computed } from '@ember/object';

export default Controller.extend({
  simple1: computed(() =>
    A([{ name: 'Foo' }, { name: 'Bar' }, { name: 'Baz' }, { name: 'Quux' }])
  ),

  simple2: computed(() => A([{ name: 'Zomg' }, { name: 'Lol' }])),

  async1: computed(() =>
    A([{ name: 'Foo' }, { name: 'Bar' }, { name: 'Baz' }, { name: 'Quux' }])
  ),

  async2: computed(() => A([{ name: 'Zomg' }, { name: 'Lol' }])),

  foreign1: computed(() =>
    A([{ name: 'Bar' }, { name: 'Baz' }, { name: 'Foo' }, { name: 'Quux' }])
  ),

  foreign2: computed(() => A([{ name: 'Zomg' }, { name: 'Lol' }])),

  copies1: computed(() =>
    A([{ name: 'Foo' }, { name: 'Bar' }, { name: 'Baz' }])
  ),

  copies2: computed(() => A([{ name: 'Quux' }])),

  copies3: computed(() => A()),

  table1: computed(() =>
    A([{ name: 'Foo' }, { name: 'Bar' }, { name: 'Baz' }, { name: 'Quux' }])
  ),

  table2: computed(() => A([{ name: 'Zomg' }, { name: 'Lol' }])),

  horizontal1: computed(() =>
    A([
      { name: 'Foo' },
      { name: 'Bar' },
      { name: 'Baz' },
      { name: 'Quux' },
      { name: 'Zomg' },
      { name: 'Lol' },
      { name: 'Quuz' },
      { name: 'Hello' },
      { name: 'World' },
    ])
  ),

  horizontal2: computed(() =>
    A([{ name: 'Foo' }, { name: 'Bar' }, { name: 'Baz' }, { name: 'Quux' }])
  ),

  rtl: computed(() =>
    A([
      { name: 'حلقة واحدة للحكم عليهم جميعان' },
      { name: 'حلقة واحدة للعثور عليهم' },
      { name: 'حلقة واحدة لجلب لهم' },
      { name: 'وفي الظلام لربطهم' },
    ])
  ),

  dragImage: computed(() =>
    A([{ name: 'Foo' }, { name: 'Bar' }, { name: 'Baz' }, { name: 'Quux' }])
  ),

  nestedItem: computed(() => ({
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
  })),

  nestedItems2: computed(() => ({
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
  })),

  sourceOnly1: computed(() =>
    A([{ name: 'Foo' }, { name: 'Bar' }, { name: 'Baz' }])
  ),

  sourceOnly2: computed(() => A([{ name: 'Quux' }])),

  networkFailure: false,

  actions: {
    dragEnd({ sourceList, sourceIndex, targetList, targetIndex }) {
      if (sourceList === targetList && sourceIndex === targetIndex) return;

      const item = sourceList.objectAt(sourceIndex);

      sourceList.removeAt(sourceIndex);
      targetList.insertAt(targetIndex, item);
    },

    determineForeignPosition({ draggedItem, items }) {
      return A(items.slice()) // create a copy of the list
        .addObject(draggedItem)
        .sortBy('name')
        .indexOf(draggedItem);
    },

    dragEnd2({ sourceList, sourceIndex, targetList, targetIndex }) {
      if (sourceList === targetList && sourceIndex === targetIndex) return;

      const unsortableList = this.copies1;

      let item = sourceList.objectAt(sourceIndex);

      if (sourceList === unsortableList) item = { ...item }; // shallow clone
      else sourceList.removeAt(sourceIndex);

      if (targetList !== unsortableList) targetList.insertAt(targetIndex, item);
    },

    determineForeignPosition2({ /*draggedItem, */ items }) {
      return items.length;
    },

    sourceOnlyDragEnd({ sourceList, sourceIndex, targetList, targetIndex }) {
      if (sourceList === targetList && sourceIndex === targetIndex) return;

      const sourceOnlyList = this.sourceOnly1;

      let item = sourceList.objectAt(sourceIndex);

      if (sourceList === sourceOnlyList) item = { ...item }; // shallow clone

      if (targetList !== sourceOnlyList) targetList.insertAt(targetIndex, item);
    },

    setDragImage({ event, element }) {
      const target = element.querySelector('.the-item');
      const { x, y } = element.getBoundingClientRect();

      // Set drag image, positioning it to align with `.the-item`'s position
      event.dataTransfer.setDragImage(
        target,
        event.clientX - x,
        event.clientY - y
      );
    },
  },

  dragEndTask: task(function* ({
    sourceList,
    sourceIndex,
    targetList,
    targetIndex,
  }) {
    if (sourceList === targetList && sourceIndex === targetIndex)
      return RSVP.resolve();

    const item = sourceList.objectAt(sourceIndex);

    sourceList.removeAt(sourceIndex);
    targetList.insertAt(targetIndex, item);

    yield timeout(2000);

    if (this.networkFailure) {
      // Rollback
      targetList.removeAt(targetIndex);
      sourceList.insertAt(sourceIndex, item);

      return RSVP.reject({ message: 'Request timed out.' });
    }

    return RSVP.resolve();
  }).drop(),
});
