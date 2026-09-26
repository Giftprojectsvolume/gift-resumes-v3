// Runs a set of plain-rule checks against a resume's data.
// Every check returns { id, label, status, detail } where status
// is 'pass' | 'warning' | 'fail' — never a claim about a specific
// ATS system, since there is no single universal standard.

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0
}

export function runATSChecklist(data) {
  const checks = []

  checks.push({
    id: 'contact-info',
    label: 'Contact information present',
    status: hasText(data.full_name) && hasText(data.email) && hasText(data.phone) ? 'pass' : 'warning',
    detail: 'Full name, email and phone help a recruiter (and most systems) reach you.',
  })

  checks.push({
    id: 'summary',
    label: 'Professional summary present',
    status: hasText(data.professional_summary) ? 'pass' : 'warning',
    detail: 'A short summary at the top helps both people and parsing software understand your CV quickly.',
  })

  checks.push({
    id: 'work-experience',
    label: 'Work experience section',
    status: data.workExperience && data.workExperience.length > 0 ? 'pass' : 'warning',
    detail:
      data.workExperience && data.workExperience.length > 0
        ? `${data.workExperience.length} role(s) listed.`
        : 'No work experience listed — fine if you are early-career, otherwise worth adding.',
  })

  const missingDates = (data.workExperience || []).filter((job) => !job.start_date && !job.is_current)
  checks.push({
    id: 'work-dates',
    label: 'Work experience dates',
    status: missingDates.length === 0 ? 'pass' : 'warning',
    detail:
      missingDates.length === 0
        ? 'All roles have a start date.'
        : `${missingDates.length} role(s) are missing a start date — dates help establish a clear timeline.`,
  })

  checks.push({
    id: 'education',
    label: 'Education section',
    status: data.education && data.education.length > 0 ? 'pass' : 'warning',
    detail:
      data.education && data.education.length > 0
        ? `${data.education.length} qualification(s) listed.`
        : 'No education listed yet.',
  })

  checks.push({
    id: 'skills',
    label: 'Skills section',
    status: data.skills && data.skills.length >= 3 ? 'pass' : 'warning',
    detail:
      data.skills && data.skills.length > 0
        ? `${data.skills.length} skill(s) listed.`
        : 'No skills listed — even a handful helps readability and keyword matching.',
  })

  const longEntries = (data.workExperience || []).filter(
    (job) => (job.responsibilities || '').length > 1200
  )
  checks.push({
    id: 'entry-length',
    label: 'Work entry length',
    status: longEntries.length === 0 ? 'pass' : 'warning',
    detail:
      longEntries.length === 0
        ? 'Work entries are a reasonable length.'
        : `${longEntries.length} entr${longEntries.length === 1 ? 'y is' : 'ies are'} very long — consider trimming to the most relevant points.`,
  })

  return checks
}

// Very simple keyword-overlap check against a pasted job description.
// Not a scoring system — just surfaces words from the job ad that
// don't appear anywhere in the CV, as a prompt to review, not a verdict.
export function checkJobDescriptionOverlap(data, jobDescription) {
  if (!jobDescription || !jobDescription.trim()) return null

  const stopWords = new Set([
    'the', 'and', 'a', 'an', 'to', 'of', 'in', 'for', 'on', 'with', 'is', 'are', 'be',
    'as', 'at', 'by', 'or', 'that', 'this', 'will', 'you', 'your', 'we', 'our', 'have',
    'has', 'from', 'it', 'their', 'they', 'who', 'which', 'must', 'able', 'work',
  ])

  const resumeText = [
    data.professional_summary,
    ...(data.workExperience || []).map((j) => `${j.job_title} ${j.responsibilities} ${j.achievements}`),
    ...(data.skills || []).map((s) => s.skill_name),
    ...(data.education || []).map((e) => `${e.qualification} ${e.details}`),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  const jobWords = jobDescription
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !stopWords.has(w))

  const uniqueJobWords = [...new Set(jobWords)]
  const missing = uniqueJobWords.filter((w) => !resumeText.includes(w))

  return {
    totalKeywords: uniqueJobWords.length,
    missingKeywords: missing.slice(0, 15),
  }
}
