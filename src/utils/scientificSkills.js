/**
 * Central Scientific Skill & Plugin Registry for ScholarHub AI (UVE v2.0)
 * Allows users to discover and trigger specialized scientific visualization & analysis engines.
 */

export const SCIENTIFIC_SKILLS = [
  {
    id: 'circuit',
    engine: 'circuit_schematic',
    triggers: ['@circuit', '/circuit', '@schematic'],
    name: 'Circuit Schematic & Simulation',
    category: 'Electronics & Hardware',
    iconName: 'Zap',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    accentColor: '#3b82f6',
    description: 'Draft SVG schematics for RC/RL filters, op-amps, voltage sources, resistors, capacitors & LEDs.',
    promptTemplate: '@circuit Draft an RC low-pass filter circuit with R=10kΩ and C=1µF.',
    keywords: ['circuit', 'schematic', 'resistor', 'capacitor', 'voltage', 'opamp', 'filter', 'cutoff frequency']
  },
  {
    id: 'chemistry',
    engine: 'molecule_2d',
    triggers: ['@chemistry', '/chem', '@molecule'],
    name: '2D Molecule & Reaction Flow',
    category: 'Chemistry & Biology',
    iconName: 'FlaskConical',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    accentColor: '#10b981',
    description: 'Render 2D molecular structures (CPK atom colors, bond order) and chemical reaction flows.',
    promptTemplate: '@chemistry Draw the molecular structure of Aspirin (C9H8O4) with functional group annotations.',
    keywords: ['chemistry', 'molecule', 'aspirin', 'reaction', 'atom', 'bond', 'benzene', 'pharmacology']
  },
  {
    id: 'math',
    engine: 'math_plot',
    triggers: ['@math', '/math', '@plot'],
    name: 'Math Plotter & Equation Evaluator',
    category: 'Mathematics & Physics',
    iconName: 'Calculator',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    accentColor: '#6366f1',
    description: 'Evaluate function curves with SymPy and render interactive ECharts with KaTeX latex overlays.',
    promptTemplate: '@math Plot f(x) = sin(x) / x from x = -10 to 10 with derivative annotations.',
    keywords: ['math', 'plot', 'function', 'equation', 'sympy', 'derivative', 'integral', 'curve', 'sine']
  },
  {
    id: 'geo',
    engine: 'geo_map',
    triggers: ['@geo', '/geo', '@map'],
    name: 'Geospatial Research Mapping',
    category: 'Geospatial & Field Studies',
    iconName: 'Globe',
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
    accentColor: '#0284c7',
    description: 'Map research institutions, epidemiology spatial data, and global study locations using Leaflet OSM.',
    promptTemplate: '@geo Map the top AI research hubs in Europe (Oxford, Cambridge, ETH Zurich, INRIA).',
    keywords: ['geo', 'map', 'spatial', 'location', 'epidemiology', 'institution', 'latitude', 'longitude']
  },
  {
    id: '3d',
    engine: 'molecule_3d',
    triggers: ['@3d', '/3d', '@model3d'],
    name: 'Three.js 3D Ball-and-Stick Model',
    category: 'Molecular & Spatial 3D',
    iconName: 'Box',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    accentColor: '#a855f7',
    description: 'Interactive 3D ball-and-stick molecular model with orbit controls and spatial lighting.',
    promptTemplate: '@3d Render 3D ball-and-stick model of Caffeine molecule with orbit controls.',
    keywords: ['3d', 'ball-and-stick', 'spatial 3d', 'threejs', 'orbit', 'protein', 'caffeine', 'crystal']
  },
  {
    id: 'd3',
    engine: 'citation_graph',
    triggers: ['@d3', '/d3', '@network'],
    name: 'Citation & Co-Citation Graph',
    category: 'Bibliometrics & Networks',
    iconName: 'Share2',
    badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
    accentColor: '#14b8a6',
    description: 'Interactive D3.js force-directed graph illustrating paper citations, co-citations, and author links.',
    promptTemplate: '@d3 Render co-citation network graph of top papers on CRISPR-Cas9 genome editing.',
    keywords: ['d3', 'citation', 'network', 'co-citation', 'graph', 'bibliometrics', 'paper links']
  },
  {
    id: 'chart',
    engine: 'bar_chart',
    triggers: ['@chart', '/chart', '@graph'],
    name: 'Quantitative Data Visualizer',
    category: 'Data Analytics & Statistics',
    iconName: 'BarChart3',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    accentColor: '#f59e0b',
    description: 'Render interactive bar, line, scatter, and histogram charts using ECharts engine.',
    promptTemplate: '@chart Compare efficacy rates of mRNA vs Viral Vector vaccines across clinical trials.',
    keywords: ['chart', 'bar', 'line', 'scatter', 'data', 'statistics', 'histogram', 'comparison']
  },
  {
    id: 'flowchart',
    engine: 'flowchart',
    triggers: ['@flowchart', '/flow', '@diagram'],
    name: 'Conceptual & System Flowchart',
    category: 'Systems & Methodologies',
    iconName: 'Workflow',
    badgeColor: 'bg-violet-50 text-violet-700 border-violet-200',
    accentColor: '#8b5cf6',
    description: 'Render Mermaid.js architecture diagrams, clinical trial workflows, and process flowcharts.',
    promptTemplate: '@flowchart Diagram the double-blind randomized clinical trial protocol for drug candidate X.',
    keywords: ['flowchart', 'diagram', 'mermaid', 'process', 'workflow', 'architecture', 'protocol']
  },
  {
    id: 'phylogenetic',
    engine: 'gene_tree',
    triggers: ['@phylo', '/phylo', '@gene'],
    name: 'Evolutionary Phylogeny & Gene Tree',
    category: 'Genomics & Evolutionary Bio',
    iconName: 'Dna',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    accentColor: '#f43f5e',
    description: 'Render phylogenetic trees and genomic sequence alignment hierarchy.',
    promptTemplate: '@phylo Construct phylogenetic tree for SARS-CoV-2 spike protein variants.',
    keywords: ['phylo', 'phylogenetic', 'gene', 'dna', 'tree', 'evolution', 'genomics', 'sequence']
  },
  {
    id: 'stats',
    engine: 'stats_advisor',
    triggers: ['@stats', '/stats', '@statistic', '@hypothesistest'],
    name: 'Statistical Decision Advisor & APA Reporter',
    category: 'Statistics & Biostatistics',
    iconName: 'Calculator',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    accentColor: '#4f46e5',
    description: 'Determine exact statistical tests (t-test, ANOVA, Mann-Whitney, Regression, Cox survival), assumption checks & APA 7th reporting templates.',
    promptTemplate: '@stats Recommend the correct statistical test for comparing drug efficacy across 3 patient groups with skewed data.',
    keywords: ['stats', 'statistics', 'ttest', 't-test', 'anova', 'regression', 'mann-whitney', 'kruskal-wallis', 'p-value', 'power analysis', 'sample size', 'hypothesis']
  },
  {
    id: 'pitch',
    engine: 'pitch_generator',
    triggers: ['@pitch', '/pitch', '@3mt', '@presentation', '@defense'],
    name: 'Scientific Pitch & 3MT Suite',
    category: 'Scientific Communication',
    iconName: 'Mic',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    accentColor: '#9333ea',
    description: 'Generate 1-Minute Elevator Pitch, 3-Minute 3MT Conference Summary, 10-Minute Seminar Script, and Committee Q&A defense answers.',
    promptTemplate: '@pitch Draft a 3-Minute 3MT conference talk and 1-minute elevator pitch based on our synthesized findings.',
    keywords: ['pitch', '3mt', 'presentation', 'conference', 'elevator pitch', 'seminar', 'defense', 'speech', 'talk']
  },
  {
    id: 'ethics',
    engine: 'ai_ethics_shield',
    triggers: ['@ethics', '/ethics', '@disclosure', '@integrity', '@plagiarism'],
    name: 'Ethics & Integrity Shield (AI Disclosure & Plagiarism Guard)',
    category: 'Research Integrity & Ethics',
    iconName: 'ShieldCheck',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    accentColor: '#059669',
    description: 'Generate publication-ready AI disclosure statements (Elsevier, Nature, ICMJE, IEEE, Thesis) and audit citation grounding integrity.',
    promptTemplate: '@ethics Generate a Nature-compliant AI disclosure statement for this literature synthesis.',
    keywords: ['ethics', 'disclosure', 'integrity', 'plagiarism', 'ai policy', 'nature', 'elsevier', 'icmje', 'statement', 'hallucination']
  },
  {
    id: 'review',
    engine: 'peer_reviewer',
    triggers: ['@review', '/review', '@peerreview', '@critique', '@appraisal'],
    name: 'The Peer Reviewer (Critical Appraisal & Bias Evaluation)',
    category: 'Critical Appraisal',
    iconName: 'Award',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    accentColor: '#d97706',
    description: 'Aggressive peer-review appraisal: Evaluate methodological weaknesses, Risk of Bias (RoB) matrix, sample size adequacy, and overstated claims.',
    promptTemplate: '@review Conduct an aggressive peer review of these papers focusing on potential confounding variables and sample size limitations.',
    keywords: ['review', 'peer review', 'critique', 'appraisal', 'bias', 'confounder', 'methodology weakness', 'limitation', 'robins', 'cochrane']
  }
];

