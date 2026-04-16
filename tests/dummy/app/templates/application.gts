import type { TemplateOnlyComponent } from '@ember/component/template-only';

export default <template>{{outlet}}</template> satisfies TemplateOnlyComponent<{ Args: { model: unknown, controller: unknown } }>