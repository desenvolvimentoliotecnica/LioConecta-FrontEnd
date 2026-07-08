# LioTransforma — Histórias de Usuário

> 52 histórias com critérios de aceite, organizadas por épico.

**Legenda de status:** `new` | `partial` | `integrated`  
**Legenda de prioridade:** `Alta` | `Média` | `Baixa`

---

## EPIC-TF-01 — Fundação do Módulo

### US-TF-001 — Acessar o módulo LioTransforma

| Campo | Valor |
|-------|-------|
| Epic | EPIC-TF-01 |
| Prioridade | Alta |
| Release | R5 |
| Rota | `/transforma` |

**Como** colaborador autenticado  
**Quero** acessar o LioTransforma pelo menu principal  
**Para** iniciar minha jornada de aprendizado e transformação

**Critérios de aceite:**
- [ ] Link "LioTransforma" visível na topbar para usuários com `transforma:learner`
- [ ] Rota `/transforma` carrega `TransformaShell` com menu lateral
- [ ] Usuário sem permissão vê mensagem de acesso negado
- [ ] Página registrada no sitemap e routeCatalog

---

### US-TF-002 — Navegar pelo menu do módulo

| Campo | Valor |
|-------|-------|
| Epic | EPIC-TF-01 |
| Prioridade | Alta |
| Release | R5 |

**Como** colaborador  
**Quero** navegar pelas seções Para Você, Explorar, Capacidades, etc.  
**Para** encontrar rapidamente o que preciso

**Critérios de aceite:**
- [ ] Menu lateral com 8 seções conforme arquitetura
- [ ] Submenus expansíveis (Explorar, Capacidades, Evolução, Transformação, Oportunidades)
- [ ] Item ativo destacado visualmente
- [ ] Breadcrumb em páginas internas

---

### US-TF-003 — Ver home "Para Você"

| Campo | Valor |
|-------|-------|
| Epic | EPIC-TF-01, EPIC-TF-11 |
| Prioridade | Alta |
| Release | R5 |
| Rota | `/transforma` |

**Como** colaborador  
**Quero** ver uma home personalizada ao entrar no LioTransforma  
**Para** ter visão do meu progresso e atividades relevantes

**Critérios de aceite:**
- [ ] Cards: treinamentos pendentes, progresso PDI, recomendações
- [ ] Placeholder para feed inteligente (integração R6)
- [ ] Atalhos rápidos: Explorar trilhas, Meu PDI, Desafios abertos

---

## EPIC-TF-02 — Aprendizado (LMS/LXP)

### US-TF-004 — Explorar catálogo de conteúdos

| Campo | Valor |
|-------|-------|
| Epic | EPIC-TF-02 |
| Prioridade | Alta |
| Release | R5 |
| Rota | `/transforma/explorar` |

**Como** colaborador  
**Quero** buscar e filtrar conteúdos de aprendizado  
**Para** encontrar cursos, vídeos e documentos relevantes

**Critérios de aceite:**
- [ ] Lista com cards: título, tipo, duração, academia, capacidades
- [ ] Filtros: tipo (vídeo, documento, podcast, microlearning), academia, obrigatório
- [ ] Busca por texto
- [ ] Paginação ou scroll infinito

---

### US-TF-005 — Consumir conteúdo de aprendizado

| Campo | Valor |
|-------|-------|
| Epic | EPIC-TF-02 |
| Prioridade | Alta |
| Release | R5 |

**Como** colaborador  
**Quero** assistir/ler conteúdos e ter meu progresso registrado  
**Para** completar meu aprendizado

**Critérios de aceite:**
- [ ] Player de vídeo integrado ou embed
- [ ] Visualizador de documentos (PDF)
- [ ] Player de podcast
- [ ] Microlearning: cards sequenciais
- [ ] Progresso salvo (% concluído)
- [ ] Marcação automática ao atingir 90% do vídeo ou última página

---

### US-TF-006 — Percorrer trilha de aprendizado

| Campo | Valor |
|-------|-------|
| Epic | EPIC-TF-02 |
| Prioridade | Alta |
| Release | R5 |
| Rota | `/transforma/explorar/trilhas` |

