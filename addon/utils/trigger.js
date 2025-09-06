import { assert } from '@ember/debug';
import { triggerEvent, settled } from '@ember/test-helpers';

// // https://github.com/jgwhite/ember-sortable/blob/21d2c513f96796f9b1a56983d34cf501a1f169c2/tests/integration/components/sortable-group-test.js#L35-L40
// export function triggerEvent (elementOrSelector, eventName, params) {
//   run(() => {
//     const element =
//       (elementOrSelector instanceof Element)
//         ? elementOrSelector
//         : find(elementOrSelector)

//     if (typeof params === 'function') params = params(element)

//     const event = new CustomEvent(eventName, params)

//     element.dispatchEvent(event)
//   })
// }

export default function trigger(elementOrSelector, eventName, isDraggingUp) {
  const element =
    elementOrSelector instanceof Element
      ? elementOrSelector
      : find(elementOrSelector);

  const params = {};

  if (isDraggingUp != null) {
    const modifier = isDraggingUp ? 0.25 : 0.75;
    const inner = element.offsetHeight * modifier;
    const outer = element.getBoundingClientRect().top;
    params.clientY = inner + outer;
  }

  return triggerEvent(elementOrSelector, eventName, params);
}

export async function sort(
  sourceList,
  sourceIndex,
  targetIndex,
  above,
  handleSelector
) {
  let sourceItem = sourceList.children[sourceIndex];

  assert(`source item not exist at index ${sourceIndex}`, sourceItem);

  if (handleSelector) sourceItem = sourceItem.querySelector(handleSelector);

  assert('handle does not exist', !handleSelector || sourceItem);

  const targetItem = sourceList.children[targetIndex];

  assert(`target item not exist at index ${targetIndex}`, targetItem);

  await trigger(sourceItem, 'dragstart');
  await trigger(targetItem, 'dragover', above);
  await trigger(sourceItem, 'dragend');

  return settled();
}

export async function move(
  sourceList,
  sourceIndex,
  targetList,
  targetIndex,
  above,
  handleSelector
) {
  let sourceItem = sourceList.children[sourceIndex];

  assert(`source item not exist at index ${sourceIndex}`, sourceItem);

  if (handleSelector) sourceItem = sourceItem.querySelector(handleSelector);

  assert('handle does not exist', !handleSelector || sourceItem);

  const targetListLength = targetList.childElementCount;

  if (targetListLength) {
    if (targetIndex == null) {
      targetIndex = targetListLength - 1;
      above = false;
    }

    const targetItem = targetList.children[targetIndex];

    assert(`target item not exist at index ${targetIndex}`, targetItem);

    await trigger(sourceItem, 'dragstart');
    await trigger(targetList, 'dragenter');
    await trigger(targetItem, 'dragover', above);
    await trigger(sourceItem, 'dragend');
  } else {
    assert(
      `target list is empty, the only available target index is 0, but target index ${targetIndex} was provided`,
      !targetIndex
    );

    await trigger(sourceItem, 'dragstart');
    await trigger(targetList, 'dragenter');
    await trigger(sourceItem, 'dragend');
  }

  return settled();
}
