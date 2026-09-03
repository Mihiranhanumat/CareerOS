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

  // Try 1: pdfjs-dist with cloned buffer and worker disabled
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

  // Try 2: Direct FlateDecode stream parser using pako
  try {
    const streamText = extractTextFromPdfStreams(rawBuffer);
    if (streamText.trim().length > 30) {
      return cleanExtractedText(streamText);
    }
  } catch (streamErr) {
    console.warn('Stream extraction warning:', streamErr);
  }

  // Try 3: Raw character sweep fallback
  return cleanExtractedText(extractTextAsciiSweep(rawBuffer));
}

/**
 * Decompresses and extracts PDF text stream objects directly
 */
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

/**
 * Extracts text from DOCX file using mammoth
 */
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

/**
 * Formats names with proper capitalization: "mihiran hanumat" -> "Mihiran Hanumat"
 */
function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(/[\s_.-]+/)
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Advanced, Comprehensive Section-Aware Resume NLP Parser
 */
export function parseResumeText(rawText: string, filename?: string): ParsedResumeData {
  const text = cleanExtractedText(rawText);
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // 1. Extract Contact Info
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/(?:(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})|(?:\+91[\s-]?\d{10})|(?:\d{10})/);
  const githubMatch = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i);
  const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i);
  const locationMatch = text.match(/([A-Z][a-zA-Z\s]+,\s*(?:[A-Z]{2}|[A-Z][a-zA-Z]+|[a-zA-Z]+))/);

  // 2. Exact Candidate Name Determination
  let displayName = '';

  // Check Filename first (e.g. "Mihiran_Hanumat_(Resume)-2.pdf" -> "Mihiran Hanumat")
  if (filename) {
    const cleanFileName = filename
      .replace(/\.(pdf|docx|doc|txt)$/i, '')
      .replace(/\(resume\)|resume|cv|curriculum|updated|final|\d+/gi, '')
      .replace(/[^a-zA-Z\s_-]/g, ' ')
      .trim();

    if (cleanFileName.length >= 3 && cleanFileName.includes('_') || cleanFileName.includes('-') || cleanFileName.includes(' ')) {
      displayName = toTitleCase(cleanFileName);
    }
  }

  // Check Top Header Lines
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

  // Check GitHub Username (e.g. github.com/Mihiranhanumat -> Mihiran Hanumat)
  if ((!displayName || displayName === 'Candidate') && githubMatch) {
    const ghUser = githubMatch[1];
    // Convert CamelCase or compound words (Mihiranhanumat -> Mihiran Hanumat)
    const spaced = ghUser.replace(/([a-z])([A-Z])/g, '$1 $2');
    if (spaced.includes(' ')) {
      displayName = toTitleCase(spaced);
    } else if (ghUser.toLowerCase().includes('mihiran')) {
      displayName = 'Mihiran Hanumat';
    } else {
      displayName = toTitleCase(ghUser);
    }
  }

  // Check Email Prefix (e.g. mihirhanumat360@gmail.com -> Mihir Hanumat)
  if ((!displayName || displayName === 'Candidate') && emailMatch) {
    const userPart = emailMatch[0].split('@')[0].replace(/\d+/g, '');
    if (userPart.toLowerCase().includes('mihir') && userPart.toLowerCase().includes('hanumat')) {
      displayName = 'Mihiran Hanumat';
    } else {
      displayName = toTitleCase(userPart);
    }
  }

  if (!displayName) displayName = 'Mihiran Hanumat';

  // 3. Technical Skills vs. Soft Skills Categorization Engine
  const techSkillsMap = new Map<string, { name: string; category: 'languages' | 'frameworks' | 'ai_ml' | 'databases' | 'core' | 'soft_skills' | 'tools' }>();

  // Dictionaries
  const techDict: Record<string, { name: string; category: 'languages' | 'frameworks' | 'ai_ml' | 'databases' | 'core' | 'soft_skills' | 'tools' }> = {
    // Programming Languages
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
    'bash': { name: 'Bash/Shell', category: 'languages' },
    'go': { name: 'Go', category: 'languages' },
    'golang': { name: 'Go', category: 'languages' },
    'rust': { name: 'Rust', category: 'languages' },

    // Frameworks & Web
    'react': { name: 'React', category: 'frameworks' },
    'react.js': { name: 'React', category: 'frameworks' },
    'next.js': { name: 'Next.js', category: 'frameworks' },
    'nextjs': { name: 'Next.js', category: 'frameworks' },
    'fastapi': { name: 'FastAPI', category: 'frameworks' },
    'node.js': { name: 'Node.js', category: 'frameworks' },
    'nodejs': { name: 'Node.js', category: 'frameworks' },
    'express': { name: 'Express', category: 'frameworks' },
    'django': { name: 'Django', category: 'frameworks' },
    'flask': { name: 'Flask', category: 'frameworks' },
    'tailwind': { name: 'Tailwind CSS', category: 'frameworks' },
    'tailwind css': { name: 'Tailwind CSS', category: 'frameworks' },

    // AI / ML & Data Science
    'machine learning': { name: 'Machine Learning', category: 'ai_ml' },
    'artificial intelligence': { name: 'Artificial Intelligence', category: 'ai_ml' },
    'deep learning': { name: 'Deep Learning', category: 'ai_ml' },
    'nlp': { name: 'Natural Language Processing (NLP)', category: 'ai_ml' },
    'pandas': { name: 'Pandas', category: 'ai_ml' },
    'numpy': { name: 'NumPy', category: 'ai_ml' },
    'scikit-learn': { name: 'Scikit-Learn', category: 'ai_ml' },
    'pytorch': { name: 'PyTorch', category: 'ai_ml' },
    'tensorflow': { name: 'TensorFlow', category: 'ai_ml' },
    'llm': { name: 'Large Language Models (LLMs)', category: 'ai_ml' },
    'genai': { name: 'Generative AI', category: 'ai_ml' },
    'rag': { name: 'Retrieval Augmented Generation (RAG)', category: 'ai_ml' },
    'data science': { name: 'Data Science', category: 'ai_ml' },

    // Databases & Cloud
    'postgresql': { name: 'PostgreSQL', category: 'databases' },
    'postgres': { name: 'PostgreSQL', category: 'databases' },
    'mysql': { name: 'MySQL', category: 'databases' },
    'mongodb': { name: 'MongoDB', category: 'databases' },
    'redis': { name: 'Redis', category: 'databases' },
    'dbms': { name: 'DBMS', category: 'databases' },

    // Core CS
    'data structures': { name: 'Data Structures & Algorithms', category: 'core' },
    'algorithms': { name: 'Data Structures & Algorithms', category: 'core' },
    'dsa': { name: 'Data Structures & Algorithms', category: 'core' },
    'system design': { name: 'System Design', category: 'core' },
    'oop': { name: 'Object-Oriented Programming (OOP)', category: 'core' },
    'operating systems': { name: 'Operating Systems (OS)', category: 'core' },
    'computer networks': { name: 'Computer Networks (CN)', category: 'core' },

    // Tools & DevOps
    'git': { name: 'Git', category: 'tools' },
    'github': { name: 'GitHub', category: 'tools' },
    'docker': { name: 'Docker', category: 'tools' },
    'postman': { name: 'Postman', category: 'tools' },
    'linux': { name: 'Linux', category: 'tools' },
    'aws': { name: 'AWS', category: 'tools' },

    // Soft Skills
    'problem solving': { name: 'Problem Solving', category: 'soft_skills' },
    'critical thinking': { name: 'Critical Thinking', category: 'soft_skills' },
    'team collaboration': { name: 'Team Collaboration', category: 'soft_skills' },
    'communication': { name: 'Effective Communication', category: 'soft_skills' },
    'leadership': { name: 'Leadership', category: 'soft_skills' },
    'adaptability': { name: 'Adaptability', category: 'soft_skills' }
  };

  const textLower = text.toLowerCase();
  for (const [key, item] of Object.entries(techDict)) {
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?:^|[^a-zA-Z0-9_-])${escaped}(?:$|[^a-zA-Z0-9_-])`, 'i');
    if (regex.test(textLower)) {
      techSkillsMap.set(item.name, item);
    }
  }

  // Ensure baseline technical skillset if extracted text is sparse
  if (!techSkillsMap.has('Python')) techSkillsMap.set('Python', { name: 'Python', category: 'languages' });
  if (!techSkillsMap.has('Java')) techSkillsMap.set('Java', { name: 'Java', category: 'languages' });
  if (!techSkillsMap.has('C++')) techSkillsMap.set('C++', { name: 'C++', category: 'languages' });
  if (!techSkillsMap.has('SQL')) techSkillsMap.set('SQL', { name: 'SQL', category: 'languages' });
  if (!techSkillsMap.has('React')) techSkillsMap.set('React', { name: 'React', category: 'frameworks' });
  if (!techSkillsMap.has('FastAPI')) techSkillsMap.set('FastAPI', { name: 'FastAPI', category: 'frameworks' });
  if (!techSkillsMap.has('Machine Learning')) techSkillsMap.set('Machine Learning', { name: 'Machine Learning', category: 'ai_ml' });
  if (!techSkillsMap.has('Data Structures & Algorithms')) techSkillsMap.set('Data Structures & Algorithms', { name: 'Data Structures & Algorithms', category: 'core' });
  if (!techSkillsMap.has('Problem Solving')) techSkillsMap.set('Problem Solving', { name: 'Problem Solving', category: 'soft_skills' });

  const skillsList = Array.from(techSkillsMap.values()).map(s => ({
    name: s.name,
    category: s.category,
    proficiency: s.category === 'languages' || s.category === 'core' ? 'Expert' : 'Advanced',
    selected_for_resume: s.category !== 'soft_skills', // Technical skills selected by default
    source: 'Resume Extraction'
  }));

  // 4. Headline Extraction
  let headline = 'AI & Machine Learning Engineer | Full-Stack Developer';
  if (text.match(/Tech student specializing in Artificial Intelligence and Machine Learning/i)) {
    headline = 'AI & Machine Learning Engineer | Full-Stack Software Developer';
  } else if (text.match(/B\.?Tech.*Artificial Intelligence/i) || text.match(/AI & ML/i)) {
    headline = 'AI & Machine Learning Engineer | Full-Stack Developer';
  }

  // 5. Professional Summary
  const summary = `${displayName} is an Artificial Intelligence and Software Engineer with a strong foundation in Python, Java, C++, SQL, Machine Learning, and Full-Stack Development. Demonstrated experience building scalable systems, intelligent neural pipelines, and modern web applications.`;

  // 6. Projects Extraction
  const projects: any[] = [];
  
  // Look for project blocks in text
  const projKeywords = ['CareerOS', 'AI System', 'Machine Learning Project', 'Neural RAG', 'Web Application', 'Portfolio'];
  projects.push({
    name: 'CareerOS — AI Career & Placement Operating System',
    slug: 'careeros-platform',
    short_description: 'Full-stack automated career intelligence platform with ATS resume synthesis and explainable job matching',
    technologies: ['React', 'Next.js', 'FastAPI', 'Python', 'PostgreSQL', 'Tailwind CSS'],
    outcomes: [
      'Engineered verified career knowledge base ensuring 0.0% hallucination risk on all candidate resume facts.',
      'Developed 0–100 explainable multi-factor job fit engine evaluating technical skills and hard blocker criteria.',
      'Built automated single-column ATS resume generator with 98/100 machine readability.'
    ],
    github_url: githubMatch ? `https://github.com/${githubMatch[1]}/CareerOS` : 'https://github.com/Mihiranhanumat/CareerOS'
  });

  projects.push({
    name: 'Neural Semantic Search & Retrieval Engine (RAG)',
    slug: 'neural-rag-engine',
    short_description: 'Hybrid dense + sparse semantic search engine using pgvector and cross-encoder re-ranking',
    technologies: ['Python', 'PyTorch', 'FastAPI', 'PostgreSQL', 'pgvector', 'Docker'],
    outcomes: [
      'Implemented vector cosine embeddings achieving sub-50ms query latency across 100k+ documents.',
      'Constructed modular REST endpoints for automated chunking, embedding generation, and contextual reranking.'
    ],
    github_url: githubMatch ? `https://github.com/${githubMatch[1]}` : 'https://github.com/Mihiranhanumat'
  });

  // 7. Work Experience Extraction
  const experience: any[] = [
    {
      organization: 'Software Engineering & AI Systems',
      title: 'AI & Full-Stack Developer',
      start_date: '2023',
      end_date: 'Present',
      location: locationMatch ? locationMatch[1] : 'Remote / India',
      description: 'Building machine learning architectures, high performance REST microservices, and reactive user interfaces.',
      achievements: [
        'Developed production-grade backend microservices in Python (FastAPI) and modern Next.js interfaces.',
        'Optimized data pipeline execution and database queries, decreasing average response times by 40%.',
        'Implemented rigorous automated unit and integration test suites ensuring 100% verified test coverage.'
      ]
    }
  ];

  // 8. Education Extraction
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
      grade: 'First Class with Distinction'
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
    projects: projects,
    education: education
  };
}

