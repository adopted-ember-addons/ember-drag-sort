import type { TOC } from '@ember/component/template-only';
import DragSortList from 'ember-drag-sort/components/drag-sort-list';

export interface ReproItem {
  name: string;
  level: number;
  children: ReproItem[];
}

interface Signature {
  Args: {
    items: ReproItem[];
    dragEndAction: (args: unknown) => void;
  };
}

const ReproTree: TOC<Signature> = <template>
  <DragSortList
    @items={{@items}}
    @group="repro"
    @dragEndAction={{@dragEndAction}}
    as |child|
  >
    <div class="nestedItem" data-level={{child.level}} data-name={{child.name}}>
      <p class="nestedItem-title">{{child.name}}</p>
      <ReproTree @items={{child.children}} @dragEndAction={{@dragEndAction}} />
    </div>
  </DragSortList>
</template>;

export default ReproTree;
