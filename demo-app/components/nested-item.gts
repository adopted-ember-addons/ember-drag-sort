import type { TOC } from '@ember/component/template-only';
import DragSortList from 'ember-drag-sort/components/drag-sort-list';

interface Item {
  name: string;
  children: Item[];
}

interface Signature {
  Element: HTMLDivElement;
  Args: {
    item: Item;
    group: string;
    dragEndAction: (args: unknown) => void;
  };
}

const NestedItem: TOC<Signature> = <template>
  <div class="nestedItem" ...attributes>
    <p class="nestedItem-title">
      {{@item.name}}
    </p>

    <DragSortList
      @items={{@item.children}}
      @group="nested group"
      @dragEndAction={{@dragEndAction}}
      as |child|
    >
      <NestedItem
        @item={{child}}
        @group="nested group"
        @dragEndAction={{@dragEndAction}}
      />
    </DragSortList>
  </div>
</template>;

export default NestedItem;
