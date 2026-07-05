/**
 * Resume data. Single source of truth for the /resume page.
 * Kept out of config.ts (which is identity/feeds) because of its size.
 *
 * Copy rules (see CLAUDE.md): no em dashes, no ampersands. Date ranges use the
 * word "to". Write "Anypoint Platform" (no "the").
 */

// Which audience tabs a role belongs to. A role can belong to more than one.
export type Track = 'devrel' | 'swe' | 'books';

export interface ResumeGroup {
  // Optional sub-heading within a role (e.g. "Content creation", "Product").
  heading?: string;
  bullets: string[];
}

export interface ResumeRole {
  title: string;
  org: string;
  employment?: string; // "Permanent Full-time", "Contract Full-time", "Internship", "Freelance", "Self-employed"
  location?: string;
  start: string; // "Jul 2021"
  end: string; // "Present" | "Jun 2021"
  tracks: Track[];
  // 1 to 2 strongest bullets, shown only on the Compact tab (via .resume-highlights).
  // Roles without highlights show header-only in Compact. See resume.astro / ResumeEntry.
  highlights?: string[];
  groups?: ResumeGroup[];
  tools?: string[];
}

// Education, certs, volunteering, publications, and languages each carry an
// optional `tracks`. Same rule as roles: an item shows on an audience tab only
// if it is tagged with that track. Untagged items appear on Full and Compact
// only (they are dropped from the devrel / swe / books views).
export interface EducationItem {
  school: string;
  program: string;
  start: string;
  end: string;
  note?: string;
  tracks?: Track[];
}

export interface CertItem {
  name: string;
  issuer: string;
  issued: string;
  expires?: string;
  credentialId?: string;
  tracks?: Track[];
}

export interface VolunteerItem {
  role: string;
  org: string;
  start: string;
  end: string;
  note?: string;
  tracks?: Track[];
}

export interface PublicationItem {
  title: string;
  publisher: string;
  date: string;
  url?: string;
  blurb: string;
  tracks?: Track[];
}

export interface SpeakingItem {
  /** The event or conference name, e.g. "Montreal Dreamin'". */
  event: string;
  /** City and region for in-person events, or "Online" for virtual ones. This
   *  is what conveys the breadth (North America and online) at a glance. */
  location: string;
  /** Four-digit year the talk was given, e.g. "2025". */
  year: string;
  tracks?: Track[];
}

export interface LanguageItem {
  name: string;
  proficiency: string;
  tracks?: Track[];
}

// A single competency shown as a pill in the Skills section. Same track rule as
// everything else: untagged skills show on Full and Compact only.
export interface SkillItem {
  name: string;
  tracks?: Track[];
  // Present-only attribute in the markup: skills marked hideInCompact are dropped
  // on the Compact tab so the one-pager keeps only the headline competencies.
  hideInCompact?: boolean;
}

export interface SkillCategory {
  category: string;
  skills: SkillItem[];
}

