import { module, test } from 'qunit';
import { currentURL, settled } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import page from 'dummy/tests/pages/index';

function assertListItems(list, expectedTitles, assert, message) {
  const m = `${message}: items count`;
  assert.equal(list.items().count, expectedTitles.length, m);

  // List with disabled sorting
  expectedTitles.forEach((expectedTitle, i) => {
    const m = `${message}: List #0 item #${i} content title`;
    assert.equal(list.items(i).content.title, expectedTitle, m);
  });
}

module('Acceptance | index', function (hooks) {
  setupApplicationTest(hooks);

  test('visiting /index', async function (assert) {
    await page.visit();

    assert.equal(currentURL(), '/', 'Current URL');
    assertListItems(
      page.simple1,
      ['Foo', 'Bar', 'Baz', 'Quux'],
      assert,
      'Simple 1'
    );
    assertListItems(page.simple2, ['☰ Zomg', '☰ Lol'], assert, 'Simple 2');
  });

  test('sorting a list', async function (assert) {
    await page.visit();
    await page.simple1.sort(0, 1, false);

    assertListItems(
      page.simple1,
      ['Bar', 'Foo', 'Baz', 'Quux'],
      assert,
      'Simple 1'
    );
  });

  test('sorting between lists', async function (assert) {
    await page.visit();
    await page.simple1.move(0, page.simple2, 1, false);

    assertListItems(page.simple1, ['Bar', 'Baz', 'Quux'], assert, 'Simple 1');
    assertListItems(
      page.simple2,
      ['☰ Zomg', '☰ Lol', '☰ Foo'],
      assert,
      'Simple 2'
    );
  });

  test('disable sorting within a list when the determineForeignPositionAction parameter is given', async function (assert) {
    await page.visit();
    await page.foreign1.sort(0, 1, false);

    assertListItems(
      page.foreign1,
      ['Bar', 'Baz', 'Foo', 'Quux'],
      assert,
      'Foreign 1'
    );
  });

  test('dragging into a sortable list when the sourcelist has the determineForeignPositionAction parameter', async function (assert) {
    await page.visit();
    await page.foreign1.move(0, page.foreign2, 0, true);

    assertListItems(page.foreign1, ['Baz', 'Foo', 'Quux'], assert, 'Foreign 1');
    assertListItems(page.foreign2, ['Bar', 'Zomg', 'Lol'], assert, 'Foreign 2');
  });

  test('sort into a list that has the determineForeignPositionAction parameter', async function (assert) {
    await page.visit();
    await page.foreign2.move(0, page.foreign1, 0, false);

    assertListItems(
      page.foreign1,
      ['Bar', 'Baz', 'Foo', 'Quux', 'Zomg'],
      assert,
      'Foreign 1'
    );
    assertListItems(page.foreign2, ['Lol'], assert, 'Foreign 2');
  });

  test('sorting from an unsortable list to a sortable list, and then back into an unsortable list, should not change the position', async function (assert) {
    await page.visit();

    const item0_0 = page.foreign1.items(0);
    const item0_3 = page.foreign1.items(3);
    const item1_0 = page.foreign2.items(0);

    await item0_3.dragStart();
    await page.foreign2.dragEnter();
    await item1_0.dragOver(false);
    await page.foreign1.dragEnter();
    await item0_0.dragOver(false);
    await item0_3.dragEnd();

    await settled();

    assertListItems(
      page.foreign1,
      ['Bar', 'Baz', 'Foo', 'Quux'],
      assert,
      'Foreign 1'
    );
    assertListItems(page.foreign2, ['Zomg', 'Lol'], assert, 'Foreign 2');
  });

  test('sorting from an sortable list to an unsortable list should position alphabetically', async function (assert) {
    await page.visit();

    const item0_0 = page.foreign1.items(0);
    let item1_0 = page.foreign2.items(0);

    await item1_0.dragStart();
    await page.foreign1.dragEnter();
    await item0_0.dragOver(true);
    await item1_0.dragEnd();

    await settled();

    assertListItems(
      page.foreign1,
      ['Bar', 'Baz', 'Foo', 'Quux', 'Zomg'],
      assert,
      'Foreign 1'
    );
    assertListItems(page.foreign2, ['Lol'], assert, 'Foreign 2');

    item1_0 = page.foreign2.items(0);

    await item1_0.dragStart();
    await page.foreign1.dragEnter();
    await item0_0.dragOver(true);
    await item1_0.dragEnd();

    await settled();

    assertListItems(
      page.foreign1,
      ['Bar', 'Baz', 'Foo', 'Lol', 'Quux', 'Zomg'],
      assert,
      'Foreign 1'
    );
    assertListItems(page.foreign2, [], assert, 'Foreign 2');
  });

  test('foreign position: create a copy by dragging out', async function (assert) {
    await page.visit();
    await page.copies1.move(0, page.copies2, 0, false);

    assertListItems(page.copies1, ['Foo', 'Bar', 'Baz'], assert, 'Copies 1');
    assertListItems(page.copies2, ['Quux', 'Foo'], assert, 'Copies 2');
  });

  test('foreign position: remove a copy by dragging in', async function (assert) {
    await page.visit();
    await page.copies2.move(0, page.copies1, 0, false);

    assertListItems(page.copies1, ['Foo', 'Bar', 'Baz'], assert, 'Copies 1');
    assertListItems(page.copies2, [], assert, 'Copies 2');
  });

  test('source only: create a copy by dragging out', async function (assert) {
    await page.visit();
    await page.sourceOnly1.move(0, page.sourceOnly2, 0, false);

    assertListItems(
      page.sourceOnly1,
      ['Foo', 'Bar', 'Baz'],
      assert,
      'Source only 1'
    );
    assertListItems(page.sourceOnly2, ['Quux', 'Foo'], assert, 'Source only 2');
  });

  test('source only: does nothing when dragging in', async function (assert) {
    await page.visit();
    await page.sourceOnly2.move(0, page.sourceOnly1, 0, false);

    assertListItems(
      page.sourceOnly1,
      ['Foo', 'Bar', 'Baz'],
      assert,
      'Source only 1'
    );
    assertListItems(page.sourceOnly2, ['Quux'], assert, 'Source only 2');
  });
});
