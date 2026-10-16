import type { Dictionary } from '../i18n/dictionaries'

/**
 * Structure of the Theory page. To add a section, append a node to `theorySections`
 * (top level) or to a `sections` block (nested); every section and subsection heading
 * becomes a collapsible disclosure. `id` becomes the `#theory-...` anchor, `titleKey`
 * must be a string key present in both language dictionaries, `icon` picks a name from
 * the shared inline-SVG set in `TheoryIcons.tsx`. Content is a list of typed blocks:
 * paragraph, bullets, numbered, subheading, callout, code, code-group, terms, highlight,
 * formula (language-independent math, literal), table (headers via i18n, cells either
 * i18n keys or literals for language-independent data such as point names), link
 * (internal route, e.g. `/visualization`), example figure groups, and `sections`
 * (layout: stack | grid | ordered) for nesting further sections. Renamed
 * anchors keep working through `theorySectionAliases`.
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

export type TheoryTableCell = { textKey: TheoryTextKey } | { text: string }

export type TheoryExampleFigureSpec = {
  radius: number
  minPts: number
  captionKey: TheoryTextKey
  compact?: boolean
  bridgePointId?: string
}

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
  | {
      type: 'formula'
      formula: string
      fallback: string
      captionKey: TheoryTextKey
    }
  | { type: 'table'; headerKeys: TheoryTextKey[]; rows: TheoryTableCell[][] }
  | { type: 'link'; to: string; textKey: TheoryTextKey; fullWidth?: boolean }
  | { type: 'example-figure-group'; figures: TheoryExampleFigureSpec[] }
  | { type: 'sections'; layout: 'stack' | 'grid' | 'ordered'; items: TheorySectionNode[] }

export type TheorySectionNode = {
  id: string
  titleKey: TheoryTextKey
  icon?: TheoryIconName
  variant?: 'accent'
  blocks: TheoryBlock[]
}

const distanceFormula = String.raw`d(P, Q) = \sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}`

const quizSections: TheorySectionNode[] = [
  {
    id: 'theory-quiz-1',
    titleKey: 'theoryQuiz1Title',
    blocks: [{ type: 'paragraph', textKey: 'theoryQuiz1Text' }],
  },
  {
    id: 'theory-quiz-2',
    titleKey: 'theoryQuiz2Title',
    blocks: [{ type: 'paragraph', textKey: 'theoryQuiz2Text' }],
  },
  {
    id: 'theory-quiz-3',
    titleKey: 'theoryQuiz3Title',
    blocks: [{ type: 'paragraph', textKey: 'theoryQuiz3Text' }],
  },
]

export const theorySections: TheorySectionNode[] = [
  {
    id: 'theory-why',
    titleKey: 'theoryWhyTitle',
    icon: 'why',
    blocks: [
      { type: 'paragraph', textKey: 'theoryWhyP1' },
      { type: 'paragraph', textKey: 'theoryWhyP2' },
      { type: 'highlight', textKey: 'theoryWhyMain1' },
      { type: 'subheading', textKey: 'theoryWhySubNeed' },
      {
        type: 'bullets',
        textKeys: ['theoryWhyNeed1', 'theoryWhyNeed2', 'theoryWhyNeed3'],
      },
      { type: 'subheading', textKey: 'theoryWhySubWhere' },
      {
        type: 'bullets',
        textKeys: ['theoryWhyWhere1', 'theoryWhyWhere2', 'theoryWhyWhere3'],
      },
      { type: 'highlight', textKey: 'theoryWhyMain2' },
    ],
  },
  {
    id: 'theory-terms',
    titleKey: 'theoryTermsTitle',
    icon: 'idea',
    blocks: [
      { type: 'paragraph', textKey: 'theoryTermsIntro' },
      {
        type: 'terms',
        items: [
          { termKey: 'theoryTermPoint', definitionKey: 'theoryTermPointDef' },
          { termKey: 'theoryTermDistance', definitionKey: 'theoryTermDistanceDef' },
        ],
      },
      {
        type: 'formula',
        formula: distanceFormula,
        fallback: 'd(P, Q) = sqrt((x2 - x1)^2 + (y2 - y1)^2)',
        captionKey: 'theoryDistanceFormulaCaption',
      },
      {
        type: 'terms',
        items: [
          { termKey: 'theoryTermRadius', definitionKey: 'theoryTermRadiusDef' },
          { termKey: 'theoryTermChain', definitionKey: 'theoryTermChainDef' },
          { termKey: 'theoryTermMinPts', definitionKey: 'theoryTermMinPtsDef' },
          { termKey: 'theoryTermClusterNoise', definitionKey: 'theoryTermClusterNoiseDef' },
        ],
      },
      {
        type: 'callout',
        tone: 'important',
        labelKey: 'calloutImportantLabel',
        textKey: 'theoryTermsImportant',
      },
      { type: 'highlight', textKey: 'theoryTermsMain' },
    ],
  },
  {
    id: 'theory-walkthrough',
    titleKey: 'theoryWalkTitle',
    icon: 'steps',
    blocks: [
      { type: 'paragraph', textKey: 'theoryWalkIntro' },
      {
        type: 'numbered',
        items: [
          { titleKey: 'theoryWalkStep1Title', textKey: 'theoryWalkStep1Text' },
          { titleKey: 'theoryWalkStep2Title', textKey: 'theoryWalkStep2Text' },
          { titleKey: 'theoryWalkStep3Title', textKey: 'theoryWalkStep3Text' },
          { titleKey: 'theoryWalkStep4Title', textKey: 'theoryWalkStep4Text' },
          { titleKey: 'theoryWalkStep5Title', textKey: 'theoryWalkStep5Text' },
        ],
      },
      { type: 'callout', tone: 'note', labelKey: 'calloutNoteLabel', textKey: 'theoryWalkNote' },
      {
        type: 'link',
        to: '/visualization',
        textKey: 'theoryWalkLinkText',
        fullWidth: true,
      },
    ],
  },
  {
    id: 'theory-parameters',
    titleKey: 'theoryParamsTitle',
    icon: 'parameters',
    blocks: [
      { type: 'paragraph', textKey: 'theoryParamsIntro' },
      {
        type: 'table',
        headerKeys: ['theoryParamsTableParam', 'theoryParamsTableEffect'],
        rows: [
          [{ textKey: 'theoryParamsRow1Param' }, { textKey: 'theoryParamsRow1Effect' }],
          [{ textKey: 'theoryParamsRow2Param' }, { textKey: 'theoryParamsRow2Effect' }],
          [{ textKey: 'theoryParamsRow3Param' }, { textKey: 'theoryParamsRow3Effect' }],
          [{ textKey: 'theoryParamsRow4Param' }, { textKey: 'theoryParamsRow4Effect' }],
        ],
      },
    ],
  },
  {
    id: 'theory-original',
    titleKey: 'theoryOrigTitle',
    icon: 'compare',
    blocks: [
      { type: 'paragraph', textKey: 'theoryOrigIntro' },
      { type: 'subheading', textKey: 'theoryOrigSubKinds' },
      {
        type: 'terms',
        items: [
          { termKey: 'theoryOrigCore', definitionKey: 'theoryOrigCoreDef' },
          { termKey: 'theoryOrigBorder', definitionKey: 'theoryOrigBorderDef' },
          { termKey: 'theoryOrigNoiseTerm', definitionKey: 'theoryOrigNoiseDef' },
        ],
      },
      { type: 'callout', tone: 'note', labelKey: 'calloutNoteLabel', textKey: 'theoryOrigExam' },
      { type: 'subheading', textKey: 'theoryOrigSubDiff' },
      {
        type: 'table',
        headerKeys: ['theoryOrigTableOrig', 'theoryOrigTableOurs'],
        rows: [
          [{ textKey: 'theoryOrigRow1Orig' }, { textKey: 'theoryOrigRow1Ours' }],
          [{ textKey: 'theoryOrigRow2Orig' }, { textKey: 'theoryOrigRow2Ours' }],
          [{ textKey: 'theoryOrigRow3Orig' }, { textKey: 'theoryOrigRow3Ours' }],
          [{ textKey: 'theoryOrigRow4Orig' }, { textKey: 'theoryOrigRow4Ours' }],
          [{ textKey: 'theoryOrigRow5Orig' }, { textKey: 'theoryOrigRow5Ours' }],
        ],
      },
      { type: 'callout', tone: 'note', labelKey: 'calloutNoteLabel', textKey: 'theoryOrigBridge' },
      { type: 'highlight', textKey: 'theoryOrigMain' },
    ],
  },
  {
    id: 'theory-tradeoffs',
    titleKey: 'theoryTradeTitle',
    icon: 'balance',
    blocks: [
      { type: 'subheading', textKey: 'theoryTradeSubPros' },
      {
        type: 'bullets',
        textKeys: [
          'theoryTradePro1',
          'theoryTradePro2',
          'theoryTradePro3',
          'theoryTradePro4',
        ],
      },
      { type: 'subheading', textKey: 'theoryTradeSubCons' },
      {
        type: 'bullets',
        textKeys: [
          'theoryTradeCon1',
          'theoryTradeCon2',
          'theoryTradeCon3',
          'theoryTradeCon4',
          'theoryTradeCon5',
        ],
      },
      { type: 'subheading', textKey: 'theoryTradeSubWhen' },
      { type: 'subheading', textKey: 'theoryTradeWhenYes' },
      {
        type: 'bullets',
        textKeys: ['theoryTradeYes1', 'theoryTradeYes2'],
      },
      { type: 'subheading', textKey: 'theoryTradeWhenNo' },
      {
        type: 'bullets',
        textKeys: ['theoryTradeNo1', 'theoryTradeNo2'],
      },
      { type: 'highlight', textKey: 'theoryTradeMain' },
    ],
  },
  {
    id: 'theory-summary',
    titleKey: 'theorySumTitle',
    icon: 'cheatsheet',
    variant: 'accent',
    blocks: [
      { type: 'subheading', textKey: 'theorySumIdeaSub' },
      { type: 'paragraph', textKey: 'theorySumIdeaText' },
      { type: 'subheading', textKey: 'theorySumTermsSub' },
      {
        type: 'bullets',
        textKeys: [
          'theorySumTerm1',
          'theorySumTerm2',
          'theorySumTerm3',
          'theorySumTerm4',
        ],
      },
      { type: 'subheading', textKey: 'theorySumAlgoSub' },
      { type: 'paragraph', textKey: 'theorySumAlgoText' },
      { type: 'subheading', textKey: 'theorySumParamsSub' },
      { type: 'paragraph', textKey: 'theorySumParamsText' },
      { type: 'subheading', textKey: 'theorySumErrorsSub' },
      {
        type: 'bullets',
        textKeys: [
          'theorySumError1',
          'theorySumError2',
          'theorySumError3',
          'theorySumError4',
          'theorySumError5',
        ],
      },
      { type: 'subheading', textKey: 'theorySumQuizSub' },
      { type: 'sections', layout: 'stack', items: quizSections },
    ],
  },
]

/**
 * Aliases of removed anchors → closest current section, so old `#theory-...`
 * links keep working. `theory-idea` is the rename alias for `theory-terms`.
 */
export const theorySectionAliases: Record<string, string> = {
  'theory-idea': 'theory-terms',
  'theory-radius': 'theory-parameters',
  'theory-min-pts': 'theory-parameters',
  'theory-strengths': 'theory-tradeoffs',
  'theory-limitations': 'theory-tradeoffs',
  'theory-step-1': 'theory-walkthrough',
  'theory-step-2': 'theory-walkthrough',
  'theory-step-3': 'theory-walkthrough',
  'theory-step-4': 'theory-walkthrough',
  'theory-step-5': 'theory-walkthrough',
  'theory-step-6': 'theory-walkthrough',
  'theory-step-7': 'theory-walkthrough',
  'theory-step-8': 'theory-walkthrough',
  'theory-step-9': 'theory-walkthrough',
}

export function resolveTheorySectionId(id: string): string {
  return theorySectionAliases[id] ?? id
}

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