// Most-recent first. Each role is tagged with the tabs it appears in.
export const experience: ResumeRole[] = [
  {
    title: 'Senior Developer Advocate, MuleSoft',
    org: 'Salesforce',
    employment: 'Permanent Full-time',
    location: 'Toronto, Ontario, Canada (Remote)',
    start: 'Jul 2021',
    end: 'Present',
    tracks: ['devrel'],
    highlights: [
      'Speak at developer conferences across North America and produce written and video tutorials that help developers adopt Anypoint Platform.',
      "Launched the company's first official Twitch channel and grew it from zero to 1,000 followers over two years of live-coding content.",
    ],
    groups: [
      {
        heading: 'Content creation',
        bullets: [
          'Speak at developer conferences and meetups across North America, both virtual and in-person, reaching audiences beyond the MuleSoft community.',
          'Produce written and video tutorials across multiple channels that help developers adopt MuleSoft solutions.',
          'Build presentations and live demos for internal and external events.',
          "Launched the company's first official Twitch channel and grew it from zero to 1,000 followers over two years, filling a gap in live-coding content.",
        ],
      },
      {
        heading: 'Product',
        bullets: [
          'Bridge developers and architects in the field with the product teams, routing their questions and feedback on the solutions.',
          'Partner with Product Marketing and Product Management to launch tutorials and demos for new product releases.',
        ],
      },
      {
        heading: 'Community',
        bullets: [
          'Drive community participation in content creation and enablement sessions alongside the community team.',
          'Represent MuleSoft at community conferences and meetups as a moderator and speaker.',
        ],
      },
      {
        heading: 'Internal and Operations',
        bullets: [
          'Established a shared format and standards for developer tutorials, improving consistency across the team.',
          "Collaborated with Web, UI/UX, Creative, and Product teams to improve the official developer site around end users' needs.",
        ],
      },
    ],
  },
  {
    title: 'Founder and Content Creator',
    org: 'ProstDev',
    employment: 'Self-employed',
    location: 'Ontario, Canada (Remote)',
    start: 'Aug 2016',
    end: 'Present',
    tracks: ['devrel'],
    highlights: [
      'Founded and run a bilingual (English and Spanish) tech content platform whose YouTube channel has published over 330 videos, drawing more than 290,000 views and 26,000 hours of watch time.',
      'Coached 20 guest authors to launch their own content; many went on to start their own blogs and YouTube channels, and several became recognized voices in the MuleSoft community.',
    ],
    groups: [
      {
        bullets: [
          'Founded and run a technology content platform, publishing over 330 educational videos across 6 years to a YouTube channel with more than 290,000 views, 26,000 hours of watch time, and 4,400 subscribers.',
          "Grew a flagship beginner's guide series into the channel's top-performing content, with the lead video passing 22,000 views.",
          'Coached 20 guest authors to launch and grow their own content-creation journeys. Many went on to start their own blogs and YouTube channels, and several became recognized voices in the MuleSoft community, including the creator of one of its largest technical YouTube channels.',
          'Produce and edit educational videos, plus the marketing and promotional media around them.',
          "Manage the community and review and edit other authors' content before publication.",
          'Translate and add English and Spanish subtitles to reach a bilingual audience.',
        ],
      },
    ],
  },
  {
    title: 'Co-Founder, Bookkeeper, and Vibe Coder',
    org: 'CleaningPal',
    employment: 'Self-employed',
    location: 'Niagara Falls, Ontario, Canada (Remote)',
    start: 'Mar 2025',
    end: 'Present',
    tracks: ['books', 'swe'],
    highlights: [
      'Co-founded a Niagara-region cleaning services business with online booking.',
      'Own the books end to end: bookkeeping, invoicing, and financial record keeping.',
    ],
    groups: [
      {
        bullets: [
          'Co-founded a cleaning services business serving the Niagara region, with online booking.',
          'Own the books end to end: bookkeeping, invoicing, and financial record keeping.',
          'Built and maintain the booking site by vibe coding.',
        ],
      },
    ],
  },
  {
    title: 'Author',
    org: 'Packt',
    employment: 'Freelance',
    location: 'Remote',
    start: 'Feb 2021',
    end: 'Sep 2022',
    tracks: ['devrel'],
    highlights: [
      'Co-authored the first edition of "MuleSoft for Salesforce Developers" (Packt, 2022), writing chapters of up to 50 pages each.',
    ],
    groups: [
      {
        bullets: [
          "Authored the book's outline and chapter plan.",
          'Wrote chapters of up to 50 pages each, meeting every review deadline.',
          'Collaborated with co-authors, reviewers, and editors across multiple time zones.',
          'Partnered with the marketing department on promotional assets ahead of publication.',
          'Published the first edition of "MuleSoft for Salesforce Developers" through Packt on September 30, 2022.',
        ],
      },
    ],
  },
  {
    title: 'Senior MuleSoft Developer',
    org: 'Bits In Glass',
    employment: 'Permanent Full-time',
    location: 'Toronto, Ontario, Canada',
    start: 'Jun 2018',
    end: 'Jun 2021',
    tracks: ['swe'],
    highlights: [
      'Led MuleSoft API delivery across healthcare, logistics, and airline clients, applying API-Led connectivity with RAML, HL7, and OTA standards.',
      'Technical lead on the airline engagement: mentored up to 10 engineers, planned sprints, and owned shared code standards.',
    ],
    groups: [
      {
        heading: 'Senior MuleSoft Developer · Jun 2018 to Jun 2021',
        bullets: [
          'Built MuleSoft applications integrating third-party APIs, using Maven and Git.',
          'Wrote unit tests with MUnit and regression tests with Postman.',
          'Developed an internal API-testing product using JavaScript, Python, and NodeJS.',
          'Mentored team members on MuleSoft and supported them through MuleSoft certification.',
          'Authored blog posts, videos, KT sessions, and technical documentation to spread MuleSoft knowledge across the company.',
        ],
      },
      {
        heading: 'Health Sector: Senior MuleSoft Developer (Contract) · Nov 2020 to Jan 2021',
        bullets: [
          'Delivered MuleSoft system APIs against the HL7 (Health Level Seven) standard, connecting web services, queues, and Salesforce.',
          'Integrated Salesforce Platform Events and Anypoint MQ to link an external system through system APIs.',
          'Designed RAML specifications for Experience, Process, and System APIs following API-Led connectivity.',
          'Achieved 100% code coverage with MUnit unit tests.',
          'Deployed applications to Runtime Manager across environments, tracking work in JIRA and BitBucket.',
        ],
      },
      {
        heading: 'Warehousing and Logistics: Senior MuleSoft Developer (Contract) · Aug 2020 to Oct 2020',
        bullets: [
          "Built MuleSoft applications integrating Workday and Salesforce web services into the client's processes, using Maven and Git.",
          'Generated SQL database structures with Liquibase for local testing and Amazon Aurora instances.',
          "Connected SFTP folders into MuleSoft integrations.",
          'Deployed applications to Runtime Manager across environments, tracking work in JIRA and BitBucket.',
        ],
      },
      {
        heading: 'Airline Industry: Senior MuleSoft Developer / Technical Leader (Contract) · Jun 2018 to Feb 2020',
        bullets: [
          'Served as technical leader, delivering REST APIs across experience, process, and system layers against the OTA (Online Travel Agency) standard.',
          'Built MuleSoft applications integrating web services, using Maven and Git.',
          'Created MUnit tests, plus Postman regression tests that validated JSON schemas and compared feature branches against development.',
          'Automated API-testing scripts using JavaScript, Python, and NodeJS.',
          "Trained and mentored up to 10 engineers on the project's code, standards, and processes.",
          'Planned sprints with the team, Product Owners, and Business Analysts, and partnered with Delivery and Project Managers to set expectations and hit each delivery.',
          'Owned shared code and standards with fellow technical leaders, and groomed the backlog to sharpen future sprint planning.',
          'Delivered under Scrum and Kanban (Scrumban) methodologies.',
        ],
      },
    ],
    tools: [
      'Anypoint Studio (3.9, 4.2, 4.3 Runtime, Anypoint MQ)',
      'Anypoint Platform (Cloudhub, API Manager, Runtime Manager, Design Center, Exchange, Anypoint MQ)',
      'Maven',
      'Git / Subtree / Git Hooks',
      'Postman / Postman Runner / Newman / Postman API',
      'SoapUI',
      'RESTful Web Services',
      'SOAP Web Services',
      'RAML (1.0)',
      'Python',
      'JavaScript / NodeJS',
      'Bash',
      'Unix commands',
      'SQL',
      'Liquibase',
      'JIRA',
      'BitBucket',
    ],
  },
  {
    title: 'MuleSoft Developer',
    org: 'Accenture',
    employment: 'Full-time',
    location: 'Monterrey, Nuevo León, Mexico',
    start: 'Apr 2016',
    end: 'Jun 2018',
    tracks: ['swe'],
    highlights: [
      'Built MuleSoft and Java integrations for finance and travel-industry clients across multiple engagements.',
      'Delivered RESTful web services with Java and Jersey under Scrum, with Bamboo continuous delivery and Sonar code quality gates.',
    ],
    groups: [
      {
        heading: 'MuleSoft Developer · Finance Industry · Jan 2018 to Jun 2018',
        bullets: [
          'Refactored legacy code to naming conventions and standards.',
          "Managed dependencies with Maven, version control with Git, and continuous integration with Jenkins.",
        ],
      },
      {
        heading: 'Change Management Consultant · Industrial Company · Sep 2017 to Dec 2017',
        bullets: [
          "Delivered change management training to the client's employees, reducing change impact and resistance.",
          'Coordinated the training schedule and end-user materials, and managed all training logistics.',
        ],
      },
      {
        heading: 'MuleSoft Developer · Finance Industry · Jun 2017 to Sep 2017',
        bullets: [
          "Built MuleSoft applications integrating the client's SOAP web services.",
          "Authored technical design documentation for the SOA interface and testing documentation.",
        ],
      },
      {
        heading: 'Java Developer · International Traveling Company · Apr 2016 to May 2017',
        bullets: [
          'Developed new functionality for a RESTful web service using Java and Jersey.',
          'Wrote functional and unit tests with JUnit and maintained the design and reference documentation.',
          'Delivered in Scrum with Bamboo continuous delivery and Sonar code quality gates.',
        ],
      },
    ],
    tools: [
      "MuleSoft's Anypoint Studio",
      "MuleSoft's Anypoint Platform (3.9 Runtime)",
      'SoapUI',
      'SOAP Web Services',
      'RESTful Web Services',
      'Postman',
      'VMware',
      'Maven',
      'Git',
      'Jenkins',
      'Java (Junit, Jersey)',
      'Bash',
      'Bamboo',
      'Sonar',
      'Gradle',
      'Vagrant',
      'VirtualBox',
      'RabbitMQ',
      'JIRA (Scrum)',
    ],
  },
  {
    title: 'Java Developer',
    org: 'BSD Enterprise',
    employment: 'Full-time',
    location: 'Industrial Company, Monterrey, Nuevo León, Mexico',
    start: 'Mar 2016',
    end: 'Apr 2016',
    tracks: ['swe'],
    tools: ["Client's Middleware for creating services."],
  },
  {
    title: 'Web Developer',
    org: 'Espacios de México',
    employment: 'Internship',
    location: 'Commercial Websites and Mobile Applications, Monterrey Area, Mexico',
    start: 'Jun 2015',
    end: 'Dec 2015',
    tracks: ['swe'],
    groups: [
      {
        bullets: [
          'Built admin sites with Laravel (PHP), MySQL, HTML, CSS, and MAMP.',
          'Automated functional tests for web pages using Codeception (PHP), PhantomJS, and Selenium.',
          'Performed manual testing on web pages and mobile applications, and documented the test coverage.',
        ],
      },
    ],
    tools: [
      'PHP (Laravel, Codeception)',
      'PhantomJS',
      'Selenium',
      'HTML',
      'CSS',
      'Sequel Pro (MySQL)',
      'MAMP',
      'Terminal',
      'Axosoft (Scrum)',
      'Git (Bitbucket)',
    ],
  },
  {
    title: 'Software Developer',
    org: 'Nestlé S.A.',
    employment: 'Internship',
    location: 'Food Industry, Frankfurt Am Main Area, Germany',
    start: 'Mar 2015',
    end: 'May 2015',
    tracks: ['swe'],
    groups: [
      {
        bullets: [
          'Built VBA Excel templates that automated export processing through an existing .NET program.',
          'Developed a self-learning "tic tac toe" game in Visual Basic .NET and VBA (MS-Excel) as a "Girls Day" outreach activity.',
        ],
      },
    ],
    tools: [
      'Microsoft Excel Macros (VBA)',
      'Visual Basic .NET',
      'Microsoft SQL Server 2012',
      'Microsoft Visio',
    ],
  },
  {
    title: 'Quality Assurance Tester',
    org: 'Epicor Software Corp',
    employment: 'Internship',
    location: 'Retail Industry, Monterrey, Nuevo León, Mexico',
    start: 'May 2012',
    end: 'Jul 2014',
    tracks: ['swe'],
    groups: [
      {
        bullets: [
          'Authored and executed test plans and manual software tests.',
          'Set up and maintained testing environments.',
          'Trained on C# for application development.',
        ],
      },
    ],
    tools: [
      'Microsoft Word',
      'Microsoft Excel',
      'Microsoft SQL Server 2008 (SQL)',
      'C#',
      'Windows Virtual PC',
    ],
  },
];

