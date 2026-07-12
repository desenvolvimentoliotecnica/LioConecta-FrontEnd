/**
 * UniLio SCORM Demo — Cultura de Segurança da Informação
 */
(function () {
  'use strict';

  var PASS_THRESHOLD = 70;
  var QUIZ_MODULE_ID = 'quiz';

  var isUatMode = (function () {
    try {
      return new URLSearchParams(window.location.search).get('uat') === '1';
    } catch (e) {
      return false;
    }
  })();

  var MODULES = [
    {
      id: 'welcome',
      title: 'Boas-vindas',
      illustration: 'assets/hero.svg',
      hero: true,
      content: function () {
        return (
          '<p>Bem-vindo(a) a este curso de conscientização sobre <strong>Cultura de Segurança da Informação no dia a dia</strong>. ' +
          'Aqui você vai aprender práticas essenciais para proteger dados, dispositivos e a reputação da organização — ' +
          'no escritório, em casa ou em qualquer lugar onde você se conecte.</p>' +
          '<div class="callout">' +
          '<strong>Por que este curso importa?</strong> A segurança da informação não é responsabilidade exclusiva da TI. ' +
          'Cada colaborador é a primeira linha de defesa contra phishing, vazamentos e incidentes que podem afetar clientes, ' +
          'colegas e a continuidade dos negócios.' +
          '</div>' +
          '<p>O percurso possui <strong>11 módulos</strong>, incluindo vídeos de referência pública, uma reflexão guiada e um ' +
          'questionário final. Avance na ordem sugerida para desbloquear os próximos conteúdos.</p>' +
          '<p>Duração estimada: <strong>45 minutos</strong>.</p>'
        );
      }
    },
    {
      id: 'objectives',
      title: 'Objetivos',
      illustration: 'assets/objectives.svg',
      content: function () {
        return (
          '<h2>O que você vai aprender</h2>' +
          '<p>Ao concluir este curso, você será capaz de:</p>' +
          '<ul>' +
          '<li>Reconhecer por que a segurança da informação é estratégica para pessoas e organizações;</li>' +
          '<li>Aplicar boas práticas de senhas, autenticação multifator e gerenciamento de credenciais;</li>' +
          '<li>Identificar tentativas de phishing, engenharia social e golpes digitais;</li>' +
          '<li>Adotar hábitos seguros em dispositivos móveis e no trabalho remoto;</li>' +
          '<li>Compreender fundamentos da LGPD no cotidiano profissional;</li>' +
          '<li>Saber como reportar incidentes de segurança de forma adequada;</li>' +
          '<li>Demonstrar aprendizado no questionário final (nota mínima de 70%).</li>' +
          '</ul>' +
          '<div class="callout">' +
          '<strong>Público-alvo:</strong> colaboradores de todas as áreas que utilizam sistemas corporativos, ' +
          'e-mail institucional, dispositivos móveis ou acesso remoto.' +
          '</div>'
        );
      }
    },
    {
      id: 'importance',
      title: 'Por que segurança importa',
      illustration: 'assets/importance.svg',
      content: function () {
        return (
          '<h2>Segurança é responsabilidade de todos</h2>' +
          '<p>Incidentes de segurança raramente começam com falhas complexas de infraestrutura. Na maioria das vezes, ' +
          'um clique em link malicioso, uma senha reutilizada ou um arquivo anexo infectado são suficientes para comprometer ' +
          'contas, dados de clientes e operações críticas.</p>' +
          '<p>Segundo o CERT.br, o Centro de Estudos, Resposta e Tratamento de Incidentes de Segurança no Brasil, ' +
          'a conscientização é um dos pilares para reduzir riscos na Internet. Campanhas de phishing, ransomware e golpes ' +
          'financeiros evoluem constantemente — por isso, manter-se informado é parte do trabalho.</p>' +
          '<ul>' +
          '<li><strong>Impacto financeiro:</strong> multas regulatórias, custos de recuperação e perda de produtividade;</li>' +
          '<li><strong>Impacto reputacional:</strong> perda de confiança de clientes e parceiros;</li>' +
          '<li><strong>Impacto pessoal:</strong> exposição de dados pessoais e profissionais;</li>' +
          '<li><strong>Impacto operacional:</strong> indisponibilidade de sistemas essenciais.</li>' +
          '</ul>' +
          '<div class="video-embed">' +
          '<iframe src="https://www.youtube.com/embed/6FxSx4reJN4" title="Lançamento Cidadão na Rede — NIC.br" ' +
          'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>' +
          '</div>' +
          '<p class="video-credit">Fonte: NIC.br / CERT.br — Projeto Cidadão na Rede (conteúdo público de conscientização em segurança).</p>'
        );
      }
    },
    {
      id: 'passwords',
      title: 'Senhas e autenticação',
      illustration: 'assets/passwords.svg',
      content: function () {
        return (
          '<h2>Proteja suas credenciais</h2>' +
          '<p>Senhas fracas e reutilizadas continuam entre as principais causas de invasão de contas. ' +
          'Quando um serviço sofre vazamento, criminosos testam a mesma senha em bancos, e-mails corporativos e redes sociais.</p>' +
          '<h2>Boas práticas recomendadas</h2>' +
          '<ul>' +
          '<li>Use senhas <strong>longas e únicas</strong> para cada serviço (12+ caracteres);</li>' +
          '<li>Prefira frases-senha ou combinações aleatórias geradas por um gerenciador;</li>' +
          '<li>Ative a <strong>verificação em duas etapas (2FA/MFA)</strong> sempre que disponível;</li>' +
          '<li>Nunca compartilhe senhas por chat, e-mail ou telefone;</li>' +
          '<li>Altere imediatamente credenciais suspeitas de comprometimento;</li>' +
          '<li>Não anote senhas em post-its, planilhas sem criptografia ou documentos compartilhados.</li>' +
          '</ul>' +
          '<div class="callout callout--warning">' +
          '<strong>Atenção:</strong> a TI nunca solicitará sua senha por e-mail ou telefone. Desconfie de mensagens urgentes pedindo credenciais.' +
          '</div>' +
          '<div class="video-embed">' +
          '<iframe src="https://www.youtube.com/embed/NJkjybS6h7w" title="Senhas variadas — Cidadão na Rede" ' +
          'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>' +
          '</div>' +
          '<p class="video-credit">Fonte: NIC.br — Cidadão na Rede, série de conscientização em autenticação e senhas seguras.</p>'
        );
      }
    },
    {
      id: 'phishing',
      title: 'Phishing',
      illustration: 'assets/phishing.svg',
      content: function () {
        return (
          '<h2>Reconhecendo tentativas de phishing</h2>' +
          '<p>Phishing é uma técnica em que criminosos se passam por instituições confiáveis para obter senhas, dados bancários ' +
          'ou instalar malware. Os ataques chegam por e-mail, SMS, WhatsApp e redes sociais com urgência artificial.</p>' +
          '<h2>Sinais de alerta</h2>' +
          '<ul>' +
          '<li>Remetente com domínio diferente do esperado (ex.: n1c.br em vez de nic.br);</li>' +
          '<li>Links que não correspondem ao texto visível ao passar o mouse;</li>' +
          '<li>Erros de português, formatação estranha ou logos desatualizados;</li>' +
          '<li>Pressão por ação imediata: "sua conta será bloqueada", "confirme em 24h";</li>' +
          '<li>Anexos inesperados (.zip, .exe, .html) de remetentes desconhecidos.</li>' +
          '</ul>' +
          '<h2>O que fazer</h2>' +
          '<ol>' +
          '<li><strong>Não clique</strong> em links ou anexos suspeitos;</li>' +
          '<li>Verifique pelo canal oficial (site/app digitado manualmente);</li>' +
          '<li>Encaminhe suspeitas para cert@cert.br ou para a equipe de segurança da empresa;</li>' +
          '<li>Denuncie como phishing no seu cliente de e-mail quando disponível.</li>' +
          '</ol>' +
          '<div class="video-embed">' +
          '<iframe src="https://www.youtube.com/embed/KoimlJYKiHE" title="Não clique em links desconhecidos — Cidadão na Rede" ' +
          'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>' +
          '</div>' +
          '<p class="video-credit">Fonte: CERT.br / NIC.br — Cidadão na Rede: Não clique em links desconhecidos.</p>'
        );
      }
    },
    {
      id: 'remote-work',
      title: 'Dispositivos e trabalho remoto',
      illustration: 'assets/remote-work.svg',
      content: function () {
        return (
          '<h2>Segurança fora do escritório</h2>' +
          '<p>O trabalho remoto ampliou a superfície de ataque: notebooks pessoais, redes Wi-Fi domésticas e ambientes compartilhados ' +
          'exigem cuidados adicionais para proteger dados corporativos.</p>' +
          '<h2>Dispositivos corporativos</h2>' +
          '<ul>' +
          '<li>Mantenha sistema operacional e aplicativos <strong>sempre atualizados</strong>;</li>' +
          '<li>Use bloqueio automático de tela (máximo 5 minutos de inatividade);</li>' +
          '<li>Não instale software não autorizado pela política de TI;</li>' +
          '<li>Ative criptografia de disco (BitLocker/FileVault) quando disponível;</li>' +
          '<li>Faça backup regular de arquivos importantes conforme orientação da empresa.</li>' +
          '</ul>' +
          '<h2>Trabalho remoto seguro</h2>' +
          '<ul>' +
          '<li>Prefira VPN corporativa para acessar sistemas internos;</li>' +
          '<li>Evite redes Wi-Fi públicas para acessos sensíveis; use hotspot pessoal se necessário;</li>' +
          '<li>Posicione a tela para evitar shoulder surfing em cafés e coworkings;</li>' +
          '<li>Não compartilhe dispositivos corporativos com familiares;</li>' +
          '<li>Desconecte da VPN ao finalizar o expediente.</li>' +
          '</ul>' +
          '<div class="callout">' +
          '<strong>Perdeu ou teve o celular/notebook roubado?</strong> Comunique imediatamente a TI para bloqueio remoto, ' +
          'revogação de acessos e registro do incidente.' +
          '</div>'
        );
      }
    },
    {
      id: 'lgpd',
      title: 'LGPD no cotidiano',
      illustration: 'assets/lgpd.svg',
      content: function () {
        return (
          '<h2>Proteção de dados no dia a dia</h2>' +
          '<p>A Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018) estabelece regras sobre coleta, uso, armazenamento ' +
          'e compartilhamento de dados pessoais. No ambiente corporativo, cada colaborador que manipula informações de clientes, ' +
          'colaboradores ou fornecedores tem responsabilidades práticas.</p>' +
          '<h2>Princípios que você deve aplicar</h2>' +
          '<ul>' +
          '<li><strong>Necessidade:</strong> acesse apenas dados necessários para sua função;</li>' +
          '<li><strong>Finalidade:</strong> use informações somente para o propósito autorizado;</li>' +
          '<li><strong>Minimização:</strong> não copie bases de dados para uso pessoal ou não autorizado;</li>' +
          '<li><strong>Segurança:</strong> proteja arquivos com senha, evite enviar dados sensíveis por canais inseguros;</li>' +
          '<li><strong>Transparência:</strong> informe titulares quando solicitado conforme procedimentos internos.</li>' +
          '</ul>' +
          '<div class="callout callout--warning">' +
          '<strong>Dados sensíveis</strong> (saúde, biometria, origem racial, convicção religiosa) exigem proteção reforçada. ' +
          'Em caso de dúvida, consulte o encarregado de dados (DPO) ou jurídico.' +
          '</div>' +
          '<div class="video-embed">' +
          '<iframe src="https://www.youtube.com/embed/1kMVsuuZkXo" title="LGPD e Privacidade — ANPD" ' +
          'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>' +
          '</div>' +
          '<p class="video-credit">Fonte: conteúdo público sobre LGPD, privacidade e segurança da informação (ANPD / instituições governamentais).</p>'
        );
      }
    },
    {
      id: 'incidents',
      title: 'Incidentes',
      illustration: 'assets/incidents.svg',
      content: function () {
        return (
          '<h2>Como agir diante de um incidente</h2>' +
          '<p>Um incidente de segurança é qualquer evento que comprometa ou possa comprometer a confidencialidade, integridade ' +
          'ou disponibilidade de informações. Agir rapidamente reduz danos e facilita a resposta coordenada.</p>' +
          '<h2>Exemplos de incidentes</h2>' +
          '<ul>' +
          '<li>E-mail de phishing clicado ou credenciais fornecidas involuntariamente;</li>' +
          '<li>Notebook ou celular corporativo perdido, roubado ou infectado;</li>' +
          '<li>Envio acidental de dados pessoais para destinatário errado;</li>' +
          '<li>Comportamento anormal do computador (lentidão, pop-ups, arquivos criptografados);</li>' +
          '<li>Acesso não autorizado detectado em sistemas ou pastas compartilhadas.</li>' +
          '</ul>' +
          '<h2>Passos imediatos</h2>' +
          '<ol>' +
          '<li><strong>Isole:</strong> desconecte da rede se houver suspeita de malware;</li>' +
          '<li><strong>Preserve:</strong> não apague evidências (e-mails, logs, prints);</li>' +
          '<li><strong>Comunique:</strong> abra chamado na TI/Security ou canal de incidentes;</li>' +
          '<li><strong>Colabore:</strong> forneça detalhes objetivos (quando, o quê, qual sistema);</li>' +
          '<li><strong>Não oculte:</strong> relatar cedo é proteção, não punição.</li>' +
          '</ol>' +
          '<div class="callout">' +
          '<strong>Lembre-se:</strong> reportar um incidente rapidamente pode impedir que um ataque se propague para toda a organização.' +
          '</div>'
        );
      }
    },
    {
      id: 'video-summary',
      title: 'Vídeo-síntese',
      illustration: 'assets/video-summary.svg',
      content: function () {
        return (
          '<h2>Síntese: golpes digitais e prevenção</h2>' +
          '<p>Revise os principais conceitos deste curso com o vídeo abaixo sobre golpes online e engenharia social, ' +
          'produzido pelo NIC.br no âmbito do projeto Cidadão na Rede.</p>' +
          '<div class="video-embed">' +
          '<iframe src="https://www.youtube.com/embed/jxBnvHuGAb0" title="Não caia em golpes online — Cidadão na Rede" ' +
          'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>' +
          '</div>' +
          '<p class="video-credit">Fonte: CERT.br / NIC.br — Cidadão na Rede: Não caia em golpes online.</p>' +
          '<div class="callout">' +
          'Antes de agir diante de mensagens urgentes: <strong>desconfie, informe-se, verifique</strong> pelos canais oficiais.' +
          '</div>'
        );
      }
    },
    {
      id: 'reflection',
      title: 'Reflexão guiada',
      illustration: 'assets/reflection.svg',
      interactive: true,
      content: function () {
        return (
          '<h2>Checklist de compromisso pessoal</h2>' +
          '<p>Marque os itens que você se compromete a praticar no dia a dia. Esta reflexão não é avaliada, ' +
          'mas ajuda a consolidar o aprendizado.</p>' +
          '<ul class="checklist" id="reflection-checklist">' +
          checklistItem('r1', 'Usarei senhas únicas e ativarei 2FA nas contas corporativas.') +
          checklistItem('r2', 'Desconfiarei de links e anexos inesperados antes de clicar.') +
          checklistItem('r3', 'Manterei dispositivos atualizados e bloqueados quando ausente.') +
          checklistItem('r4', 'Acessarei dados pessoais apenas quando necessário para minha função.') +
          checklistItem('r5', 'Reportarei incidentes ou suspeitas imediatamente à TI.') +
          checklistItem('r6', 'Usarei VPN corporativa ao trabalhar remotamente.') +
          '</ul>'
        );
      }
    },
    {
      id: QUIZ_MODULE_ID,
      title: 'Questionário final',
      illustration: 'assets/quiz.svg',
      interactive: true,
      isQuiz: true,
      content: function () {
        return (
          '<h2>Questionário de verificação</h2>' +
          '<p>Responda as 5 questões abaixo. É necessário acertar pelo menos <strong>70%</strong> (4 de 5) para concluir o curso.</p>' +
          renderQuiz() +
          '<div id="quiz-result"></div>'
        );
      }
    }
  ];

  var QUIZ = [
    {
      id: 'q1',
      text: 'Qual é a prática MAIS recomendada para proteger suas contas online?',
      options: [
        { id: 'a', text: 'Usar a mesma senha forte em todos os serviços' },
        { id: 'b', text: 'Usar senhas únicas e ativar verificação em duas etapas' },
        { id: 'c', text: 'Anotar senhas em um arquivo de texto no desktop' },
        { id: 'd', text: 'Trocar senhas apenas uma vez por ano' }
      ],
      correct: 'b'
    },
    {
      id: 'q2',
      text: 'Você recebe um e-mail urgente pedindo para clicar em um link e confirmar sua senha corporativa. O que fazer?',
      options: [
        { id: 'a', text: 'Clicar imediatamente para evitar bloqueio da conta' },
        { id: 'b', text: 'Responder com a senha por e-mail' },
        { id: 'c', text: 'Não clicar e reportar à equipe de segurança/TI' },
        { id: 'd', text: 'Encaminhar o e-mail para colegas para avisar' }
      ],
      correct: 'c'
    },
    {
      id: 'q3',
      text: 'No trabalho remoto, qual medida aumenta a segurança ao acessar sistemas internos?',
      options: [
        { id: 'a', text: 'Usar Wi-Fi público de shopping sem proteção' },
        { id: 'b', text: 'Compartilhar notebook corporativo com familiares' },
        { id: 'c', text: 'Desativar atualizações automáticas para ganhar velocidade' },
        { id: 'd', text: 'Utilizar VPN corporativa e bloqueio de tela' }
      ],
      correct: 'd'
    },
    {
      id: 'q4',
      text: 'Segundo a LGPD, ao manipular dados pessoais no trabalho, você deve:',
      options: [
        { id: 'a', text: 'Acessar qualquer dado disponível no sistema sem restrição' },
        { id: 'b', text: 'Copiar bases de clientes para análise pessoal em casa' },
        { id: 'c', text: 'Acessar apenas dados necessários para sua função autorizada' },
        { id: 'd', text: 'Compartilhar dados por WhatsApp pessoal se for mais rápido' }
      ],
      correct: 'c'
    },
    {
      id: 'q5',
      text: 'Suspeita que clicou em um link de phishing. Qual a primeira ação correta?',
      options: [
        { id: 'a', text: 'Ignorar e não contar a ninguém' },
        { id: 'b', text: 'Apagar todos os e-mails para eliminar evidências' },
        { id: 'c', text: 'Comunicar imediatamente a TI/Security e preservar evidências' },
        { id: 'd', text: 'Formatar o computador sem avisar ninguém' }
      ],
      correct: 'c'
    }
  ];

  var state = {
    currentModule: MODULES[0].id,
    completedModules: [],
    quizAnswers: {},
    reflectionChecks: {},
    quizSubmitted: false,
    quizScore: null
  };

  var scormInitialized = false;

  function checklistItem(id, label) {
    return (
      '<li class="checklist__item" data-check="' + id + '">' +
      '<input type="checkbox" id="' + id + '" aria-label="' + label.replace(/"/g, '&quot;') + '">' +
      '<label for="' + id + '">' + label + '</label>' +
      '</li>'
    );
  }

  function renderQuiz() {
    return QUIZ.map(function (q, idx) {
      var options = q.options.map(function (opt) {
        return (
          '<li><label>' +
          '<input type="radio" name="' + q.id + '" value="' + opt.id + '">' +
          '<span>' + opt.text + '</span>' +
          '</label></li>'
        );
      }).join('');

      return (
        '<div class="quiz-question" data-question="' + q.id + '">' +
        '<p class="quiz-question__title">' + (idx + 1) + '. ' + q.text + '</p>' +
        '<ul class="quiz-options">' + options + '</ul>' +
        '</div>'
      );
    }).join('');
  }

  function getModuleIndex(id) {
    for (var i = 0; i < MODULES.length; i++) {
      if (MODULES[i].id === id) return i;
    }
    return -1;
  }

  function resolveModuleId(id) {
    var normalized = String(id || '').trim();
    if (!normalized || normalized === 'undefined' || normalized === 'null') {
      return MODULES[0].id;
    }
    return getModuleIndex(normalized) >= 0 ? normalized : MODULES[0].id;
  }

  function isModuleUnlocked(moduleId) {
    if (isUatMode) return true;
    var idx = getModuleIndex(moduleId);
    if (idx <= 0) return true;
    var prevId = MODULES[idx - 1].id;
    return state.completedModules.indexOf(prevId) !== -1;
  }

  function isModuleCompleted(id) {
    return state.completedModules.indexOf(id) !== -1;
  }

  function calcProgress() {
    var total = MODULES.length;
    var done = state.completedModules.length;
    if (state.quizSubmitted && state.quizScore >= PASS_THRESHOLD) {
      return 100;
    }
    return Math.round((done / total) * 100);
  }

  function persistState() {
    var payload = JSON.stringify({
      currentModule: state.currentModule,
      completedModules: state.completedModules,
      quizAnswers: state.quizAnswers,
      reflectionChecks: state.reflectionChecks,
      quizSubmitted: state.quizSubmitted,
      quizScore: state.quizScore
    });

    if (scormInitialized) {
      ScormAPI.setLessonLocation(state.currentModule);
      ScormAPI.setSuspendData(payload);
      ScormAPI.setLessonStatus(state.quizSubmitted
        ? (state.quizScore >= PASS_THRESHOLD ? 'passed' : 'failed')
        : 'incomplete');
      ScormAPI.commit();
    }

    try {
      sessionStorage.setItem('unilio-scorm-demo', payload);
    } catch (e) { /* offline */ }
  }

  function restoreState() {
    var raw = '';
    if (scormInitialized) {
      raw = ScormAPI.getSuspendData();
      if (raw === 'undefined' || raw === 'null') {
        raw = '';
      }
      var loc = ScormAPI.getLessonLocation();
      if (loc) state.currentModule = resolveModuleId(loc);
    }
    if (!raw) {
      try {
        raw = sessionStorage.getItem('unilio-scorm-demo') || '';
      } catch (e) { /* ignore */ }
    }
    if (raw) {
      try {
        var saved = JSON.parse(raw);
        if (saved.currentModule) state.currentModule = resolveModuleId(saved.currentModule);
        if (saved.completedModules) state.completedModules = saved.completedModules;
        if (saved.quizAnswers) state.quizAnswers = saved.quizAnswers;
        if (saved.reflectionChecks) state.reflectionChecks = saved.reflectionChecks;
        if (saved.quizSubmitted) state.quizSubmitted = saved.quizSubmitted;
        if (saved.quizScore != null) state.quizScore = saved.quizScore;
      } catch (e) {
        console.warn('[Course] Failed to parse suspend_data', e);
      }
    }
    state.currentModule = resolveModuleId(state.currentModule);
  }

  function markCompleted(id) {
    if (state.completedModules.indexOf(id) === -1) {
      state.completedModules.push(id);
    }
  }

  function renderSidebar() {
    var nav = document.getElementById('sidebar-nav');
    nav.innerHTML = MODULES.map(function (mod, idx) {
      var unlocked = isModuleUnlocked(mod.id);
      var completed = isModuleCompleted(mod.id);
      var active = mod.id === state.currentModule;
      var classes = ['sidebar-nav__link'];
      if (active) classes.push('is-active');
      if (completed) classes.push('is-completed');
      if (!unlocked) classes.push('is-locked');

      return (
        '<li class="sidebar-nav__item">' +
        '<button type="button" class="' + classes.join(' ') + '" data-module="' + mod.id + '"' +
        (!unlocked ? ' disabled aria-disabled="true"' : '') + '>' +
        '<span class="sidebar-nav__num">' + (completed ? '✓' : (idx + 1)) + '</span>' +
        '<span class="sidebar-nav__label">' + mod.title + '</span>' +
        '</button></li>'
      );
    }).join('');

    nav.querySelectorAll('[data-module]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-module');
        if (isModuleUnlocked(id)) {
          navigateTo(id);
        }
      });
    });
  }

  function renderProgress() {
    var pct = calcProgress();
    document.getElementById('progress-fill').style.width = pct + '%';
    document.getElementById('progress-label').textContent = pct + '%';
    var bar = document.querySelector('.progress-bar');
    if (bar) bar.setAttribute('aria-valuenow', String(pct));
  }

  function renderIllustration(mod) {
    var map = window.UNILIO_SCORM_ILLUSTRATIONS || {};
    var inline = map[mod.illustration];
    if (inline) {
      return '<div class="module-hero__illus" aria-hidden="true">' + inline + '</div>';
    }
    // Fallback for external packages / missing map — cache-bust query avoids stale broken SVGs
    return (
      '<div class="module-hero__illus">' +
      '<img src="' + mod.illustration + '?v=20260712c" alt="">' +
      '</div>'
    );
  }

  function renderModule() {
    var mod = MODULES.find(function (m) { return m.id === state.currentModule; });
    if (!mod) return;

    var panel = document.getElementById('module-panel');
    var illus = renderIllustration(mod);
    var heroBlock = mod.hero
      ? (
        '<div class="module-hero">' +
        illus +
        '<div class="module-hero__text"><h1>' + mod.title + '</h1>' +
        '<p>Curso de conscientização · UniLio SCORM Demo</p></div></div>'
      )
      : (
        '<div class="module-hero">' +
        illus +
        '<div class="module-hero__text"><h1>' + mod.title + '</h1></div></div>'
      );

    var idx = getModuleIndex(mod.id);
    var hasPrev = idx > 0;
    var hasNext = idx < MODULES.length - 1;
    var nextUnlocked = hasNext && isModuleUnlocked(MODULES[idx + 1].id);

    panel.innerHTML =
      heroBlock +
      '<div class="module-content">' + mod.content() + '</div>' +
      '<footer class="module-footer">' +
      '<button type="button" class="btn btn--secondary" id="btn-prev"' + (!hasPrev ? ' disabled' : '') + '>← Anterior</button>' +
      (mod.isQuiz
        ? '<button type="button" class="btn btn--primary" id="btn-submit-quiz">Enviar respostas</button>'
        : '<button type="button" class="btn btn--primary" id="btn-next">' +
          (hasNext ? 'Próximo →' : 'Concluir') +
          '</button>') +
      '</footer>';

    if (document.getElementById('btn-prev')) {
      document.getElementById('btn-prev').addEventListener('click', function () {
        if (hasPrev) navigateTo(MODULES[idx - 1].id);
      });
    }

    if (document.getElementById('btn-next')) {
      document.getElementById('btn-next').addEventListener('click', function () {
        markCompleted(mod.id);
        persistState();
        renderSidebar();
        renderProgress();
        if (hasNext) {
          navigateTo(MODULES[idx + 1].id);
        } else {
          navigateTo(QUIZ_MODULE_ID);
        }
      });
    }

    if (mod.id === 'reflection') {
      bindReflectionChecklist();
    }

    if (mod.isQuiz) {
      bindQuiz();
      if (state.quizSubmitted) {
        showQuizResult(state.quizScore);
      }
    }

    document.getElementById('course-main').scrollTop = 0;
  }

  function bindReflectionChecklist() {
    var list = document.getElementById('reflection-checklist');
    if (!list) return;

    list.querySelectorAll('.checklist__item').forEach(function (item) {
      var id = item.getAttribute('data-check');
      var input = item.querySelector('input');
      if (state.reflectionChecks[id]) {
        input.checked = true;
        item.classList.add('is-checked');
      }
      input.addEventListener('change', function () {
        state.reflectionChecks[id] = input.checked;
        item.classList.toggle('is-checked', input.checked);
        persistState();
      });
    });
  }

  function bindQuiz() {
    QUIZ.forEach(function (q) {
      var selected = state.quizAnswers[q.id];
      if (selected) {
        var radio = document.querySelector('input[name="' + q.id + '"][value="' + selected + '"]');
        if (radio) radio.checked = true;
      }
      document.querySelectorAll('input[name="' + q.id + '"]').forEach(function (radio) {
        radio.addEventListener('change', function () {
          state.quizAnswers[q.id] = radio.value;
          persistState();
        });
      });
    });

    var submitBtn = document.getElementById('btn-submit-quiz');
    if (submitBtn) {
      submitBtn.addEventListener('click', submitQuiz);
    }
  }

  function submitQuiz() {
    var answered = QUIZ.filter(function (q) { return state.quizAnswers[q.id]; });
    if (answered.length < QUIZ.length) {
      alert('Por favor, responda todas as 5 questões antes de enviar.');
      return;
    }

    var correct = QUIZ.filter(function (q) {
      return state.quizAnswers[q.id] === q.correct;
    }).length;

    var score = Math.round((correct / QUIZ.length) * 100);
    state.quizScore = score;
    state.quizSubmitted = true;
    markCompleted(QUIZ_MODULE_ID);

    if (scormInitialized) {
      ScormAPI.setScore(score, 0, 100);
      ScormAPI.setLessonStatus(score >= PASS_THRESHOLD ? 'passed' : 'failed');
      ScormAPI.commit();
    }

    persistState();
    showQuizResult(score);
    renderSidebar();
    renderProgress();
  }

  function showQuizResult(score) {
    var el = document.getElementById('quiz-result');
    if (!el) return;
    var passed = score >= PASS_THRESHOLD;
    el.className = 'quiz-result ' + (passed ? 'quiz-result--pass' : 'quiz-result--fail');
    el.innerHTML =
      '<div class="quiz-result__score">' + score + '%</div>' +
      '<p>' + (passed
        ? 'Parabéns! Você atingiu a nota mínima e concluiu o curso com sucesso.'
        : 'Nota insuficiente. Revise os módulos e tente novamente.') +
      '</p>';
  }

  function navigateTo(id) {
    if (!isModuleUnlocked(id)) return;
    state.currentModule = id;
    persistState();
    renderSidebar();
    renderModule();
    renderProgress();
  }

  function initScorm() {
    if (ScormAPI.isAvailable()) {
      scormInitialized = ScormAPI.initialize();
      if (scormInitialized) {
        var badge = document.getElementById('scorm-badge');
        badge.textContent = 'LMS conectado';
        badge.classList.add('scorm-badge--connected');

        var name = ScormAPI.getStudentName();
        if (name) {
          document.getElementById('student-name').textContent = name;
        }

        var status = ScormAPI.getLessonStatus();
        if (status === 'not attempted' || status === 'unknown') {
          ScormAPI.setLessonStatus('incomplete');
          ScormAPI.commit();
        }
      }
    }
  }

  function init() {
    if (isUatMode) {
      document.getElementById('uat-banner').hidden = false;
    }

    initScorm();
    restoreState();

    state.currentModule = resolveModuleId(state.currentModule);
    if (!isModuleUnlocked(state.currentModule)) {
      state.currentModule = MODULES[0].id;
    }

    var studentEl = document.getElementById('student-name');
    if (studentEl.textContent === '—') {
      studentEl.textContent = isUatMode ? 'Participante UAT' : 'Modo local';
    }

    renderSidebar();
    renderModule();
    renderProgress();

    window.addEventListener('beforeunload', function () {
      if (scormInitialized) {
        ScormAPI.commit();
        ScormAPI.finish();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