**Como** colaborador  
**Quero** seguir uma trilha sequencial de conteúdos  
**Para** desenvolver uma competência de forma estruturada

**Critérios de aceite:**
- [ ] Lista de trilhas com progresso visual
- [ ] Detalhe: módulos sequenciais, pré-requisitos
- [ ] Bloqueio de módulo seguinte até concluir anterior (configurável)
- [ ] Barra de progresso da trilha
- [ ] Emissão de certificado ao concluir 100%

---

### US-TF-007 — Realizar quiz/avaliação

| Campo | Valor |
|-------|-------|
| Epic | EPIC-TF-02 |
| Prioridade | Média |
| Release | R5 |

**Como** colaborador  
**Quero** responder quizzes ao final de módulos  
**Para** validar meu aprendizado

**Critérios de aceite:**
- [ ] Quiz com múltipla escolha e verdadeiro/falso
- [ ] Nota mínima configurável para aprovação
- [ ] Tentativas limitadas (configurável)
- [ ] Feedback imediato com explicações
- [ ] Bloqueio de certificado se reprovado

---

### US-TF-008 — Cumprir treinamento obrigatório

| Campo | Valor |
|-------|-------|
| Epic | EPIC-TF-02 |
| Prioridade | Alta |
| Release | R5 |

**Como** colaborador  
**Quero** ver meus treinamentos obrigatórios com prazos  
**Para** manter compliance e não perder prazos

**Critérios de aceite:**
- [ ] Badge "Obrigatório" em conteúdos designados
- [ ] Lista destacada na home "Para Você"
- [ ] Prazo com contagem regressiva
- [ ] Status: pendente, em andamento, concluído, vencido
- [ ] Notificação 7 dias e 1 dia antes do vencimento
- [ ] Relatório de compliance para gestor/RH

---

### US-TF-009 — Inscrever-se em evento

| Campo | Valor |
|-------|-------|
| Epic | EPIC-TF-02 |
| Prioridade | Média |
| Release | R5 |
| Rota | `/transforma/explorar/eventos` |

**Como** colaborador  
**Quero** me inscrever em workshops, webinars e eventos presenciais  
**Para** participar de experiências de aprendizado ao vivo

**Critérios de aceite:**
- [ ] Calendário de eventos futuros
- [ ] Tipos: workshop, webinar, presencial
- [ ] Inscrição com limite de vagas
- [ ] Confirmação por notificação
- [ ] Check-in presencial (QR code — fase posterior)
- [ ] Registro automático no histórico ao participar

---

### US-TF-010 — Visualizar certificados

| Campo | Valor |
|-------|-------|
| Epic | EPIC-TF-02 |
| Prioridade | Média |
| Release | R5 |
| Rota | `/transforma/evolucao/certificados` |

**Como** colaborador  
**Quero** ver e baixar meus certificados  
**Para** comprovar conclusões de trilhas e cursos

**Critérios de aceite:**
- [ ] Lista de certificados com data e trilha/curso
- [ ] Download PDF com nome, trilha, data, código verificação
- [ ] Certificados visíveis no perfil social

---

### US-TF-011 — Consultar histórico de aprendizado

| Campo | Valor |
|-------|-------|
| Epic | EPIC-TF-02 |
| Prioridade | Média |
| Release | R5 |
| Rota | `/transforma/evolucao/historico` |

**Como** colaborador  
**Quero** ver todo meu histórico de aprendizado  
**Para** acompanhar minha evolução ao longo do tempo

**Critérios de aceite:**
- [ ] Timeline cronológica de conclusões
- [ ] Filtro por tipo, academia, ano
- [ ] Total de horas de aprendizado
- [ ] Exportação CSV (opcional)

---

### US-TF-012 — Administrar conteúdos (admin/curador)

| Campo | Valor |
|-------|-------|
| Epic | EPIC-TF-02 |
| Prioridade | Alta |
| Release | R5 |

**Como** curador ou admin  
**Quero** criar e publicar conteúdos e trilhas  
**Para** alimentar o catálogo de aprendizado

**Critérios de aceite:**
- [ ] CRUD de conteúdos com upload de mídia
- [ ] Montagem de trilhas (arrastar módulos)
- [ ] Configurar obrigatoriedade e público-alvo
- [ ] Associar capacidades e academia
- [ ] Publicar/rascunho/arquivar

