import type { Dictionary } from '../i18n/dictionaries'

/**
 * Structure of the Theory page. To add a section, append a node to `theorySections`
 * (top level) or to a `sections` block (nested); every section and subsection heading
 * becomes a collapsible disclosure. `id` becomes the `#theory-...` anchor, `titleKey`
 * must be a string key present in both language dictionaries, `icon` picks a name from
 * the shared inline-SVG set in `TheoryIcons.tsx`. Content is a list of typed blocks:
 * paragraph, bullets, numbered, subheading, callout, code, code-group, terms, highlight,
 * and `sections` (layout: stack | grid | ordered) for nesting further sections.
 */

type StringKeyOf<T> = { [K in keyof T]-?: T[K] extends string ? K : never }[keyof T]

export type TheoryTextKey = StringKeyOf<Dictionary>

export type TheoryIconName =
  | 'why'
  | 'idea'
  | 'parameters'
  | 'steps'
  | 'compare'
  | 'balance'
  | 'cheatsheet'
  | 'note'
  | 'important'
  | 'example'

export type TheoryCalloutTone = 'note' | 'important' | 'example'

export type TheoryBlock =
  | { type: 'paragraph'; textKey: TheoryTextKey }
  | { type: 'bullets'; textKeys: TheoryTextKey[] }
  | { type: 'numbered'; items: { titleKey: TheoryTextKey; textKey: TheoryTextKey }[] }
  | { type: 'subheading'; textKey: TheoryTextKey }
  | { type: 'callout'; tone: TheoryCalloutTone; labelKey?: TheoryTextKey; textKey: TheoryTextKey }
  | { type: 'code'; code: string; labelKey: TheoryTextKey }
  | { type: 'code-group'; items: { code: string; labelKey: TheoryTextKey }[] }
  | { type: 'terms'; items: { termKey: TheoryTextKey; definitionKey: TheoryTextKey }[] }
  | { type: 'highlight'; textKey: TheoryTextKey }
  | { type: 'sections'; layout: 'stack' | 'grid' | 'ordered'; items: TheorySectionNode[] }

export type TheorySectionNode = {
  id: string
  titleKey: TheoryTextKey
  icon?: TheoryIconName
  variant?: 'accent'
  blocks: TheoryBlock[]
}

const pseudocode = {
  pick: 'seed = choose(unassigned)',
  neighbors: 'neighbors = {p in unassigned | distance(seed, p) < R}',
  grow: [
    'frontier = {seed}',
    'while frontier is not empty:',
    '    fresh = neighbors of frontier in unassigned',
    '    group = group union fresh',
    '    unassigned = unassigned minus fresh',
    '    frontier = fresh',
  ].join('\n'),
  nextCluster: [
    'if unassigned is empty:',
    '    stop',
    'seed = choose(unassigned)',
    'start a new group',
  ].join('\n'),
  finish: [
    'if size(group) < minPts:',
    '    mark group as noise',
    'else:',
    '    save group as a cluster',
  ].join('\n'),
}

const stepSections: TheorySectionNode[] = [
  { id: 'theory-step-1', titleKey: 'theoryStep1Title', blocks: [{ type: 'paragraph', textKey: 'theoryStep1Text' }] },
  { id: 'theory-step-2', titleKey: 'theoryStep2Title', blocks: [{ type: 'paragraph', textKey: 'theoryStep2Text' }] },
  { id: 'theory-step-3', titleKey: 'theoryStep3Title', blocks: [{ type: 'paragraph', textKey: 'theoryStep3Text' }] },
  { id: 'theory-step-4', titleKey: 'theoryStep4Title', blocks: [{ type: 'paragraph', textKey: 'theoryStep4Text' }] },
  { id: 'theory-step-5', titleKey: 'theoryStep5Title', blocks: [{ type: 'paragraph', textKey: 'theoryStep5Text' }] },
  { id: 'theory-step-6', titleKey: 'theoryStep6Title', blocks: [{ type: 'paragraph', textKey: 'theoryStep6Text' }] },
  { id: 'theory-step-7', titleKey: 'theoryStep7Title', blocks: [{ type: 'paragraph', textKey: 'theoryStep7Text' }] },
  { id: 'theory-step-8', titleKey: 'theoryStep8Title', blocks: [{ type: 'paragraph', textKey: 'theoryStep8Text' }] },
  { id: 'theory-step-9', titleKey: 'theoryStep9Title', blocks: [{ type: 'paragraph', textKey: 'theoryStep9Text' }] },
]

