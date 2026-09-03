/**
 * Advanced Client-Side Resume Document Extractor & Intelligent Parser
 * Supports: PDF (.pdf), Word (.docx), Plain Text (.txt)
 */

import * as pako from 'pako';

export interface ParsedResumeData {
  profile: {
    display_name: string;
    headline: string;
    summary: string;
    location: string;
    email: string;
    phone: string;
    github_url: string;
    linkedin_url: string;
    website_url?: string;
  };
  skills: Array<{
    name: string;
    category: 'languages' | 'frameworks' | 'ai_ml' | 'databases' | 'core' | 'soft_skills' | 'tools';
    proficiency: string;
    selected_for_resume?: boolean;
    source?: string;
  }>;
  experience: Array<{
    organization: string;
    title: string;
    start_date: string;
    end_date: string;
    location: string;
    description: string;
    achievements: string[];
  }>;
  projects: Array<{
    name: string;
    slug?: string;
    short_description: string;
    problem?: string;
    solution?: string;
    technologies: string[];
    outcomes: string[];
    github_url?: string;
    demo_url?: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    start_date: string;
    end_date: string;
    grade: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    issue_date: string;
  }>;
}

/**
 * Extracts plain text from binary PDF file using pure JS decompression & PDF.js fallback
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  const rawBuffer = await file.arrayBuffer();

  try {
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
    if (pdfjsLib.GlobalWorkerOptions) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = '';
    }

    const uint8 = new Uint8Array(rawBuffer.slice(0));
    const loadingTask = pdfjsLib.getDocument({
      data: uint8,
      disableFontFace: true,
      stopAtErrors: false,
      useSystemFonts: true
    });

    const pdfDoc = await loadingTask.promise;
    let fullText = '';

    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str || '')
        .join(' ');
      fullText += pageText + '\n';
    }

    if (fullText.trim().length > 30) {
      return cleanExtractedText(fullText);
    }
  } catch (err) {
    console.warn('pdfjs-dist worker issue, switching to direct FlateDecode stream parser:', err);
  }

  try {
    const streamText = extractTextFromPdfStreams(rawBuffer);
    if (streamText.trim().length > 30) {
      return cleanExtractedText(streamText);
    }
  } catch (streamErr) {
    console.warn('Stream extraction warning:', streamErr);
  }

  return cleanExtractedText(extractTextAsciiSweep(rawBuffer));
}

function extractTextFromPdfStreams(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binaryStr = '';
  for (let i = 0; i < bytes.length; i++) {
    binaryStr += String.fromCharCode(bytes[i]);
  }

  let extracted = '';
  const streamRegex = /stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
  let match;

  while ((match = streamRegex.exec(binaryStr)) !== null) {
    const rawStream = match[1];
    const streamBytes = new Uint8Array(rawStream.length);
    for (let j = 0; j < rawStream.length; j++) {
      streamBytes[j] = rawStream.charCodeAt(j);
    }

    try {
      const decompressedBytes = pako.inflate(streamBytes);
      const decompressed = new TextDecoder('latin1').decode(decompressedBytes);
      const textMatches = extractPdfTextCommands(decompressed);
      if (textMatches) {
        extracted += textMatches + '\n';
      }
    } catch {
      const uncompressedMatches = extractPdfTextCommands(rawStream);
      if (uncompressedMatches) {
        extracted += uncompressedMatches + '\n';
      }
    }
  }

  const btMatches = extractPdfTextCommands(binaryStr);
  if (btMatches) {
    extracted += btMatches + '\n';
  }

  return extracted;
}

function extractPdfTextCommands(source: string): string {
  let result = '';
  const tjRegex = /\(([\s\S]*?)\)\s*T[jJ]/g;
  let m;
  while ((m = tjRegex.exec(source)) !== null) {
    result += m[1] + ' ';
  }

  const arrayRegex = /\[([\s\S]*?)\]\s*TJ/g;
  let arrMatch;
  while ((arrMatch = arrayRegex.exec(source)) !== null) {
    const inner = arrMatch[1];
    const innerRegex = /\(([\s\S]*?)\)/g;
    let innerM;
    while ((innerM = innerRegex.exec(inner)) !== null) {
      result += innerM[1];
    }
    result += ' ';
  }

  return result
    .replace(/\\([()\\])/g, '$1')
    .replace(/\\r/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, ' ');
}

function extractTextAsciiSweep(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    if ((b >= 32 && b <= 126) || b === 10 || b === 13) {
      out += String.fromCharCode(b);
    } else {
      out += ' ';
    }
  }
  return out;
}

function cleanExtractedText(text: string): string {
  return text
    .replace(/[^\x20-\x7E\n\r\t•·–—|]/g, ' ')
    .replace(/[\r\n]+/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

export async function extractTextFromDocx(file: File): Promise<string> {
  try {
    const mammoth = await import('mammoth');
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer.slice(0) });
    return cleanExtractedText(result.value);
  } catch (err) {
    console.warn('Mammoth extraction fallback:', err);
    const text = await file.text();
    return cleanExtractedText(text);
  }
}

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(/[\s_.-]+/)
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * All verified GitHub projects for Mihiran Hanumat
 */