---

## EPIC-TF-03 — Capacidades & Skills

### US-TF-013 — Visualizar mapa de capacidades

| Campo | Valor |
|-------|-------|
| Epic | EPIC-TF-03 |
| Prioridade | Alta |
| Release | R5 |
| Rota | `/transforma/capacidades` |

**Como** colaborador  
**Quero** ver o mapa visual de capacidades da organização  
**Para** entender quais competências posso desenvolver

**Critérios de aceite:**
- [ ] Visualização hierárquica: domínio → subcapacidade
- [ ] Dois eixos: Transformação Digital e Excelência Operacional
- [ ] Indicador visual do meu nível em cada subcapacidade
- [ ] Link para trilhas relacionadas

---

### US-TF-014 — Gerenciar minhas capacidades

| Campo | Valor |
|-------|-------|
| Epic | EPIC-TF-03 |
| Prioridade | Alta |
| Release | R5 |
| Rota | `/transforma/capacidades/minhas` |

**Como** colaborador  
**Quero** auto-avaliar minhas capacidades  
**Para** registrar meu nível atual de proficiência

**Critérios de aceite:**
- [ ] Lista de subcapacidades com seletor 1–5 estrelas
- [ ] Status: auto-declarado, validado gestor, evidenciado
- [ ] Histórico de evolução
- [ ] Sugestão de trilhas para subir de nível

---

### US-TF-015 — Validar capacidades do time (gestor)

| Campo | Valor |
|-------|-------|
| Epic | EPIC-TF-03, EPIC-TF-14 |
| Prioridade | Média |
| Release | R7 |

**Como** gestor  
**Quero** validar ou ajustar as capacidades declaradas pelo meu time  
**Para** ter visão confiável das competências

**Critérios de aceite:**
- [ ] Lista de pendências de validação
- [ ] Aprovar, ajustar nível ou solicitar evidência
- [ ] Notificação ao colaborador

---

### US-TF-016 — Evoluir capacidade por conclusão de trilha

| Campo | Valor |
|-------|-------|
| Epic | EPIC-TF-03 |
| Prioridade | Alta |
| Release | R5 |

**Como** colaborador  
**Quero** que minhas capacidades evoluam automaticamente ao concluir trilhas  
**Para** ter evidência objetiva do meu desenvolvimento

**Critérios de aceite:**
- [ ] Trilha vinculada a subcapacidade(s)
- [ ] Ao concluir: nível atualizado com status "evidenciado"
- [ ] Não reduz nível auto-declarado maior
- [ ] Notificação de evolução

---

### US-TF-017 — Ver skills da organização

| Campo | Valor |
|-------|-------|
| Epic | EPIC-TF-03, EPIC-TF-15 |
| Prioridade | Média |
| Release | R7 |
| Rota | `/transforma/capacidades/organizacao` |

**Como** gestor ou diretor  
**Quero** ver agregado de capacidades da organização  
**Para** identificar forças e gaps

**Critérios de aceite:**
- [ ] Heatmap ou barras por domínio/subcapacidade
- [ ] Dados anonimizados (média, distribuição)
- [ ] Filtro por área/departamento
- [ ] Exportação para cockpit

---

## EPIC-TF-04 — PDI Integrado

### US-TF-018 — Criar e editar meu PDI

| Campo | Valor |
|-------|-------|
| Epic | EPIC-TF-04 |
| Prioridade | Alta |
| Release | R5 |
| Rota | `/transforma/evolucao/pdi` |

**Como** colaborador  
**Quero** criar meu PDI anual com objetivo e ações  
**Para** ter plano de desenvolvimento vivo na plataforma

**Critérios de aceite:**
- [ ] Um PDI ativo por ano
- [ ] Campo objetivo (texto livre)
- [ ] Ações: título, tipo (trilha, workshop, mentoria, projeto, case, outro)
- [ ] Status por ação: pendente, em andamento, concluído
- [ ] Barra de progresso geral (% ações concluídas)

---

### US-TF-019 — Vincular ações do PDI a recursos da plataforma

