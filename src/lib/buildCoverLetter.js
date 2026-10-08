// Builds a first-draft cover letter ONLY from facts in the user's CV
// and the details they type in. Nothing is invented.
// Any CV text still in [square brackets] (unfinished starter text) is ignored.

const PLACEHOLDER = /\[[^\]]*\]/

function clean(value) {
  if (typeof value !== 'string') return ''
  const trimmed = value.trim()
  if (!trimmed || PLACEHOLDER.test(trimmed)) return ''
  return trimmed
}

function cleanLines(text, max) {
  if (typeof text !== 'string') return []
  return text
    .split('\n')
    .map((line) => line.replace(/^[\s\-•*–]+/, '').trim())
    .filter((line) => line && !PLACEHOLDER.test(line))
    .slice(0, max)
}

function joinList(items) {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

function yearOf(dateString) {
  return typeof dateString === 'string' && /^\d{4}/.test(dateString) ? dateString.slice(0, 4) : ''
}

export function buildCoverLetter(cv, details) {
  const resume = cv.resume || {}
  const work = (cv.workExperience || []).filter((job) => clean(job.job_title) || clean(job.employer))
  const education = (cv.education || []).filter((e) => clean(e.qualification))
  const skills = (cv.skills || []).map((s) => clean(s.skill_name)).filter(Boolean)
  const certifications = (cv.certifications || []).map((c) => clean(c.certificate_name)).filter(Boolean)
  const languages = (cv.languages || []).map((l) => clean(l.language)).filter(Boolean)
  const summary = clean(resume.professional_summary)
  const name = clean(resume.full_name)

  const company = (details.company || '').trim()
  const jobTitle = (details.jobTitle || '').trim()
  const manager = (details.hiringManager || '').trim()
  const extra = (details.extra || '').trim()

  let usedCvFacts = false
  const paragraphs = []

  paragraphs.push(manager ? `Dear ${manager},` : 'Dear Hiring Manager,')

  if (jobTitle && company) {
    paragraphs.push(`I am writing to apply for the ${jobTitle} position at ${company}.`)
  } else if (jobTitle) {
    paragraphs.push(`I am writing to apply for the ${jobTitle} position.`)
  } else if (company) {
    paragraphs.push(`I am writing to express my interest in working at ${company}.`)
  } else {
    paragraphs.push('I am writing to express my interest in a position with your organisation.')
  }

  if (summary) {
    paragraphs.push(`About me: ${summary}`)
    usedCvFacts = true
  }

  if (work.length > 0) {
    const main = work.find((job) => job.is_current) || work[0]
    const isCurrent = !!main.is_current
    const title = clean(main.job_title)
    const employer = clean(main.employer)
    const startYear = yearOf(main.start_date)
    const lead = isCurrent ? 'I currently work' : 'Most recently, I worked'

    let sentence
    if (title && employer) {
      sentence = `${lead} as ${title} at ${employer}${isCurrent && startYear ? `, where I have been since ${startYear}` : ''}.`
    } else if (title) {
      sentence = `${lead} as ${title}.`
    } else {
      sentence = `${lead} at ${employer}.`
    }
    paragraphs.push(sentence)
    usedCvFacts = true

    const duties = cleanLines(main.responsibilities, 4)
    if (duties.length > 0) {
      paragraphs.push(
        `${isCurrent ? 'My responsibilities include' : 'My responsibilities included'}:\n${duties.map((d) => `• ${d}`).join('\n')}`
      )
    }

    const achievements = cleanLines(main.achievements, 3)
    if (achievements.length > 0) {
      paragraphs.push(
        `${isCurrent ? 'Some of my achievements in this role include' : 'Some of my achievements in this role included'}:\n${achievements.map((a) => `• ${a}`).join('\n')}`
      )
    }

    const others = work
      .filter((job) => job !== main)
      .map((job) => {
        const t = clean(job.job_title)
        const e = clean(job.employer)
        return t && e ? `${t} at ${e}` : ''
      })
      .filter(Boolean)
      .slice(0, 2)
    if (others.length > 0) {
      paragraphs.push(`I also have work experience as ${joinList(others)}.`)
    }
  }

  if (skills.length > 0) {
    paragraphs.push(`My key skills include ${joinList(skills.slice(0, 8))}.`)
    usedCvFacts = true
  }

  if (education.length > 0) {
    const items = education.slice(0, 2).map((e) => {
      const qualification = clean(e.qualification)
      const institution = clean(e.institution)
      return institution ? `${qualification} at ${institution}` : qualification
    })
    paragraphs.push(`My education includes ${joinList(items)}.`)
    usedCvFacts = true
  }

  if (certifications.length > 0) {
    const list = certifications.slice(0, 3)
    paragraphs.push(`I also hold the following certification${list.length > 1 ? 's' : ''}: ${joinList(list)}.`)
    usedCvFacts = true
  }

  if (languages.length > 0) {
    paragraphs.push(`My languages include ${joinList(languages.slice(0, 4))}.`)
    usedCvFacts = true
  }

  if (extra) paragraphs.push(extra)

  if (!usedCvFacts) return null

  paragraphs.push(
    `I would welcome the opportunity to discuss how I can contribute${company ? ` to ${company}` : ' to your team'}. Thank you for considering my application.`
  )
  paragraphs.push(`${manager ? 'Yours sincerely' : 'Yours faithfully'},\n${name || '[Your Name]'}`)

  return paragraphs.join('\n\n')
    }
