/* eslint-disable ember/no-runloop */
import Service from '@ember/service';
import { next } from '@ember/runloop';
import { tracked } from '@glimmer/tracking';
import { setProperties } from '@ember/object';

export default class DragSort<
  Item extends Record<string, unknown>,
> extends Service {
  #eventTarget = new EventTarget();

  on(eventName: string, callback: (event: CustomEvent) => void) {
    this.#eventTarget.addEventListener(eventName, callback as EventListener);
    return this;
  }

  off(eventName: string, callback: (event: CustomEvent) => void) {
    this.#eventTarget.removeEventListener(eventName, callback as EventListener);
    return this;
  }

  trigger(eventName: string, data?: unknown) {
    const event = new CustomEvent(eventName, { detail: data });
    this.#eventTarget.dispatchEvent(event);
    return this;
  }

  @tracked isDragging = false;
  @tracked isDraggingUp: boolean | null = null;

  @tracked draggedItem = null;
  @tracked group = null;

  @tracked sourceArgs: object | null = null;
  @tracked sourceIndex: number | null = null;
  @tracked sourceList: Array<Item> | null = null;

  @tracked targetArgs: object | null = null;
  @tracked targetIndex: number | null = null;
  @tracked targetList: Array<Item> | null = null;

  @tracked lastDragEnteredList: Array<Item> | null = null;
  @tracked isHorizontal?: boolean;

  startDragging({
    additionalArgs,
    item,
    index,
    items,
    group,
    isHorizontal,
  }: {
    additionalArgs: object;
    item: Item;
    index: number;
    items: Array<Item>;
    group: string;
    isHorizontal: boolean;
  }) {
    setProperties(this, {
      isDragging: true,
      isDraggingUp: false,

      draggedItem: item,
      group,
      isHorizontal,

      sourceArgs: additionalArgs,
      sourceIndex: index,
      sourceList: items,

      targetArgs: additionalArgs,
      targetIndex: null,
      targetList: items,
    });

    next(() => {
      this.trigger('start', {
        group,
        draggedItem: item,
        sourceList: items,
        sourceIndex: index,
      });
    });
  }

  draggingOver({
    group,
    index,
    items,
    isDraggingUp,
  }: {
    group?: string;
    index: number;
    items: Array<Item>;
    isDraggingUp: boolean;
  }) {
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
    setProperties(this, {
      targetIndex: index,
      isDraggingUp,
    });
  }

  dragEntering({
    group,
    items,
    isHorizontal,
    targetArgs,
    targetIndex = 0,
  }: {
    group?: string;
    items: Array<Item>;
    isHorizontal?: boolean;
    targetArgs: object;
    targetIndex?: number;
  }) {
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

      this.targetArgs = targetArgs;
      this.targetIndex = targetIndex;
    }

    // Remember entering a new list
    setProperties(this, {
      targetList: items,
      lastDragEnteredList: items,
      isHorizontal: isHorizontal,
    });
  }

  endDragging({ action }: { action: unknown }) {
    const sourceArgs = this.sourceArgs;
    const sourceList = this.sourceList;
    const sourceIndex = this.sourceIndex as number;
    const targetArgs = this.targetArgs;
    const targetList = this.targetList;
    let targetIndex = this.targetIndex as number;
    const isDraggingUp = this.isDraggingUp;
    const group = this.group;
    const draggedItem = this.draggedItem;

    // Only perform action if targetIndex was set (meaning dragover/dragenter occurred)
    // and the position actually changed
    if (
      targetIndex !== null &&
      (sourceList !== targetList || sourceIndex !== targetIndex)
    ) {
      // Account for dragged item shifting indexes by one
      if (sourceList === targetList && targetIndex > sourceIndex) targetIndex--;

      // Account for dragging down
      if (
        // Dragging down
        !isDraggingUp &&
        // Target index is not after the last item
        targetIndex < (targetList?.length ?? 0) &&
        // The only element in target list is not the one dragged
        !(targetList?.length === 1 && targetList[0] === draggedItem)
      )
        targetIndex++;

      if (
        (sourceList !== targetList || sourceIndex !== targetIndex) &&
        typeof action === 'function'
      ) {
        next(() => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
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
  }

  _reset() {
    setProperties(this, {
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
  }
}