| Campo | Valor |
|-------|-------|
| Epic | EPIC-TF-04 |
| Prioridade | Alta |
| Release | R5 |

**Como** colaborador  
**Quero** vincular ações do PDI a trilhas, eventos e oportunidades  
**Para** que o progresso seja automático

**Critérios de aceite:**
- [ ] Autocomplete ao vincular trilha/evento/oportunidade existente
- [ ] Conclusão da trilha marca ação como concluída
- [ ] Ação manual pode ser marcada concluída com confirmação
- [ ] Deep-link da ação para o recurso

---

### US-TF-020 — Acompanhar progresso do PDI

| Campo | Valor |
|-------|-------|
| Epic | EPIC-TF-04 |
| Prioridade | Média |
| Release | R5 |

**Como** colaborador  
**Quero** ver visualmente o progresso do meu PDI  
**Para** manter motivação e foco

**Critérios de aceite:**
- [ ] Barra de progresso estilo `████████░░░░ 65%`
- [ ] Checklist visual: ✓ concluído, ○ pendente
- [ ] Resumo na home "Para Você"
- [ ] Comparativo com PDI do ano anterior (opcional)

---

### US-TF-021 — Receber lembretes de ações do PDI

| Campo | Valor |
|-------|-------|
| Epic | EPIC-TF-04 |
| Prioridade | Média |
| Release | R5 |

**Como** colaborador  
**Quero** ser notificado sobre ações do PDI próximas do prazo  
**Para** não perder compromissos de desenvolvimento

**Critérios de aceite:**
- [ ] Data limite opcional por ação
- [ ] Notificação 7 dias antes
- [ ] Notificação no dia do vencimento

---

### US-TF-022 — Visualizar PDIs do time (gestor)

| Campo | Valor |
|-------|-------|
| Epic | EPIC-TF-04, EPIC-TF-14 |
| Prioridade | Média |
| Release | R7 |

**Como** gestor  
**Quero** ver PDIs e progresso do meu time  
**Para** apoiar o desenvolvimento individual

**Critérios de aceite:**
- [ ] Lista de colaboradores com % progresso PDI
- [ ] Detalhe read-only do PDI
- [ ] Filtro: sem PDI, atrasado, em dia
- [ ] Sem edição pelo gestor (apenas visualização)

---

## EPIC-TF-05 — Academias Corporativas

### US-TF-023 — Explorar academias corporativas

| Campo | Valor |
|-------|-------|
| Epic | EPIC-TF-05 |
| Prioridade | Média |
| Release | R6 |
| Rota | `/transforma/explorar/academias` |

**Como** colaborador  
**Quero** navegar pelas academias temáticas  
**Para** encontrar conteúdos organizados por área de conhecimento

**Critérios de aceite:**
- [ ] 5 academias com cards visuais distintos
- [ ] Contagem de trilhas e conteúdos por academia
- [ ] Link para comunidade relacionada

---

### US-TF-024 — Ver detalhe de uma academia

| Campo | Valor |
|-------|-------|
| Epic | EPIC-TF-05 |
| Prioridade | Média |
| Release | R6 |
| Rota | `/transforma/explorar/academias/:slug` |

**Como** colaborador  
**Quero** ver trilhas, conteúdos e curadores de uma academia  
**Para** me aprofundar em uma área

**Critérios de aceite:**
- [ ] Header com identidade visual da academia
- [ ] Trilhas em destaque
- [ ] Conteúdos recentes
- [ ] Curadores listados

---

### US-TF-025 — Curar conteúdos de uma academia

| Campo | Valor |
|-------|-------|
| Epic | EPIC-TF-05 |
| Prioridade | Média |
| Release | R6 |

**Como** curador de academia  
**Quero** organizar e destacar conteúdos da minha academia  
**Para** manter curadoria de qualidade

**Critérios de aceite:**
- [ ] Destacar trilhas na home da academia
- [ ] Aprovar conteúdos submetidos à academia
- [ ] Reordenar trilhas em destaque

---

## EPIC-TF-06 — Transformação em Ação

### US-TF-026 — Ver dashboard de Transformação em Ação

| Campo | Valor |
|-------|-------|
| Epic | EPIC-TF-06 |
| Prioridade | Média |
| Release | R6 |
| Rota | `/transforma/transformacao` |

