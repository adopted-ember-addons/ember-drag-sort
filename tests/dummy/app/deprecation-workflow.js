import setupDeprecationWorkflow from 'ember-cli-deprecation-workflow'

setupDeprecationWorkflow({
  throwOnUnhandled : true,
  workflow         : [
    {
      handler : 'silence',
      matchId : 'deprecated-run-loop-and-computed-dot-access',
    },
    { handler : 'silence', matchId : 'ember-cli-page-object.old-collection-api' },
    { handler : 'silence', matchId : 'ember-global' },
    { handler : 'silence', matchId : 'this-property-fallback' },
  ],
})