export const education: EducationItem[] = [
  {
    // Untagged: baking maps to the local-business side, not bookkeeping.
    school: 'Niagara College',
    program: 'Baking and Pastry Arts / Baker / Pastry Chef',
    start: 'Sep 2023',
    end: 'Apr 2025',
  },
  {
    school: 'Universidad Regiomontana S.C.',
    program: 'Software Engineer',
    start: '2012',
    end: '2017',
    note: 'Activities and societies: Social service on IIDEA A.C.',
    tracks: ['devrel', 'swe'],
  },
  {
    school: 'Frankfurt University of Applied Sciences',
    program: 'Computer Science (B.Sc.)',
    start: '2014',
    end: '2015',
    tracks: ['devrel', 'swe'],
  },
  {
    // Untagged: business foundation, not a clean fit for any single audience.
    school: 'Universidad Regiomontana S.C.',
    program: 'Bachelor of Electronic Business',
    start: '2010',
    end: '2012',
  },
];

export const certifications: CertItem[] = [
  {
    name: 'Certificate of completion: Introduction to agent skills',
    issuer: 'Anthropic',
    issued: 'Jun 2026',
    credentialId: 'rumqc53kpk8f',
    tracks: ['devrel', 'swe'],
  },
  {
    name: 'Certificate of completion: Claude code 101',
    issuer: 'Anthropic',
    issued: 'Jun 2026',
    credentialId: 'zwdkkkdim4my',
    tracks: ['devrel', 'swe'],
  },
  {
    name: 'QuickBooks Online ProAdvisor Advanced Certification',
    issuer: 'Intuit',
    issued: 'May 2026',
    expires: 'Oct 2027',
    tracks: ['books'],
  },
  {
    name: 'QuickBooks Online ProAdvisor Certification',
    issuer: 'Intuit',
    issued: 'May 2026',
    expires: 'Oct 2027',
    tracks: ['books'],
  },
  {
    // Untagged: DEI training, relevant broadly but not a single audience.
    name: 'Self-Guided Foundational Safe Zone Training',
    issuer: 'The Safe Zone Project',
    issued: 'Mar 2025',
    expires: 'Mar 2025',
  },
  {
    // Untagged: DEI training.
    name: 'Introduction to Gender-based Analysis Plus',
    issuer: 'Government of Canada',
    issued: 'Mar 2025',
    expires: 'Mar 2025',
  },
  {
    name: 'Federal Income Tax Level 1 - 2024',
    issuer: 'H&R Block Canada',
    issued: 'Dec 2024',
    expires: 'Apr 2025',
    tracks: ['books'],
  },
  {
    // Untagged: food handling maps to the local-business side, not bookkeeping.
    name: 'Food Handler Certificate',
    issuer: 'Niagara Region Public Health',
    issued: 'May 2024',
    expires: 'Jun 2029',
    credentialId: '4228384324AM',
  },
  {
    name: '(Renewed) MuleSoft Certified Developer - Level 1 (Mule 4)',
    issuer: 'MuleSoft',
    issued: 'Nov 2020',
    expires: 'Nov 2022',
    tracks: ['devrel', 'swe'],
  },
  {
    name: 'VANTIQ Certified Developer',
    issuer: 'VANTIQ',
    issued: 'Aug 2020',
    expires: 'Aug 2020',
    tracks: ['devrel', 'swe'],
  },
  {
    name: 'MuleSoft Certified Integration Architect - Level 1',
    issuer: 'MuleSoft',
    issued: 'May 2020',
    expires: 'May 2022',
    tracks: ['devrel', 'swe'],
  },
  {
    name: 'MuleSoft Certified Platform Architect - Level 1',
    issuer: 'MuleSoft',
    issued: 'Mar 2020',
    expires: 'Mar 2022',
    tracks: ['devrel', 'swe'],
  },
  {
    name: '(Renewed) MuleSoft Certified Developer - API Design Associate',
    issuer: 'MuleSoft',
    issued: 'Mar 2020',
    expires: 'Mar 2022',
    tracks: ['devrel', 'swe'],
  },
  {
    name: '(Renewed) MuleSoft Certified Developer - Integration and API Associate (Mule 3.9)',
    issuer: 'MuleSoft',
    issued: 'Feb 2020',
    expires: 'Feb 2022',
    tracks: ['devrel', 'swe'],
  },
  {
    // Untagged: academic-credential verification, not audience-specific.
    name: 'Verified International Academic Qualifications',
    issuer: 'World Education Services',
    issued: 'Jan 2020',
    expires: 'Jan 2020',
  },
  {
    name: 'MuleSoft Certified Developer - Level 1 (Mule 4)',
    issuer: 'MuleSoft',
    issued: 'Nov 2018',
    expires: 'Nov 2020',
    tracks: ['devrel', 'swe'],
  },
  {
    name: 'Splunk Certified Power User',
    issuer: 'Splunk',
    issued: 'Apr 2018',
    expires: 'Apr 2018',
    credentialId: 'Cert-232257',
    tracks: ['swe'],
  },
  {
    name: 'MuleSoft Certified Developer - API Design Associate (RAML 1.0)',
    issuer: 'MuleSoft',
    issued: 'Mar 2018',
    expires: 'Mar 2020',
    tracks: ['devrel', 'swe'],
  },
  {
    name: 'Splunk Certified User',
    issuer: 'Splunk',
    issued: 'Mar 2018',
    expires: 'Mar 2018',
    credentialId: 'Cert-228862',
    tracks: ['swe'],
  },
  {
    // Untagged: language certificate.
    name: 'EF Level 16, Upper Advanced, CEFR Level C2',
    issuer: 'EF',
    issued: 'Aug 2017',
    expires: 'Aug 2017',
  },
  {
    name: 'MuleSoft Certified Developer - Integration and API Associate',
    issuer: 'MuleSoft',
    issued: 'May 2017',
    expires: 'May 2019',
    tracks: ['devrel', 'swe'],
  },
];