**Como** colaborador  
**Quero** ver iniciativas estratégicas ativas e métricas  
**Para** entender o que a empresa está transformando

**Critérios de aceite:**
- [ ] KPIs: iniciativas ativas, colaboradores envolvidos, áreas, impacto estimado
- [ ] Cards de iniciativas com status e progresso
- [ ] Filtro por área e status

---

### US-TF-027 — Participar de uma iniciativa

| Campo | Valor |
|-------|-------|
| Epic | EPIC-TF-06 |
| Prioridade | Média |
| Release | R6 |

**Como** colaborador  
**Quero** me inscrever em iniciativas de transformação  
**Para** aplicar meu conhecimento em projetos reais

**Critérios de aceite:**
- [ ] Botão "Participar" com confirmação
- [ ] Lista de participantes visível
- [ ] Notificação ao líder da iniciativa
- [ ] Aparece no perfil e PDI

---

### US-TF-028 — Acompanhar detalhe de iniciativa

| Campo | Valor |
|-------|-------|
| Epic | EPIC-TF-06 |
| Prioridade | Média |
| Release | R6 |
| Rota | `/transforma/transformacao/iniciativas/:id` |

**Como** colaborador participante  
**Quero** ver progresso, timeline e resultados da iniciativa  
**Para** acompanhar a evolução do projeto

**Critérios de aceite:**
- [ ] Descrição, objetivo, patrocinador
- [ ] Barra de progresso
- [ ] Timeline de marcos
- [ ] Resultados publicados
- [ ] Lista de participantes

---

### US-TF-029 — Publicar case de transformação

| Campo | Valor |
|-------|-------|
| Epic | EPIC-TF-06 |
| Prioridade | Baixa |
| Release | R6 |
| Rota | `/transforma/transformacao/cases` |

**Como** líder de iniciativa  
**Quero** publicar um case com resultados alcançados  
**Para** compartilhar aprendizados com a organização

**Critérios de aceite:**
- [ ] Formulário: título, contexto, solução, resultados, métricas
- [ ] Vinculação à iniciativa
- [ ] Publicação no feed e área de cases

---

## EPIC-TF-07 — Desafios de Transformação

### US-TF-030 — Ver desafios abertos

| Campo | Valor |
|-------|-------|
| Epic | EPIC-TF-07 |
| Prioridade | Média |
| Release | R6 |
| Rota | `/transforma/transformacao/desafios` |

**Como** colaborador  
**Quero** ver desafios de transformação abertos  
**Para** contribuir com ideias e soluções

**Critérios de aceite:**
- [ ] Lista com status: aberto, em seleção, em experimentação, encerrado
- [ ] Contadores: ideias, participantes, dias restantes
- [ ] Destaque para desafios da minha área

---

### US-TF-031 — Enviar ideia para um desafio

| Campo | Valor |
|-------|-------|
| Epic | EPIC-TF-07 |
| Prioridade | Média |
| Release | R6 |

**Como** colaborador  
**Quero** submeter minha ideia para um desafio  
**Para** propor soluções inovadoras

**Critérios de aceite:**
- [ ] Formulário: título, descrição, benefício esperado
- [ ] Anexo opcional (imagem, documento)
- [ ] Ideia listada publicamente (ou anônima — configurável)
- [ ] Contador de ideias atualizado

---

### US-TF-032 — Comentar e votar em ideias

| Campo | Valor |
|-------|-------|
| Epic | EPIC-TF-07 |
| Prioridade | Média |
| Release | R6 |

**Como** colaborador  
**Quero** comentar e votar nas ideias de um desafio  
**Para** ajudar na seleção das melhores propostas

**Critérios de aceite:**
- [ ] Thread de comentários por ideia
- [ ] Voto único por colaborador por desafio
- [ ] Ranking de ideias por votos
- [ ] Formar equipe em torno de uma ideia

---

### US-TF-033 — Gerenciar fases do desafio (admin)

| Campo | Valor |
|-------|-------|
| Epic | EPIC-TF-07 |
| Prioridade | Média |
| Release | R6 |

