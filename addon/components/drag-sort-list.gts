import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import type DragSort from 'ember-drag-sort/services/drag-sort';
import element_ from "ember-element-helper/helpers/element";
import { on } from "@ember/modifier";
import DragSortItem from "ember-drag-sort/components/drag-sort-item";

interface DragSortListSignature<Item extends object> {
  Element: HTMLDivElement;
  Args: {
    additionalArgs?: object;
    childClass?: string;
    childTagName?: string;
    determineForeignPositionAction?: (args: {
      draggedItem: unknown;
      items: Array<Item>;
    }) => number;
    draggingEnabled?: boolean;
    dragEndAction?: unknown;
    dragStartAction?: unknown;
    handle?: string;
    items: Array<Item>;
    isHorizontal?: boolean;
    isRtl?: boolean;
    group?: string;
    sourceOnly?: boolean;
  };
  Blocks: {
    default: [item: Item, index: number];
  };
}

export default class DragSortList<Item extends object> extends Component<
  DragSortListSignature<Item>
> {<template>{{#let (element_ (if @tagName @tagName "div")) as |Tag|}}
  <Tag class="dragSortList
      {{if this.draggingEnabled "-draggingEnabled"}}
      {{if this.isDragging "-isDragging"}}
      {{if this.isDraggingOver "-isDraggingOver"}}
      {{if this.isEmpty "-isEmpty"}}
      {{if this.isExpanded "-isExpanded"}}
      {{if @isHorizontal "-horizontal"}}
      {{if @isRtl "-rtl"}}
      {{if this.isVertical "-vertical"}}
      {{if this.sourceOnly "-sourceOnlyList"}}" {{on "dragenter" this.dragEnter}} {{on "dragover" this.dragOver}} ...attributes>
    {{#each @items as |item index|}}
      <DragSortItem @additionalArgs={{@additionalArgs}} @determineForeignPositionAction={{@determineForeignPositionAction}} @draggingEnabled={{this.draggingEnabled}} @dragEndAction={{@dragEndAction}} @dragStartAction={{@dragStartAction}} @group={{@group}} @handle={{@handle}} @index={{index}} @isHorizontal={{@isHorizontal}} @isRtl={{@isRtl}} @item={{item}} @items={{@items}} @sourceOnly={{this.sourceOnly}} @tagName={{@childTagName}} class={{@childClass}}>
        {{yield item index}}
      </DragSortItem>
    {{/each}}
  </Tag>
{{/let}}</template>
  @service declare dragSort: DragSort<Item>;

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

  @action
  dragEnter(event: DragEvent) {
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
  }

  @action
  dragOver(event: DragEvent) {
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
  }

  @action
  dragEntering(event: DragEvent) {
    const group = this.args.group;
    const items = this.args.items;
    const dragSort = this.dragSort;
    const isHorizontal = this.args.isHorizontal;
    const targetArgs = this.args.additionalArgs ?? null;
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
  }

  @action
  getClosestHorizontalIndex(event: DragEvent) {
    // Calculate which item is closest and make that the target
    const itemsNodeList = (event.currentTarget as HTMLElement).querySelectorAll(
      '.dragSortItem',
    );
    const draggableItems = Array.from(itemsNodeList) as HTMLElement[];
    const positions = draggableItems.map((draggableItem: HTMLElement) =>
      draggableItem.getBoundingClientRect(),
    );
    const tops = positions.map((pos: DOMRect) => pos.top);
    const uniqueTops = [...new Set(tops)];
    const rows = uniqueTops.sort();
    const currentRowPosition = rows
      .filter((row: number) => row < event.clientY)
      .pop();
    const closestItem = positions
      .filter((pos: DOMRect) => pos.top === currentRowPosition)
      .pop();

    return closestItem ? positions.indexOf(closestItem) : 0;
  }

  @action
  forceDraggingOver() {
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
  }

  @action
  isDraggingOverHorizontal(event: DragEvent) {
    const dragSort = this.dragSort;
    const group = this.args.group;
    const items = this.args.items;
    const index = this.getClosestHorizontalIndex(event);
    const isDraggingUp = false;

    dragSort.draggingOver({ group, index, items, isDraggingUp });
  }
}
