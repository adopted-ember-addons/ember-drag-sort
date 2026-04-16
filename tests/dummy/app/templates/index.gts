import type { TemplateOnlyComponent } from '@ember/component/template-only';
import { on } from "@ember/modifier";
import { not } from "@ember/helper";
import { perform } from "ember-concurrency";
import DragSortList from "ember-drag-sort/components/drag-sort-list";
import NestedItem from "tests/dummy/app/components/nested-item";

export default <template>
{{! template-lint-disable no-action}}

<h1>ember-drag-sort demo</h1>

<p>
  See

  <a
    href="https://github.com/kaliber5/ember-drag-sort/blob/gen-0/tests/dummy/app/templates/index.hbs"
  >
    demo template source
  </a>

  and

  <a
    href="https://github.com/kaliber5/ember-drag-sort/blob/gen-0/tests/dummy/app/controllers/index.js"
  >
    demo controller source
  </a>.
</p>

<div class="list-groups">

  <div class="list-group-wrapper">
    <h2>Simple usage</h2>

    <p>
      Sort lists, drag between lists. Won't let you drag items from/to other
      groups.
    </p>

    <section class="list-group">
      <article class="list">
        <h4>List without drag handles</h4>

        <DragSortList
          id="simple-1"
          @items={{@controller.simple1}}
          @group="simple"
          @dragEndAction={{@controller.dragEnd}}
          as |item|
        >
          <div class="the-item">
            {{item.name}}
          </div>
        </DragSortList>
      </article>

      <article class="list">
        <h4>List with drag handles</h4>

        <DragSortList
          id="simple-2"
          @items={{@controller.simple2}}
          @group="simple"
          @handle=".handle"
          @dragEndAction={{@controller.dragEnd}}
          as |item|
        >
          <div class="the-item">
            <span class="handle" draggable="true">☰</span>
            {{item.name}}
          </div>
        </DragSortList>
      </article>
    </section>
  </div>

  <div class="list-group-wrapper">
    <h2>Async action</h2>

    <p>
      Uses async action, driven by
      <a href="http://ember-concurrency.com/">ember-concurrency</a>. See
      <a
        href="https://github.com/kaliber5/ember-drag-sort/blob/gen-1/tests/dummy/app/controllers/index.js#L158-L177"
      >task source</a>.
    </p>

    <p>
      <label>
        <input
          type="checkbox"
          checked={{@controller.networkFailure}}
          {{on "change" @controller.updateNetworkFailure}}
        />
        Simulate network failure.
      </label>
    </p>

    <p>
      Status:

      {{#if @controller.dragEndTask.isRunning}}
        Updating...
      {{else if @controller.dragEndTask.last.error}}
        {{@controller.dragEndTask.last.error.message}}
      {{else}}
        Idle.
      {{/if}}
    </p>

    <section class="list-group">
      <article class="list">
        <h4>List 1</h4>

        <DragSortList
          id="async-1"
          @items={{@controller.async1}}
          @group="async"
          @draggingEnabled={{@controller.dragEndTask.isIdle}}
          @dragEndAction={{perform @controller.dragEndTask}}
          as |item|
        >
          <div class="the-item">
            {{item.name}}
          </div>
        </DragSortList>
      </article>

      <article class="list">
        <h4>List 2</h4>

        <DragSortList
          id="async-2"
          @items={{@controller.async2}}
          @group="async"
          @draggingEnabled={{not @controller.dragEndTask.isRunning}}
          @dragEndAction={{perform @controller.dragEndTask}}
          as |item|
        >
          <div class="the-item">
            {{item.name}}
          </div>
        </DragSortList>
      </article>
    </section>
  </div>

  <div class="list-group-wrapper">
    <h2>Unsortable list</h2>

    <p>
      Use `determineForeignPositionAction` to prevent user from rearranging a
      list, while still letting them drag in and out of the list
    </p>

    <section class="list-group">
      <article class="list">
        <h4>List 1 (always sorted alphabetically)</h4>

        <DragSortList
          id="foreign-1"
          @items={{@controller.foreign1}}
          @group="foreign"
          @dragEndAction={{@controller.dragEnd}}
          @determineForeignPositionAction={{@controller.determineForeignPosition}}
          as |item|
        >
          <div class="the-item">
            {{item.name}}
          </div>
        </DragSortList>
      </article>

      <article class="list">
        <h4>List 2 (sorted by user)</h4>

        <DragSortList
          id="foreign-2"
          @items={{@controller.foreign2}}
          @group="foreign"
          @dragEndAction={{@controller.dragEnd}}
          as |item|
        >
          <div class="the-item">
            {{item.name}}
          </div>
        </DragSortList>
      </article>
    </section>
  </div>

  <div class="list-group-wrapper">
    <h2>Create copies of items by dragging out, delete by dragging in</h2>

    <p>
      Drag out of source list to create copies of items. Drag back into the
      source list to remove copies. The source list can't be modified.
    </p>

    <section class="list-group">
      <article class="list">
        <h4>List 1 (source, always sorted alphabetically)</h4>

        <DragSortList
          id="copies-1"
          @items={{@controller.copies1}}
          @group="copies"
          @dragEndAction={{@controller.dragEnd2}}
          @determineForeignPositionAction={{@controller.determineForeignPosition2}}
          as |item|
        >
          <div class="the-item">
            {{item.name}}
          </div>
        </DragSortList>
      </article>

      <article class="list">
        <h4>List 2 (target, sorted by user)</h4>

        <DragSortList
          id="copies-2"
          @items={{@controller.copies2}}
          @group="copies"
          @dragEndAction={{@controller.dragEnd2}}
          as |item|
        >
          <div class="the-item">
            {{item.name}}
          </div>
        </DragSortList>
      </article>

      <article class="list">
        <h4>List 3 (target, sorted by user)</h4>

        <DragSortList
          id="copies-3"
          @items={{@controller.copies3}}
          @group="copies"
          @dragEndAction={{@controller.dragEnd2}}
          as |item|
        >
          <div class="the-item">
            {{item.name}}
          </div>
        </DragSortList>
      </article>
    </section>
  </div>

  <div class="list-group-wrapper">
    <h2>Source only list</h2>

    <p>
      Use `sourceOnly` to prevent the user from rearranging or dragging into the
      list. Effectively, it is marked as immutable, and only used as a source
      bucket for other lists.
    </p>

    <p>
      This example is similar to the previous one, except that the source list
      remains absolutely static.
    </p>

    <section class="list-group">
      <article class="list">
        <h4>Source list</h4>

        <DragSortList
          id="source-only-1"
          @items={{@controller.sourceOnly1}}
          @group="source-only"
          @dragEndAction={{@controller.sourceOnlyDragEnd}}
          @sourceOnly={{true}}
          as |item|
        >
          <div class="the-item">
            {{item.name}}
          </div>
        </DragSortList>
      </article>

      <article class="list">
        <h4>Target list</h4>

        <DragSortList
          id="source-only-2"
          @items={{@controller.sourceOnly2}}
          @group="source-only"
          @dragEndAction={{@controller.sourceOnlyDragEnd}}
          as |item|
        >
          <div class="the-item">
            {{item.name}}
          </div>
        </DragSortList>
      </article>
    </section>
  </div>

  <div class="list-group-wrapper">
    <h2>Tables</h2>

    <p>
      ember-drag-sort uses a simple CSS technique to render the placeholder:
      `:before` and `:after` pseudoelements.
    </p>

    <p>
      Unfortunately, this doesn't work with HTML tables because table semantics
      are very restrictive. To work around this problem, top/bottom padding on
      table cells can be used instead of selectors.
    </p>

    <p>
      This is not a great solution because padding appears
      <em>inside</em>
      table cells. If you want your cells to have borders, you'll have to apply
      them to inner elements instead.
    </p>

    <p>
      See
      <a
        href="https://github.com/kaliber5/ember-drag-sort/blob/gen-0/tests/dummy/app/styles/app.css#L126-L159"
      >style overrides of this demo.</a>
    </p>

    <section class="list-group">
      <article class="list">
        <h4>Table 1</h4>

        <DragSortList
          id="table-1"
          @items={{@controller.table1}}
          @tagName="table"
          @childTagName="tr"
          @group="table"
          @dragEndAction={{@controller.dragEnd}}
          as |item|
        >
          <td>
            <div class="the-item">
              {{item.name}}
            </div>
          </td>
        </DragSortList>
      </article>

      <article class="list">
        <h4>Table 2</h4>

        <DragSortList
          id="table-2"
          @items={{@controller.table2}}
          @tagName="table"
          @childTagName="tr"
          @group="table"
          @dragEndAction={{@controller.dragEnd}}
          as |item|
        >
          <td>
            <div class="the-item">
              {{item.name}}
            </div>
          </td>
        </DragSortList>
      </article>
    </section>
  </div>

  <div class="list-group-wrapper">
    <h2>Horizontal list</h2>

    <p>
      Set `isHorizontal=true` for a horizontal drag n drop. You can also drag
      between a horizontal list and a vertical.
    </p>

    <section class="list-group">
      <article class="horizontal-list list">
        <h4>List 1</h4>

        <DragSortList
          id="horizontal-1"
          @items={{@controller.horizontal1}}
          @group="horizontal"
          @dragEndAction={{@controller.dragEnd}}
          @isHorizontal={{true}}
          as |item|
        >
          <div class="the-item">
            {{item.name}}
          </div>
        </DragSortList>
      </article>

      <article class="list">
        <h4>List 2</h4>

        <DragSortList
          id="horizontal-2"
          @items={{@controller.horizontal2}}
          @group="horizontal"
          @dragEndAction={{@controller.dragEnd}}
          as |item|
        >
          <div class="the-item">
            {{item.name}}
          </div>
        </DragSortList>
      </article>
    </section>
  </div>

  <div class="list-group-wrapper">
    <h2>Horizontal list with RTL</h2>

    <p>
      Use `isRtl=true` if you're using a language which is read right to left.
      Has no effect on vertical lists.
    </p>

    <section class="list-group list-groups">
      <article class="horizontal-list list">
        <DragSortList
          id="rtl"
          @items={{@controller.rtl}}
          @group="rtl"
          @isHorizontal={{true}}
          @isRtl={{true}}
          @dragEndAction={{@controller.dragEnd}}
          as |item|
        >
          <div class="the-item">
            {{item.name}}
          </div>
        </DragSortList>
      </article>
    </section>
  </div>

  <div class="list-group-wrapper">
    <h2>Custom drag image</h2>

    <p>
      Note that the drag image does not contain the gray margins around the
      boxes
    </p>

    <section class="list-group">
      <article class="list">
        <DragSortList
          id="drag-image"
          @items={{@controller.dragImage}}
          @group="dragImage"
          @dragStartAction={{@controller.setDragImage}}
          @dragEndAction={{@controller.dragEnd}}
          as |item|
        >
          <div class="the-item">
            {{item.name}}
          </div>
        </DragSortList>
      </article>
    </section>
  </div>
</div>

<div class="list-groups">
  <div class="list-group-wrapper">
    <h2>Nested list</h2>

    <p>
      See
      <a
        href="https://github.com/adopted-ember-addons/ember-drag-sort/blob/gen-0/tests/dummy/app/templates/components/nested-item.hbs"
      >
        component template source
      </a>.
    </p>

    <NestedItem
      id="nested"
      @item={{@controller.nestedItem}}
      @group="nested"
      @dragEndAction={{@controller.dragEnd}}
    />

    <p>Warning: Nested lists don't work well with horizontal lists.</p>
  </div>
</div>
</template> satisfies TemplateOnlyComponent<{ Args: { model: unknown, controller: unknown } }>;