**Como** admin/diretoria  
**Quero** avançar desafios pelas fases do pipeline  
**Para** estruturar o processo de inovação

**Critérios de aceite:**
- [ ] Fases: Desafio → Ideias → Seleção → Experimentação → Piloto → Escala
- [ ] Transição manual com data e responsável
- [ ] Notificação aos participantes a cada fase
- [ ] Seleção de ideias finalistas

---

### US-TF-034 — Publicar desafio de transformação

| Campo | Valor |
|-------|-------|
| Epic | EPIC-TF-07 |
| Prioridade | Média |
| Release | R6 |

**Como** diretoria ou curador  
**Quero** publicar um novo desafio  
**Para** mobilizar a organização em torno de um problema

**Critérios de aceite:**
- [ ] Formulário: título, descrição, área, prazo, critérios
- [ ] Publicação no feed LioTransforma e feed global
- [ ] Patrocinador e equipe avaliadora

---

## EPIC-TF-08 — Oportunidades

### US-TF-035 — Receber recomendações de oportunidades

| Campo | Valor |
|-------|-------|
| Epic | EPIC-TF-08 |
| Prioridade | Média |
| Release | R6 |
| Rota | `/transforma/oportunidades` |

**Como** colaborador  
**Quero** ver oportunidades recomendadas após concluir trilhas  
**Para** aplicar meu conhecimento em projetos reais

**Critérios de aceite:**
- [ ] Card: projeto, área, dedicação, capacidades requeridas
- [ ] Match visual: ✓ capacidades que possuo
- [ ] Trigger: conclusão de trilha → recomendação
- [ ] Seção "Para você" na home

---

### US-TF-036 — Candidatar-se a oportunidade

| Campo | Valor |
|-------|-------|
| Epic | EPIC-TF-08 |
| Prioridade | Média |
| Release | R6 |

**Como** colaborador  
**Quero** clicar "Quero participar" em uma oportunidade  
**Para** me candidatar a um projeto

**Critérios de aceite:**
- [ ] Mensagem opcional ao gestor publicador
- [ ] Status: candidatado, aceito, recusado
- [ ] Notificação ao publicador
- [ ] Vinculação automática ao PDI se configurado

---

### US-TF-037 — Publicar oportunidade (gestor)

| Campo | Valor |
|-------|-------|
| Epic | EPIC-TF-08 |
| Prioridade | Média |
| Release | R6 |
| Rota | `/transforma/oportunidades/projetos` |

**Como** gestor  
**Quero** publicar oportunidades de projeto para o time  
**Para** atrair colaboradores com as skills certas

**Critérios de aceite:**
- [ ] Formulário: título, descrição, área, dedicação/semana, capacidades requeridas
- [ ] Prazo de candidatura
- [ ] Gerenciar candidatos: aceitar/recusar

---

### US-TF-038 — Conectar Learning → Skills → Projetos

| Campo | Valor |
|-------|-------|
| Epic | EPIC-TF-08 |
| Prioridade | Média |
| Release | R6 |

**Como** sistema  
**Quero** correlacionar trilhas concluídas, capacidades e oportunidades  
**Para** recomendar projetos relevantes automaticamente

**Critérios de aceite:**
- [ ] Motor de matching por overlap de capacidades
- [ ] Score de compatibilidade exibido
- [ ] Log de recomendações para analytics

---

## EPIC-TF-09 — Mentoria & Especialistas

### US-TF-039 — Buscar especialistas por capacidade

| Campo | Valor |
|-------|-------|
| Epic | EPIC-TF-09 |
| Prioridade | Baixa |
| Release | R7 |
| Rota | `/transforma/oportunidades/mentorias` |

**Como** colaborador  
**Quero** encontrar especialistas internos em uma capacidade  
**Para** solicitar mentoria

**Critérios de aceite:**
- [ ] Busca por capacidade (ex: Power BI)
- [ ] Cards: nome, área, rating, disponibilidade
- [ ] Filtro por área

---

### US-TF-040 — Solicitar mentoria

| Campo | Valor |
|-------|-------|
| Epic | EPIC-TF-09 |
| Prioridade | Baixa |
| Release | R7 |