/**
 * Filter skills by input search query
 */
export function findSkillsByQuery(query) {
  if (!query) return SCIENTIFIC_SKILLS;
  const cleanQ = query.toLowerCase().trim().replace(/^[@/]/, '');
  return SCIENTIFIC_SKILLS.filter(skill => {
    return (
      skill.id.includes(cleanQ) ||
      skill.name.toLowerCase().includes(cleanQ) ||
      skill.triggers.some(t => t.toLowerCase().includes(cleanQ)) ||
      skill.keywords.some(k => k.toLowerCase().includes(cleanQ))
    );
  });
}

/**
 * Detect dynamic contextual skill suggestions based on conversation history text
 */
export function detectContextualSkills(conversationText = '') {
  if (!conversationText) {
    return [SCIENTIFIC_SKILLS[0], SCIENTIFIC_SKILLS[1], SCIENTIFIC_SKILLS[2]];
  }

  const textLower = conversationText.toLowerCase();
  const matched = SCIENTIFIC_SKILLS.map(skill => {
    let score = 0;
    skill.keywords.forEach(kw => {
      if (textLower.includes(kw.toLowerCase())) {
        score += 1;
      }
    });
    return { skill, score };
  });

  matched.sort((a, b) => b.score - a.score);

  // Return top 3 matched skills (fallback to default 3 if no match)
  const top = matched.filter(m => m.score > 0).map(m => m.skill);
  if (top.length >= 3) return top.slice(0, 3);

  // Fill up to 3 with remaining skills
  const usedIds = new Set(top.map(s => s.id));
  const result = [...top];
  for (const s of SCIENTIFIC_SKILLS) {
    if (!usedIds.has(s.id)) {
      result.push(s);
      usedIds.add(s.id);
    }
    if (result.length >= 3) break;
  }
  return result;
}
