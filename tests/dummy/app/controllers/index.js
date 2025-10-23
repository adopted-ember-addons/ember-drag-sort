import Controller from '@ember/controller';
import { action } from '@ember/object';

import { dropTask, timeout } from 'ember-concurrency';
import RSVP from 'rsvp';
import { tracked } from '@glimmer/tracking';

export default class IndexController extends Controller {
  @tracked simple1 = [
    { name: 'Foo' },
    { name: 'Bar' },
    { name: 'Baz' },
    { name: 'Quux' },
  ];
  @tracked simple2 = [{ name: 'Zomg' }, { name: 'Lol' }];

  @tracked async1 = [
    { name: 'Foo' },
    { name: 'Bar' },
    { name: 'Baz' },
    { name: 'Quux' },
  ];
  @tracked async2 = [{ name: 'Zomg' }, { name: 'Lol' }];

  @tracked foreign1 = [
    { name: 'Bar' },
    { name: 'Baz' },
    { name: 'Foo' },
    { name: 'Quux' },
  ];
  @tracked foreign2 = [{ name: 'Zomg' }, { name: 'Lol' }];

  @tracked copies1 = [{ name: 'Foo' }, { name: 'Bar' }, { name: 'Baz' }];
  @tracked copies2 = [{ name: 'Quux' }];
  @tracked copies3 = [];

  @tracked table1 = [
    { name: 'Foo' },
    { name: 'Bar' },
    { name: 'Baz' },
    { name: 'Quux' },
  ];

  @tracked table2 = [{ name: 'Zomg' }, { name: 'Lol' }];

  @tracked horizontal1 = [
    { name: 'Foo' },
    { name: 'Bar' },
    { name: 'Baz' },
    { name: 'Quux' },
    { name: 'Zomg' },
    { name: 'Lol' },
    { name: 'Quuz' },
    { name: 'Hello' },
    { name: 'World' },
  ];

  @tracked horizontal2 = [
    { name: 'Foo' },
    { name: 'Bar' },
    { name: 'Baz' },
    { name: 'Quux' },
  ];

  @tracked rtl = [
    { name: 'حلقة واحدة للحكم عليهم جميعان' },
    { name: 'حلقة واحدة للعثور عليهم' },
    { name: 'حلقة واحدة لجلب لهم' },
    { name: 'وفي الظلام لربطهم' },
  ];

  @tracked dragImage = [
    { name: 'Foo' },
    { name: 'Bar' },
    { name: 'Baz' },
    { name: 'Quux' },
  ];

  @tracked nestedItem = {
    name: 'Foo',
    children: [
      {
        name: 'Bar',
        children: [
          {
            name: 'Baz',
            children: [],
          },
          {
            name: 'Quuz',
            children: [],
          },
        ],
      },
      {
        name: 'Zomg',
        children: [],
      },
      {
        name: 'Lol',
        children: [],
      },
    ],
  };

  @tracked nestedItems2 = {
    name: 'Foo',
    children: [
      {
        name: 'Bar',
        children: [
          {
            name: 'Baz',
            children: [],
          },
          {
            name: 'Quuz',
            children: [],
          },
        ],
      },
      {
        name: 'Zomg',
        children: [],
      },
      {
        name: 'Lol',
        children: [],
      },
    ],
  };

  @tracked sourceOnly1 = [{ name: 'Foo' }, { name: 'Bar' }, { name: 'Baz' }];

  @tracked sourceOnly2 = [{ name: 'Quux' }];

  @tracked networkFailure = false;

  _updateArrayProperty(oldArray, newArray) {
    // Find which property matches the old array and update it
    const propertyNames = [
      'simple1',
      'simple2',
      'async1',
      'async2',
      'foreign1',
      'foreign2',
      'copies1',
      'copies2',
      'copies3',
      'table1',
      'table2',
      'horizontal1',
      'horizontal2',
      'rtl',
      'dragImage',
      'sourceOnly1',
      'sourceOnly2',
    ];

    for (const prop of propertyNames) {
      if (this[prop] === oldArray) {
        this[prop] = newArray;
        break;
      }
    }
  }

  @action
  dragEnd({ sourceList, sourceIndex, targetList, targetIndex }) {
    if (sourceList === targetList && sourceIndex === targetIndex) return;

    const item = sourceList[sourceIndex];

    // Create new arrays to trigger reactivity
    const newSourceList = [...sourceList];
    newSourceList.splice(sourceIndex, 1);

    const newTargetList =
      sourceList === targetList ? newSourceList : [...targetList];
    newTargetList.splice(targetIndex, 0, item);

    // Update the tracked properties
    this._updateArrayProperty(sourceList, newSourceList);
    if (sourceList !== targetList) {
      this._updateArrayProperty(targetList, newTargetList);
    }
  }

  @action
  determineForeignPosition({ draggedItem, items }) {
    const itemsCopy = items.slice(); // create a copy of the list
    itemsCopy.push(draggedItem);
    itemsCopy.sort((a, b) => a.name.localeCompare(b.name));
    return itemsCopy.indexOf(draggedItem);
  }

  @action
  dragEnd2({ sourceList, sourceIndex, targetList, targetIndex }) {
    if (sourceList === targetList && sourceIndex === targetIndex) return;

    const unsortableList = this.copies1;

    let item = sourceList[sourceIndex];

    if (sourceList === unsortableList) {
      item = { ...item }; // shallow clone
    } else {
      const newSourceList = [...sourceList];
      newSourceList.splice(sourceIndex, 1);
      this._updateArrayProperty(sourceList, newSourceList);
    }

    if (targetList !== unsortableList) {
      const newTargetList = [...targetList];
      newTargetList.splice(targetIndex, 0, item);
      this._updateArrayProperty(targetList, newTargetList);
    }
  }

  @action
  determineForeignPosition2({ /*draggedItem, */ items }) {
    return items.length;
  }

  @action
  sourceOnlyDragEnd({ sourceList, sourceIndex, targetList, targetIndex }) {
    if (sourceList === targetList && sourceIndex === targetIndex) return;

    const sourceOnlyList = this.sourceOnly1;

    let item = sourceList[sourceIndex];

    if (sourceList === sourceOnlyList) item = { ...item }; // shallow clone

    if (targetList !== sourceOnlyList) {
      const newTargetList = [...targetList];
      newTargetList.splice(targetIndex, 0, item);
      this._updateArrayProperty(targetList, newTargetList);
    }
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

      const item = sourceList[sourceIndex];

      // Create new arrays to trigger reactivity
      const newSourceList = [...sourceList];
      newSourceList.splice(sourceIndex, 1);

      const newTargetList =
        sourceList === targetList ? newSourceList : [...targetList];
      newTargetList.splice(targetIndex, 0, item);

      // Update the tracked properties
      this._updateArrayProperty(sourceList, newSourceList);
      if (sourceList !== targetList) {
        this._updateArrayProperty(targetList, newTargetList);
      }

      await timeout(2000);

      if (this.networkFailure) {
        // Rollback
        const rollbackTargetList = [...newTargetList];
        rollbackTargetList.splice(targetIndex, 1);
        const rollbackSourceList = [...newSourceList];
        rollbackSourceList.splice(sourceIndex, 0, item);

        this._updateArrayProperty(newTargetList, rollbackTargetList);
        if (sourceList !== targetList) {
          this._updateArrayProperty(newSourceList, rollbackSourceList);
        }

        return RSVP.reject({ message: 'Request timed out.' });
      }

      return RSVP.resolve();
    },
  );
}