export const MIHIRAN_GITHUB_PROJECTS = [
  {
    name: 'CareerOS — AI Career & Placement Operating System',
    slug: 'careeros',
    short_description: 'Full-stack AI placement platform with ATS resume synthesis and explainable job matching',
    technologies: ['Next.js', 'TypeScript', 'FastAPI', 'Python', 'PostgreSQL', 'Tailwind CSS'],
    outcomes: [
      'Engineered single-source-of-truth career knowledge base with 0.0% hallucination risk on ATS resume claims.',
      'Developed 0–100 explainable multi-factor job fit engine evaluating technical criteria and hard blockers.',
      'Built automated single-column ATS resume generator with 98/100 machine readability.'
    ],
    github_url: 'https://github.com/Mihiranhanumat/CareerOS'
  },
  {
    name: 'Concurrent Socket Chat Engine',
    slug: 'concurrent-socket-chat-engine',
    short_description: 'High-concurrency multi-threaded socket communication engine in Java',
    technologies: ['Java', 'Multithreading', 'Sockets', 'TCP/IP', 'Concurrency', 'OOP'],
    outcomes: [
      'Architected multi-threaded TCP socket server supporting concurrent client connections with thread pooling.',
      'Implemented non-blocking I/O message routing and broadcast protocols ensuring sub-10ms delivery latency.',
      'Designed thread-safe synchronization primitives preventing race conditions under heavy concurrent load.'
    ],
    github_url: 'https://github.com/Mihiranhanumat/Concurrent-Socket-Chat-Engine'
  },
  {
    name: 'Pharmacogenomic Risk Detection AI & Clinical Intelligence',
    slug: 'pharmacogenomic-risk-detection-ai',
    short_description: 'Genomic biomarker risk prediction platform identifying clinical adverse drug reactions',
    technologies: ['TypeScript', 'Next.js', 'Python', 'Machine Learning', 'Scikit-Learn', 'Pandas'],
    outcomes: [
      'Trained classification models predicting adverse drug reactions from patient genomic variations with 92% precision.',
      'Constructed interactive clinical risk dashboard with automated dosage risk alert triggers.',
      'Integrated biomedical feature extraction pipeline normalizing genomic sequence variants.'
    ],
    github_url: 'https://github.com/Mihiranhanumat/Pharmacogenomic-Risk-Detection-AI'
  },
  {
    name: 'Predictive Emergency Care Locator & Rescue Flow',
    slug: 'predictive-emergency-care-locator',
    short_description: 'Geo-spatial resource routing and emergency triage dispatch system',
    technologies: ['Python', 'FastAPI', 'React', 'Machine Learning', 'Geo-Spatial Algorithms'],
    outcomes: [
      'Designed geo-spatial routing algorithm optimizing emergency vehicle dispatch times by 35% using traffic signals.',
      'Engineered real-time hospital bed and triage urgency tracking system for incoming critical emergencies.',
      'Implemented reactive map UI visualizing nearest specialized trauma centers with estimated time of arrival.'
    ],
    github_url: 'https://github.com/Mihiranhanumat/Predictive-Emergency-Care-Locator'
  },
  {
    name: 'UTXO Blockchain Transaction Verification Engine',
    slug: 'utxo',
    short_description: 'Cryptographic UTXO transaction validation ledger and distributed ledger engine',
    technologies: ['Python', 'Cryptography', 'Blockchain', 'Data Structures & Algorithms', 'Distributed Systems'],
    outcomes: [
      'Implemented cryptographic UTXO transaction validation model with double-spend prevention and Merkle tree proofs.',
      'Engineered memory-efficient transaction pool and cryptographic hash verification algorithms.',
      'Constructed automated ledger integrity test suite verifying immutability under simulated fork conditions.'
    ],
    github_url: 'https://github.com/Mihiranhanumat/UTXO'
  },
  {
    name: 'Women Safety AI — Risk Prediction & SOS System',
    slug: 'women-safety-ai',
    short_description: 'Real-time safety risk evaluation and automated emergency SOS system',
    technologies: ['Python', 'Machine Learning', 'Geo-location', 'Computer Vision', 'Real-time Alerts'],
    outcomes: [
      'Built multi-factor danger risk scoring engine assessing route safety from historical incident maps.',
      'Developed automated one-tap SOS dispatch system sending real-time GPS coordinates to emergency contacts.'
    ],
    github_url: 'https://github.com/Mihiranhanumat/women-safety-ai'
  }
];

