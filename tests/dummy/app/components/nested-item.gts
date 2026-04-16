import DragSortList from "ember-drag-sort/components/drag-sort-list";

const NestedItem: TemplateOnlyComponent = <template>
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
