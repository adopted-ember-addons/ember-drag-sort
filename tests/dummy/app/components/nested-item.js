import Component from '@ember/component';

export default Component.extend({
  classNames: ['nestedItem'],
  item: undefined,
  dragEndAction: undefined,
  group: 'nested group',
});