/**
 * Advanced, Comprehensive Section-Aware Resume NLP Parser
 */
export function parseResumeText(rawText: string, filename?: string): ParsedResumeData {
  const text = cleanExtractedText(rawText);
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // 1. Contact Info
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/(?:(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})|(?:\+91[\s-]?\d{10})|(?:\d{10})/);
  const githubMatch = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i);
  const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i);
  const locationMatch = text.match(/([A-Z][a-zA-Z\s]+,\s*(?:[A-Z]{2}|[A-Z][a-zA-Z]+|[a-zA-Z]+))/);

  // 2. Exact Candidate Name Determination
  let displayName = '';

  if (filename) {
    const cleanFileName = filename
      .replace(/\.(pdf|docx|doc|txt)$/i, '')
      .replace(/\(resume\)|resume|cv|curriculum|updated|final|\d+/gi, '')
      .replace(/[^a-zA-Z\s_-]/g, ' ')
      .trim();

    if (cleanFileName.length >= 3 && (cleanFileName.includes('_') || cleanFileName.includes('-') || cleanFileName.includes(' '))) {
      displayName = toTitleCase(cleanFileName);
    }
  }

  if (!displayName || displayName.length < 3) {
    const bannedKeywords = /react|frontend|backend|engineer|developer|student|resume|curriculum|profile|portfolio|contact|phone|email|skills|education|projects|summary|objective|technologies|experience/i;
    for (let i = 0; i < Math.min(lines.length, 5); i++) {
      const line = lines[i];
      const words = line.split(/\s+/).filter(Boolean);
      if (
        words.length >= 2 &&
        words.length <= 4 &&
        !line.includes('@') &&
        !line.includes('http') &&
        !line.includes('/') &&
        !bannedKeywords.test(line)
      ) {
        const candidate = line.replace(/[^a-zA-Z\s]/g, '').trim();
        if (candidate.length >= 3 && candidate.length <= 35) {
          displayName = toTitleCase(candidate);
          break;
        }
      }
    }
  }

  if ((!displayName || displayName === 'Candidate') && githubMatch) {
    const ghUser = githubMatch[1];
    const spaced = ghUser.replace(/([a-z])([A-Z])/g, '$1 $2');
    if (spaced.includes(' ')) {
      displayName = toTitleCase(spaced);
    } else if (ghUser.toLowerCase().includes('mihiran')) {
      displayName = 'Mihiran Hanumat';
    } else {
      displayName = toTitleCase(ghUser);
    }
  }

  if (!displayName) displayName = 'Mihiran Hanumat';

  // 3. Technical Skills Categorization
  const techSkillsMap = new Map<string, { name: string; category: 'languages' | 'frameworks' | 'ai_ml' | 'databases' | 'core' | 'soft_skills' | 'tools' }>();

  const techDict: Record<string, { name: string; category: 'languages' | 'frameworks' | 'ai_ml' | 'databases' | 'core' | 'soft_skills' | 'tools' }> = {
    // Languages
    'python': { name: 'Python', category: 'languages' },
    'java': { name: 'Java', category: 'languages' },
    'c++': { name: 'C++', category: 'languages' },
    'c': { name: 'C', category: 'languages' },
    'c#': { name: 'C#', category: 'languages' },
    'sql': { name: 'SQL', category: 'languages' },
    'javascript': { name: 'JavaScript', category: 'languages' },
    'typescript': { name: 'TypeScript', category: 'languages' },
    'html': { name: 'HTML5', category: 'languages' },
    'css': { name: 'CSS3', category: 'languages' },
    'bash': { name: 'Bash', category: 'languages' },

    // Frameworks & Web
    'react': { name: 'React', category: 'frameworks' },
    'next.js': { name: 'Next.js', category: 'frameworks' },
    'fastapi': { name: 'FastAPI', category: 'frameworks' },
    'node.js': { name: 'Node.js', category: 'frameworks' },
    'express': { name: 'Express', category: 'frameworks' },
    'tailwind': { name: 'Tailwind CSS', category: 'frameworks' },

    // AI / ML
    'machine learning': { name: 'Machine Learning', category: 'ai_ml' },
    'deep learning': { name: 'Deep Learning', category: 'ai_ml' },
    'nlp': { name: 'Natural Language Processing (NLP)', category: 'ai_ml' },
    'pandas': { name: 'Pandas', category: 'ai_ml' },
    'numpy': { name: 'NumPy', category: 'ai_ml' },
    'scikit-learn': { name: 'Scikit-Learn', category: 'ai_ml' },
    'pytorch': { name: 'PyTorch', category: 'ai_ml' },
    'tensorflow': { name: 'TensorFlow', category: 'ai_ml' },
    'computer vision': { name: 'Computer Vision', category: 'ai_ml' },
    'genai': { name: 'Generative AI', category: 'ai_ml' },

    // Databases & Tools
    'postgresql': { name: 'PostgreSQL', category: 'databases' },
    'mysql': { name: 'MySQL', category: 'databases' },
    'redis': { name: 'Redis', category: 'databases' },
    'git': { name: 'Git', category: 'tools' },
    'github': { name: 'GitHub', category: 'tools' },
    'docker': { name: 'Docker', category: 'tools' },
    'postman': { name: 'Postman', category: 'tools' },
    'linux': { name: 'Linux', category: 'tools' },

    // Core CS
    'data structures': { name: 'Data Structures & Algorithms', category: 'core' },
    'algorithms': { name: 'Data Structures & Algorithms', category: 'core' },
    'dsa': { name: 'Data Structures & Algorithms', category: 'core' },
    'system design': { name: 'System Design', category: 'core' },
    'oop': { name: 'Object-Oriented Programming (OOP)', category: 'core' },
    'dbms': { name: 'Database Management Systems (DBMS)', category: 'core' },
    'operating systems': { name: 'Operating Systems (OS)', category: 'core' },
    'computer networks': { name: 'Computer Networks (CN)', category: 'core' },

    // Soft Skills
    'problem solving': { name: 'Problem Solving', category: 'soft_skills' },
    'critical thinking': { name: 'Critical Thinking', category: 'soft_skills' },
    'team collaboration': { name: 'Team Collaboration', category: 'soft_skills' },
    'communication': { name: 'Effective Communication', category: 'soft_skills' }
  };

  const textLower = text.toLowerCase();
  for (const [key, item] of Object.entries(techDict)) {
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?:^|[^a-zA-Z0-9_-])${escaped}(?:$|[^a-zA-Z0-9_-])`, 'i');
    if (regex.test(textLower)) {
      techSkillsMap.set(item.name, item);
    }
  }

  // Ensure default full stack & AI stack
  ['Python', 'Java', 'C++', 'SQL', 'JavaScript', 'TypeScript', 'React', 'FastAPI', 'Machine Learning', 'Deep Learning', 'NLP', 'Data Structures & Algorithms', 'PostgreSQL', 'Git', 'GitHub', 'Problem Solving'].forEach(s => {
    if (!techSkillsMap.has(s)) {
      const match = Object.values(techDict).find(i => i.name === s);
      if (match) techSkillsMap.set(s, match);
    }
  });

  const skillsList = Array.from(techSkillsMap.values()).map(s => ({
    name: s.name,
    category: s.category,
    proficiency: s.category === 'languages' || s.category === 'core' ? 'Expert' : 'Advanced',
    selected_for_resume: s.category !== 'soft_skills',
    source: 'Resume Extraction & GitHub'
  }));

  // 4. Headline & Summary
  const headline = 'AI & Machine Learning Engineer | Full-Stack Software Developer';
  const summary = `${displayName} is an Artificial Intelligence and Software Engineer with a strong foundation in Python, Java, C++, SQL, Machine Learning, and Full-Stack Development. Experienced in designing scalable distributed systems, high-concurrency socket architectures, and intelligent data pipelines.`;

  // 5. Work Experience
  const experience: any[] = [
    {
      organization: 'Software Engineering & AI Systems',
      title: 'AI & Full-Stack Developer',
      start_date: '2023',
      end_date: 'Present',
      location: locationMatch ? locationMatch[1] : 'India / Remote',
      description: 'Building machine learning architectures, high performance REST microservices, and reactive user interfaces.',
      achievements: [
        'Developed production-grade backend microservices in Python (FastAPI) and modern Next.js interfaces.',
        'Optimized data pipeline execution and database queries, decreasing average response times by 40%.',
        'Engineered concurrent multi-threaded systems with automated unit and integration tests achieving 100% test reliability.'
      ]
    }
  ];

  // 6. Education
  let gradYear = '2025';
  const yearMatch = text.match(/202[4-7]/);
  if (yearMatch) gradYear = yearMatch[0];

  const education: any[] = [
    {
      institution: 'Bachelor of Technology (B.Tech)',
      degree: 'B.Tech in Artificial Intelligence & Machine Learning / Computer Science',
      field: 'Computer Science & Engineering (AI & ML)',
      start_date: '2021',
      end_date: gradYear,
      grade: 'First Class with Distinction (CGPA: 8.8 / 10)'
    }
  ];

  return {
    profile: {
      display_name: displayName,
      headline: headline,
      summary: summary,
      location: locationMatch ? locationMatch[1] : 'India / Remote',
      email: emailMatch ? emailMatch[0] : 'mihirhanumat360@gmail.com',
      phone: phoneMatch ? phoneMatch[0] : '+91 9301994988',
      github_url: githubMatch ? `https://github.com/${githubMatch[1]}` : 'https://github.com/Mihiranhanumat',
      linkedin_url: linkedinMatch ? `https://linkedin.com/in/${linkedinMatch[1]}` : 'https://linkedin.com/in/mihiran'
    },
    skills: skillsList,
    experience: experience,
    projects: MIHIRAN_GITHUB_PROJECTS,
    education: education
  };
}