export const volunteering: VolunteerItem[] = [
  {
    // Untagged: community advocacy, not tied to a single resume audience.
    role: 'Council Member',
    org: 'Women In Niagara',
    start: 'Oct 2025',
    end: 'Present',
    note: 'The Women in Niagara Council is an advisory council made up of volunteers that help with programming and advocacy for women in business in Niagara.',
  },
  {
    // Untagged: community wellness, not tied to a single resume audience.
    role: 'Events Volunteer',
    org: 'Safe Space Niagara',
    start: 'Jul 2022',
    end: 'Jul 2024',
    note: 'Attended events with the Founder and Executive Director to help with the setup or to sell some of the articles. All proceedings go toward the organization. Safe Space Niagara offers a safe space in St. Catharines, Ontario for people to participate in various wellness activities, such as art, meditation, yoga, and music.',
  },
  {
    role: 'Lead',
    org: 'Women Who Code',
    start: 'Aug 2020',
    end: 'Jan 2023',
    note: 'Provided mentorship on my areas of expertise so other women can feel empowered to start their journey in technology. Helped to promote WWCode Monterrey to others so the network can grow.',
    tracks: ['devrel', 'swe'],
  },
  {
    role: 'Mentor',
    org: 'Olascoaga MX',
    start: 'Apr 2021',
    end: 'Jul 2022',
    note: 'Part of the WILL program to mentor students in STEM careers from all around Mexico. Held mentorship sessions (once or twice a week) with my mentee to discuss topics that could help her in her professional career or student life. WILL is a mentorship program for women that promotes the development of self-confidence and expands working opportunities.',
    tracks: ['devrel', 'swe'],
  },
  {
    role: 'MuleSoft Meetup Leader',
    org: 'MuleSoft',
    start: 'Jun 2018',
    end: 'Aug 2021',
    note: 'One of the meetup leaders for the Toronto, Online Spanish, and Women Who Mule groups. A group for anyone who wants to explore MuleSoft tools (Mule ESB, CloudHub, and Anypoint Platform) for building SOA, SaaS integration, and API solutions.',
    tracks: ['devrel', 'swe'],
  },
  {
    role: 'MuleSoft Ambassadress',
    org: 'MuleSoft',
    start: 'Jul 2020',
    end: 'Jul 2021',
    note: "Ambassadors help developers connect the world's apps, data, and devices by sharing their passion and experience. They speak at events, publish tutorials, mentor others, and lead by example wherever they are.",
    tracks: ['devrel'],
  },
  {
    role: 'U-ERRE Ambassador',
    org: 'Accenture México',
    start: 'Sep 2016',
    end: 'Jun 2018',
    note: 'Ambassadress for the Universidad Regiomontana (U-ERRE) in Monterrey, Mexico. Managed the connections from the universities and Accenture in order to create initiatives or support events that benefit both parties. Hackathons, academies, and employee discounts were organized and coordinated by us.',
    tracks: ['devrel'],
  },
  {
    // Untagged: community publicity, not tied to a single resume audience.
    role: 'Volunteer',
    org: 'IIDEA a.c.',
    start: 'Aug 2012',
    end: 'Aug 2014',
    note: 'Help with publicity for wheelchair sports.',
  },
];

