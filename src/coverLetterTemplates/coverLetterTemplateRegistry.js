export const COVER_LETTER_TEMPLATE_REGISTRY = [
  {
    slug: 'general-professional',
    name: 'General Professional',
    description: 'A clean, all-purpose cover letter layout.',
    className: 'cl-tpl-general-professional',
  },
  {
    slug: 'entry-level-cl',
    name: 'Entry Level',
    description: 'Friendly and straightforward, for a first job or early career.',
    className: 'cl-tpl-entry-level',
  },
  {
    slug: 'career-change',
    name: 'Career Change',
    description: 'A confident tone suited to moving into a new field.',
    className: 'cl-tpl-career-change',
  },
  {
    slug: 'professional-application',
    name: 'Professional Application',
    description: 'Formal and precise, for corporate or senior roles.',
    className: 'cl-tpl-professional-application',
  },
]

export function getCoverLetterTemplateBySlug(slug) {
  return COVER_LETTER_TEMPLATE_REGISTRY.find((t) => t.slug === slug) || COVER_LETTER_TEMPLATE_REGISTRY[0]
}