**Como** colaborador  
**Quero** solicitar mentoria, shadowing ou sessão de dúvidas  
**Para** aprender com quem já domina o assunto

**Critérios de aceite:**
- [ ] Tipos: mentoria, conversa, dúvidas, shadowing, acompanhamento
- [ ] Mensagem ao especialista
- [ ] Fluxo: solicitado → aceito/recusado → em andamento → concluído
- [ ] Avaliação mútua ao concluir

---

### US-TF-041 — Aceitar solicitações de mentoria (mentor)

| Campo | Valor |
|-------|-------|
| Epic | EPIC-TF-09 |
| Prioridade | Baixa |
| Release | R7 |

**Como** especialista/mentor  
**Quero** gerenciar solicitações de mentoria  
**Para** compartilhar conhecimento de forma organizada

**Critérios de aceite:**
- [ ] Opt-in para ser mentor no perfil
- [ ] Capacidades que aceita mentorar
- [ ] Limite de mentorias simultâneas
- [ ] Aceitar/recusar com mensagem

---

### US-TF-042 — Vincular mentoria ao PDI

| Campo | Valor |
|-------|-------|
| Epic | EPIC-TF-09 |
| Prioridade | Baixa |
| Release | R7 |

**Como** colaborador  
**Quero** vincular uma mentoria como ação do meu PDI  
**Para** contabilizar no meu desenvolvimento

**Critérios de aceite:**
- [ ] Ação tipo "mentoria" no PDI
- [ ] Conclusão da mentoria marca ação como concluída
- [ ] Mentor recebe badge após N mentorias

---

## EPIC-TF-10 — Compartilhamento de Conhecimento

### US-TF-043 — Publicar conhecimento

| Campo | Valor |
|-------|-------|
| Epic | EPIC-TF-10 |
| Prioridade | Média |
| Release | R6 |
| Rota | `/transforma/conhecimento` |

**Como** colaborador autorizado  
**Quero** publicar artigo, vídeo, tutorial ou case  
**Para** compartilhar conhecimento com a organização

**Critérios de aceite:**
- [ ] Tipos: artigo, vídeo, tutorial, case, checklist, apresentação, boas práticas
- [ ] Editor rich text (TipTap — já no projeto)
- [ ] Tags e capacidades associadas
- [ ] Rascunho/publicado
- [ ] Moderação por curador (opcional)

---

### US-TF-044 — Explorar conhecimento publicado

| Campo | Valor |
|-------|-------|
| Epic | EPIC-TF-10 |
| Prioridade | Média |
| Release | R6 |

**Como** colaborador  
**Quero** buscar e filtrar conhecimentos publicados  
**Para** aprender com colegas

**Critérios de aceite:**
- [ ] Feed de conhecimentos com busca e tags
- [ ] Ordenação: recentes, populares
- [ ] Contagem de visualizações e reações

---

### US-TF-045 — Distribuir conhecimento no feed social

| Campo | Valor |
|-------|-------|
| Epic | EPIC-TF-10, EPIC-TF-11 |
| Prioridade | Média |
| Release | R6 |

**Como** sistema  
**Quero** que publicações de conhecimento apareçam no feed  
**Para** amplificar alcance

**Critérios de aceite:**
- [ ] Post automático no feed LioConecta ao publicar
- [ ] Deep-link para `/transforma/conhecimento/:id`
- [ ] Reações e comentários do feed

---

### US-TF-046 — Moderar conhecimento (curador)

| Campo | Valor |
|-------|-------|
| Epic | EPIC-TF-10 |
| Prioridade | Baixa |
| Release | R6 |

**Como** curador  
**Quero** aprovar ou rejeitar publicações pendentes  
**Para** garantir qualidade do conteúdo

**Critérios de aceite:**
- [ ] Fila de moderação
- [ ] Aprovar, rejeitar com motivo, solicitar revisão
- [ ] Notificação ao autor

---

## EPIC-TF-11 — Feed Social Inteligente

### US-TF-047 — Ver feed personalizado no LioTransforma

| Campo | Valor |
|-------|-------|
| Epic | EPIC-TF-11 |
| Prioridade | Média |
| Release | R6 |

**Como** colaborador  
**Quero** ver atividades relevantes na home do LioTransforma  
**Para** me manter engajado com a comunidade