export const publications: PublicationItem[] = [
  {
    title: 'MuleSoft for Salesforce Developers',
    publisher: 'Packt Publishing',
    date: 'Sep 30, 2022',
    blurb:
      "A practitioner's guide to building scalable Salesforce enterprise integrations with Anypoint Platform and Anypoint Studio, covering how to design, deploy, and manage MuleSoft APIs.",
    tracks: ['devrel', 'swe'],
  },
];

// Events where Alex has spoken. Most-recent first. ADD YOUR OTHER CONFERENCES,
// MEETUPS, AND ONLINE TALKS HERE, one line per event. Use a real city and
// region for in-person events (this is what shows the North America breadth)
// and "Online" for virtual ones. Tag every entry ['devrel'] so it appears on
// the DevRel audience tab (untagged entries show on Full/Compact only).
export const speaking: SpeakingItem[] = [
  {
    event: 'Agentforce World Tour Toronto',
    location: 'Toronto, ON, Canada',
    year: '2025',
    tracks: ['devrel'],
  },
  {
    event: "Montreal Dreamin'",
    location: 'Montreal, QC, Canada',
    year: '2024, 2025',
    tracks: ['devrel'],
  },
  {
    event: 'TDX',
    location: 'San Francisco, CA, USA',
    year: '2022, 2024, 2025',
    tracks: ['devrel'],
  },
  {
    event: "Dreamin' in Color",
    location: 'New Orleans, LA, USA',
    year: '2024',
    tracks: ['devrel'],
  },
  {
    event: 'Dreamforce',
    location: 'San Francisco, CA, USA',
    year: '2023',
    tracks: ['devrel'],
  },
  {
    event: 'Women Who Code CONNECT: Recharge',
    location: 'Online',
    year: '2022',
    tracks: ['devrel'],
  },
  {
    event: "New Relic FutureStack",
    location: 'Las Vegas, NV, USA',
    year: '2022',
    tracks: ['devrel'],
  },
];

