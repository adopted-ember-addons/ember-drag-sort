// ----- Ember modules -----
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { not, reads } from '@ember/object/computed';
import { computed, get, observer } from '@ember/object';
import { next } from '@ember/runloop';
import { A } from '@ember/array';

// ----- Ember addons -----

// ----- Own modules -----
import layout from '../templates/components/drag-sort-list';

export default Component.extend({
  // ----- Arguments -----
  additionalArgs: undefined,
  items: undefined,
  group: undefined,
  draggingEnabled: true,
  childClass: '',
  childTagName: 'div',
  handle: null,
  sourceOnly: false,

  isHorizontal: false,
  isRtl: false,

  dragEndAction: undefined,
  dragStartAction: undefined,
  determineForeignPositionAction: undefined,

  // ----- Services -----
  dragSort: service(),

  // ----- Overridden properties -----
  layout,
  classNameBindings: [
    ':dragSortList',
    'draggingEnabled:-draggingEnabled',
    'isHorizontal:-horizontal',
    'isVertical:-vertical',
    'isRtl:-rtl',
    'isDragging:-isDragging',
    'isDraggingOver:-isDraggingOver',
    'isExpanded2:-isExpanded',
    'isEmpty:-isEmpty',
    'sourceOnly:-sourceOnlyList',
  ],

  // ----- Static properties -----

  // ----- Aliases -----
  sourceList: reads('dragSort.sourceList'),
  targetList: reads('dragSort.targetList'),
  sourceIndex: reads('dragSort.sourceIndex'),
  draggedItem: reads('dragSort.draggedItem'),
  lastDragEnteredList: reads('dragSort.lastDragEnteredList'),
  isVertical: not('isHorizontal'),

  // ----- Computed properties -----
  isDragging: computed('dragSort.{isDragging,group}', 'group', function () {
    const isDragging = this.get('dragSort.isDragging');
    const group = this.group;
    const groupFromService = this.get('dragSort.group');

    return isDragging && group === groupFromService;
  }),

  isDraggingOver: computed('isDragging', 'items', 'targetList', function () {
    const isDragging = this.isDragging;
    const items = this.items;
    const targetList = this.targetList;

    return isDragging && items === targetList;
  }),

  isExpanded: computed(
    'isDragging',
    'isEmpty',
    'isOnlyElementDragged',
    function () {
      const isDragging = this.isDragging;
      const isEmpty = this.isEmpty;
      const isOnlyElementDragged = this.isOnlyElementDragged;

      return isDragging && (isEmpty || isOnlyElementDragged);
    }
  ),

  isExpanded2: reads('isExpanded'),

  isEmpty: computed('items.[]', function () {
    const count = this.get('items.length');

    return !count;
  }),

  isOnlyElementDragged: computed(
    'items.length',
    'items',
    'sourceList',
    'sourceIndex',
    function () {
      const count = this.get('items.length');
      const items = this.items;
      const sourceList = this.sourceList;
      const sourceIndex = this.sourceIndex;

      return count === 1 && items === sourceList && !sourceIndex;
    }
  ),

  // ----- Overridden methods -----
  dragEnter(event) {
    // Ignore irrelevant drags
    if (!this.get('dragSort.isDragging')) return;

    // Ignore irrelevant groups
    const group = this.group;
    const activeGroup = this.get('dragSort.group');
    if (group !== activeGroup) return;

    event.stopPropagation();

    // Ignore duplicate events (explanation: https://github.com/lolmaus/jquery.dragbetter#what-this-is-all-about )
    const items = this.items;
    const lastDragEnteredList = this.lastDragEnteredList;
    if (items === lastDragEnteredList) return;

    this.dragEntering(event);

    if (this.determineForeignPositionAction) {
      this.forceDraggingOver();
    }
  },

  dragOver(event) {
    // This event is only used for placing the dragged element into the end of a horizontal list
    if (this.isVertical) {
      return;
    }

    // Ignore irrelevant drags
    if (!this.get('dragSort.isDragging') || this.determineForeignPositionAction)
      return;

    const group = this.group;
    const activeGroup = this.get('dragSort.group');

    if (group !== activeGroup) return;

    event.stopPropagation();

    this.isDraggingOverHorizontal(event);
  },

  // ----- Custom methods -----
  dragEntering(event) {
    const group = this.group;
    const items = this.items;
    const dragSort = this.dragSort;
    const isHorizontal = this.isHorizontal;
    const targetArgs = this.additionalArgs;
    let targetIndex = 0;

    if (isHorizontal) {
      targetIndex = this.getClosestHorizontalIndex(event);
      dragSort.set('isDraggingUp', false);
    }

    dragSort.dragEntering({
      group,
      items,
      isHorizontal,
      targetArgs,
      targetIndex,
    });
  },

  getClosestHorizontalIndex(event) {
    // Calculate which item is closest and make that the target
    const itemsNodeList = this.element.querySelectorAll('.dragSortItem');
    const draggableItems = A(Array.prototype.slice.call(itemsNodeList));
    const positions = A(
      draggableItems.map((draggableItem) =>
        draggableItem.getBoundingClientRect()
      )
    );
    const rows = positions.uniqBy('top').mapBy('top').sort();
    const currentRowPosition = rows.filter((row) => row < event.clientY).pop();
    const closestItem = positions.filterBy('top', currentRowPosition).pop();

    return closestItem ? positions.indexOf(closestItem) : 0;
  },

  forceDraggingOver() {
    const determineForeignPositionAction = this.determineForeignPositionAction;

    const group = this.group;
    const items = this.items;
    const itemsLength = items.length;
    const draggedItem = this.draggedItem;
    const sourceList = this.sourceList;
    const dragSort = this.dragSort;

    let isDraggingUp = true;

    let index =
      items === sourceList
        ? items.indexOf(draggedItem) + 1
        : determineForeignPositionAction({ draggedItem, items });

    if (index >= itemsLength) {
      index = itemsLength - 1;
      isDraggingUp = false;
    }

    dragSort.draggingOver({ group, index, items, isDraggingUp });
  },

  isDraggingOverHorizontal(event) {
    const dragSort = this.dragSort;
    const group = this.group;
    const items = this.items;
    const index = this.getClosestHorizontalIndex(event);
    const isDraggingUp = false;

    dragSort.draggingOver({ group, index, items, isDraggingUp });
  },

  // ----- Observers -----
  setIsExpanded2: observer('isExpanded', function () {
    // The delay is necessary for HTML class to update with a delay.
    // Otherwise, dragging is finished immediately.
    next(() => {
      if (this.isDestroying || this.isDestroyed) return;

      this.set('isExpanded2', this.isExpanded);
    });
  }),
});
