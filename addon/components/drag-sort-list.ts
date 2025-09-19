import Component from '@glimmer/component';
import { service } from '@ember/service';
import { A } from '@ember/array';
import type DragSort from 'ember-drag-sort/services/drag-sort';

interface DragSortListSignature {
  Element: HTMLDivElement;
  Args: {
    additionalArgs: object;
    childClass?: string;
    childTagName?: string;
    determineForeignPositionAction?: (args: {
      draggedItem: unknown;
      items: Array<unknown>;
    }) => number;
    draggingEnabled: boolean;
    dragEndAction?: unknown;
    dragStartAction?: unknown;
    handle?: string;
    items: Array<object>;
    isHorizontal?: boolean;
    isRtl?: boolean;
    group: string;
    sourceOnly: boolean;
  };
}

export default class DragSortList extends Component<DragSortListSignature> {
  @service declare dragSort: DragSort;

  declare el: HTMLElement;

  get draggingEnabled() {
    return this.args.draggingEnabled ?? true;
  }

  get isDragging() {
    const isDragging = this.dragSort.isDragging;
    const group = this.args.group;
    const groupFromService = this.dragSort.group;

    return isDragging && group === groupFromService;
  }

  get isDraggingOver() {
    const isDragging = this.isDragging;
    const items = this.args.items;
    const targetList = this.dragSort.targetList;

    return isDragging && items === targetList;
  }

  get isVertical() {
    return !this.args.isHorizontal;
  }

  get isExpanded() {
    const isDragging = this.isDragging;
    const isEmpty = this.isEmpty;
    const isOnlyElementDragged = this.isOnlyElementDragged;

    return isDragging && (isEmpty || isOnlyElementDragged);
  }

  get isEmpty() {
    return !this.args.items?.length;
  }

  get isOnlyElementDragged() {
    const count = this.args.items?.length;
    const items = this.args.items;
    const sourceList = this.dragSort.sourceList;
    const sourceIndex = this.dragSort.sourceIndex;

    return count === 1 && items === sourceList && !sourceIndex;
  }

  get sourceOnly() {
    return this.args.sourceOnly ?? false;
  }

  elementInserted = (element: HTMLElement) => {
    this.el = element;
  };

  dragEnter = (event: DragEvent) => {
    // Ignore irrelevant drags
    if (!this.dragSort.isDragging) return;

    // Ignore irrelevant groups
    const group = this.args.group;
    const activeGroup = this.dragSort.group;
    if (group !== activeGroup) return;

    event.stopPropagation();

    // Ignore duplicate events (explanation: https://github.com/lolmaus/jquery.dragbetter#what-this-is-all-about )
    const items = this.args.items;
    const lastDragEnteredList = this.dragSort.lastDragEnteredList;
    if (items === lastDragEnteredList) return;

    this.dragEntering(event);

    if (this.args.determineForeignPositionAction) {
      this.forceDraggingOver();
    }
  };

  dragOver = (event: DragEvent) => {
    // This event is only used for placing the dragged element into the end of a horizontal list
    if (this.isVertical) {
      return;
    }

    // Ignore irrelevant drags
    if (!this.dragSort.isDragging || this.args.determineForeignPositionAction)
      return;

    const group = this.args.group;
    const activeGroup = this.dragSort.group;

    if (group !== activeGroup) return;

    event.stopPropagation();

    this.isDraggingOverHorizontal(event);
  };

  dragEntering = (event: DragEvent) => {
    const group = this.args.group;
    const items = this.args.items;
    const dragSort = this.dragSort;
    const isHorizontal = this.args.isHorizontal;
    const targetArgs = this.args.additionalArgs;
    let targetIndex = 0;

    if (isHorizontal) {
      targetIndex = this.getClosestHorizontalIndex(event);
      dragSort.isDraggingUp = false;
    }

    dragSort.dragEntering({
      group,
      items,
      isHorizontal,
      targetArgs,
      targetIndex,
    });
  };

  getClosestHorizontalIndex = (event: DragEvent) => {
    // Calculate which item is closest and make that the target
    const itemsNodeList = this.el.querySelectorAll('.dragSortItem');
    const draggableItems = A<HTMLElement>(
      Array.prototype.slice.call(itemsNodeList),
    );
    const positions = A(
      draggableItems.map((draggableItem) =>
        draggableItem.getBoundingClientRect(),
      ),
    );
    const rows = positions.uniqBy('top').mapBy('top').sort();
    const currentRowPosition = rows.filter((row) => row < event.clientY).pop();
    const closestItem = positions.filterBy('top', currentRowPosition).pop();

    return closestItem ? positions.indexOf(closestItem) : 0;
  };

  forceDraggingOver = () => {
    const determineForeignPositionAction =
      this.args.determineForeignPositionAction;

    const group = this.args.group;
    const items = this.args.items;
    const itemsLength = items?.length;
    const draggedItem = this.dragSort.draggedItem;
    const sourceList = this.dragSort.sourceList;

    let isDraggingUp = true;

    if (draggedItem) {
      let index =
        items === sourceList
          ? items.indexOf(draggedItem) + 1
          : determineForeignPositionAction!({ draggedItem, items });

      if (index >= itemsLength) {
        index = itemsLength - 1;
        isDraggingUp = false;
      }

      this.dragSort.draggingOver({ group, index, items, isDraggingUp });
    }
  };

  isDraggingOverHorizontal = (event: DragEvent) => {
    const dragSort = this.dragSort;
    const group = this.args.group;
    const items = this.args.items;
    const index = this.getClosestHorizontalIndex(event);
    const isDraggingUp = false;

    dragSort.draggingOver({ group, index, items, isDraggingUp });
  };
}