export const languages: LanguageItem[] = [
  { name: 'English', proficiency: 'Full professional proficiency', tracks: ['devrel', 'swe', 'books'] },
  { name: 'Spanish', proficiency: 'Native or bilingual proficiency', tracks: ['devrel', 'swe', 'books'] },
];

// Skills shown as pills in the Skills section, grouped by category. Each skill
// is track-tagged (untagged shows on Full and Compact only). hideInCompact drops
// a skill from the Compact one-pager. Seeded from the tools and work below; keep
// it a scannable snapshot, not an exhaustive list.
export const skills: SkillCategory[] = [
  {
    category: 'Integration and APIs',
    skills: [
      { name: 'MuleSoft / Anypoint Platform', tracks: ['swe', 'devrel'] },
      { name: 'RESTful and SOAP web services', tracks: ['swe', 'devrel'] },
      { name: 'API-Led connectivity', tracks: ['swe', 'devrel'] },
      { name: 'RAML', tracks: ['swe', 'devrel'] },
      { name: 'MUnit', tracks: ['swe', 'devrel'], hideInCompact: true },
      { name: 'Postman / Newman', tracks: ['swe', 'devrel'], hideInCompact: true },
      { name: 'HL7', tracks: ['swe'], hideInCompact: true },
    ],
  },
  {
    category: 'Languages and data',
    skills: [
      { name: 'Java', tracks: ['swe'] },
      { name: 'JavaScript / NodeJS', tracks: ['swe'] },
      { name: 'Python', tracks: ['swe'] },
      { name: 'SQL', tracks: ['swe'] },
      { name: 'Bash', tracks: ['swe'], hideInCompact: true },
    ],
  },
  {
    category: 'Developer relations',
    skills: [
      { name: 'Public speaking', tracks: ['devrel'] },
      { name: 'Technical writing', tracks: ['devrel'] },
      { name: 'Video and live-stream production', tracks: ['devrel'] },
      { name: 'Developer tutorials', tracks: ['devrel'] },
      { name: 'Mentoring and coaching', tracks: ['devrel'] },
      { name: 'Community management', tracks: ['devrel'], hideInCompact: true },
      { name: 'Technical editing', tracks: ['devrel'], hideInCompact: true },
    ],
  },
  {
    category: 'Bookkeeping',
    skills: [
      { name: 'QuickBooks Online', tracks: ['books'] },
      { name: 'Invoicing', tracks: ['books'] },
      { name: 'Financial record keeping', tracks: ['books'] },
      { name: 'Canadian small-business tax basics', tracks: ['books'], hideInCompact: true },
    ],
  },
  {
    category: 'Practices and tooling',
    skills: [
      { name: 'Git', tracks: ['swe', 'devrel'] },
      { name: 'CI/CD (Jenkins, Bamboo)', tracks: ['swe'] },
      { name: 'Agile / Scrum / Kanban', tracks: ['swe', 'devrel'] },
      { name: 'JIRA', tracks: ['swe'], hideInCompact: true },
    ],
  },
];

