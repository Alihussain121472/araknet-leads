import { AcademicProposalInput, AcademicProposalResponse, AcademicLevel, AcademicProposalType } from './types';

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function generateAcademicProposalOffline(inp: AcademicProposalInput): AcademicProposalResponse {
  const level = inp.academic_level;
  const ptype = inp.proposal_type;
  const topic = inp.topic.trim();
  const purpose = inp.purpose.trim();
  const audience = inp.target_audience?.trim() || 'Evaluation Committee and Stakeholders';
  const reqs = inp.specific_requirements?.trim() || 'Standard institutional and review rubrics.';

  // 1. Title
  let title = '';
  if (level === "Bachelor's") {
    if (ptype === 'Education Proposal') {
      title = `An Applied Study on ${topic}: Enhancing Learning Outcomes and Student Engagement`;
    } else if (ptype === 'Business Proposal') {
      title = `Business Strategy and Feasibility Plan: ${topic}`;
    } else {
      title = `Strategic Social Media Campaign and Growth Plan for ${topic}`;
    }
  } else if (level === "Master's") {
    if (ptype === 'Education Proposal') {
      title = `Pedagogical Innovation and Implementation Framework: An Empirical Investigation into ${topic}`;
    } else if (ptype === 'Business Proposal') {
      title = `Strategic Market Optimization and Operational Framework: Driving Enterprise Value in ${topic}`;
    } else {
      title = `Algorithmic Distribution and Multi-Channel Engagement Dynamics: A Strategic Analysis of ${topic}`;
    }
  } else {
    // PhD
    if (ptype === 'Education Proposal') {
      title = `Epistemic Paradigms and Pedagogical Transformation: A Critical Inquiry into ${topic}`;
    } else if (ptype === 'Business Proposal') {
      title = `Theoretical Grounding and Econometric Modeling of ${topic}: Resolving Contemporary Market Inefficiencies`;
    } else {
      title = `Algorithmic Mediations and Information Diffusion: A Mixed-Methods Investigation into ${topic}`;
    }
  }

  // 2. Introduction / Background
  let intro = '';
  if (level === "Bachelor's") {
    intro = `The field of ${ptype.toLowerCase().replace(' proposal', '')} is experiencing significant evolution, making the study of ${topic} both timely and essential. In modern environments, practitioners and learners face emerging opportunities that require clear, structured, and practical approaches. This proposal addresses ${purpose} by establishing a foundational framework tailored for ${audience}. By synthesizing core concepts and direct observations, this project connects textbook theory with real-world application, ensuring tangible progress and measurable classroom or organizational outcomes.`;
  } else if (level === "Master's") {
    intro = `Contemporary discourse within ${ptype.toLowerCase().replace(' proposal', '')} highlights a growing imperative for empirical rigor and systemic integration regarding ${topic}. While conventional models offer partial explanations, rapid socio-technical shifts have created structural complexities that existing operational paradigms fail to comprehensively address. This proposal presents an analytical framework designed to fulfill ${purpose}, targeted directly at ${audience}. By bridging rigorous theoretical literature with practical implementation protocols, this study investigates underlying causal dynamics and establishes a repeatable, scalable benchmark for operational and academic advancement.`;
  } else {
    // PhD
    intro = `Contemporary scholarship in ${ptype.toLowerCase().replace(' proposal', '')} stands at an epistemological crossroads concerning the theorization and systemic actualization of ${topic}. Extant literature frequently suffers from methodological fragmentation and unexamined ontological assumptions, leaving foundational mechanisms under-theorized. This doctoral research proposal engages directly with this gap, proposing a groundbreaking conceptual and empirical paradigm aimed at ${purpose}. Formulated for evaluation by ${audience}, this inquiry problematizes prevailing orthodoxies, constructs an interdisciplinary investigative matrix, and provides substantial theoretical and empirical contributions to the overarching discipline.`;
  }

  // 3. Problem Statement
  let prob = '';
  if (level === "Bachelor's") {
    prob = `A major challenge currently observed in relation to ${topic} is the lack of accessible, streamlined solutions that address day-to-day challenges. Many existing approaches are either too complex for everyday users or fail to deliver consistent results. Specifically, stakeholders struggle with achieving ${purpose} due to fragmented tools and inadequate guidance. Without a well-organized plan, resources are wasted and key goals remain unmet.`;
  } else if (level === "Master's") {
    prob = `Despite recent advancements, organizations and researchers addressing ${topic} encounter critical structural inefficiencies and strategic misalignment. Empirical evidence suggests that conventional interventions fail to resolve ${purpose} due to suboptimal integration, data silos, and insufficient analytical validation. This gap creates measurable friction for ${audience}, inhibiting performance and preventing scalable adoption.`;
  } else {
    // PhD
    prob = `A critical lacuna persists within the literature regarding ${topic}. Existing empirical and theoretical models fail to account for non-linear interactions and structural mediating variables governing ${purpose}. Consequently, scholarly inquiry has reached an explanatory plateau, while institutional bodies such as ${audience} lack validated predictive models. This study directly confronts this theoretical void, establishing the causal pathways and boundary conditions that have remained unaddressed in peer-reviewed scholarship.`;
  }

  // 4. Objectives
  let objs: string[] = [];
  if (level === "Bachelor's") {
    objs = [
      `Identify and document the core requirements and foundational challenges associated with ${topic}.`,
      `Design and execute a practical workflow to systematically realize ${purpose}.`,
      `Evaluate performance benchmarks and gather actionable feedback from ${audience}.`,
      `Produce a documented toolkit and practical recommendations adhering to: ${reqs}.`
    ];
  } else if (level === "Master's") {
    objs = [
      `Conduct a comprehensive diagnostic and comparative analysis of existing frameworks governing ${topic}.`,
      `Formulate an empirical operational model to advance ${purpose} across multi-stakeholder settings.`,
      `Validate systemic efficacy through structured pilot testing, data analytics, and stakeholder feedback from ${audience}.`,
      `Synthesize operational guidelines, quantitative metrics, and compliance controls aligned with: ${reqs}.`
    ];
  } else {
    // PhD
    objs = [
      `Deconstruct extant ontological and epistemological assumptions regarding ${topic} through a systematic literature meta-synthesis.`,
      `Formulate a novel theoretical construct and mathematical/conceptual taxonomy addressing ${purpose}.`,
      `Deploy an empirical, triangulated multi-phase research methodology to test hypothesized causal relationships.`,
      `Synthesize doctoral findings into high-impact peer-reviewed contributions and policy rubrics conforming to: ${reqs}.`
    ];
  }

  // 5. Methodology or Approach
  let method = '';
  if (level === "Bachelor's") {
    if (ptype === 'Education Proposal') {
      method = `This project utilizes a structured, four-phase instructional approach: (1) Initial Needs Assessment through surveys and student interviews to establish baseline understanding of ${topic}; (2) Curriculum Material Development incorporating interactive modules and clear learning rubrics; (3) Classroom Implementation across a targeted cohort to test feasibility; and (4) Learning Evaluation comparing pre- and post-implementation scores to ensure ${purpose} is attained.`;
    } else if (ptype === 'Business Proposal') {
      method = `The business execution plan follows a milestone-driven strategy: (1) Market & Competitor Discovery analyzing pricing, demand, and customer personas for ${topic}; (2) Operational Workflow Design establishing cost structures, delivery timelines, and risk controls; (3) Pilot Launch testing minimum viable deliverables with key customer segments; and (4) Financial and KPI Review to confirm operational profitability and deliver on ${purpose}.`;
    } else {
      method = `The social media rollout follows a proven 4-stage playbook: (1) Audience and Competitor Audit identifying top-performing content formats for ${topic}; (2) Content Creation Sprint producing educational carousels, short-form video scripts, and engagement hooks; (3) Multi-Channel Publishing Schedule optimizing posting cadence across platforms; and (4) Analytics Review tracking reach, click-through rates, and community growth to satisfy ${purpose}.`;
    }
  } else if (level === "Master's") {
    if (ptype === 'Education Proposal') {
      method = `This research employs a quasi-experimental, mixed-methods design. Phase 1 conducts a systematic diagnostic audit and validated diagnostic survey instrument measuring student cognitive load and engagement in ${topic}. Phase 2 deploys an intervention protocol utilizing modern pedagogical scaffolding and digital feedback loops. Phase 3 performs rigorous statistical analysis (including paired t-tests, ANOVA, and qualitative thematic analysis) to measure educational yield against baseline cohorts, validating hypotheses relating to ${purpose}.`;
    } else if (ptype === 'Business Proposal') {
      method = `The strategic methodology integrates quantitative market modeling with agile execution sprints. Phase 1 conducts unit economic sensitivity analysis, competitive benchmarking, and stakeholder elicitation on ${topic}. Phase 2 engineers an enterprise operational framework featuring automated reporting and cross-functional alignment. Phase 3 tests the model via a controlled commercial pilot, measuring customer acquisition cost (CAC), lifetime value (LTV), and operational efficiency to ensure empirical validation of ${purpose}.`;
    } else {
      method = `This research utilizes an empirical multi-funnel growth architecture. Phase 1 establishes algorithmic baseline tracking, audience sentiment clustering, and conversion telemetry for ${topic}. Phase 2 deploys controlled A/B split-testing across messaging variants, visual assets, and distribution algorithms. Phase 3 applies multivariate regression and attribution modeling to isolate engagement drivers, optimizing return on ad spend (ROAS) and organic virality to achieve ${purpose}.`;
    }
  } else {
    // PhD
    if (ptype === 'Education Proposal') {
      method = `This doctoral dissertation adopts an advanced, multi-phase convergent mixed-methods epistemological framework (Creswell & Plano Clark). Strand A consists of a longitudinal, multi-site empirical investigation (N > 500) measuring cognitive absorption, self-efficacy, and learning outcomes in ${topic} using structural equation modeling (SEM). Strand B employs phenomenological and grounded theory qualitative protocols, gathering semi-structured in-depth interviews from educators and policy leaders. Methodological triangulation and confirmatory factor analysis (CFA) are systematically deployed to ensure construct validity, internal consistency (Cronbach's alpha > 0.85), and generalizability for ${purpose}.`;
    } else if (ptype === 'Business Proposal') {
      method = `This study deploys an advanced econometric and dynamic capabilities methodology. The empirical framework incorporates panel data econometrics, difference-in-differences (DiD) estimation, and machine learning predictive clustering to analyze firm-level performance in ${topic}. Robustness checks include instrumental variables (IV) estimation and Monte Carlo simulations to mitigate endogeneity concerns. Qualitative executive cross-case synthesis provides deep contextual validation, establishing a comprehensive theoretical paradigm for ${purpose}.`;
    } else {
      method = `This doctoral research employs a computational social science framework combining natural language processing (NLP), large-scale network graph theory, and longitudinal sentiment analysis. The data corpus comprises > 1,000,000 algorithmic platform interactions and community graph nodes surrounding ${topic}. Network centrality algorithms (PageRank, Betweenness) and latent Dirichlet allocation (LDA) topic modeling delineate information cascade dynamics. Empirical models are subjected to rigorous cross-validation and counterfactual causal inference to uncover the governing mechanisms of ${purpose}.`;
    }
  }

  // 6. Expected Outcomes / Benefits
  let outcomes = '';
  if (level === "Bachelor's") {
    outcomes = `Upon project completion, expected outcomes include: (1) A fully tested and documented working solution for ${topic}; (2) Measurable improvement in user engagement, retention, or operational efficiency; (3) A clear implementation guide empowering ${audience} to replicate findings easily; and (4) A robust final report satisfying all undergraduate academic and institutional requirements.`;
  } else if (level === "Master's") {
    outcomes = `Anticipated contributions and deliverables encompass: (1) An empirically validated operational model advancing current industry and academic benchmarks for ${topic}; (2) Statistically significant enhancements in performance metrics, directly demonstrating attainment of ${purpose}; (3) Comprehensive risk mitigation and scalability protocols designed for enterprise or institutional deployment; and (4) A publishable postgraduate thesis contributing directly to the body of applied research.`;
  } else {
    // PhD
    outcomes = `The transformative outcomes of this doctoral inquiry include: (1) A seminal, peer-reviewed theoretical framework redefining the academic discourse on ${topic}; (2) Empirical resolution of long-standing causal ambiguities regarding ${purpose}, supported by high-dimensional data; (3) Novel methodological instruments and validated scales ready for cross-disciplinary adoption; and (4) Actionable policy whitepapers and strategic doctrines providing authoritative guidance to ${audience} and international bodies.`;
  }

  // 7. Conclusion
  let conclusion = '';
  if (level === "Bachelor's") {
    conclusion = `In conclusion, this proposal provides a practical, well-scoped roadmap to tackle ${topic}. By combining clear milestones with actionable steps, the project guarantees measurable progress toward ${purpose}. With the support of ${audience}, this initiative will deliver practical value, high educational quality, and a strong foundation for future study or professional implementation.`;
  } else if (level === "Master's") {
    conclusion = `In summary, this proposal establishes a methodologically sound and strategically imperative approach to addressing ${topic}. By synthesizing robust analytical models with real-world execution, the initiative resolves existing systemic inefficiencies to definitively accomplish ${purpose}. The proposed study promises substantial returns in organizational capability and applied academic scholarship.`;
  } else {
    // PhD
    conclusion = `In conclusion, this doctoral dissertation proposal provides a rigorous, groundbreaking intervention into ${topic}. Through philosophical clarity, advanced methodological triangulation, and uncompromising empirical standards, the investigation dismantles theoretical stagnation and establishes a new frontier in the discipline. The anticipated yields will permanently advance scholarly inquiry, empower ${audience} with definitive insights, and set a new gold standard in the field.`;
  }

  // Level Insights
  let levelInsights = '';
  if (level === "Bachelor's") {
    levelInsights = "Calibrated for Undergraduate / Bachelor's Level: Emphasizes conceptual clarity, foundational literature, direct practical application, and clearly bounded milestone execution.";
  } else if (level === "Master's") {
    levelInsights = "Calibrated for Postgraduate / Master's Level: Emphasizes theoretical frameworks, comparative synthesis, empirical justification, and rigorous methodology.";
  } else {
    // PhD
    levelInsights = "Calibrated for Doctoral / PhD Level: Emphasizes epistemological grounding, identification of critical gaps in extant literature, rigorous mixed-methods/validation protocols, and definitive scholarly contribution.";
  }

  const objectivesMd = objs.map(o => `- ${o}`).join('\n');
  const rawMarkdown = `# ${title}

**Academic Level:** ${level}  
**Proposal Type:** ${ptype}  
**Target Audience:** ${audience}  
**Guidelines & Requirements:** ${reqs}  

---

## 1. Title
**${title}**

## 2. Introduction / Background
${intro}

## 3. Problem Statement
${prob}

## 4. Objectives
${objectivesMd}

## 5. Methodology or Approach
${method}

## 6. Expected Outcomes / Benefits
${outcomes}

## 7. Conclusion
${conclusion}

---
*Generated by Proposal Strategist Agent (Academic & Professional Division)*
`;

  const wordCount = countWords(rawMarkdown);

  return {
    title,
    academic_level: level,
    proposal_type: ptype,
    introduction_background: intro,
    problem_statement: prob,
    objectives: objs,
    methodology_approach: method,
    expected_outcomes_benefits: outcomes,
    conclusion,
    raw_markdown: rawMarkdown,
    word_count: wordCount,
    provider_used: 'offline (academic strategist engine)',
    level_insights: levelInsights
  };
}
