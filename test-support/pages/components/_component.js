import { clickable, findElement, isVisible, text } from 'ember-cli-page-object';

// A helper to leverage jQuery for page component queries
export function jquery(callback, errorIfMissing = true) {
  return {
    isDescriptor: true,

    get() {
      const $el = findElement(this);

      if (errorIfMissing && !$el.length) {
        throw new Error(`Element ${this.scope} not found.`);
      }

      return callback($el);
    },
  };
}

export default function component(scope = '', descriptor = {}) {
  // If a descriptor is passed as the first arg
  if (scope === Object(scope)) {
    descriptor = scope;
    scope = null;
  }

  return {
    ...(scope ? { scope, itemScope: scope } : {}), // inject the scope only if it was provided

    $: jquery(($el) => $el),
    attr: jquery(($el) => (attrName) => $el.attr(attrName)),
    click: clickable(),
    contains: jquery(
      ($el) => (selector) => $el.find(selector).length > 0,
      false
    ),
    empty: jquery(
      ($el) =>
        $el.is(':empty') ||
        (!$el.children().length && !$el.text().trim().length)
    ),
    exists: jquery(($el) => $el.length > 0, false), // false: don't spit an error if element isn't found
    index: jquery(($el) => $el.index()),
    hasClass: jquery(($el) => (className) => $el.hasClass(className)),
    visible: isVisible(),
    text: text(),

    ...descriptor,
  };
}