// Professional summary shown atop every tab. Keyed by tab id (not Track) so Full
// and Compact get a summary too. The resume.astro script swaps the text per tab
// (data-tracks cannot do per-tab text). All five keys are required.
export type SummaryTab = 'full' | 'compact' | 'devrel' | 'swe' | 'books';

export const summaries: Record<SummaryTab, string> = {
  full:
    'Developer advocate and software engineer with a decade across MuleSoft integration, developer relations, and technical content. Senior Developer Advocate at Salesforce (MuleSoft), published Packt author, and international conference speaker, with deep hands-on experience delivering REST and SOAP APIs for enterprise clients. Bilingual in English and Spanish.',
  compact:
    'Developer advocate and software engineer: a decade of MuleSoft integration, developer relations, and technical content, with a published book and conference talks across North America.',
  devrel:
    'Senior Developer Advocate at Salesforce (MuleSoft) and founder of a bilingual tech-content platform whose YouTube channel has drawn over 290,000 views and 26,000 hours of watch time across 330-plus videos. Speaks at conferences across North America, produces written and video tutorials, and coaches new authors, 20 to date, several now recognized voices in the MuleSoft community. Authored a Packt book on MuleSoft for Salesforce developers.',
  swe:
    'Software engineer with a decade of MuleSoft and integration work: REST and SOAP APIs, API-Led connectivity, and Java, delivered for healthcare, logistics, airline, and finance clients. Comfortable building with code, from enterprise integrations to a live booking site.',
  books:
    'QuickBooks Online ProAdvisor (Advanced) certified bookkeeper for Canadian small businesses, with hands-on books work at CleaningPal: bookkeeping, invoicing, and financial record keeping.',
};
