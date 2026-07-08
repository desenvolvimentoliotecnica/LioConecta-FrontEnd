# LioTransforma — Mapa de Capacidades

> Taxonomia organizacional de competências para o módulo Capacidades.

---

## 1. Estrutura hierárquica

```
Capacidade (nível 1 — domínio)
└── Subcapacidade (nível 2 — skill específica)
    └── Nível do colaborador: 1–5 estrelas
```

Cada subcapacidade pode ser:
- **Auto-declarada** pelo colaborador
- **Validada** pelo gestor
- **Evidenciada** por conclusão de trilha/certificação no LioTransforma

---

## 2. Domínio: Transformação Digital

| ID | Subcapacidade | Descrição | Trilhas sugeridas |
|----|---------------|-----------|-------------------|
| `TD-CULT` | Cultura Digital | Mindset digital, colaboração virtual, ferramentas | Onboarding Digital, Ferramentas LioConecta |
| `TD-GM` | Gestão da Mudança | ADKAR, comunicação de mudanças, resistência | Gestão da Mudança na Prática |
| `TD-AUTO` | Automação | RPA, workflows, integração de sistemas | Introdução à Automação |
| `TD-IA` | Inteligência Artificial | IA generativa, casos de uso, ética | IA para o Dia a Dia, AI Explorer |
| `TD-DADOS` | Dados e Analytics | Power BI, SQL, storytelling com dados | Power BI Intermediário, Dados para Decisão |
| `TD-EXP` | Experiência Digital | UX, jornada do colaborador, design thinking | UX Essencial |
| `TD-INOV` | Inovação | Design thinking, prototipação, lean startup | Inovação na Liotécnica |

---

## 3. Domínio: Excelência Operacional

| ID | Subcapacidade | Descrição | Trilhas sugeridas |
|----|---------------|-----------|-------------------|
| `EO-LEAN` | Lean | 5S, Kaizen, eliminação de desperdícios | Lean Manufacturing Básico |
| `EO-MC` | Melhoria Contínua | PDCA, ciclos de melhoria, gemba | Melhoria Contínua na Prática |
| `EO-GP` | Gestão de Processos | Mapeamento, BPM, padronização | Mapeamento de Processos |
| `EO-IND` | Indicadores | KPIs, dashboards, metas | Indicadores que Importam |
| `EO-ACR` | Análise de Causa Raiz | 5 Porquês, Ishikawa, 8D | Resolução de Problemas 8D |
| `EO-RP` | Resolução de Problemas | A3, PDCA aplicado, tomada de decisão | Problem Solving Avançado |

---

## 4. Domínio: Liderança (Academia de Liderança)

| ID | Subcapacidade | Descrição |
|----|---------------|-----------|
| `LD-NL` | Novos Líderes | Transição IC → gestor |
| `LD-FB` | Feedback | Feedback estruturado, 1:1 |
| `LD-GE` | Gestão de Equipes | Delegação, motivação, conflitos |
| `LD-COM` | Comunicação | Comunicação assertiva, apresentações |
| `LD-SUC` | Sucessão | Planejamento de sucessores, desenvolvimento |

---

## 5. Domínio: Negócios (Academia de Negócios)

| ID | Subcapacidade | Descrição |
|----|---------------|-----------|
| `NG-FIN` | Finanças | Demonstrativos, orçamento, custos |
| `NG-IBP` | IBP | Integrated Business Planning |
| `NG-VND` | Vendas | Técnicas comerciais, CRM |
| `NG-EST` | Estratégia | OKRs, planejamento estratégico |
| `NG-IND` | Indicadores de Negócio | KPIs comerciais e financeiros |

---

## 6. Domínio: Cultura (Academia de Cultura)

| ID | Subcapacidade | Descrição |
|----|---------------|-----------|
| `CU-ONB` | Onboarding | Integração de novos colaboradores |
| `CU-VAL` | Valores | Cultura Liotécnica, missão/visão |
| `CU-ETI` | Ética | Código de conduta, integridade |
| `CU-LGPD` | LGPD | Privacidade, tratamento de dados |
| `CU-DIV` | Diversidade | Inclusão, equidade |
| `CU-ORG` | Cultura Organizacional | Rituais, reconhecimento |

---

## 7. Domínio: Industrial (Academia Industrial)

| ID | Subcapacidade | Descrição |
|----|---------------|-----------|
| `IN-PROC` | Processos Produtivos | Operação de linha, OEE |
| `IN-SEG` | Segurança | NR, EPI, segurança comportamental |
| `IN-QUAL` | Qualidade | ISO, controle estatístico |
| `IN-MAN` | Manutenção | TPM, manutenção preventiva |
| `IN-EO` | Excelência Operacional | (link para domínio EO) |

---

## 8. Domínio: Digital/TI (Academia Digital)

| ID | Subcapacidade | Descrição |
|----|---------------|-----------|
| `DG-DEV` | Desenvolvimento | C#, .NET, arquitetura |
| `DG-CIB` | Cibersegurança | Segurança da informação, phishing |
| `DG-IA` | Inteligência Artificial | (link TD-IA) |
| `DG-DAD` | Dados | (link TD-DADOS) |
| `DG-AUT` | Automação | (link TD-AUTO) |

---

## 9. Níveis de proficiência

| Estrelas | Nível | Critério sugerido |
|----------|-------|-------------------|
| ★☆☆☆☆ | Iniciante | Conhece conceitos básicos |
| ★★☆☆☆ | Básico | Aplica com supervisão |
| ★★★☆☆ | Intermediário | Aplica de forma independente |
| ★★★★☆ | Avançado | Ensina outros; referência no time |
| ★★★★★ | Especialista | Referência na organização; mentor |

---

## 10. Regras de evolução automática

| Evento | Efeito na capacidade |
|--------|---------------------|
| Conclusão de trilha vinculada | +1 nível (máx. evidenciado pela trilha) |
| Certificação externa validada | Nível definido pelo admin |
| Mentoria concluída (mentor) | Reforço em capacidade relacionada |
| Publicação de conhecimento (10+) | Badge Multiplicador |
| Participação em 5 desafios | Badge Inovador |

---

## 11. Implementação técnica

```typescript
// src/config/transforma/capabilities.ts (proposto)
export interface CapabilityDomain {
  id: string;
  name: string;
  icon: string;
  academySlug?: string;
  subcapabilities: SubCapability[];
}

export interface SubCapability {
  id: string;
  name: string;
  description: string;
  linkedTrailIds?: string[];
}
```

---

## 12. Uso nos módulos

| Módulo | Uso da taxonomia |
|--------|------------------|
| Capacidades | Mapa visual, auto-avaliação |
| Trilhas | Tags de capacidades desenvolvidas |
| PDI | Objetivos vinculados a subcapacidades |
| Oportunidades | Requisitos de skills |
| Mentoria | Busca de especialistas |
| Cockpit | Agregação % por domínio |
| Perfil | Exibição de skills com estrelas |
