/**
 * All site content lives here. Edit this file to update the website —
 * no component changes needed.
 */

export const profile = {
  name: "Sanket Ingale",
  title: "Senior Software Engineer",
  tagline:
    "Full-stack engineer building control planes for networks, compliance, and AI platforms.",
  location: "Pune, IN",
  email: "sanket.ingale1998@gmail.com",
  links: [
    { label: "GitHub", href: "https://github.com/sanket-ingale" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/sanket-ingale1998" },
  ],
  about: [
    "I build the interfaces that operators rely on to run complex systems — private cellular networks, compliance platforms, and AI governance tools. My work runs from orchestration dashboards and real-time visualizations down to the APIs and data flows behind them.",
    "Over five years across startups and enterprise teams, I've led product engineering end to end — architecture, component libraries, APIs, performance, and mentoring — across React, TypeScript, Node, and Python.",
  ],
};

export type Project = {
  id: string;
  name: string;
  summary: string;
  highlights: string[];
  tech: string[];
};

export const projects: Project[] = [
  {
    id: "network-orchestration",
    name: "Private cellular network orchestration platform",
    summary:
      "Enterprise platform for orchestrating private 5G/LTE networks — radios, edges, and sites managed from a single control plane.",
    highlights: [
      "Designed a centralized RBAC module on CASL, replacing scattered per-component permission checks with a single declarative ability layer wired through the app.",
      "Built radio and edge management UIs: advanced table architecture with grouped-row expansion, filter persistence, and URL-driven selection across refreshes.",
      "Developed floorplan-based radio visualization — placement pins, walk-test overlays, and PDF exports with metric heatmaps aligned to on-screen markers.",
      "Maintained the shared component library powering multiple products: table contexts, steppers, dialogs, and date-time selectors with Storybook coverage.",
    ],
    tech: ["React", "TypeScript", "Redux Toolkit", "MUI X", "CASL", "Highcharts", "Storybook"],
  },
  {
    id: "compliance-platform",
    name: "Financial compliance & reporting platform",
    summary:
      "Modernized the UI of a compliance product certified by XBRL International — from legacy screens to a coherent, scalable design system.",
    highlights: [
      "Revamped the platform with React and Shadcn, improving design consistency across modules.",
      "Designed a Google Docs–inspired folder and document management system with user/group access controls.",
      "Built a rich document editor on Lexical supporting HTML, TXT, DOC, and JSON with extensible plugins.",
      "Cut build times by 40% through modularization and dead-dependency removal.",
    ],
    tech: ["React", "TypeScript", "Shadcn", "Lexical", "Zustand"],
  },
  {
    id: "genai-governance",
    name: "Gen AI governance & security platform",
    summary:
      "Enterprise platform giving compliance and security teams visibility into Gen AI components — LLMs, agents, datastores, and endpoints across multi-cloud environments.",
    highlights: [
      "Built interactive dashboards and data visualizations for interpreting structured and unstructured datasets.",
      "Integrated frontend interfaces with internal and third-party APIs across communication and document platforms.",
      "Contributed to the internal design system, establishing standards for consistency and accessibility.",
    ],
    tech: ["React", "TypeScript", "D3.js", "Chart.js"],
  },
  {
    id: "agritech-erp",
    name: "Seed-to-sale agritech ERP",
    summary:
      "ERP for regulated agriculture — compliance, sales, production, and inventory with multi-site visibility.",
    highlights: [
      "Architected a real-time inventory dashboard on WebSockets, streamlining supply-chain visibility and reducing manual reconciliation.",
      "Engineered demand-alert mechanisms surfacing market trends to stakeholders in real time.",
      "Implemented CI/CD pipelines for zero-drama releases.",
    ],
    tech: ["React", "Node.js", "GraphQL", "WebSockets"],
  },
  {
    id: "dataviz-library",
    name: "Reusable data visualization library",
    summary:
      "Dynamic charting components built on D3 and Chart.js, integrated across React dashboards.",
    highlights: [
      "Cut chart integration effort by 50%, enabling faster delivery of reporting features across products.",
      "Built a 3D model-tagging web experience with Three.js for advanced dataset visualization.",
    ],
    tech: ["D3.js", "Chart.js", "Three.js", "React"],
  },
];

export type Role = {
  company: string;
  title: string;
  period: string;
  points: string[];
};

export const experience: Role[] = [
  {
    company: "Copods",
    title: "Senior Software Engineer",
    period: "Aug 2023 — present",
    points: [
      "Leading frontend work across enterprise platforms — network orchestration, compliance, and AI governance.",
      "Mentoring developers, driving reviews and sprint planning; conducting internal sessions on Gen AI and frontend practice.",
      "Revamped the company portfolio site (Webflow + AWS), significantly reducing load times.",
    ],
  },
  {
    company: "Vmedulife Software",
    title: "Software Engineer",
    period: "Sept 2022 — Jun 2023",
    points: [
      "Engineered project modules from inception to deployment across ERP, OBE, and academic platforms.",
      "Led a team of developers for key modules with scalable React + Redux architecture.",
    ],
  },
  {
    company: "Tata Consultancy Services",
    title: "Associate Software Engineer",
    period: "Feb 2021 — Sept 2022",
    points: [
      "Built a responsive phonebook application for a UK-based bank with reusable, scalable UI components.",
      "Integrated third-party vendor APIs to extend application functionality.",
    ],
  },
];

export const skills: { group: string; items: string[] }[] = [
  {
    group: "Languages",
    items: ["TypeScript", "JavaScript", "HTML", "CSS/SCSS", "SQL", "GraphQL"],
  },
  {
    group: "Frameworks & libraries",
    items: [
      "React",
      "React Native",
      "Vue.js",
      "Redux Toolkit",
      "Zustand",
      "MUI / MUI X",
      "Tailwind",
      "Shadcn",
      "Three.js",
      "D3.js",
      "Highcharts",
    ],
  },
  {
    group: "Backend",
    items: ["Node.js", "Python", "FastAPI", "GraphQL", "WebSockets", "MySQL"],
  },
  {
    group: "Tools & platform",
    items: ["Vite", "Storybook", "AWS", "Figma", "Git", "CI/CD"],
  },
];

export const education = {
  degree: "B.E. Computer Science",
  school: "MGM's Jawaharlal Nehru College of Engineering",
  period: "2016 — 2020",
};
