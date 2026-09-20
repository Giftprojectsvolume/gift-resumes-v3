const DEFAULT_ORDER = ['summary', 'experience', 'education', 'skills', 'certifications', 'languages', 'references']
const ENTRY_LEVEL_ORDER = ['summary', 'education', 'skills', 'experience', 'certifications', 'languages', 'references']

export const TEMPLATE_REGISTRY = [
  {
    slug: 'clean-professional',
    name: 'Clean Professional',
    description: 'Simple, modern and easy to read.',
    className: 'tpl-clean-professional',
    sectionOrder: DEFAULT_ORDER,
  },
  {
    slug: 'ats-friendly',
    name: 'ATS Friendly',
    description: 'Minimal formatting, built to parse cleanly.',
    className: 'tpl-ats-friendly',
    sectionOrder: DEFAULT_ORDER,
  },
  {
    slug: 'modern-professional',
    name: 'Modern Professional',
    description: 'More visual, while staying professional.',
    className: 'tpl-modern-professional',
    sectionOrder: DEFAULT_ORDER,
  },
  {
    slug: 'entry-level',
    name: 'Entry Level',
    description: 'Leads with education and skills.',
    className: 'tpl-entry-level',
    sectionOrder: ENTRY_LEVEL_ORDER,
  },
]

export function getTemplateBySlug(slug) {
  return TEMPLATE_REGISTRY.find((t) => t.slug === slug) || TEMPLATE_REGISTRY[0]
}