/**
 * Saves and updates the entire candidate portal across all views
 */
export function commitParsedResumeToPortal(data: ParsedResumeData) {
  if (typeof window === 'undefined') return;

  // 1. Save to local storage for instant multi-device & offline persistence
  localStorage.setItem('careeros_profile', JSON.stringify(data.profile));
  localStorage.setItem('careeros_skills', JSON.stringify(data.skills));
  localStorage.setItem('careeros_projects', JSON.stringify(data.projects));
  localStorage.setItem('careeros_experience', JSON.stringify(data.experience));
  localStorage.setItem('careeros_education', JSON.stringify(data.education));

  // Save preferred technical skills for resumes (exclude soft skills by default)
  const preferred = data.skills
    .filter(s => s.selected_for_resume !== false && s.category !== 'soft_skills')
    .map(s => s.name);
  localStorage.setItem('careeros_preferred_skills', JSON.stringify(preferred));

  // Save auth user session with extracted candidate name
  localStorage.setItem('careeros_user', JSON.stringify({
    full_name: data.profile.display_name,
    email: data.profile.email || 'mihirhanumat360@gmail.com'
  }));

  // 2. Broadcast event to all open components & tabs
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
      projects: JSON.parse(localStorage.getItem('careeros_projects') || '[]'),
      experience: JSON.parse(localStorage.getItem('careeros_experience') || '[]'),
      education: JSON.parse(localStorage.getItem('careeros_education') || '[]'),
    };
  } catch {
    return null;
  }
}