**Critérios de aceite:**
- [ ] Mix: conclusões, publicações, desafios, badges, celebrações
- [ ] Ações: parabenizar, curtir, comentar, participar
- [ ] Algoritmo básico: área, capacidades, academias seguidas

---

### US-TF-048 — Celebrar conclusão de colega

| Campo | Valor |
|-------|-------|
| Epic | EPIC-TF-11 |
| Prioridade | Baixa |
| Release | R6 |

**Como** colaborador  
**Quero** parabenizar colegas que concluíram trilhas  
**Para** reforçar cultura de aprendizado

**Critérios de aceite:**
- [ ] Botão "Celebrar" / "Parabenizar"
- [ ] Contador de celebrações visível
- [ ] Notificação ao celebrado

---

### US-TF-049 — Receber recomendações de conteúdo

| Campo | Valor |
|-------|-------|
| Epic | EPIC-TF-11 |
| Prioridade | Média |
| Release | R6 |

**Como** colaborador  
**Quero** ver trilhas e conteúdos recomendados para mim  
**Para** descobrir aprendizados relevantes

**Critérios de aceite:**
- [ ] Baseado em: capacidades, PDI, área, histórico
- [ ] Seção "Recomendado para você" na home
- [ ] Mínimo 3 recomendações quando houver dados

---

## EPIC-TF-12 — Gamificação Corporativa

### US-TF-050 — Conquistar badges automaticamente

| Campo | Valor |
|-------|-------|
| Epic | EPIC-TF-12 |
| Prioridade | Baixa |
| Release | R7 |

**Como** colaborador  
**Quero** ganhar badges por contribuições e aprendizado  
**Para** ser reconhecido de forma elegante

**Critérios de aceite:**
- [ ] Badges: Especialista, Mentor, Multiplicador, Inovador, Transformador, Colaborador, Explorador Digital, Aprendizado Contínuo
- [ ] Regras automáticas (ex: 10 conhecimentos → Multiplicador)
- [ ] Notificação e post no feed ao conquistar
- [ ] Visual corporativo (não infantil)

---

### US-TF-051 — Ver minhas conquistas

| Campo | Valor |
|-------|-------|
| Epic | EPIC-TF-12 |
| Prioridade | Baixa |
| Release | R7 |

**Como** colaborador  
**Quero** ver todos os badges que conquistei e os próximos  
**Para** ter visão do meu reconhecimento

**Critérios de aceite:**
- [ ] Galeria de badges conquistados e bloqueados
- [ ] Critério de cada badge visível
- [ ] Progresso para próximo badge (ex: 7/10 conhecimentos)

---

## EPIC-TF-13 — Perfil Integrado

### US-TF-052 — Ver dados LioTransforma no perfil social

| Campo | Valor |
|-------|-------|
| Epic | EPIC-TF-13 |
| Prioridade | Média |
| Release | R6 |

**Como** colega ou gestor  
**Quero** ver capacidades, badges e certificações no perfil  
**Para** conhecer a expertise de um colaborador

**Critérios de aceite:**
- [ ] Seções no perfil: Capacidades (★), Badges, Certificações, Conteúdos publicados, Projetos de transformação
- [ ] Dados sincronizados do LioTransforma
- [ ] Configuração de visibilidade pelo dono do perfil

---

## Resumo quantitativo

| Epic | Histórias |
|------|-----------|
| EPIC-TF-01 | 3 |
| EPIC-TF-02 | 9 |
| EPIC-TF-03 | 5 |
| EPIC-TF-04 | 5 |
| EPIC-TF-05 | 3 |
| EPIC-TF-06 | 4 |
| EPIC-TF-07 | 5 |
| EPIC-TF-08 | 4 |
| EPIC-TF-09 | 4 |
| EPIC-TF-10 | 4 |
| EPIC-TF-11 | 3 |
| EPIC-TF-12 | 2 |
| EPIC-TF-13 | 1 |
| **Total** | **52** |

*EPIC-TF-14 (Gestor) e EPIC-TF-15 (Cockpit) são cobertos por extensões de US-TF-015, US-TF-017, US-TF-022 e tasks dedicadas nos specs.*
