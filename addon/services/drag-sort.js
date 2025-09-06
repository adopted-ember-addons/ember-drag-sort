// ----- Ember modules -----
import Service from '@ember/service';
import EventedMixin from '@ember/object/evented';
import { next } from '@ember/runloop';

export default Service.extend(EventedMixin, {
  // ----- Static properties -----
  isDragging: false,
  isDraggingUp: null,

  draggedItem: null,
  group: null,

  sourceList: null,
  targetList: null,
  sourceIndex: null,
  targetIndex: null,

  lastDragEnteredList: null,
  isHorizontal: false,

  // ----- Custom methods -----
  startDragging({ additionalArgs, item, index, items, group, isHorizontal }) {
    this.setProperties({
      isDragging: true,
      isDraggingUp: false,

      draggedItem: item,
      group,
      isHorizontal,

      sourceArgs: additionalArgs,
      sourceList: items,
      targetArgs: additionalArgs,
      targetList: items,
      sourceIndex: index,
      targetIndex: index,
    });

    if (items.length > 1) {
      if (index === 0) {
        this.set('targetIndex', index + 1);
        this.set('isDraggingUp', true);
      } else {
        this.set('targetIndex', index - 1);
      }
    }

    next(() => {
      this.trigger('start', {
        group,
        draggedItem: item,
        sourceList: items,
        sourceIndex: index,
      });
    });
  },

  draggingOver({ group, index, items, isDraggingUp }) {
    // Ignore hovers over irrelevant groups
    if (group !== this.group) return;

    // Ignore hovers over irrelevant lists
    if (items !== this.targetList) return;

    if (index !== this.targetIndex) {
      next(() => {
        this.trigger('sort', {
          group,
          sourceArgs: this.sourceArgs,
          sourceList: this.sourceList,
          sourceIndex: this.sourceIndex,
          draggedItem: this.draggedItem,
          targetArgs: this.targetArgs,
          targetList: this.targetList,
          oldTargetIndex: this.targetIndex,
          newTargetIndex: index,
        });
      });
    }

    // Remember current index and direction
    this.setProperties({
      targetIndex: index,
      isDraggingUp,
    });
  },

  dragEntering({ group, items, isHorizontal, targetArgs, targetIndex = 0 }) {
    // Ignore entering irrelevant groups
    if (group !== this.group) return;

    // Reset index when entering a new list
    if (items !== this.targetList) {
      next(() => {
        this.trigger('move', {
          group,
          sourceArgs: this.sourceArgs,
          sourceList: this.sourceList,
          sourceIndex: this.sourceIndex,
          draggedItem: this.draggedItem,
          oldTargetList: this.targetList,
          newTargetList: items,
          targetArgs,
          targetIndex: targetIndex,
        });
      });

      this.set('targetArgs', targetArgs);
      this.set('targetIndex', targetIndex);
    }

    // Remember entering a new list
    this.setProperties({
      targetList: items,
      lastDragEnteredList: items,
      isHorizontal: isHorizontal,
    });
  },

  endDragging({ action }) {
    const sourceArgs = this.sourceArgs;
    const sourceList = this.sourceList;
    const sourceIndex = this.sourceIndex;
    const targetArgs = this.targetArgs;
    const targetList = this.targetList;
    let targetIndex = this.targetIndex;
    const isDraggingUp = this.isDraggingUp;
    const group = this.group;
    const draggedItem = this.draggedItem;

    if (sourceList !== targetList || sourceIndex !== targetIndex) {
      // Account for dragged item shifting indexes by one
      if (sourceList === targetList && targetIndex > sourceIndex) targetIndex--;

      // Account for dragging down
      if (
        // Dragging down
        !isDraggingUp &&
        // Target index is not after the last item
        targetIndex < targetList.get('length') &&
        // The only element in target list is not the one dragged
        !(
          targetList.get('length') === 1 &&
          targetList.get('firstObject') === draggedItem
        )
      )
        targetIndex++;

      if (
        (sourceList !== targetList || sourceIndex !== targetIndex) &&
        typeof action === 'function'
      ) {
        next(() => {
          action({
            group,
            draggedItem,
            sourceArgs,
            sourceList,
            sourceIndex,
            targetArgs,
            targetList,
            targetIndex,
          });
        });
      }
    }

    this._reset();

    next(() => {
      this.trigger('end', {
        group,
        draggedItem,
        sourceArgs,
        sourceList,
        sourceIndex,
        targetArgs,
        targetList,
        targetIndex,
      });
    });
  },

  _reset() {
    this.setProperties({
      isDragging: false,
      isDraggingUp: null,

      draggedItem: null,
      group: null,

      sourceArgs: null,
      sourceList: null,
      targetArgs: null,
      targetList: null,
      sourceIndex: null,
      targetIndex: null,

      lastDragEnteredList: null,
    });
  },
});
