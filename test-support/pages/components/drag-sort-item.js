/* eslint-disable ember/no-jquery */
import { attribute, hasClass } from 'ember-cli-page-object';

import component from './_component';
import trigger from 'ember-drag-sort/utils/trigger';

export default component({
  draggable: attribute('draggable'),

  isDragged: hasClass('-isDragged'),
  isDraggingOver: hasClass('-isDraggingOver'),
  placeholderAbove: hasClass('-placeholderBefore'),
  placeholderBelow: hasClass('-placeholderAfter'),

  dragStart(index) {
    trigger(this.$.get(0), 'dragstart');
  },

  dragOver(above) {
    trigger(this.$.get(0), 'dragover', above);
  },

  dragEnd() {
    trigger(this.$.get(0), 'dragend');
  },
});
