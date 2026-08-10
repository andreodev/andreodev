# Andreo Henrique

```ts
const andreo = {
  role: "Full Stack Software Engineer",
  location: "Manaus, AM - Brasil",
  currentFocus: [
    "fintech platforms",
    "payment gateways",
    "Pix and BaaS",
    "marketplaces",
    "dashboards",
    "multi-tenant SaaS",
  ],
  workingAt: "Wite Group",
  mindset: "produto bem pensado, código limpo e interface que não atrapalha o usuário",
} as const;
```

```ts
export const aboutMe = {
  summary:
    "Sou desenvolvedor full stack com foco em aplicações web complexas, produtos financeiros, marketplaces e interfaces de alta usabilidade.",
  dayToDay:
    "Construo features de ponta a ponta, integro APIs, modelo fluxos de negócio e transformo requisitos bagunçados em software entregável.",
  engineeringTaste: [
    "TypeScript como contrato mental",
    "componentes reutilizáveis sem exagerar na abstração",
    "APIs claras, previsíveis e fáceis de manter",
    "dashboards rápidos para operações reais",
    "UX simples o bastante para parecer óbvia",
  ],
} as const;
```

## Stack Principal

```ts
export const stack = {
  frontend: ["React", "Next.js", "TypeScript", "JavaScript", "Tailwind CSS", "Vite"],
  backend: ["Node.js", "NestJS", "REST APIs", "Go"],
  mobile: ["React Native", "Firebase"],
  data: ["SQL", "MongoDB"],
  productDomains: ["Fintech", "Pix", "BaaS", "Payment Gateway", "Marketplace", "SaaS"],
  workflow: ["Git", "debugging", "refactoring", "performance", "agile delivery"],
} as const;
```

## Projetos Selecionados

```ts
export const featuredProjects = [
  {
    name: "Sistema de Gestão para Oficinas Multi-Tenant",
    repo: "github.com/andreodev/car-workshop",
    description:
      "Plataforma full stack para oficinas automotivas com clientes, veículos, ordens de serviço, agenda, estoque, PDV e financeiro em arquitetura multi-tenant.",
    highlights: [
      "fluxo operacional para atendimento, orçamento, OS e venda",
      "painel administrativo e experiência white-label",
      "módulos de estoque, financeiro, clientes, veículos e mecânicos",
    ],
    stack: ["React", "TypeScript", "Node.js", "SQL", "REST APIs"],
  },
  {
    name: "AutoCore / LP Workshop",
    repo: "github.com/andreodev/lp-workshop",
    description:
      "Landing page de produto para uma plataforma white-label de gestão para oficinas, com preview interativo do dashboard e foco em conversão.",
    highlights: [
      "demo visual com troca de marcas",
      "módulos simulados de OS, financeiro, estoque e atendimento",
      "UI moderna com motion e componentes orientados a produto",
    ],
    stack: ["React", "TypeScript", "Tailwind CSS", "Motion", "Vite"],
  },
  {
    name: "Sentinel",
    repo: "github.com/andreodev/go-pay",
    description:
      "API em Go para processamento seguro de webhooks de pagamento, prevenção de eventos duplicados e análise de risco antifraude em tempo real.",
    highlights: ["idempotência", "webhooks", "risk scoring", "regras de negócio"],
    stack: ["Go", "APIs", "Payments", "Antifraud"],
  },
  {
    name: "FoodBoxd",
    repo: "github.com/andreodev/FoodBox",
    description:
      "App mobile para gestão de cardápios e avaliações de refeições, com fluxo para gestores, usuários, notas, comentários e informações nutricionais.",
    highlights: ["mobile app", "avaliações", "dashboard de desempenho", "Firebase"],
    stack: ["React Native", "Firebase"],
  },
  {
    name: "Takusan",
    repo: "github.com/andreodev/Takusan",
    live: "takusan.vercel.app",
    description:
      "Aplicação web para explorar animes populares, detalhes, trailers, personagens e gêneros com uma UI animada e performática.",
    highlights: ["GraphQL", "UI animada", "detalhes dinâmicos", "performance"],
    stack: ["React", "Vite", "Tailwind CSS", "GraphQL", "Framer Motion"],
  },
] as const;
```

## Experiência

```ts
export const experience = [
  {
    company: "Wite Group",
    role: "Full Stack Software Developer",
    context:
      "Evolução de uma plataforma fintech com marketplace, gateway de pagamento, Pix, BaaS, produtos, links de pagamento, transações e dashboards financeiros.",
    stack: ["Node.js", "NestJS", "TypeScript", "React", "REST APIs"],
  },
  {
    company: "InovStar Atendimento",
    role: "Full-Stack Developer",
    context:
      "Desenvolvimento de aplicações web, APIs, integrações com MongoDB e sistema de chat integrado com WhatsApp API.",
    stack: ["React", "Node.js", "TypeScript", "MongoDB", "WhatsApp API"],
  },
  {
    company: "Planno Finanças",
    role: "Full Stack Developer Intern",
    context:
      "Features frontend, integrações REST, correção de bugs, refatorações e entregas em sprints ágeis.",
    stack: ["Vue.js", "React", "REST APIs", "Agile"],
  },
] as const;
```

## Como Eu Trabalho

```ts
export const principles = {
  productFirst: "antes de codar, entender o problema que o usuário realmente tem",
  codeQuality: "menos magia, mais clareza; menos improviso, mais manutenção",
  delivery:
    "shippar com critério: validar o fluxo, medir impacto e deixar o próximo dev em paz",
  ux:
    "interface boa é aquela que reduz atrito, explica o caminho e não exige manual",
} as const;
```

## Contato

```ts
export const contact = {
  github: "https://github.com/andreodev",
  linkedin: "https://www.linkedin.com/in/andreo-henrique/",
  instagram: "https://www.instagram.com/andreodevv",
  email: "developerandreo@gmail.com",
} as const;

export default {
  developer: andreo,
  aboutMe,
  stack,
  featuredProjects,
  experience,
  principles,
  contact,
};
```
