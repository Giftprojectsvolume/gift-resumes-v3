// Starter CV content. Every item is clearly an EXAMPLE the user must replace.
// Nothing here claims the user worked anywhere, studied anywhere or has any skill.

export const STARTER_CATEGORIES = [
  { id: 'admin', label: 'Administration & Office' },
  { id: 'retail', label: 'Retail & Sales' },
  { id: 'customer-service', label: 'Customer Service' },
  { id: 'hospitality', label: 'Hospitality & Tourism' },
  { id: 'healthcare', label: 'Healthcare & Caregiving' },
  { id: 'education', label: 'Education & Teaching' },
  { id: 'construction', label: 'Construction & Skilled Trades' },
  { id: 'security', label: 'Security' },
  { id: 'finance', label: 'Finance & Accounting' },
  { id: 'it', label: 'IT & Technology' },
  { id: 'marketing', label: 'Marketing & Communications' },
  { id: 'logistics', label: 'Logistics & Transport' },
  { id: 'engineering', label: 'Engineering & Technical' },
  { id: 'general', label: 'General / Any Industry' },
  { id: 'student', label: 'Student / Entry Level' },
  { id: 'career-change', label: 'Career Change' },
]

export const PLACEHOLDERS = {
  company: '[Enter Company Name]',
  jobTitle: '[Enter Job Title]',
  institution: '[Enter Institution Name]',
  qualification: '[Enter Qualification]',
  educationDetails: 'Year completed: [Enter Year]',
}

function standardSummary(area) {
  return `Professional and motivated [Job Title] with experience in [${area}]. Skilled in [skill 1], [skill 2] and [skill 3]. Known for [professional strength]. Seeking an opportunity to contribute to [type of organisation/team].`
}