export const theorySections: TheorySectionNode[] = [
  {
    id: 'theory-why',
    titleKey: 'theoryWhyTitle',
    icon: 'why',
    blocks: [
      { type: 'paragraph', textKey: 'theoryWhyParagraph1' },
      { type: 'paragraph', textKey: 'theoryWhyParagraph2' },
      { type: 'callout', tone: 'note', labelKey: 'calloutNoteLabel', textKey: 'theoryWhyCallout' },
    ],
  },
  {
    id: 'theory-idea',
    titleKey: 'theoryIdeaTitle',
    icon: 'idea',
    blocks: [
      { type: 'paragraph', textKey: 'theoryIdeaParagraph1' },
      { type: 'paragraph', textKey: 'theoryIdeaParagraph2' },
      {
        type: 'bullets',
        textKeys: ['theoryIdeaRadius', 'theoryIdeaGrowth', 'theoryIdeaNoise'],
      },
    ],
  },
  {
    id: 'theory-parameters',
    titleKey: 'theoryParametersTitle',
    icon: 'parameters',
    blocks: [
      {
        type: 'sections',
        layout: 'grid',
        items: [
          {
            id: 'theory-radius',
            titleKey: 'theoryRadiusTitle',
            blocks: [
              { type: 'paragraph', textKey: 'theoryRadiusText' },
              {
                type: 'callout',
                tone: 'example',
                labelKey: 'theoryExampleLabel',
                textKey: 'theoryRadiusExample',
              },
            ],
          },
          {
            id: 'theory-min-pts',
            titleKey: 'theoryMinPtsTitle',
            blocks: [
              { type: 'paragraph', textKey: 'theoryMinPtsText' },
              {
                type: 'callout',
                tone: 'example',
                labelKey: 'theoryExampleLabel',
                textKey: 'theoryMinPtsExample',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'theory-walkthrough',
    titleKey: 'theoryStepsTitle',
    icon: 'steps',
    blocks: [
      { type: 'paragraph', textKey: 'theoryStepsIntro' },
      { type: 'sections', layout: 'ordered', items: stepSections },
      {
        type: 'code-group',
        items: [
          { code: pseudocode.pick, labelKey: 'theoryCodePickLabel' },
          { code: pseudocode.neighbors, labelKey: 'theoryCodeNeighborsLabel' },
          { code: pseudocode.grow, labelKey: 'theoryCodeGrowLabel' },
          { code: pseudocode.nextCluster, labelKey: 'theoryCodeNextLabel' },
          { code: pseudocode.finish, labelKey: 'theoryCodeFinishLabel' },
        ],
      },
    ],
  },
  {
    id: 'theory-original',
    titleKey: 'theoryOriginalTitle',
    icon: 'compare',
    blocks: [
      { type: 'paragraph', textKey: 'theoryOriginalText' },
      {
        type: 'terms',
        items: [
          { termKey: 'theoryCoreTitle', definitionKey: 'theoryCoreText' },
          { termKey: 'theoryBorderTitle', definitionKey: 'theoryBorderText' },
          { termKey: 'theoryNoiseTitle', definitionKey: 'theoryNoiseText' },
        ],
      },
      {
        type: 'callout',
        tone: 'note',
        labelKey: 'calloutNoteLabel',
        textKey: 'theoryDifferenceCallout',
      },
    ],
  },
  {
    id: 'theory-tradeoffs',
    titleKey: 'theoryTradeoffsTitle',
    icon: 'balance',
    blocks: [
      {
        type: 'sections',
        layout: 'grid',
        items: [
          {
            id: 'theory-strengths',
            titleKey: 'theoryStrengthsTitle',
            blocks: [
              {
                type: 'bullets',
                textKeys: ['theoryStrength1', 'theoryStrength2', 'theoryStrength3'],
              },
            ],
          },
          {
            id: 'theory-limitations',
            titleKey: 'theoryLimitationsTitle',
            blocks: [
              {
                type: 'bullets',
                textKeys: ['theoryLimitation1', 'theoryLimitation2', 'theoryLimitation3'],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'theory-summary',
    titleKey: 'theorySummaryTitle',
    icon: 'cheatsheet',
    variant: 'accent',
    blocks: [
      {
        type: 'terms',
        items: [
          { termKey: 'theoryTermR', definitionKey: 'theoryTermRDefinition' },
          { termKey: 'theoryTermMinPts', definitionKey: 'theoryTermMinPtsDefinition' },
          { termKey: 'theoryTermCluster', definitionKey: 'theoryTermClusterDefinition' },
          { termKey: 'theoryTermNoise', definitionKey: 'theoryTermNoiseDefinition' },
        ],
      },
    ],
  },
]

function collectSectionIds(nodes: TheorySectionNode[], acc: string[] = []): string[] {
  for (const node of nodes) {
    acc.push(node.id)
    for (const block of node.blocks) {
      if (block.type === 'sections') {
        collectSectionIds(block.items, acc)
      }
    }
  }
  return acc
}

export const theorySectionIds: readonly string[] = collectSectionIds(theorySections)

export function getTheorySectionAncestors(targetId: string): string[] {
  const path: string[] = []

  function walk(nodes: TheorySectionNode[]): boolean {
    for (const node of nodes) {
      path.push(node.id)
      if (node.id === targetId) {
        return true
      }
      for (const block of node.blocks) {
        if (block.type === 'sections' && walk(block.items)) {
          return true
        }
      }
      path.pop()
    }
    return false
  }

  return walk(theorySections) ? path.slice(0, -1) : []
}
