# Changelog

## Release (2025-09-19)

* ember-drag-sort 4.0.0 (major)

#### :boom: Breaking Change
* `ember-drag-sort`
  * [#87](https://github.com/adopted-ember-addons/ember-drag-sort/pull/87) Require ember 4.12+, node 20+ ([@RobbieTheWagner](https://github.com/RobbieTheWagner))
  * [#86](https://github.com/adopted-ember-addons/ember-drag-sort/pull/86) Require Ember 3.28+, node 18+, modernize code ([@RobbieTheWagner](https://github.com/RobbieTheWagner))

#### Committers: 1
- Robbie Wagner ([@RobbieTheWagner](https://github.com/RobbieTheWagner))

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).



## [3.0.1] - 2022-07-27

### Fixed
* Fix `ember-cli-page-object` import path, by [@mkszepp](https://github.com/mkszepp).

### Maintenance
* Bump some dependencies, by [@mkszepp](https://github.com/mkszepp).
* Pin Node 12, use Volta, by [@lolmaus](https://github.com/lolmaus).



## [3.0.0] - 2020-08-17

### Added
* `dragStartAction` allows updating drag image, by [@bendemboski](https://github.com/bendemboski).



## [3.0.0-beta.0] - 2020-01-05

### Changed
* ⚠ Dropped support for Ember CLI below 3.12.

### Maintenance
* Upgraded Ember CLI to 3.15 and dependencies.
* Converted templates to angle brackets.
* Minor maintenance changes.



## [2.0.0-beta.2] - 2020-01-05

### Added
* `sourceOnly` option for an immutable drag-from list by [@rwwagner90](https://github.com/rwwagner90).

### Maintenance
* Brush up demo, tests and linting.



## [2.0.0-beta.1] - 2019-12-04

### Added
* `additionalArgs` enable saving many-to-many relationships by [@rwwagner90](https://github.com/rwwagner90).

### Fixed

* Avoid redirects to anything.com in Firefox by [@anlumo](https://github.com/anlumo).
* Remove `'anything'` text from `dataTransfer.setData` by [@mateusalexandre](https://github.com/mateusalexandre).



## [2.0.0-beta.0] - 2019-09-17

### Added
- Support for horizontal lists by @frysch. 😎

### Changed
- Raised the minimal Node requirement to 8.
- Resolved the nested list jumping issue by preventing height change during dragging.

### Documentation
- Removed jQuery mentions from the readme.
- Mentioned the `handleSelector` attribute in test helpers.



## [2.0.0-alpha.3] - 2019-04-08

### Changed
- Upgraded to Ember Canary (internally).
- Removed dependency on `ember-awesome-macros` and `ember-macro-helpers`.
- Account for current placeholder padding when determining next placeholder position.

## Documentation
- Updated the version of the Ember CLI badge.



## [2.0.0-alpha.2] - 2019-04-03

### Changed
- Upgraded to Ember CLI 3.8, got rid of jQuery dependency. :warning: Nested lists don't work in Ember without jQuery, see https://github.com/emberjs/ember.js/issues/17840
- Moved to kaliber5/ember-drag-sort
- Adjusted code style/linting



## [1.1.1] - 2017-11-15

### Fixed
- Fixed placeholder jumping around in nested lists, by [@lolmaus](https://github.com/lolmaus/)



## [1.1.0] - 2017-11-14

### Added
- Table demo ([#12](https://github.com/Deveo/ember-drag-sort/issues/12), reported by [@livfwd](https://github.com/livfwd), fixed by [@lolmaus](https://github.com/lolmaus/))

### Tech debt
- Upgraded to Ember CLI 2.16.2
- Migrated to new module imports (RFC 176)



## [1.0.2] - 2017-10-3

### Fixed
- Make ember-awesome-macros a dependency instead of subdependency ([#11](https://github.com/Deveo/ember-drag-sort/issues/11), fixed by [@lolmaus](https://github.com/lolmaus/))



## [1.0.1] - 2017-09-30

### Added
- Make page objects aware of drag handles ([#10](https://github.com/Deveo/ember-drag-sort/issues/10), implemented by [@lolmaus](https://github.com/lolmaus/))



## [1.0.0] - 2017-09-11

### Added
- Drag handle ([#5](https://github.com/Deveo/ember-drag-sort/issues/5), implemented by [@lolmaus](https://github.com/lolmaus/))



## [1.0.0-beta-0] - 2017-08-31

### Added
- Unsortable lists ([#4](https://github.com/Deveo/ember-drag-sort/pull/4), implemented by [@lolmaus](https://github.com/lolmaus/))



## [1.0.0-alpha.9] - 2017-05-22
Public release.
