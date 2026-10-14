/**
 * All site content lives here. Edit this file to update the website.
 * No component changes needed.
 */

export const profile = {
  name: "Sanket Ingale",
  title: "Senior Software Engineer",
  tagline:
    "Full-stack engineer working on network, compliance and AI products.",
  location: "Pune, IN",
  email: "sanket.ingale1998@gmail.com",
  links: [
    { label: "GitHub", href: "https://github.com/sanket-ingale" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/sanket-ingale1998" },
    { label: "Instagram", href: "https://www.instagram.com/lightbuster_/" },
  ],
  about: [
    "I build web apps for teams that manage private cellular networks, financial compliance and AI security. That covers everything from dashboards, data-heavy tables and visualizations to the APIs and data behind them.",
    "I've been doing this for over five years at startups and larger companies. I work across React, TypeScript, Node and Python."
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
      "A platform for managing private 5G and LTE networks, including radios, edge devices and sites, all in one place.",
    highlights: [
      "Moved permission checks that were spread across components into one RBAC setup built on CASL.",
      "Built the radio and edge management screens, with grouped tables, saved filters and selections that stay in the URL after a refresh.",
      "Built a floorplan view that shows where radios are placed, with walk-test overlays and PDF exports that include signal heatmaps.",
      "Looked after the shared component library used by several products, with tables, steppers, dialogs and date pickers documented in Storybook.",
    ],
    tech: ["React", "TypeScript", "Redux Toolkit", "MUI X", "CASL", "Highcharts", "Storybook"],
  },
  {
    id: "compliance-platform",
    name: "Financial compliance & reporting platform",
    summary:
      "Rebuilt the UI of an XBRL International certified compliance product, replacing old screens with a proper design system.",
    highlights: [
      "Moved the app to React and Shadcn so every module looks and behaves the same.",
      "Built folder and document management similar to Google Docs, with access control for users and groups.",
      "Built a document editor on Lexical that works with HTML, TXT, DOC and JSON files and supports plugins.",
      "Cut build times by 40% by splitting the code into modules and removing unused dependencies.",
    ],
    tech: ["React", "TypeScript", "Shadcn", "Lexical", "Zustand"],
  },
  {
    id: "genai-governance",
    name: "Gen AI governance & security platform",
    summary:
      "A platform that helps security and compliance teams keep track of the LLMs, agents, datastores and endpoints their company uses across different clouds.",
    highlights: [
      "Built dashboards and charts that make large amounts of data easier to understand.",
      "Connected the app to internal APIs and to third-party messaging and document tools.",
      "Worked on the internal design system and helped set rules for consistency and accessibility.",
    ],
    tech: ["React", "TypeScript", "D3.js", "Chart.js"],
  },
  {
    id: "agritech-erp",
    name: "Seed-to-sale agritech ERP",
    summary:
      "An ERP for regulated agriculture that handles compliance, sales, production and inventory across multiple sites.",
    highlights: [
      "Built a live inventory dashboard using WebSockets so teams no longer had to match stock numbers by hand.",
      "Added demand alerts that tell people about market changes as they happen.",
      "Set up CI/CD pipelines so releases went out smoothly.",
    ],
    tech: ["React", "Node.js", "GraphQL", "WebSockets"],
  },
  {
    id: "dataviz-library",
    name: "Reusable data visualization library",
    summary:
      "Chart components built on D3 and Chart.js and used across our React dashboards.",
    highlights: [
      "Cut the effort needed to add charts by 50%, so reporting features shipped faster.",
      "Built a Three.js tool for tagging 3D models in the browser.",
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
    period: "Aug 2023 – present",
    points: [
      "Lead development on our network management, compliance and AI security products.",
      "Make the main technical decisions, from how data moves between the API and the app to permissions and the component library shared across products.",
      "Build features all the way from the API to the screens people use every day to manage networks, documents and reports.",
    ],
  },
  {
    company: "Vmedulife Software",
    title: "Software Engineer",
    period: "Sept 2022 – Jun 2023",
    points: [
      "Built modules from start to release for ERP, OBE and academic products.",
      "Led a small team of developers on key modules built with React and Redux.",
    ],
  },
  {
    company: "Tata Consultancy Services",
    title: "Associate Software Engineer",
    period: "Feb 2021 – Sept 2022",
    points: [
      "Built a responsive phonebook app for a UK bank using reusable UI components.",
      "Connected the app to third-party vendor APIs to add new features.",
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
  period: "2016 – 2020",
};
