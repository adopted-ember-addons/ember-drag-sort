# ember-drag-sort

[![Ember Observer Score](http://emberobserver.com/badges/ember-drag-sort.svg?cache_bust=1)](http://emberobserver.com/addons/ember-drag-sort)
[![npm package version](https://img.shields.io/npm/v/ember-drag-sort.svg)](https://www.npmjs.com/package/ember-drag-sort)
[![license MIT](https://img.shields.io/badge/license-MIT-brightgreen.svg)](https://github.com/adopted-ember-addons/ember-drag-sort/blob/main/LICENSE.md)
![ember-versions 3.28+](https://img.shields.io/badge/ember--versions-3.28%2B-yellowgreen.svg)
![node-versions 18+](https://img.shields.io/badge/node--versions-18%2B-yellowgreen.svg)

- [ember-drag-sort](#ember-drag-sort)
  - [Support](#support)
  - [About](#about)
    - [Features](#features)
    - [Demo](#demo)
  - [Versions, branches and jQuery](#versions-branches-and-jquery)
  - [Known issues](#known-issues)
    - [Browser support](#browser-support)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Basic usage](#basic-usage)
    - [The drag end action](#the-drag-end-action)
    - [The drag start action](#the-drag-start-action)
    - [The determine foreign position action](#the-determine-foreign-position-action)
    - [Marking a list as a source only bucket](#marking-a-list-as-a-source-only-bucket)
    - [Passing additional arguments](#passing-additional-arguments)
    - [drag-sort-list arguments reference](#drag-sort-list-arguments-reference)
    - [HTML classes](#html-classes)
    - [CSS concerns](#css-concerns)
    - [Events](#events)
  - [Test helpers](#test-helpers)
    - [trigger](#trigger)
    - [sort](#sort)
    - [move](#move)
    - [Page object components](#page-object-components)
      - [Importing page object components](#importing-page-object-components)
      - [Including page object components into your page objects](#including-page-object-components-into-your-page-objects)
      - [Extending the dragSortList page object component](#extending-the-dragsortlist-page-object-component)
      - [Extending the dragSortItem page object component](#extending-the-dragsortitem-page-object-component)
      - [Providing the drag handle selector](#providing-the-drag-handle-selector)
      - [Sorting the dragSortList page object component](#sorting-the-dragsortlist-page-object-component)
  - [Development](#development)
    - [Do not use npm, use yarn](#do-not-use-npm-use-yarn)
    - [Installation for development](#installation-for-development)
    - [Running](#running)
    - [Branch names](#branch-names)
    - [Updating the table of contents](#updating-the-table-of-contents)
    - [Demo deployment](#demo-deployment)
  - [Credits](#credits)
  - [License](#license)

## Compatibility

- Ember.js v3.24 or above
- Ember CLI v3.24 or above
- Node.js v18 or above

## About

A drag'n'drop sortable list addon.

### Features

- Dragging between lists.
- Drag handle.
- Nested lists (tree-like structures).
- Strict DDAU: does not mutate the lists while dragging. On drag end, calls an action for you to handle list mutation.
- Disable sorting within a list while still allowing dragging in and out of the list (sort order is determined by host app instead of the user).

### Demo

https://adopted-ember-addons.github.io/ember-drag-sort/

## Versions, branches and jQuery

- Version 1.x, `gen-0` branch is based on jQuery. Supports Ember CLI 1.13+.
- Version 2.x, `gen-1` branch (current development head) has got rid of jQuery. Except for page objects which [still import](https://github.com/san650/ember-cli-page-object/blob/v1.15.2/index.js#L23-L28) jQuery in test env. Supports Ember CLI 3.8+.
- Version 3.x, `gen-2` branch supports Ember CLI 3.12+.
- Version 4.x, `main` branch supports Ember and Ember CLI 3.28+.

### Browser support

Tested manually.

Works in desktop browsers:

- Chrome
- Firefox
- Safari

Does not work on mobile browsers:

- Safari/iOS: does not support drag'n'drop.
- Firefox/Android: does not support drag'n'drop.
- Chrome/Android: for some reason, does not fire the `dragend` event. Currently, the addon behaves incorrectly on Chrome/Android. If your webapp offers mobile experience, you must manually detect Chrome/Android and disable dragging.

## Installation

Install the addon:

    ember i ember-drag-sort

## Usage

### Basic usage

The `drag-sort-list` component accepts two mandatory arguments:

- `items` -- the array of items to sort. _Must_ be an Ember array (normally, all arrays in an Ember app are Ember arrays).
- `dragEndAction` -- a closure action that should update elements when sort is complete.

The component accepts a block representing an individual item (the block is rendered multiple times, one per list item). It yields `item` and `index`.

```handlebars
<DragSortList @items={{this.items1}} @dragEndAction={{this.dragEnd}} as |item|>
  {{item.name}}
</DragSortList>
```

### The drag end action

It is called on the source list component when the drag'n'drop operation is complete. It's called with a single argument -- an object with the following properties:

| Property      | Type   | Description                                                            |
| :------------ | :----- | :--------------------------------------------------------------------- |
| `group`       | String | Group provided to the `drag-sort-list` component.                      |
| `draggedItem` | <any>  | The list item being dragged.                                           |
| `sourceList`  | Array  | The list where the sorting was initiated.                              |
| `sourceIndex` | Number | The initial index of the item in the source list.                      |
| `targetList`  | Array  | The list where sorting was finished. Will be the same as `sourceList`. |
| `targetIndex` | Number | The resulting index of the dragged item in the target list.            |

When sorting within one list, `targetIndex` assumes that the dragged item is not in the list.

> For example, when your list is `['a', 'b', 'c']` and you put `b` after `c`, `sourceIndex` will be `1` and `targetIndex` will be `2`. The initial index of `c` was `2`, so you could suppose that target index after `c` is `3`.
>
> But `targetIndex` is calculated as if the dragged item `b` is not in the list: `['a', 'c']`. Thus, next index after `c` will be `2`.
>
> This is because the array has three items with indexes `0`, `1` and `2`, so putting an item to position `3` would make no sense.

Here's the reference implementation of the `dragEndAction` action:

```js
  @action
  dragEndAction ({sourceList, sourceIndex, targetList, targetIndex/* , sourceArgs, targetArgs */}) {
    if (sourceList === targetList && sourceIndex === targetIndex) return

    const item = sourceList.objectAt(sourceIndex)

    sourceList.removeAt(sourceIndex)
    targetList.insertAt(targetIndex, item)
  }
```

### The drag start action

This action is called when a drag is beginning, and can be used to customize the drag image, or otherwise modify the data transfer. It's called with a single argument -- an object with the following properties:

| Property      | Type       | Description                    |
| :------------ | :--------- | :----------------------------- |
| `event`       | Event      | The `dragstart` event.         |
| `element`     | DOMElement | The DOM element being dragged. |
| `draggedItem` | <any>      | The list item being dragged.   |

This can be used to put margins around the list items without those margins being included in the drag image:

```css
.the-item {
  margin: 20px;
}
```

```handlebars
<DragSortList
  items={{this.items1}}
  dragStartAction={{action "dragStart"}}
  dragEndAction={{action "dragEnd"}}
  as |item|
>
  <div class="the-item">
    {{item.name}}
  </div>
</DragSortList>
```

```javascript
actions: {
  dragStart({ event, element }) {
    let target = element.querySelector('.the-item');
    let { x, y } = element.getBoundingClientRect();
    // Set drag image, positioning it to align with `.the-item`'s position
    event.dataTransfer.setDragImage(target, event.clientX - x, event.clientY - y);
  }
}
```

### The determine foreign position action

You may want to let the user drag items in and out of a list, without letting him rearrange items within a list. In that case the order of items is determined by the app.

Here's a use case. Your CMS allows the admin to put widgets in page areas. The admin panel has a number of lists representing page header, sidebar, footer, etc. The admin is allowed to rearrange widgets to his liking. And there's a list of unused widgets, the admin can drag items to and from that list, but unused items should always be sorted alphabetically.

To achieve that, pass a closure action `determineForeignPositionAction` into the list of unused items. This will prevent the user from sorting items in that list.

When the user drags a foreign items into such a list, the action will be called to determine the position of the item. Essentially, by running that action the `ember-drag-sort` addon asks the host app to suggest desired position of the dragged item.

The action is only called for foreign items. When the user drags an item out of the unsortable list but then drags the item back, it will appear on its original position.

The `determineForeignPositionAction` is called with with a single argument -- an object with the following properties:

| Property      | Type  | Description                                   |
| :------------ | :---- | :-------------------------------------------- |
| `draggedItem` |       | The item being dragged.                       |
| `items`       | Array | The list where the item should be positioned. |

This action must return an **integer** -- the desired position of the item.

The simplest implementation is to always put the item into the end of the list:

```js
@action
determineForeignPosition ({/* draggedItem,  */items}) {
  return items.length
}
```

To sort items alphabetically, you can use lodash:

```js
@action
determineForeignPosition ({draggedItem, items}) {
  return _.sortedIndex(items.toArray(), draggedItem)
}
```

Or do it by hand:

```js
@action
determineForeignPosition ({draggedItem, items}) {
    return Ember.A(items.slice()) // make sure not to mutate the list; `Ember.A()` is typically redundant
      .addObject(draggedItem)
      .sortBy('name')
      .indexOf(draggedItem)
}
```

**`determineForeignPositionAction` must not actually sort the list**. It's only purpose is to suggest desired item position, which is necessary to display the placeholder.

### Marking a list as a source only bucket

Sometimes you may have a need to define a bucket of items that is "source only". This means
that you can only grab items from it to add to other buckets. The source bucket can never be
reordered or modified by dragging items out of it. It is only a source to drag to other lists.

This list would be marked as source only:

```hbs
<DragSortList
  @items={{this.items1}}
  @dragEndAction={{this.dragEnd}}
  @sourceOnly={{true}}
  as |item|
>
  {{item.name}}
</DragSortList>
```

You could then have one or more other lists which you could drag the items from the source list into.

### Passing additional arguments

When using `drag-sort-list` in a template, you can pass additional arguments to it. These arguments will be passed into the `dragEndAction`.

Here's a case where this is useful. Say, you have `parent` and `child` models, with a many-to-many relationship between the two. When you reorder a list of children, the new order must be persisted by calling `.save()` on the parent. But the `dragEndAction` does not have access to the parent by default!

To resolve this problem, pass the parent into the `drag-sort-list` component via the `additionalArgs` argument:

```handlebars
{{#each parents as |parent|}}
  <DragSortList
    @items          = {{this.parent.children}}
    @additionalArgs = {{hash parent=parent foo="bar"}}
    @dragEndAction  = {{this.dragEnd}}
    as |child|
  }}
    {{child.name}}
  </DragSortList>
{{/each}}
```

Now you can access the parent of both source and target lists in the `dragEndAction`. The value of `additionalArgs` will be exposed as `sourceArgs` and `targetArgs`:

```js
@action
dragEndAction({ sourceList, sourceIndex, sourceArgs, targetList, targetIndex, targetArgs }) {
  if (sourceModel === targetModel && sourceIndex === targetIndex) return;

  const item = sourceList.objectAt(sourceIndex);
  sourceList.removeAt(sourceIndex);
  targetList.insertAt(targetIndex, item);

  // Access the parent via `sourceArgs` and `targetArgs`
  sourceArgs.parent.save();
  targetArgs.parent.save();

  console.log(sourceArgs.foo); // => "bar"
  console.log(targetArgs.foo); // => "bar"
}
```

### drag-sort-list arguments reference

| Argument                         | Type                                         | Default value | Description                                                                                                                                                                                     |
| :------------------------------- | :------------------------------------------- | :------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `items`                          | Ember Array                                  | <required>    | An array of items to display and offer sorting.                                                                                                                                                 |
| `dragEndAction`                  | Closure action                               | <required>    | This callback will be called on source list when sorting is complete. See above for details.                                                                                                    |
| `dragStartAction`                | Closure action                               | <required>    | This callback will be called on source list when dragging is starting. See above for details.                                                                                                   |
| `determineForeignPositionAction` | Closure action or `undefined`                | `undefined`   | When provided, used to determine the position of the placeholder when dragging a foreign item into the list. When not provided, the user is able to determine the order. See above for details. |
| `group`                          | <any>                                        | `undefined`   | Used to restrict dragging between multiple lists to only some of those lists. Typically a string.                                                                                               |
| `draggingEnabled`                | Boolean                                      | `true`        | Disables sorting. Useful when `dragEndAction` is an async operation.                                                                                                                            |
| `childClass`                     | String                                       | `""`          | HTML class applied to list item components.                                                                                                                                                     |
| `childTagName`                   | String                                       | `"div"`       | `tagName` applied to list item components.                                                                                                                                                      |
| `handle`                         | String, typically `"[draggable]"`, or `null` | `null`        | Selector of the drag handle element. When provided, items can only be dragged by handle. :warning: The handle element _must_ have `draggable="true"` attribute.                                 |
| `isHorizontal`                   | Boolean                                      | `false`       | Displays the list horizontally. :warning: Horizontal lists don't work well when nested.                                                                                                         |
| `isRtl`                          | Boolean                                      | `false`       | RTL - Right to left. Might be useful for certain languages. :warning: Has no effect on vertical lists.                                                                                          |
| `additionalArgs`                 | <any>                                        | `undefined`   | A catch-all for additional arguments you may want to access in the `dragEndAction`. Can be used for things like passing the parent of the list in for saving `hasMany` relationships.           |

### HTML classes

`drag-sort-list` component has HTML class `dragSortList`. It also assumes the following classes dynamically:

| HTML class         | Applied when...                                                                                                                                                                   |
| :----------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `-isEmpty`         | The given list is empty.                                                                                                                                                          |
| `-draggingEnabled` | Dragging is enabled via the `draggingEnabled` attribute.                                                                                                                          |
| `-isDragging`      | Dragging is in progress and the given list is either a source list or belongs to the same group as the source list.                                                               |
| `-isDraggingOver`  | Dragging is in progress and the placeholder is within the given list. This class is removed from a list when an item is dragged into a different list.                            |
| `-isExpanded`      | Dragging is in progress and the given list is either empty or contains only the dragged item. Used to give some height to the list, so that the item can be dragged back into it. |

The individual item component has HTML class `dragSortItem`. It also assumes the following classes dynamically:

| HTML class           | Applied when...                                                               |
| :------------------- | :---------------------------------------------------------------------------- |
| `-isDragged`         | The given item is the one being dragged. Used to hide the item from the list. |
| `-isDraggingOver`    | Dragged item is positioned either above/before or below/after the given item. |
| `-placeholderBefore` | Dragged item is positioned above/before the given item.                       |
| `-placeholderAfter`  | Dragged item is positioned below/after the given item.                        |

### CSS concerns

When dragging, the dragged item is hidden via the `-isDragged` HTML class that applies `display: none`.

The placeholder (drop target) is shown via the `-placeholderBefore` or `-placeholderAfter` HTML classes. These classes apply padding to the given list item, and the placeholder is an absolutely positioned `:before` pseudo-element. A similar pseudo-element is applied to an `-isExpanded` list (see above).

For sorting to work correctly, you must not apply padding to the list HTML element. If you need some padding on the list, apply it to its parent element.

You must not apply any padding or margin to list item elements either. If you need padding between list items, apply it to HTML elements that you pass into list items.

Avoid collapsing margins between list items and between list item and list. Collapsing margins may cause a [jumping glitch](https://github.com/kaliber5/ember-drag-sort/issues/7).

### Events

There's an Ember service called `dragSort`. You can listen to the following events on it, using the [Evented API](https://www.emberjs.com/api/classes/Ember.Evented.html).

Each event is called with as single argument, which is an object with properties. For the description of properties, see `dragEndAction` documentation above.

| Event name | Description                                                                        | Argument properties                                                                                   |
| :--------- | :--------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------- |
| `start`    | Sorting has started.                                                               | `group`, `draggedItem`, `sourceList`, `sourceIndex`                                                   |
| `sort`     | Dragged item has been moved within a list. The list is referenced as `targetList`. | `group`, `draggedItem`, `sourceList`, `sourceIndex`, `targetList`, `oldTargetIndex`, `newTargetIndex` |
| `move`     | Item has been dragged into a different list.                                       | `group`, `draggedItem`, `sourceList`, `sourceIndex`, `oldTargetList`, `newTargetList`, `targetIndex`  |
| `end`      | Sorting has ended.                                                                 | `group`, `draggedItem`, `sourceList`, `sourceIndex`, `targetList`, `targetIndex`                      |

## Test helpers

### trigger

`trigger` is a low-level test helper that can be imported like this:

```js
import trigger from "ember-drag-sort/utils/trigger";
```

It accepts three arguments:

| Argument    | Type                                     | Description                                                                                    |
| :---------- | :--------------------------------------- | :--------------------------------------------------------------------------------------------- |
| `element`   | String, DOM element or jQuery collection | Selector or element to trigger an operation on.                                                |
| `eventName` | String                                   | For list: `dragenter`; for list item: `dragstart`, `dragover` or `dragend`.                    |
| `above`     | Boolean                                  | Only for `dragover`. Whether to put placeholder above (`true`) or below (`false`) target item. |

The order of operations is the following:

1. `dragstart` on the element to drag.
2. `dragenter` on target list that the dragged element should be moved into (optional).
3. `dragover` on target element, the one that the dragged element should be dropped next to. Provide third argument to indicate above or below.
4. `dragover` on the dragged element.

After performing the operations, you must [wait for async behavior](https://guides.emberjs.com/v2.13.0/testing/testing-components/#toc_waiting-on-asynchronous-behavior).

See this addon's integration test for example.

### sort

`sort` is a high-level test helper that **moves an item to a new position within the same list**.

It can be imported like this:

```js
import { sort } from "ember-drag-sort/utils/trigger";
```

It accepts the following arguments:

| Argument         | Type                                     | Required? | Description                                                                                                                     |
| :--------------- | :--------------------------------------- | :-------- | :------------------------------------------------------------------------------------------------------------------------------ |
| `sourceList`     | String, DOM element or jQuery collection | yes       | Selector or element of the `drag-sort-list` component.                                                                          |
| `sourceIndex`    | Integer                                  | yes       | Zero-based index of the item to pick up.                                                                                        |
| `targetIndex`    | Integer                                  | yes       | Zero-based index of the item to drop picked item on top of, calculated while the picked item is still on its original position. |
| `above`          | Boolean                                  | yes       | Whether to drop picked item above (`true`) or below (`false`) target item.                                                      |
| `handleSelector` | String                                   | no        | Provide if handles are used in the list                                                                                         |

After executing `sort` in a test, perform a wait using `wait`, `andThen` or `await`.

Example:

```js
import {sort} from 'ember-drag-sort/utils/trigger'

test('sorting a list', async function (assert) {
  await visit('/')

  const list = document.querySelector('.dragSortList')

  await sort(list, 0, 1, false)

  const expectedTitles = ['Bar', 'Foo', 'Baz', 'Quux']

  assert.strictEqual(list.childElementCount, 4)

  expectedTitles.forEach((expectedTitle, k) => {
    m = `List #0 item #${k} content title`
    expect(list.children[k].textContent.trim(), m).equal(expectedTitle)
  })
}))
```

### move

`move` is a high-level test helper that **moves an item from one list into another**.

It can be imported like this:

```js
import { sort } from "ember-drag-sort/utils/trigger";
```

It accepts the following arguments:

| Argument         | Type                                     | Required?                       | Description                                                                                                                                                                                                                                |
| :--------------- | :--------------------------------------- | :------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sourceList`     | String, DOM element or jQuery collection | yes                             | Selector or element of the source `drag-sort-list` component.                                                                                                                                                                              |
| `sourceIndex`    | Integer                                  | yes                             | Zero-based index of the item to pick up.                                                                                                                                                                                                   |
| `targetList`     | String, DOM element or jQuery collection | yes                             | Selector or element of the target `drag-sort-list` component.                                                                                                                                                                              |
| `targetIndex`    | Integer                                  | no                              | Zero-based index of the item to drop picked item on top of, calculated while the picked item is still on its original position. When omitted, adds item to the end of the target list. **Must** be omitted when moving into an empty list. |
| `above`          | Boolean                                  | yes if `targetList` is provided | Whether to drop picked item above (`true`) or below (`false`) target item.                                                                                                                                                                 |
| `handleSelector` | String                                   | no                              | Provide if handles are used in the list                                                                                                                                                                                                    |

After executing `sort`, perform a wait using `wait`, `andThen` or `await`.

Example:

```js
const [list0, list1] = document.querySelectorAll(".dragSortList");

await move(list0, 0, list1, 1, false);
```

This will pick the first item from `list0` and drop it below the second item of `list1`.

See this addon's acceptance test for example.

### Page object components

This addon provides [page object](http://ember-cli-page-object.js.org) components.

#### Importing page object components

Page object components mixed into your app's `tests/pages/components/` directory

```
import dragSortList from '<your-app-name>/tests/pages/components/drag-sort-list'
import dragSortItem from '<your-app-name>/tests/pages/components/drag-sort-item'
```

Normally, you only need to import `dragSortList`. `dragSortItem` is available as part of `dragSortList`.

When used in a test, **the `dragSortList` page object component offers the following properties and methods**:

| Property          | Type                                                                                     | Description                                                       |
| :---------------- | :--------------------------------------------------------------------------------------- | :---------------------------------------------------------------- |
| `items`           | [Page Object Collection](http://ember-cli-page-object.js.org/docs/v1.8.x/api/collection) | Each item is a `dragSortItem` page object component.              |
| `draggingEnabled` | Boolean                                                                                  | Checks for `-draggingEnabled` class on the component (see above). |
| `isDragging`      | Boolean                                                                                  | Checks for `-isDragging` class on the component (see above).      |
| `isDraggingOver`  | Boolean                                                                                  | Checks for `-isDraggingOver` class on the component (see above).  |
| `isEmpty`         | Boolean                                                                                  | Checks for `-isEmpty` class on the component (see above).         |
| `isExpanded`      | Boolean                                                                                  | Checks for `-isExpanded` class on the component (see above).      |
| `dragEnter()`     | Method                                                                                   | Calls `trigger` helper on current list with `'dragenter'`.        |
| `sort(...)`       | Method                                                                                   | Calls `sort` helper on current list. See below for arguments.     |
| `move(...)`       | Method                                                                                   | Calls `move` helper on current list. See below for arguments.     |

**The `dragSortItem` page object component offers the following properties and methods**:

| Property           | Type                  | Description                                                                                                    |
| :----------------- | :-------------------- | :------------------------------------------------------------------------------------------------------------- |
| `content`          | Page Object Component | Represents the content of every `dragSortItem`. Available only via the factory imported from `{dragSortList}`. |
| `draggable`        | Boolean               | Whether the item is draggable                                                                                  |
| `isDragged`        | Boolean               | Checks for `-isDragged` class on the component (see above).                                                    |
| `isDraggingOver`   | Boolean               | Checks for `-isDraggingOver` class on the component (see above).                                               |
| `placeholderAbove` | Boolean               | Checks for `-placeholderBefore` class on the component (see above).                                            |
| `placeholderBelow` | Boolean               | Checks for `-placeholderAfter` class on the component (see above).                                             |
| `dragStart()`      | Method                | Calls `trigger` helper on current item with `'dragstart'`.                                                     |
| `dragOver(above)`  | Method                | Calls `trigger` helper on current item with `'dragover'` and `above`.                                          |
| `dragEnd()`        | Method                | Calls `trigger` helper on current item with `'dragend'`.                                                       |

Additionally, **both page object components offer the following properties and methods**:

| Property                      | Type              | Description                                                                                                                               |
| :---------------------------- | :---------------- | :---------------------------------------------------------------------------------------------------------------------------------------- |
| `$`                           | jQuery Collection | Current element wrapped in jQuery.                                                                                                        |
| `empty`                       | Boolean           | Whether current element is empty, ignoring whitespace.                                                                                    |
| `exists`                      | Boolean           | Whether current element exists. When element does not exist, returns `false` without raising an exception.                                |
| `index`                       | Integer           | Index of current element within its parent.                                                                                               |
| `visible`                     | Boolean           | [PageObject.isVisible](http://ember-cli-page-object.js.org/docs/v1.8.x/api/isVisible).                                                    |
| `attr(string)`                | Method            | Returns given attribute value on current element ([PageObject.attribute](http://ember-cli-page-object.js.org/docs/v1.8.x/api/attribute)). |
| `click()`                     | Method            | [PageObject.clickable](http://ember-cli-page-object.js.org/docs/v1.8.x/api/clickable).                                                    |
| `contains(selectorOrElement)` | Method            | Returns whether given element exists inside current element.                                                                              |
| `hasClass(string)`            | Method            | Returns whether current element has given class.                                                                                          |
| `text()`                      | Method            | Returns text of current element ([PageObject.text](http://ember-cli-page-object.js.org/docs/v1.8.x/api/text)).                            |

#### Including page object components into your page objects

Here's how you include `dragSortList` into your page object:

```js
// tests/pages/index.js

import { create, visitable } from "ember-cli-page-object";
import dragSortList from "<your-app-name>/tests/pages/components/drag-sort-list";

export default create({
  visit: visitable("/"),
  sortableList: dragSortList,
});
```

#### Extending the dragSortList page object component

If you want to provide custom descriptors for the `dragSortList` page object component, use the spread operator:

```js
import { create, hasClass, visitable } from "ember-cli-page-object";
import dragSortList from "<your-app-name>/tests/pages/components/drag-sort-list";

export default create({
  visit: visitable("/"),
  sortableList: {
    ...dragSortList,
    isActive: hasClass("active"),
  },
});
```

#### Extending the dragSortItem page object component

You can not provide a custom descriptor for `dragSortItem`, but you can describe its content. For example, you can describe the following template:

```handlebars
<DragSortList
  @items={{this.items}}
  @dragEndAction={{this.dragEndAction}}
  as |item|
>
  <div class="drag-sort-item-content">
    {{item.name}}
  </div>
</DragSortList>
```

...by importing the page object component factory from `{dragSortList}` and passing your item description into it like this:

```js
import { create, visitable } from "ember-cli-page-object";
import { dragSortList } from "<your-app-name>/tests/pages/components/drag-sort-list";

export default create({
  visit: visitable("/"),
  sortableList: dragSortList({
    title: text(),
  }),
});
```

In a test, list items are available as `sortableList.items`. Item content is available as `sortableList.items.objectAt(index)`.

For example, to assert the title of the first item in a list, using the page object from the last example, you can do this:

```js
assert.strictEqual(sortableList.items.objectAt(0).item.content.title, "Foo");
```

#### Providing the drag handle selector

If you're using drag handles, you must pass a drag handle selector to the factory as the second argument:

```js
import { create, visitable } from "ember-cli-page-object";
import { dragSortList } from "<your-app-name>/tests/pages/components/drag-sort-list";

export default create({
  visit: visitable("/"),
  sortableList: dragSortList({}, "[draggable]"),
});
```

If you don't want to provide custom list item content, pass an empty object.

This assumes that every list item has a handle with the same selector.

The selector must be discoverable within list item content. In other words, the handle is accessed via `listItem.querySelector(handleSelector)`.

If you're describing a nested list, use the `>` combinator in your drag handle selector, so that drag handles of child items aren't selected.

#### Sorting the dragSortList page object component

Inside your acceptance test, you can use the `sort` method on the `dragSortList` page object component.

To **rearrange items within a single list**, call `dragSortList.sort()` with three arguments:

| Argument      | Type    | Required | Description                                                                                                                     |
| :------------ | :------ | :------- | :------------------------------------------------------------------------------------------------------------------------------ |
| `sourceIndex` | Integer | yes      | Zero-based index of the item to pick up.                                                                                        |
| `targetIndex` | Integer | yes      | Zero-based index of the item to drop picked item on top of, calculated while the picked item is still on its original position. |
| `above`       | Boolean | yes      | Whether to drop picked item above (`true`) or below (`false`) target item.                                                      |

After executing `sort`, perform a wait using `await` or `andThen()`.

Example:

```js
test('sorting a list', async function (assert) {
  await page.visit()

  const list = page.sortableList

  await list.sort(0, 1, false)

  const expectedTitles = ['Bar', 'Foo', 'Baz', 'Quux']

  assert.strictEqual(list.items.length, 4)

  expectedTitles.forEach((expectedTitle, k) => {
    m = `List #0 item #${k} content title`
    expect(list.items.objectAt(k).item.title, m).equal(expectedTitle)
  })
}))
```

To **move an item from one list to another**, call `dragSortList.move()` with four arguments:

| Argument      | Type                  | Required                        | Description                                                                                                                                                                                                                                |
| :------------ | :-------------------- | :------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sourceIndex` | Integer               | yes                             | Zero-based index of the item to pick up.                                                                                                                                                                                                   |
| `targetList`  | Page object component | yes                             | The page object of the other sortable list component.                                                                                                                                                                                      |
| `targetIndex` | Integer               | no                              | Zero-based index of the item to drop picked item on top of, calculated while the picked item is still on its original position. When omitted, adds item to the end of the target list. **Must** be omitted when moving into an empty list. |
| `above`       | Boolean               | yes if `targetList` is provided | Whether to drop picked item above (`true`) or below (`false`) target item.                                                                                                                                                                 |

After executing `sort`, perform a wait using `await` or `andThen()`.

Example:

```js
const list1 = page.sortableList1;
const list2 = page.sortableList2;

await list1.sort(0, list2, 1, false);
```

This will pick the first item from `list1` and drop it below the second item of `list2`.

See this addon's acceptance test for example.

## Development

### Use Volta

Use [Volta](https://volta.sh) to automatically pick correct Node and Yarn versions.

### Do not use npm, use yarn

This project uses [Yarn](https://yarnpkg.com/) to lock dependencies. You can install yarn with `npm i -g yarn`.

### Installation for development

- `git clone <repository-url>` this repository
- `cd ember-drag-sort`
- `yarn install` :warning:

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).

### Running

- `ember serve`
- Visit your app at [http://localhost:4200](http://localhost:4200).

### Branch names

Main branches are named as `gen-1`, `gen-2`, etc. Default branch on GitHub is where active development happens.

This naming scheme is due to the fact that this project uses SemVer. As a result, major version number will rise very quickly, without any correlation with actual major changes in the app.

The number in the branch name, "generation", is supposed to be incremented in these cases:

- A huge improvement or change happens in the addon.
- There's a change in the addon's API or architecture which introduces a necessity to maintain more than one branch at a time.
- The codebase is started from scratch.

Pull requests are welcome from feature branches. Make sure to discus proposed changes with addon maintainers to avoid wasted effort.

### Updating the table of contents

Maintaining the TOC by hand is extremely tedious. Use [this tiny webapp](https://lolmaus.github.io/tocdown/) to generate the TOC automatically. Enable the first two checkboxes there.

### Demo deployment

This command will deploy the app to https://adopted-ember-addons/ember-drag-sort.github.io/ember-drag-sort/ :

    ember deploy prod

## Credits

Built by [@lolmaus](https://github.com/lolmaus) and [contributors](https://github.com/adopted-ember-addons/ember-drag-sort/graphs/contributors).

Notable contributors: [@frysch](https://github.com/frysch), [@RobbieTheWagner](https://github.com/RobbieTheWagner).

Conceieved in [Firecracker](https://github.com/firecracker).

Reimplemented in [Deveo](https://github.com/Deveo)/[Perforce](https://www.perforce.com/deveo-customer-info).

Originally developed and maintained by [kaliber5](https://kaliber5.de).

<img src="https://www.kaliber5.de/assets/images/kaliber5@2x.png" alt="kaliber5" width="134" height="40">

## License

This project is licensed under the [MIT License](LICENSE.md).
