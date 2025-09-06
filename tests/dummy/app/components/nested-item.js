import Component from '@ember/component';
import layout from '../templates/components/nested-item';

export default Component.extend({
  layout,
  classNames: ['nestedItem'],
  item: undefined,
  dragEndAction: undefined,
  group: 'nested group',
});