export const STARTERS = {
  admin: {
    summary: standardSummary('administration and office support'),
    duties: [
      'Answer calls and emails and direct enquiries to the right person',
      'Keep filing, records and databases accurate and up to date',
      'Schedule appointments, meetings and diaries',
      'Prepare documents, reports and correspondence',
    ],
    skills: ['Microsoft Office', 'Filing and record keeping', 'Typing accuracy', 'Time management', 'Communication', 'Attention to detail'],
  },
  retail: {
    summary: standardSummary('retail and sales'),
    duties: [
      'Assist customers and recommend suitable products',
      'Process sales and handle cash or card payments accurately',
      'Keep shelves stocked and displays neat',
      'Help with stock counts and receiving deliveries',
    ],
    skills: ['Customer service', 'Cash handling', 'Product knowledge', 'Stock control', 'Teamwork', 'Sales and persuasion'],
  },
  'customer-service': {
    summary: standardSummary('customer service'),
    duties: [
      'Respond to customer enquiries by phone, email or in person',
      'Resolve complaints politely and professionally',
      'Record customer details and issues accurately',
      'Follow up to make sure customers are satisfied',
    ],
    skills: ['Communication', 'Problem solving', 'Patience', 'Active listening', 'Computer literacy', 'Conflict resolution'],
  },
  hospitality: {
    summary: standardSummary('hospitality and tourism'),
    duties: [
      'Welcome guests and respond to their requests',
      'Serve food and drinks or prepare rooms to the required standard',
      'Keep work areas clean and follow hygiene rules',
      'Work with the team during busy periods',
    ],
    skills: ['Guest service', 'Teamwork', 'Food and hygiene standards', 'Working under pressure', 'Communication', 'Flexibility'],
  },
  healthcare: {
    summary: standardSummary('healthcare and caregiving'),
    duties: [
      'Assist patients or clients with daily personal care',
      'Record observations and report concerns to the supervisor',
      'Keep the environment clean, safe and comfortable',
      'Support patients and families with kindness and respect',
    ],
    skills: ['Patient care', 'Compassion', 'Record keeping', 'Infection control', 'Communication', 'Teamwork'],
  },
  education: {
    summary: standardSummary('education and teaching'),
    duties: [
      'Plan and deliver lessons suited to the learners',
      'Mark work and give feedback on progress',
      'Manage the classroom and support learner behaviour',
      'Communicate with parents or guardians',
    ],
    skills: ['Lesson planning', 'Classroom management', 'Communication', 'Patience', 'Assessment and marking', 'Computer literacy'],
  },
  construction: {
    summary: standardSummary('construction and skilled trades'),
    duties: [
      'Carry out work to the required plans and standards',
      'Follow site safety rules and use protective equipment',
      'Use tools and equipment correctly and keep them in good order',
      'Work with the site team to meet deadlines',
    ],
    skills: ['Reading plans', 'Health and safety awareness', 'Use of hand and power tools', 'Teamwork', 'Quality workmanship', 'Time management'],
  },
  security: {
    summary: standardSummary('security'),
    duties: [
      'Patrol the site and check access points',
      'Monitor entry and exit and record visitors',
      'Write incident reports clearly and accurately',
      'Respond calmly to alarms and incidents',
    ],
    skills: ['Observation', 'Report writing', 'Access control', 'Staying calm under pressure', 'Communication', 'Reliability'],
  },
  finance: {
    summary: standardSummary('finance and accounting'),
    duties: [
      'Capture and reconcile transactions accurately',
      'Prepare invoices, statements and payment runs',
      'Assist with month-end reports and reconciliations',
      'Keep financial records organised and confidential',
    ],
    skills: ['Bookkeeping', 'Accounting software', 'Excel', 'Attention to detail', 'Reconciliations', 'Confidentiality'],
  },
  it: {
    summary: standardSummary('IT and technology'),
    duties: [
      'Troubleshoot hardware, software and network problems',
      'Set up and maintain user accounts and devices',
      'Document issues and solutions clearly',
      'Support colleagues or customers with technical questions',
    ],
    skills: ['Troubleshooting', 'Technical support', 'Operating systems', 'Networking basics', 'Documentation', 'Communication'],
  },
  marketing: {
    summary: standardSummary('marketing and communications'),
    duties: [
      'Create content for social media, email or print',
      'Help plan and run campaigns',
      'Track results and report on what worked',
      'Coordinate with designers, suppliers or clients',
    ],
    skills: ['Content writing', 'Social media', 'Campaign planning', 'Basic design tools', 'Reporting results', 'Communication'],
  },
  logistics: {
    summary: standardSummary('logistics and transport'),
    duties: [
      'Load, unload and check goods against delivery documents',
      'Plan routes and deliver on time',
      'Keep vehicles and equipment clean and safe',
      'Complete delivery and stock records accurately',
    ],
    skills: ['Route planning', 'Stock handling', 'Documentation', 'Time management', 'Road safety', 'Reliability'],
  },
  engineering: {
    summary: standardSummary('engineering and technical work'),
    duties: [
      'Assist with design, installation or maintenance work',
      'Read drawings and technical specifications',
      'Test equipment and record the results',
      'Follow safety and quality procedures',
    ],
    skills: ['Technical drawings', 'Maintenance and repairs', 'Problem solving', 'Health and safety', 'Measuring and testing', 'Teamwork'],
  },
  general: {
    summary: standardSummary('industry/area'),
    duties: [
      'Complete daily tasks accurately and on time',
      'Work with colleagues to meet team goals',
      'Communicate clearly with customers, suppliers or managers',
      'Learn new tasks quickly and follow procedures',
    ],
    skills: ['Communication', 'Teamwork', 'Time management', 'Reliability', 'Problem solving', 'Computer literacy'],
  },
  student: {
    summary:
      'Motivated [student / recent graduate / school leaver] seeking an entry-level [Job Title] position. Strong in [skill 1], [skill 2] and [skill 3] and keen to learn. Known for [professional strength]. Looking for an opportunity to start a career with [type of organisation/team].',
    duties: [
      'Describe what you did in a part-time job, internship, volunteer role or school project',
      'Say what you were responsible for',
      'Mention a task you did well',
      'Add what you learned',
    ],
    skills: ['Willingness to learn', 'Communication', 'Teamwork', 'Time management', 'Computer literacy', 'Reliability'],
  },
  'career-change': {
    summary:
      'Adaptable [Job Title] moving into [new industry/area] after experience in [previous industry/area]. Skilled in [transferable skill 1], [transferable skill 2] and [transferable skill 3]. Known for [professional strength]. Seeking an opportunity to apply these skills at [type of organisation/team].',
    duties: [
      'Describe a task from your previous work that is useful in your new field',
      'Show a responsibility that carries over to the new role',
      'Mention any training or short course for the new field',
      'Highlight skills you used in both fields',
    ],
    skills: ['Adaptability', 'Communication', 'Problem solving', 'Time management', 'Teamwork', 'Learning new systems'],
  },
}

export function formatExampleDuties(duties) {
  return duties.map((d) => `[Example: ${d}]`).join('\n')
}

export function formatExampleSkill(name) {
  return `[Example] ${name}`
    }
