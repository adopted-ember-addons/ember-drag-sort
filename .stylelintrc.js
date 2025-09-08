'use strict';

module.exports = {
  extends: ['stylelint-config-standard', 'stylelint-prettier/recommended'],
  rules: {
    'declaration-block-no-redundant-longhand-properties': null,
    'no-descending-specificity': null,
    'selector-class-pattern': null,
    'value-no-vendor-prefix': null,
  },
};
