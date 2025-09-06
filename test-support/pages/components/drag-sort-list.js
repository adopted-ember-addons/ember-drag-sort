import component from './_component';
import dragSortItem from './drag-sort-item';
import trigger, { sort, move } from 'ember-drag-sort/utils/trigger';

import { collection, hasClass } from 'ember-cli-page-object';

export function dragSortList(content = {}, handleSelector) {
  return component({
    items: collection({
      itemScope: '> .dragSortItem',
      item: {
        ...dragSortItem,
        content,
      },
    }),

    draggingEnabled: hasClass('-draggingEnabled'),
    isDragging: hasClass('-isDragging'),
    isDraggingOver: hasClass('-isDraggingOver'),
    isEmpty: hasClass('-isEmpty'),
    isExpanded: hasClass('-isExpanded'),

    dragEnter() {
      trigger(this.$.get(0), 'dragenter');
    },

    sort(sourceIndex, targetIndex, above) {
      return sort(
        this.$.get(0),
        sourceIndex,
        targetIndex,
        above,
        handleSelector
      );
    },

    move(sourceIndex, targetList, targetIndex, above) {
      return move(
        this.$.get(0),
        sourceIndex,
        targetList.$.get(0),
        targetIndex,
        above,
        handleSelector
      );
    },
  });
}

export default dragSortList();
