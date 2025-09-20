/* eslint-disable ember/no-runloop */
import Component from '@glimmer/component';
import { assert } from '@ember/debug';
import { service } from '@ember/service';
import type DragSort from 'ember-drag-sort/services/drag-sort';
import { next } from '@ember/runloop';
import { tracked } from '@glimmer/tracking';

function getComputedStyleInt(element: HTMLElement, cssProp: string) {
  const computedStyle = window.getComputedStyle(element, null);
  const valueStr = computedStyle.getPropertyValue(cssProp);

  return parseInt(valueStr, 10);
}

interface DragSortItemSignature<Item extends Record<string, unknown>> {
  Args: {
    additionalArgs: object;
    determineForeignPositionAction: unknown;
    draggingEnabled: boolean;
    dragEndAction?: unknown;
    dragStartAction?: (args: {
      event: DragEvent;
      element: HTMLElement;
      draggedItem: Item;
    }) => void;
    group: string;
    handle?: string;
    index: number;
    isHorizontal: boolean;
    isRtl?: boolean;
    item: Item;
    items: Array<Item>;
    sourceOnly: boolean;
  };
}

export default class DragSortItem<
  Item extends Record<string, unknown>,
> extends Component<DragSortItemSignature<Item>> {
  @service declare dragSort: DragSort<Item>;

  declare el: HTMLElement;

  @tracked _isDragged = false;

  get draggable() {
    const handle = this.args.handle;
    const draggingEnabled = this.args.draggingEnabled;

    return !handle && draggingEnabled ? true : null;
  }

  get isDragged() {
    const isDragging = this.dragSort.isDragging;
    const items = this.args.items;
    const sourceList = this.dragSort.sourceList;
    const index = this.args.index;
    const sourceIndex = this.dragSort.sourceIndex;

    return isDragging && items === sourceList && index === sourceIndex;
  }

  get isDraggingOver() {
    const isDragging = this.dragSort.isDragging;
    const items = this.args.items;
    const targetList = this.dragSort.targetList;
    const index = this.args.index;
    const targetIndex = this.dragSort.targetIndex;
    const isDragged = this.isDragged;
    const sourceOnly = this.args.sourceOnly;

    return (
      !sourceOnly &&
      isDragging &&
      items === targetList &&
      index === targetIndex &&
      !isDragged
    );
  }

  get isLast() {
    const index = this.args.index;
    const count = this.args.items?.length;

    return index === count - 1;
  }

  get isVertical() {
    return !this.dragSort.isHorizontal;
  }

  get shouldShowPlaceholderBefore() {
    const isDraggingOver = this.isDraggingOver;
    const isDraggingUp = this.dragSort.isDraggingUp;
    const sourceOnly = this.args.sourceOnly;

    return !sourceOnly && isDraggingOver && isDraggingUp;
  }

  get shouldShowPlaceholderAfter() {
    const isDraggingOver = this.isDraggingOver;
    const isDraggingUp = this.dragSort.isDraggingUp;
    const sourceOnly = this.args.sourceOnly;

    return !sourceOnly && isDraggingOver && !isDraggingUp;
  }

  elementInserted = (element: HTMLElement) => {
    this.el = element;
  };

  dragStart = (event: DragEvent) => {
    // Ignore irrelevant drags
    if (!this.args.draggingEnabled) return;

    if (!this.isHandleUsed(event.target as HTMLElement)) {
      event.preventDefault();
      return;
    }

    event.stopPropagation();

    // Required for Firefox. http://stackoverflow.com/a/32592759/901944
    if (event.dataTransfer) {
      if (event.dataTransfer.setData) event.dataTransfer.setData('text', '');
      if (event.dataTransfer.setDragImage)
        event.dataTransfer.setDragImage(this.el, 0, 0);
    }

    const dragStartAction = this.args.dragStartAction;

    if (dragStartAction) {
      const item = this.args.item;

      dragStartAction({
        event,
        element: this.el,
        draggedItem: item,
      });
    }

    this.startDragging();
  };

  dragEnd = (event: DragEvent) => {
    // Ignore irrelevant drags
    if (!this.dragSort.isDragging) return;

    event.stopPropagation();
    event.preventDefault();

    this.endDragging();
  };

  // Required for Firefox. http://stackoverflow.com/a/32592759/901944
  drop = (event: DragEvent) => {
    event.preventDefault();
  };

  dragOver = (event: DragEvent) => {
    // Ignore irrelevant drags
    if (
      !this.dragSort.isDragging ||
      this.args.determineForeignPositionAction ||
      this.args.sourceOnly
    )
      return;

    const group = this.args.group;
    const activeGroup = this.dragSort.group;

    if (group !== activeGroup) return;

    event.stopPropagation();
    event.preventDefault();

    this.draggingOver(event);
  };

  startDragging = () => {
    this.collapse();

    const additionalArgs = this.args.additionalArgs;
    const item = this.args.item;
    const index = this.args.index;
    const items = this.args.items;
    const group = this.args.group;
    const dragSort = this.dragSort;
    const isHorizontal = this.args.isHorizontal;

    dragSort.startDragging({
      additionalArgs,
      item,
      index,
      items,
      group,
      isHorizontal,
    });
  };

  endDragging = () => {
    this.restore();

    this.dragSort.endDragging({ action: this.args.dragEndAction });
  };

  draggingOver = (event: DragEvent) => {
    const sourceOnly = this.args.sourceOnly;

    if (sourceOnly) {
      event.preventDefault();
      return;
    }

    const { group, index, items } = this.args;
    const isHorizontal = this.dragSort.isHorizontal;
    const isRtl = this.args.isRtl && isHorizontal;
    const isPlaceholderBefore = this.shouldShowPlaceholderBefore;
    const isPlaceholderAfter = this.shouldShowPlaceholderAfter;
    const dragSort = this.dragSort;
    const placeholderModifier = isRtl ? -1 : 1;

    let beforeAttribute = 'padding-top';
    let afterAttribute = 'padding-bottom';
    if (isHorizontal) {
      beforeAttribute = isRtl ? 'padding-right' : 'padding-left';
      afterAttribute = isRtl ? 'padding-left' : 'padding-right';
    }

    const placeholderCorrection = isPlaceholderBefore
      ? getComputedStyleInt(this.el, beforeAttribute) * placeholderModifier
      : isPlaceholderAfter
        ? -getComputedStyleInt(this.el, afterAttribute) * placeholderModifier
        : 0;

    const offset = isHorizontal
      ? this.el.getBoundingClientRect().left
      : this.el.getBoundingClientRect().top;

    const itemSize = isHorizontal ? this.el.offsetWidth : this.el.offsetHeight;

    const mousePosition = isHorizontal ? event.clientX : event.clientY;

    const isDraggingUp = isRtl
      ? mousePosition - offset > (itemSize + placeholderCorrection) / 2
      : mousePosition - offset < (itemSize + placeholderCorrection) / 2;

    dragSort.draggingOver({ group, index, items, isDraggingUp });
  };

  collapse = () => {
    // The delay is necessary for HTML classes to update with a delay.
    // Otherwise, dragging is finished immediately.
    next(() => {
      if (this.isDestroying || this.isDestroyed) return;
      this._isDragged = true;
    });
  };

  restore = () => {
    // The delay is necessary for HTML class to update with a delay.
    // Otherwise, dragging is finished immediately.
    next(() => {
      if (this.isDestroying || this.isDestroyed) return;
      this._isDragged = false;
    });
  };

  isHandleUsed = (target: HTMLElement) => {
    const handle = this.args.handle;

    if (!handle) return true;

    const handleElement = this.el.querySelector(handle);

    assert('Handle not found', !!handleElement);

    return handleElement === target || handleElement.contains(target);
  };
}