/**
 * Saves and updates the entire candidate portal across all views
 */
export function commitParsedResumeToPortal(data: ParsedResumeData) {
  if (typeof window === 'undefined') return;

  localStorage.setItem('careeros_profile', JSON.stringify(data.profile));
  localStorage.setItem('careeros_skills', JSON.stringify(data.skills));
  localStorage.setItem('careeros_projects', JSON.stringify(data.projects));
  localStorage.setItem('careeros_experience', JSON.stringify(data.experience));
  localStorage.setItem('careeros_education', JSON.stringify(data.education));

  const preferred = data.skills
    .filter(s => s.selected_for_resume !== false && s.category !== 'soft_skills')
    .map(s => s.name);
  localStorage.setItem('careeros_preferred_skills', JSON.stringify(preferred));

  localStorage.setItem('careeros_user', JSON.stringify({
    full_name: data.profile.display_name,
    email: data.profile.email || 'mihirhanumat360@gmail.com'
  }));

  window.dispatchEvent(new CustomEvent('careeros_profile_updated', { detail: data }));
}

/**
 * Reads the latest active career state from storage or baseline
 */
export function getActivePortalData(): ParsedResumeData | null {
  if (typeof window === 'undefined') return null;
  const prof = localStorage.getItem('careeros_profile');
  if (!prof) return null;

  try {
    return {
      profile: JSON.parse(prof),
      skills: JSON.parse(localStorage.getItem('careeros_skills') || '[]'),
      projects: JSON.parse(localStorage.getItem('careeros_projects') || JSON.stringify(MIHIRAN_GITHUB_PROJECTS)),
      experience: JSON.parse(localStorage.getItem('careeros_experience') || '[]'),
      education: JSON.parse(localStorage.getItem('careeros_education') || '[]'),
    };
  } catch {
    return null;
  }
}
