(function (global) {
  "use strict";

  var VIEWER_ROLE = "colleague";

  function mapViewerRole(viewerContext) {
    if (viewerContext === 2 || viewerContext === "Self") return "self";
    if (viewerContext === 1 || viewerContext === "HR") return "rh";
    if (viewerContext === 3 || viewerContext === "Admin") return "admin";
    return "colleague";
  }

  function profileHref(slug) {
    return "/pessoas/perfil?id=" + encodeURIComponent(slug);
  }

  function orgChartHref(focusId) {
    return focusId
      ? "/pessoas/organograma?focus=" + encodeURIComponent(focusId)
      : "/pessoas/organograma";
  }

  function formatStatValue(value) {
    if (value === null || value === undefined || value === "") return "—";
    return value;
  }

  function openPersonChat(email, teamsUpn) {
    var chatEmail = email || teamsUpn;
    if (!chatEmail) return;
    var chat = global.LioChat;
    if (chat && chat.enabled && typeof chat.openConversationByEmail === "function") {
      chat.openConversationByEmail(chatEmail);
      return;
    }
    var teamsTarget = teamsUpn || email;
    if (!teamsTarget) return;
    window.open(
      "https://teams.microsoft.com/l/chat/0/0?users=" + encodeURIComponent(teamsTarget),
      "_blank",
      "noopener,noreferrer"
    );
  }

  var deptColors = {
    Executiva: { stroke: "#a78bfa", badge: "#ede9fe", text: "#6d28d9" },
    Produto: { stroke: "#93c5fd", badge: "#dbeafe", text: "#1d4ed8" },
    "Recursos Humanos": { stroke: "#f9a8d4", badge: "#fce7f3", text: "#be185d" },
    Marketing: { stroke: "#86efac", badge: "#dcfce7", text: "#15803d" },
    TI: { stroke: "#67e8f9", badge: "#cffafe", text: "#0e7490" },
    Comercial: { stroke: "#fdba74", badge: "#ffedd5", text: "#c2410c" },
    Financeiro: { stroke: "#fcd34d", badge: "#fef3c7", text: "#b45309" }
  };

  var historyTypeLabels = {
    atual: "Cargo atual",
    promotion: "Promoção",
    admission: "Admissão",
    transfer: "Transferência",
    salary: "Ajuste salarial"
  };

  var monthNames = [
    "", "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
  ];

  function getDeptColors(dept) {
    return deptColors[dept] || deptColors.Executiva;
  }

  function getProfileId() {
    var params = new URLSearchParams(window.location.search);
    var id = params.get("id");
    if (id) return id;

    params.forEach(function (value, key) {
      if (id) return;
      if (key.indexOf("id=") === 0) {
        id = decodeURIComponent(key.slice(3));
        return;
      }
      if (!value) {
        var eq = key.indexOf("=");
        if (eq > 0 && key.slice(0, eq) === "id") {
          id = decodeURIComponent(key.slice(eq + 1));
        }
      }
    });

    return id;
  }

  function formatDate(isoDate) {
    var parts = isoDate.split("-");
    if (parts.length !== 3) return isoDate;
    return parts[2] + "/" + parts[1] + "/" + parts[0];
  }

  function buildPeopleIndex(allPeople) {
    var index = {};
    allPeople.forEach(function (p) {
      index[p.id] = p;
    });
    return index;
  }

  function buildHierarchyChain(person, peopleIndex) {
    var chain = [];
    var managerId = person.managerId;
    var visited = {};
    while (managerId && peopleIndex[managerId] && !visited[managerId]) {
      visited[managerId] = true;
      chain.unshift(peopleIndex[managerId]);
      managerId = peopleIndex[managerId].managerId;
    }
    return chain;
  }

  function isBirthdaySoon(person) {
    var p = person.personal || {};
    if (!p.birthMonth || !p.birthDay) return null;
    var now = new Date(2026, 6, 4);
    var bMonth = p.birthMonth;
    var bDay = p.birthDay;
    if (bMonth === 7 && bDay >= 1 && bDay <= 14) {
      return { type: "month", label: "Aniversário em " + bDay + " de julho" };
    }
    if (bMonth === 7 && bDay === 4) {
      return { type: "today", label: "Aniversário hoje!" };
    }
    if (bMonth === 7) {
      return { type: "month", label: "Aniversário em " + bDay + " de julho" };
    }
    return null;
  }

  function canViewRhData(person) {
    return VIEWER_ROLE === "rh" || VIEWER_ROLE === "admin" || VIEWER_ROLE === "self" ||
      person.personal.visibility !== "rh-only";
  }

  function renderBreadcrumb(person, chain) {
    chain = chain || [];
    var html = '<a href="' + orgChartHref() + '">Organograma</a>';
    chain.forEach(function (ancestor) {
      html +=
        '<span class="breadcrumb__sep">/</span>' +
        '<a href="' + profileHref(ancestor.id) + '">' +
        ancestor.name + "</a>";
    });
    html += '<span class="breadcrumb__sep">/</span>';
    html += '<span class="breadcrumb__current">' + person.name + "</span>";
    document.getElementById("profile-breadcrumb-trail").innerHTML = html;
  }

  function renderBirthdayBanner(person) {
    var banner = document.getElementById("profile-birthday-banner");
    var info = isBirthdaySoon(person);
    if (!info || !banner) {
      if (banner) banner.hidden = true;
      return;
    }
    banner.hidden = false;
    document.getElementById("profile-birthday-title").textContent = info.label;
    document.getElementById("profile-birthday-text").textContent =
      "Envie parabéns e fortaleça o clima de equipe na LioConecta.";
  }

  function renderHeroBadges(person) {
    var container = document.getElementById("profile-badges");
    if (!container) return;
    var tagLabels = {
      ceo: "CEO",
      director: "Liderança",
      member: "Colaborador"
    };
    var labels = person.tagLabels || (person.tags || []).map(function (t) {
      return tagLabels[t] || t;
    });
    var html = "";
    labels.forEach(function (tag) {
      var cls = "profile-hero__badge";
      if (tag === "CEO") cls += " profile-hero__badge--ceo";
      if (tag === "Liderança") cls += " profile-hero__badge--director";
      html += '<span class="' + cls + '">' + tag + "</span>";
    });
    container.innerHTML = html;
  }

  function renderMiniOrg(person, chain) {
    var container = document.getElementById("profile-mini-org");
    if (!container) return;
    chain = chain || [];
    var html = '<span class="profile-mini-org__label">Cadeia hierárquica:</span>';
    html += '<a class="profile-mini-org__item" href="' + orgChartHref(person.id) + '"><i class="fa-solid fa-sitemap"></i> Organograma</a>';
    chain.forEach(function (node) {
      html += '<span class="profile-mini-org__sep">›</span>';
      html +=
        '<a class="profile-mini-org__item" href="' + profileHref(node.id) + '">' +
        (node.img ? '<img src="' + node.img + '" alt="" />' : "") + node.name + "</a>";
    });
    html += '<span class="profile-mini-org__sep">›</span>';
    html += '<span class="profile-mini-org__current">' + person.name + "</span>";
    container.innerHTML = html;
  }

  function renderStats(person) {
    var stats = person.stats || {};
    var items = [
      { value: stats.tenureYears, label: "Anos de casa", tab: null },
      { value: person.roleTenure && person.roleTenure.years, label: "Anos no cargo", tab: "career" },
      { value: stats.directReports, label: "Reportes diretos", tab: "overview" },
      { value: stats.groups, label: "Grupos", tab: "overview" },
      { value: stats.recognitions, label: "Reconhecimentos", tab: "activity" },
      { value: stats.projectsCount, label: "Projetos", tab: "career" }
    ];
    return items.map(function (item) {
      var tag = item.tab
        ? ' data-tab-target="' + item.tab + '" class="profile-stat profile-stat--link"'
        : ' class="profile-stat"';
      return (
        "<button type=\"button\"" + tag + ">" +
        '<span class="profile-stat__value">' + formatStatValue(item.value) + "</span>" +
        '<span class="profile-stat__label">' + item.label + "</span>" +
        "</button>"
      );
    }).join("");
  }

  function renderPersonalData(person) {
    if (!canViewRhData(person)) {
      return (
        '<p class="profile-rh-notice">Dados pessoais restritos. Visível apenas para RH e gestores.</p>' +
        '<div class="profile-contact-item"><span class="profile-contact-item__label">Nome</span>' +
        '<span class="profile-contact-item__value">' + person.name + "</span></div>"
      );
    }
    var personal = person.personal || {};
    return (
      '<div class="profile-contact-item"><span class="profile-contact-item__label">Nome completo</span><span class="profile-contact-item__value">' + (personal.fullName || person.name || "—") + "</span></div>" +
      '<div class="profile-contact-item"><span class="profile-contact-item__label">Matrícula</span><span class="profile-contact-item__value">' + (personal.matricula || "—") + "</span></div>" +
      '<div class="profile-contact-item"><span class="profile-contact-item__label">Data de nascimento</span><span class="profile-contact-item__value">' + (personal.birthDate || "—") + "</span></div>" +
      '<div class="profile-contact-item"><span class="profile-contact-item__label">CPF</span><span class="profile-contact-item__value">' + (personal.cpf || "—") + "</span></div>" +
      '<div class="profile-contact-item"><span class="profile-contact-item__label">RG</span><span class="profile-contact-item__value">' + (personal.rg || "—") + "</span></div>" +
      '<div class="profile-contact-item"><span class="profile-contact-item__label">Endereço</span><span class="profile-contact-item__value">' + (personal.address || personal.cityState || "—") + "</span></div>" +
      '<div class="profile-contact-item"><span class="profile-contact-item__label">Estado civil</span><span class="profile-contact-item__value">' + (personal.maritalStatus || "—") + "</span></div>" +
      '<div class="profile-contact-item"><span class="profile-contact-item__label">Nacionalidade</span><span class="profile-contact-item__value">' + (personal.nationality || "—") + "</span></div>"
    );
  }

  function renderContact(person) {
    var contact = person.contact || {};
    var avail = person.availability || {};
    var managerHtml = "—";
    if (person.managerId || person.managerName) {
      managerHtml = person.managerId
        ? '<a href="' + profileHref(person.managerId) + '">' + (person.managerName || "—") + "</a>"
        : (person.managerName || "—");
      if (person.managerId) {
        managerHtml +=
          ' <a class="profile-contact-item__link-secondary" href="' +
          orgChartHref(person.managerId) +
          '">Ver no organograma</a>';
      }
    }
    return (
      '<div class="profile-contact-item"><span class="profile-contact-item__label">E-mail</span><span class="profile-contact-item__value"><a href="mailto:' + contact.email + '">' + contact.email + "</a></span></div>" +
      '<div class="profile-contact-item"><span class="profile-contact-item__label">Telefone / Ramal</span><span class="profile-contact-item__value">' + (contact.phone || "—") + "</span></div>" +
      '<div class="profile-contact-item"><span class="profile-contact-item__label">Localização</span><span class="profile-contact-item__value">' + (contact.location || "—") + "</span></div>" +
      '<div class="profile-contact-item"><span class="profile-contact-item__label">Microsoft Teams</span><span class="profile-contact-item__value"><a href="https://teams.microsoft.com/l/chat/0/0?users=' + encodeURIComponent(contact.email || "") + '">' + (contact.teams || "—") + "</a></span></div>" +
      '<div class="profile-contact-item"><span class="profile-contact-item__label">Modelo de trabalho</span><span class="profile-contact-item__value">' + (avail.workModel || "—") + " · " + (avail.schedule || "") + "</span></div>" +
      '<div class="profile-contact-item"><span class="profile-contact-item__label">Escritório</span><span class="profile-contact-item__value">' + (avail.floor || "—") + " · " + (avail.room || "—") + "</span></div>" +
      '<div class="profile-contact-item"><span class="profile-contact-item__label">Admissão</span><span class="profile-contact-item__value">' + (person.admission || "—") + "</span></div>" +
      '<div class="profile-contact-item"><span class="profile-contact-item__label">Reporta-se a</span><span class="profile-contact-item__value">' + managerHtml + "</span></div>"
    );
  }

  function renderAvailability(person) {
    var avail = person.availability || {};
    return (
      '<div class="profile-contact-item"><span class="profile-contact-item__label">Modelo</span><span class="profile-contact-item__value">' + (avail.workModel || "—") + "</span></div>" +
      '<div class="profile-contact-item"><span class="profile-contact-item__label">Horário</span><span class="profile-contact-item__value">' + (avail.schedule || "—") + "</span></div>" +
      '<div class="profile-contact-item"><span class="profile-contact-item__label">Fuso</span><span class="profile-contact-item__value">' + (avail.timezone || "—") + "</span></div>" +
      '<div class="profile-contact-item"><span class="profile-contact-item__label">Andar / Sala</span><span class="profile-contact-item__value">' + (avail.floor || "—") + " · " + (avail.room || "—") + "</span></div>"
    );
  }

  function renderMentorBuddy(person) {
    if (person.buddy) {
      return (
        '<div class="profile-contact-item"><span class="profile-contact-item__label">Buddy de onboarding</span>' +
        '<span class="profile-contact-item__value"><a href="' + profileHref(person.buddy.id) + '">' +
        person.buddy.name + "</a> · desde " + person.buddy.since + "</span></div>"
      );
    }
    if (person.mentor) {
      return (
        '<div class="profile-contact-item"><span class="profile-contact-item__label">Mentor</span>' +
        '<span class="profile-contact-item__value"><a href="' + profileHref(person.mentor.id) + '">' +
        person.mentor.name + "</a> · desde " + person.mentor.since + "</span></div>"
      );
    }
    return '<p class="profile-empty">Nenhum mentor ou buddy registrado.</p>';
  }

  function renderSkills(skills) {
    skills = skills || [];
    if (!skills.length) return '<p class="profile-empty">Nenhuma competência registrada.</p>';
    return skills.map(function (skill) {
      var name = typeof skill === "string" ? skill : skill.name;
      var level = typeof skill === "object" ? skill.level : 3;
      var endorsements = typeof skill === "object" ? skill.endorsements : 0;
      var pct = Math.min(100, (level / 5) * 100);
      return (
        '<div class="profile-skill">' +
        '<span class="profile-skill__name">' + name + "</span>" +
        '<span class="profile-skill__meta">' + endorsements + " endossos</span>" +
        '<div class="profile-skill__bar"><div class="profile-skill__fill" style="width:' + pct + '%"></div></div>' +
        "</div>"
      );
    }).join("");
  }

  function renderLanguages(languages) {
    if (!languages || !languages.length) return '<p class="profile-empty">Nenhum idioma registrado.</p>';
    return languages.map(function (lang) {
      return '<span class="profile-lang"><strong>' + lang.name + "</strong> · " + lang.level + "</span>";
    }).join("");
  }

  function renderLinks(links) {
    if (!links || !Object.keys(links).length) return '<p class="profile-empty">Nenhum link externo.</p>';
    var html = '<div class="profile-links">';
    if (links.linkedin) {
      html += '<a class="profile-link" href="' + links.linkedin + '" target="_blank" rel="noopener"><i class="fa-brands fa-linkedin"></i> LinkedIn</a>';
    }
    if (links.github) {
      html += '<a class="profile-link" href="' + links.github + '" target="_blank" rel="noopener"><i class="fa-brands fa-github"></i> GitHub</a>';
    }
    if (links.portfolio) {
      html += '<a class="profile-link" href="' + links.portfolio + '" target="_blank" rel="noopener"><i class="fa-solid fa-globe"></i> Portfolio</a>';
    }
    html += "</div>";
    return html;
  }

  function renderEducation(education) {
    if (!education || !education.length) return '<p class="profile-empty">Nenhuma formação registrada.</p>';
    return education.map(function (item) {
      return (
        '<article class="profile-timeline__item">' +
        '<div class="profile-timeline__date">' + item.period + " · " + (item.note || item.type) + "</div>" +
        '<div class="profile-timeline__title">' + item.degree + "</div>" +
        '<div class="profile-timeline__meta">' + item.institution + "</div>" +
        "</article>"
      );
    }).join("");
  }

  function renderCertifications(certs) {
    if (!certs || !certs.length) return '<p class="profile-empty">Nenhuma certificação registrada.</p>';
    return certs.map(function (item) {
      return (
        '<article class="profile-timeline__item">' +
        '<div class="profile-timeline__date">' + item.year + " · Certificação</div>" +
        '<div class="profile-timeline__title">' + item.name + "</div>" +
        '<div class="profile-timeline__meta">' + item.issuer + "</div>" +
        "</article>"
      );
    }).join("");
  }

  function parseHistorySortKey(dateLabel) {
    if (!dateLabel) return 0;
    var text = String(dateLabel).toLowerCase();
    var yearMatch = text.match(/(19|20)\d{2}/);
    var year = yearMatch ? parseInt(yearMatch[0], 10) : 0;
    var month = 0;
    var monthMap = {
      jan: 1, fev: 2, mar: 3, abr: 4, mai: 5, jun: 6,
      jul: 7, ago: 8, set: 9, out: 10, nov: 11, dez: 12
    };
    Object.keys(monthMap).some(function (abbr) {
      if (text.indexOf(abbr) !== -1) {
        month = monthMap[abbr];
        return true;
      }
      return false;
    });
    return year * 100 + month;
  }

  function sortHistoryDescending(history) {
    return history.slice().sort(function (a, b) {
      var left = parseHistorySortKey(a && a.date);
      var right = parseHistorySortKey(b && b.date);
      if (right !== left) return right - left;
      var typeWeight = { atual: 5, promotion: 4, transfer: 3, salary: 2, admission: 1 };
      return (typeWeight[b.type] || 0) - (typeWeight[a.type] || 0);
    });
  }

  function renderHistory(history) {
    if (!history || !history.length) return '<p class="profile-empty">Nenhum histórico registrado.</p>';
    return sortHistoryDescending(history).map(function (item) {
      return (
        '<article class="profile-timeline__item">' +
        '<div class="profile-timeline__date">' + item.date + " · " + (historyTypeLabels[item.type] || item.type) + "</div>" +
        '<div class="profile-timeline__title">' + item.title + "</div>" +
        '<div class="profile-timeline__meta">' + item.dept + "</div>" +
        '<p class="profile-timeline__note">' + item.note + "</p>" +
        "</article>"
      );
    }).join("");
  }

  function renderProjects(projects) {
    if (!projects || !projects.length) return '<p class="profile-empty">Nenhum projeto ativo.</p>';
    return (
      '<div class="profile-project-grid">' +
      projects.map(function (p) {
        return (
          '<article class="profile-project">' +
          '<div class="profile-project__name">' + p.name + "</div>" +
          '<div class="profile-project__meta">' + p.role + " · desde " + p.since + "</div>" +
          '<span class="profile-project__status">' + p.status + "</span>" +
          "</article>"
        );
      }).join("") +
      "</div>"
    );
  }

  function renderRecognitions(recognitions) {
    if (!recognitions || !recognitions.length) return '<p class="profile-empty">Nenhum reconhecimento recente.</p>';
    return recognitions.map(function (r) {
      return (
        '<article class="profile-recognition">' +
        '<div class="profile-recognition__icon"><i class="fa-solid fa-gift"></i></div>' +
        "<div>" +
        '<div class="profile-recognition__title">' + r.title + "</div>" +
        '<div class="profile-recognition__detail">' + r.detail + "</div>" +
        '<div class="profile-recognition__meta">Por <a href="' + profileHref(r.authorId) + '">' + r.author + "</a> · " + formatDate(r.date) + "</div>" +
        (r.feedUrl ? '<a class="profile-recognition__link" href="' + r.feedUrl + '">Ver no feed →</a>' : "") +
        "</div></article>"
      );
    }).join("");
  }

  function renderInteractions(interactions) {
    if (!interactions || !interactions.length) return '<p class="profile-empty">Nenhuma interação recente.</p>';
    return interactions.map(function (item) {
      var tag = item.feedUrl ? "a" : "article";
      var href = item.feedUrl ? ' href="' + item.feedUrl + '"' : "";
      return (
        "<" + tag + ' class="profile-interaction"' + href + ">" +
        '<div class="profile-interaction__icon"><i class="' + item.icon + '"></i></div>' +
        "<div style=\"flex:1\">" +
        '<div class="profile-interaction__title">' + item.title + "</div>" +
        '<div class="profile-interaction__detail">' + item.detail + "</div>" +
        "</div>" +
        '<time class="profile-interaction__date" datetime="' + item.date + '">' + formatDate(item.date) + "</time>" +
        "</" + tag + ">"
      );
    }).join("");
  }

  function renderDocuments(docs) {
    if (!docs || !docs.length) return '<p class="profile-empty">Nenhum documento vinculado.</p>';
    return (
      '<div class="profile-doc-list">' +
      docs.map(function (d) {
        return (
          '<a class="profile-doc" href="' + d.url + '">' +
          '<span class="profile-doc__icon"><i class="fa-regular fa-file-lines"></i></span>' +
          "<div>" +
          '<div class="profile-doc__title">' + d.title + "</div>" +
          '<div class="profile-doc__meta">' + d.type + " · " + formatDate(d.date) + "</div>" +
          "</div></a>"
        );
      }).join("") +
      "</div>"
    );
  }

  function renderCommunications(comms) {
    if (!comms || !comms.length) return '<p class="profile-empty">Nenhum comunicado vinculado.</p>';
    return (
      '<div class="profile-doc-list">' +
      comms.map(function (c) {
        return (
          '<a class="profile-doc" href="' + c.url + '">' +
          '<span class="profile-doc__icon"><i class="fa-solid fa-bullhorn"></i></span>' +
          "<div>" +
          '<div class="profile-doc__title">' + c.title + "</div>" +
          '<div class="profile-doc__meta">' + c.type + " · " + formatDate(c.date) + "</div>" +
          "</div></a>"
        );
      }).join("") +
      "</div>"
    );
  }

  function renderDirectReports(person, reports) {
    reports = reports || [];
    if (!reports.length) return '<p class="profile-empty">Nenhum subordinado direto registrado.</p>';
    return reports.map(function (report) {
      return (
        '<a class="profile-report" href="' + profileHref(report.id) + '">' +
        (report.img
          ? '<img class="profile-report__avatar" src="' + report.img + '" alt="" />'
          : '<span class="profile-report__avatar profile-report__avatar--placeholder" aria-hidden="true"><i class="fa-solid fa-user"></i></span>') +
        "<div>" +
        '<div class="profile-report__name">' + report.name + "</div>" +
        '<div class="profile-report__role">' + report.title + "</div>" +
        "</div></a>"
      );
    }).join("");
  }

  function renderPeers(person, peers) {
    peers = peers || [];
    if (!person.managerId && !person.managerName) {
      return '<p class="profile-empty">Sem colegas de mesmo gestor.</p>';
    }
    if (!peers.length) return '<p class="profile-empty">Nenhum colega direto registrado.</p>';
    return peers.map(function (peer) {
      return (
        '<a class="profile-peer" href="' + profileHref(peer.id) + '">' +
        (peer.img
          ? '<img class="profile-peer__avatar" src="' + peer.img + '" alt="" />'
          : '<span class="profile-peer__avatar profile-peer__avatar--placeholder" aria-hidden="true"><i class="fa-solid fa-user"></i></span>') +
        "<div>" +
        '<div class="profile-peer__name">' + peer.name + "</div>" +
        '<div class="profile-peer__role">' + peer.title + "</div>" +
        "</div></a>"
      );
    }).join("");
  }

  function renderGroups(groups) {
    if (!groups || !groups.length) return '<p class="profile-empty">Nenhum grupo registrado.</p>';
    return groups.map(function (g) {
      return (
        '<a class="profile-group-item" href="' + (g.url || "grupos-meus-grupos.html") + '">' +
        "<div>" +
        '<div class="profile-group-item__name">' + g.name + "</div>" +
        '<div class="profile-group-item__meta">' + g.role + " · " + g.members + " membros</div>" +
        "</div>" +
        '<i class="fa-solid fa-chevron-right" style="color:#94a3b8;font-size:12px"></i>' +
        "</a>"
      );
    }).join("");
  }

  function renderRelatedPeople(person, allPeople) {
    var related = allPeople.filter(function (p) {
      return p.dept === person.dept && p.id !== person.id;
    }).slice(0, 5);
    if (!related.length) return '<p class="profile-empty">Nenhuma sugestão.</p>';
    return (
      '<div class="profile-related">' +
      related.map(function (p) {
        return (
          '<a class="profile-related__chip" href="' + profileHref(p.id) + '">' +
          '<img src="' + p.img + '" alt="" />' + p.name.split(" ")[0] +
          "</a>"
        );
      }).join("") +
      "</div>"
    );
  }

  function buildVCard(person) {
    var c = person.contact || {};
    return [
      "BEGIN:VCARD",
      "VERSION:3.0",
      "FN:" + person.name,
      "TITLE:" + person.title,
      "ORG:LioTécnica",
      "EMAIL:" + (c.email || ""),
      "TEL:" + (c.phone || ""),
      "NOTE:" + (person.aboutMe || person.bio || ""),
      "END:VCARD"
    ].join("\n");
  }

  function openVCardModal(person) {
    var modal = document.getElementById("profile-vcard-modal");
    if (!modal) return;
    var vcard = buildVCard(person);
    var email = (person.contact && person.contact.email) || "";
    document.getElementById("profile-vcard-qr").src =
      "https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=" + encodeURIComponent("mailto:" + email);
    document.getElementById("profile-vcard-download").onclick = function () {
      var blob = new Blob([vcard], { type: "text/vcard" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = person.id + ".vcf";
      a.click();
    };
    modal.hidden = false;
  }

  function setupTabs() {
    var buttons = document.querySelectorAll(".profile-tabs__btn");
    var panels = document.querySelectorAll(".profile-tab-panel");
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var tab = btn.getAttribute("data-tab");
        buttons.forEach(function (b) {
          b.classList.toggle("is-active", b === btn);
        });
        panels.forEach(function (panel) {
          panel.hidden = panel.getAttribute("data-tab-panel") !== tab;
        });
      });
    });
    document.querySelectorAll("[data-tab-target]").forEach(function (el) {
      el.addEventListener("click", function () {
        var tab = el.getAttribute("data-tab-target");
        var targetBtn = document.querySelector('.profile-tabs__btn[data-tab="' + tab + '"]');
        if (targetBtn) targetBtn.click();
      });
    });
  }

  function setupVCardModal() {
    var modal = document.getElementById("profile-vcard-modal");
    if (!modal) return;
    modal.querySelectorAll("[data-close-vcard]").forEach(function (el) {
      el.addEventListener("click", function () {
        modal.hidden = true;
      });
    });
  }

  function mountProfileModalsToBody() {
    document.querySelectorAll(".profile-edit-modal, .profile-vcard-modal").forEach(function (modal) {
      if (modal.parentElement !== document.body) {
        document.body.appendChild(modal);
      }
    });
  }

  var currentPerson = null;
  var currentAllPeople = null;
  var activeEditModal = null;

  var languageLevels = ["Básico", "Intermediário", "Avançado", "Fluente", "Nativo"];
  var projectStatuses = ["Ativo", "Concluído", "Pausado"];
  var careerTypes = [
    { value: "atual", label: "Cargo atual" },
    { value: "promotion", label: "Promoção" },
    { value: "transfer", label: "Transferência" },
  ];

  function canEditProfile() {
    return VIEWER_ROLE === "self";
  }

  function toggleEditButtons() {
    var visible = canEditProfile();
    document.querySelectorAll("[data-edit-section]").forEach(function (btn) {
      btn.hidden = !visible;
    });
  }

  function setEditError(section, message) {
    var el = document.getElementById("profile-edit-" + section + "-error");
    if (!el) return;
    if (message) {
      el.textContent = message;
      el.hidden = false;
    } else {
      el.textContent = "";
      el.hidden = true;
    }
  }

  function closeEditModal(section) {
    if (!section) return;
    var modal = document.getElementById("profile-edit-" + section + "-modal");
    if (modal) modal.hidden = true;
    if (activeEditModal === section) activeEditModal = null;
    setEditError(section, "");
    if (!activeEditModal) {
      document.body.style.overflow = "";
    }
  }

  function renderSkillsEditor(skills) {
    var list = document.getElementById("profile-edit-skills-list");
    if (!list) return;
    var rows = (skills.length ? skills : [{ name: "", level: 3, endorsements: 0 }]).map(function (skill, index) {
      var level = typeof skill.level === "number" ? skill.level : 3;
      return (
        '<div class="profile-edit-row" data-skill-row="' + index + '">' +
        '<input class="profile-edit-row__input" type="text" data-skill-name maxlength="80" placeholder="Nome da competência" value="' + escapeAttr(skill.name || "") + '" />' +
        '<select class="profile-edit-row__select" data-skill-level aria-label="Nível">' +
        [1, 2, 3, 4, 5].map(function (value) {
          return '<option value="' + value + '"' + (level === value ? " selected" : "") + ">" + value + "/5</option>";
        }).join("") +
        "</select>" +
        '<button class="profile-edit-row__remove" type="button" data-remove-skill aria-label="Remover competência"><i class="fa-solid fa-trash" aria-hidden="true"></i></button>' +
        "</div>"
      );
    }).join("");
    list.innerHTML = rows;
  }

  function renderLanguagesEditor(languages) {
    var list = document.getElementById("profile-edit-languages-list");
    if (!list) return;
    var rows = (languages.length ? languages : [{ name: "", level: "Intermediário" }]).map(function (lang, index) {
      return (
        '<div class="profile-edit-row profile-edit-row--languages" data-language-row="' + index + '">' +
        '<input class="profile-edit-row__input" type="text" data-language-name maxlength="60" placeholder="Idioma" value="' + escapeAttr(lang.name || "") + '" />' +
        '<select class="profile-edit-row__select" data-language-level aria-label="Nível">' +
        languageLevels.map(function (level) {
          return '<option value="' + level + '"' + ((lang.level || "") === level ? " selected" : "") + ">" + level + "</option>";
        }).join("") +
        "</select>" +
        '<button class="profile-edit-row__remove" type="button" data-remove-language aria-label="Remover idioma"><i class="fa-solid fa-trash" aria-hidden="true"></i></button>' +
        "</div>"
      );
    }).join("");
    list.innerHTML = rows;
  }

  function escapeAttr(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }

  function collectSkillsFromEditor() {
    var rows = document.querySelectorAll("#profile-edit-skills-list [data-skill-row]");
    var skills = [];
    rows.forEach(function (row) {
      var name = row.querySelector("[data-skill-name]").value.trim();
      if (!name) return;
      var level = parseInt(row.querySelector("[data-skill-level]").value, 10) || 3;
      skills.push({ name: name, level: level, endorsements: 0 });
    });
    return skills;
  }

  function collectLanguagesFromEditor() {
    var rows = document.querySelectorAll("#profile-edit-languages-list [data-language-row]");
    var languages = [];
    rows.forEach(function (row) {
      var name = row.querySelector("[data-language-name]").value.trim();
      var level = row.querySelector("[data-language-level]").value.trim();
      if (!name || !level) return;
      languages.push({ name: name, level: level });
    });
    return languages;
  }

  function mergeProfileHistory(personalData) {
    var baseHistory = parseJsonField(personalData.history, []) || [];
    var userHistory = parseJsonField(personalData.careerHistory, []) || [];
    return sortHistoryDescending(baseHistory.concat(userHistory));
  }

  function renderProjectsEditor(projects) {
    var list = document.getElementById("profile-edit-projects-list");
    if (!list) return;
    var items = projects.length ? projects : [{ name: "", role: "", since: "", status: "Ativo" }];
    list.innerHTML = items.map(function (project, index) {
      var status = project.status || "Ativo";
      return (
        '<article class="profile-edit-block" data-project-row="' + index + '">' +
        '<div class="profile-edit-block__head"><strong>Projeto ' + (index + 1) + '</strong>' +
        '<button class="profile-edit-row__remove" type="button" data-remove-project aria-label="Remover projeto"><i class="fa-solid fa-trash" aria-hidden="true"></i></button></div>' +
        '<div class="profile-edit-block__grid">' +
        '<input class="profile-edit-row__input" type="text" data-project-name maxlength="120" placeholder="Nome" value="' + escapeAttr(project.name || "") + '" />' +
        '<input class="profile-edit-row__input" type="text" data-project-role maxlength="80" placeholder="Papel" value="' + escapeAttr(project.role || "") + '" />' +
        '<input class="profile-edit-row__input" type="text" data-project-since maxlength="40" placeholder="Desde" value="' + escapeAttr(project.since || "") + '" />' +
        '<select class="profile-edit-row__select" data-project-status aria-label="Status">' +
        projectStatuses.map(function (option) {
          return '<option value="' + option + '"' + (status === option ? " selected" : "") + ">" + option + "</option>";
        }).join("") +
        "</select></div></article>"
      );
    }).join("");
  }

  function renderEducationEditor(education) {
    var list = document.getElementById("profile-edit-education-list");
    if (!list) return;
    var items = education.length ? education : [{ period: "", degree: "", institution: "", note: "" }];
    list.innerHTML = items.map(function (item, index) {
      return (
        '<article class="profile-edit-block" data-education-row="' + index + '">' +
        '<div class="profile-edit-block__head"><strong>Formação ' + (index + 1) + '</strong>' +
        '<button class="profile-edit-row__remove" type="button" data-remove-education aria-label="Remover formação"><i class="fa-solid fa-trash" aria-hidden="true"></i></button></div>' +
        '<div class="profile-edit-block__grid">' +
        '<input class="profile-edit-row__input" type="text" data-education-period maxlength="40" placeholder="Período" value="' + escapeAttr(item.period || "") + '" />' +
        '<input class="profile-edit-row__input" type="text" data-education-degree maxlength="120" placeholder="Curso / grau" value="' + escapeAttr(item.degree || "") + '" />' +
        '<input class="profile-edit-row__input" type="text" data-education-institution maxlength="120" placeholder="Instituição" value="' + escapeAttr(item.institution || "") + '" />' +
        '<input class="profile-edit-row__input" type="text" data-education-note maxlength="120" placeholder="Observação" value="' + escapeAttr(item.note || "") + '" />' +
        "</div></article>"
      );
    }).join("");
  }

  function renderCertificationsEditor(certifications) {
    var list = document.getElementById("profile-edit-certifications-list");
    if (!list) return;
    var items = certifications.length ? certifications : [{ name: "", issuer: "", year: "" }];
    list.innerHTML = items.map(function (item, index) {
      return (
        '<article class="profile-edit-block" data-certification-row="' + index + '">' +
        '<div class="profile-edit-block__head"><strong>Certificação ' + (index + 1) + '</strong>' +
        '<button class="profile-edit-row__remove" type="button" data-remove-certification aria-label="Remover certificação"><i class="fa-solid fa-trash" aria-hidden="true"></i></button></div>' +
        '<div class="profile-edit-block__grid">' +
        '<input class="profile-edit-row__input" type="text" data-certification-name maxlength="120" placeholder="Nome" value="' + escapeAttr(item.name || "") + '" />' +
        '<input class="profile-edit-row__input" type="text" data-certification-issuer maxlength="120" placeholder="Emissor" value="' + escapeAttr(item.issuer || "") + '" />' +
        '<input class="profile-edit-row__input" type="text" data-certification-year maxlength="10" placeholder="Ano" value="' + escapeAttr(item.year || "") + '" />' +
        "</div></article>"
      );
    }).join("");
  }

  function renderCareerHistoryEditor(history) {
    var list = document.getElementById("profile-edit-career-history-list");
    if (!list) return;
    var items = history.length ? history : [{ type: "atual", title: "", date: "", dept: "", note: "" }];
    list.innerHTML = items.map(function (item, index) {
      var type = item.type || "atual";
      return (
        '<article class="profile-edit-block" data-career-history-row="' + index + '">' +
        '<div class="profile-edit-block__head"><strong>Registro ' + (index + 1) + '</strong>' +
        '<button class="profile-edit-row__remove" type="button" data-remove-career-history aria-label="Remover registro"><i class="fa-solid fa-trash" aria-hidden="true"></i></button></div>' +
        '<div class="profile-edit-block__grid">' +
        '<select class="profile-edit-row__select" data-career-history-type aria-label="Tipo">' +
        careerTypes.map(function (option) {
          return '<option value="' + option.value + '"' + (type === option.value ? " selected" : "") + ">" + option.label + "</option>";
        }).join("") +
        "</select>" +
        '<input class="profile-edit-row__input" type="text" data-career-history-title maxlength="120" placeholder="Cargo / função" value="' + escapeAttr(item.title || "") + '" />' +
        '<input class="profile-edit-row__input" type="text" data-career-history-date maxlength="20" placeholder="Ano ou período" value="' + escapeAttr(item.date || "") + '" />' +
        '<input class="profile-edit-row__input" type="text" data-career-history-dept maxlength="80" placeholder="Área / departamento" value="' + escapeAttr(item.dept || "") + '" />' +
        '<input class="profile-edit-row__input" type="text" data-career-history-note maxlength="200" placeholder="Observação" value="' + escapeAttr(item.note || "") + '" />' +
        "</div></article>"
      );
    }).join("");
  }

  function collectProjectsFromEditor() {
    var rows = document.querySelectorAll("#profile-edit-projects-list [data-project-row]");
    var projects = [];
    rows.forEach(function (row) {
      var name = row.querySelector("[data-project-name]").value.trim();
      if (!name) return;
      projects.push({
        name: name,
        role: row.querySelector("[data-project-role]").value.trim(),
        since: row.querySelector("[data-project-since]").value.trim(),
        status: row.querySelector("[data-project-status]").value,
      });
    });
    return projects;
  }

  function collectEducationFromEditor() {
    var rows = document.querySelectorAll("#profile-edit-education-list [data-education-row]");
    var education = [];
    rows.forEach(function (row) {
      var degree = row.querySelector("[data-education-degree]").value.trim();
      var institution = row.querySelector("[data-education-institution]").value.trim();
      if (!degree && !institution) return;
      education.push({
        period: row.querySelector("[data-education-period]").value.trim(),
        degree: degree,
        institution: institution,
        note: row.querySelector("[data-education-note]").value.trim(),
      });
    });
    return education;
  }

  function collectCertificationsFromEditor() {
    var rows = document.querySelectorAll("#profile-edit-certifications-list [data-certification-row]");
    var certifications = [];
    rows.forEach(function (row) {
      var name = row.querySelector("[data-certification-name]").value.trim();
      if (!name) return;
      certifications.push({
        name: name,
        issuer: row.querySelector("[data-certification-issuer]").value.trim(),
        year: row.querySelector("[data-certification-year]").value.trim(),
      });
    });
    return certifications;
  }

  function collectCareerHistoryFromEditor() {
    var rows = document.querySelectorAll("#profile-edit-career-history-list [data-career-history-row]");
    var history = [];
    rows.forEach(function (row) {
      var title = row.querySelector("[data-career-history-title]").value.trim();
      if (!title) return;
      history.push({
        type: row.querySelector("[data-career-history-type]").value,
        title: title,
        date: row.querySelector("[data-career-history-date]").value.trim(),
        dept: row.querySelector("[data-career-history-dept]").value.trim(),
        note: row.querySelector("[data-career-history-note]").value.trim(),
      });
    });
    return history;
  }

  function refreshEditableSections(person) {
    document.getElementById("profile-bio").textContent = person.aboutMe || person.bio || "";
    document.getElementById("profile-pronouns").textContent = person.pronouns || "";
    document.getElementById("profile-skills").innerHTML = renderSkills(person.skills);
    document.getElementById("profile-languages").innerHTML = renderLanguages(person.languages);
    document.getElementById("profile-links").innerHTML = renderLinks(person.links);
    document.getElementById("profile-availability").innerHTML = renderAvailability(person);
    document.getElementById("profile-mentor").innerHTML = renderMentorBuddy(person);
    document.getElementById("profile-projects").innerHTML = renderProjects(person.projects);
    document.getElementById("profile-education").innerHTML = renderEducation(person.education);
    document.getElementById("profile-certifications").innerHTML = renderCertifications(person.certifications);
    document.getElementById("profile-history").innerHTML = renderHistory(person.history);
  }

  function resolveProfileAvatarUrl(person) {
    if (!person) return "";
    if (global.PersonAvatar && typeof global.PersonAvatar.resolvePhotoUrlFromSource === "function") {
      return global.PersonAvatar.resolvePhotoUrlFromSource(person) || "";
    }
    if (global.PersonAvatar && typeof global.PersonAvatar.resolvePhotoUrl === "function") {
      var candidate =
        person.portalPhotoUrl ||
        person.PortalPhotoUrl ||
        person.img ||
        person.photoUrl ||
        person.PhotoUrl ||
        "";
      return global.PersonAvatar.resolvePhotoUrl(candidate) || candidate || "";
    }
    return (
      person.portalPhotoUrl ||
      person.PortalPhotoUrl ||
      person.img ||
      person.photoUrl ||
      person.PhotoUrl ||
      ""
    );
  }

  function openAvatarPickerForProfile() {
    if (!canEditProfile() || !currentPerson || !global.AvatarPicker) return;

    var graphPhotoUrl =
      currentPerson.graphPhotoUrl ||
      (global.PersonAvatar && global.PersonAvatar.resolveGraphPhotoUrl(currentPerson.img));

    global.AvatarPicker.open({
      mode: "me",
      isSelf: true,
      slug: currentPerson.id,
      personName: currentPerson.name,
      photoUrl: currentPerson.img,
      graphPhotoUrl: graphPhotoUrl,
      currentUrl: resolveProfileAvatarUrl(currentPerson),
      onSaved: function (savedUrl, result) {
        if (result) {
          applyUpdatedProfile(result);
        } else {
          currentPerson.img = savedUrl || graphPhotoUrl || "";
          renderProfileAvatar(currentPerson);
        }
        if (typeof global.reloadOrganogram === "function") {
          global.reloadOrganogram();
        }
      }
    });
  }

  function renderProfileAvatar(person) {
    var avatarEl = document.getElementById("profile-avatar");
    var changeBtn = document.getElementById("profile-avatar-change");
    if (!avatarEl) return;

    var src = resolveProfileAvatarUrl(person);
    if (src) {
      avatarEl.src = src;
      avatarEl.hidden = false;
    } else {
      avatarEl.removeAttribute("src");
      avatarEl.hidden = true;
    }
    avatarEl.alt = "Foto de " + person.name;

    if (changeBtn) {
      changeBtn.hidden = !canEditProfile();
    }
  }

  function updateOverviewFromPerson(person) {
    refreshEditableSections(person);
    renderProfileAvatar(person);
  }

  function applyUpdatedProfile(dto) {
    currentPerson = mapApiProfileToLegacy(dto);
    updateOverviewFromPerson(currentPerson);
  }

  function saveProfileSection(section, payload, saveButton) {
    if (!global.LioApi || global.LioApi.useMock) {
      setEditError(section, "Edição indisponível no modo mock.");
      return Promise.resolve();
    }

    var originalLabel = saveButton.textContent;
    saveButton.disabled = true;
    saveButton.textContent = "Salvando…";
    setEditError(section, "");

    return global.LioApi.patch("/me/profile/" + section, payload)
      .then(function (dto) {
        applyUpdatedProfile(dto);
        closeEditModal(section);
      })
      .catch(function (error) {
        var message = "Não foi possível salvar. Tente novamente.";
        if (error && error.body && error.body.message) {
          message = error.body.message;
        }
        setEditError(section, message);
      })
      .finally(function () {
        saveButton.disabled = false;
        saveButton.textContent = originalLabel;
      });
  }

  function openEditModal(section) {
    if (!canEditProfile() || !currentPerson) return;
    if (activeEditModal) closeEditModal(activeEditModal);
    activeEditModal = section;
    var modal = document.getElementById("profile-edit-" + section + "-modal");
    if (!modal) return;

    document.body.style.overflow = "hidden";

    if (section === "about") {
      document.getElementById("profile-edit-about-input").value =
        currentPerson.aboutMe || currentPerson.bio || "";
    } else if (section === "skills") {
      renderSkillsEditor(currentPerson.skills || []);
    } else if (section === "languages") {
      renderLanguagesEditor(currentPerson.languages || []);
    } else if (section === "links") {
      var links = currentPerson.links || {};
      document.getElementById("profile-edit-link-linkedin").value = links.linkedin || "";
      document.getElementById("profile-edit-link-github").value = links.github || "";
      document.getElementById("profile-edit-link-portfolio").value = links.portfolio || "";
    } else if (section === "pronouns") {
      document.getElementById("profile-edit-pronouns-input").value = currentPerson.pronouns || "";
    } else if (section === "availability") {
      var avail = currentPerson.availability || {};
      document.getElementById("profile-edit-availability-model").value = avail.workModel || "";
      document.getElementById("profile-edit-availability-schedule").value = avail.schedule || "";
      document.getElementById("profile-edit-availability-timezone").value = avail.timezone || "";
      document.getElementById("profile-edit-availability-floor").value = avail.floor || "";
      document.getElementById("profile-edit-availability-room").value = avail.room || "";
    } else if (section === "mentorship") {
      var mentor = currentPerson.mentor || {};
      var buddy = currentPerson.buddy || {};
      document.getElementById("profile-edit-mentor-name").value = mentor.name || "";
      document.getElementById("profile-edit-mentor-slug").value = mentor.id || mentor.slug || "";
      document.getElementById("profile-edit-mentor-since").value = mentor.since || "";
      document.getElementById("profile-edit-buddy-name").value = buddy.name || "";
      document.getElementById("profile-edit-buddy-slug").value = buddy.id || buddy.slug || "";
      document.getElementById("profile-edit-buddy-since").value = buddy.since || "";
    } else if (section === "projects") {
      renderProjectsEditor(currentPerson.projects || []);
    } else if (section === "education") {
      renderEducationEditor(currentPerson.education || []);
    } else if (section === "certifications") {
      renderCertificationsEditor(currentPerson.certifications || []);
    } else if (section === "career-history") {
      renderCareerHistoryEditor(currentPerson.careerHistory || []);
    }

    modal.hidden = false;
  }

  var editModalsInitialized = false;

  function setupProfileEditModals() {
    if (editModalsInitialized) return;
    editModalsInitialized = true;

    var avatarChangeBtn = document.getElementById("profile-avatar-change");
    if (avatarChangeBtn) {
      avatarChangeBtn.addEventListener("click", openAvatarPickerForProfile);
    }

    document.querySelectorAll("[data-edit-section]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        openEditModal(btn.getAttribute("data-edit-section"));
      });
    });

    document.querySelectorAll("[data-close-edit]").forEach(function (el) {
      el.addEventListener("click", function () {
        closeEditModal(el.getAttribute("data-close-edit"));
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && activeEditModal) {
        closeEditModal(activeEditModal);
      }
    });

    var skillsList = document.getElementById("profile-edit-skills-list");
    if (skillsList) {
      skillsList.addEventListener("click", function (event) {
        var removeBtn = event.target.closest("[data-remove-skill]");
        if (!removeBtn) return;
        var row = removeBtn.closest("[data-skill-row]");
        if (row) row.remove();
      });
    }

    var languagesList = document.getElementById("profile-edit-languages-list");
    if (languagesList) {
      languagesList.addEventListener("click", function (event) {
        var removeBtn = event.target.closest("[data-remove-language]");
        if (!removeBtn) return;
        var row = removeBtn.closest("[data-language-row]");
        if (row) row.remove();
      });
    }

    var skillsAdd = document.getElementById("profile-edit-skills-add");
    if (skillsAdd) {
      skillsAdd.addEventListener("click", function () {
        renderSkillsEditor(collectSkillsFromEditor().concat([{ name: "", level: 3, endorsements: 0 }]));
      });
    }

    var languagesAdd = document.getElementById("profile-edit-languages-add");
    if (languagesAdd) {
      languagesAdd.addEventListener("click", function () {
        renderLanguagesEditor(collectLanguagesFromEditor().concat([{ name: "", level: "Intermediário" }]));
      });
    }

    var aboutSave = document.getElementById("profile-edit-about-save");
    if (aboutSave) {
      aboutSave.addEventListener("click", function () {
        var value = document.getElementById("profile-edit-about-input").value.trim();
        saveProfileSection("about", { aboutMe: value || null }, aboutSave);
      });
    }

    var skillsSave = document.getElementById("profile-edit-skills-save");
    if (skillsSave) {
      skillsSave.addEventListener("click", function () {
        saveProfileSection("skills", { skills: collectSkillsFromEditor() }, skillsSave);
      });
    }

    var languagesSave = document.getElementById("profile-edit-languages-save");
    if (languagesSave) {
      languagesSave.addEventListener("click", function () {
        saveProfileSection("languages", { languages: collectLanguagesFromEditor() }, languagesSave);
      });
    }

    var linksSave = document.getElementById("profile-edit-links-save");
    if (linksSave) {
      linksSave.addEventListener("click", function () {
        saveProfileSection("links", {
          links: {
            linkedin: document.getElementById("profile-edit-link-linkedin").value.trim(),
            github: document.getElementById("profile-edit-link-github").value.trim(),
            portfolio: document.getElementById("profile-edit-link-portfolio").value.trim(),
          },
        }, linksSave);
      });
    }

    bindListEditor("#profile-edit-projects-list", "[data-remove-project]", "[data-project-row]", function () {
      renderProjectsEditor(collectProjectsFromEditor().concat([{ name: "", role: "", since: "", status: "Ativo" }]));
    }, "profile-edit-projects-add", collectProjectsFromEditor);

    bindListEditor("#profile-edit-education-list", "[data-remove-education]", "[data-education-row]", function () {
      renderEducationEditor(collectEducationFromEditor().concat([{ period: "", degree: "", institution: "", note: "" }]));
    }, "profile-edit-education-add", collectEducationFromEditor);

    bindListEditor("#profile-edit-certifications-list", "[data-remove-certification]", "[data-certification-row]", function () {
      renderCertificationsEditor(collectCertificationsFromEditor().concat([{ name: "", issuer: "", year: "" }]));
    }, "profile-edit-certifications-add", collectCertificationsFromEditor);

    bindListEditor("#profile-edit-career-history-list", "[data-remove-career-history]", "[data-career-history-row]", function () {
      renderCareerHistoryEditor(collectCareerHistoryFromEditor().concat([{ type: "atual", title: "", date: "", dept: "", note: "" }]));
    }, "profile-edit-career-history-add", collectCareerHistoryFromEditor);

    var pronounsSave = document.getElementById("profile-edit-pronouns-save");
    if (pronounsSave) {
      pronounsSave.addEventListener("click", function () {
        saveProfileSection("pronouns", {
          pronouns: document.getElementById("profile-edit-pronouns-input").value.trim() || null,
        }, pronounsSave);
      });
    }

    var availabilitySave = document.getElementById("profile-edit-availability-save");
    if (availabilitySave) {
      availabilitySave.addEventListener("click", function () {
        saveProfileSection("availability", {
          availability: {
            workModel: document.getElementById("profile-edit-availability-model").value,
            schedule: document.getElementById("profile-edit-availability-schedule").value.trim(),
            timezone: document.getElementById("profile-edit-availability-timezone").value.trim(),
            floor: document.getElementById("profile-edit-availability-floor").value.trim(),
            room: document.getElementById("profile-edit-availability-room").value.trim(),
          },
        }, availabilitySave);
      });
    }

    var mentorshipSave = document.getElementById("profile-edit-mentorship-save");
    if (mentorshipSave) {
      mentorshipSave.addEventListener("click", function () {
        function buildContact(nameId, slugId, sinceId) {
          var name = document.getElementById(nameId).value.trim();
          if (!name) return null;
          return {
            name: name,
            slug: document.getElementById(slugId).value.trim() || null,
            since: document.getElementById(sinceId).value.trim() || null,
          };
        }
        saveProfileSection("mentorship", {
          mentor: buildContact("profile-edit-mentor-name", "profile-edit-mentor-slug", "profile-edit-mentor-since"),
          buddy: buildContact("profile-edit-buddy-name", "profile-edit-buddy-slug", "profile-edit-buddy-since"),
        }, mentorshipSave);
      });
    }

    var projectsSave = document.getElementById("profile-edit-projects-save");
    if (projectsSave) {
      projectsSave.addEventListener("click", function () {
        saveProfileSection("projects", { projects: collectProjectsFromEditor() }, projectsSave);
      });
    }

    var educationSave = document.getElementById("profile-edit-education-save");
    if (educationSave) {
      educationSave.addEventListener("click", function () {
        saveProfileSection("education", { education: collectEducationFromEditor() }, educationSave);
      });
    }

    var certificationsSave = document.getElementById("profile-edit-certifications-save");
    if (certificationsSave) {
      certificationsSave.addEventListener("click", function () {
        saveProfileSection("certifications", { certifications: collectCertificationsFromEditor() }, certificationsSave);
      });
    }

    var careerHistorySave = document.getElementById("profile-edit-career-history-save");
    if (careerHistorySave) {
      careerHistorySave.addEventListener("click", function () {
        saveProfileSection("career-history", { careerHistory: collectCareerHistoryFromEditor() }, careerHistorySave);
      });
    }
  }

  function bindListEditor(listSelector, removeSelector, rowSelector, onAdd, addButtonId, collectFn) {
    var list = document.querySelector(listSelector);
    if (list) {
      list.addEventListener("click", function (event) {
        var removeBtn = event.target.closest(removeSelector);
        if (!removeBtn) return;
        var row = removeBtn.closest(rowSelector);
        if (row) row.remove();
      });
    }
    var addButton = document.getElementById(addButtonId);
    if (addButton) {
      addButton.addEventListener("click", onAdd);
    }
  }

  function renderProfile(person, hierarchy, relatedPeople) {
    currentPerson = person;
    currentAllPeople = relatedPeople || [];
    hierarchy = hierarchy || { chain: [], peers: [], directReports: [], directReportsCount: 0 };
    var loading = document.getElementById("profile-loading");
    if (loading) loading.hidden = true;

    var colors = getDeptColors(person.dept);
    var root = document.getElementById("profile-root");
    if (!root) {
      throw new Error("profile-root not found");
    }
    root.hidden = false;
    var errorEl = document.getElementById("profile-error");
    if (errorEl) errorEl.hidden = true;
    root.style.setProperty("--profile-accent", colors.stroke);
    root.style.setProperty("--profile-badge-bg", colors.badge);
    root.style.setProperty("--profile-badge-text", colors.text);

    document.title = "LioConecta — " + person.name;
    renderBreadcrumb(person, hierarchy.chain);
    renderBirthdayBanner(person);

    renderProfileAvatar(person);
    document.getElementById("profile-name").textContent = person.name;
    document.getElementById("profile-role").textContent = person.title;
    document.getElementById("profile-dept").textContent = person.dept;
    document.getElementById("profile-pronouns").textContent = person.pronouns || "";
    document.getElementById("profile-bio").textContent = person.aboutMe || person.bio || "";

    renderHeroBadges(person);
    renderMiniOrg(person, hierarchy.chain);

    document.getElementById("profile-stats").innerHTML = renderStats(person);
    document.getElementById("profile-personal").innerHTML = renderPersonalData(person);
    document.getElementById("profile-contact").innerHTML = renderContact(person);
    document.getElementById("profile-availability").innerHTML = renderAvailability(person);
    document.getElementById("profile-mentor").innerHTML = renderMentorBuddy(person);
    document.getElementById("profile-reports").innerHTML = renderDirectReports(person, hierarchy.directReports);
    document.getElementById("profile-peers").innerHTML = renderPeers(person, hierarchy.peers);
    document.getElementById("profile-groups").innerHTML = renderGroups(person.groups);
    document.getElementById("profile-skills").innerHTML = renderSkills(person.skills);
    document.getElementById("profile-languages").innerHTML = renderLanguages(person.languages);
    document.getElementById("profile-links").innerHTML = renderLinks(person.links);
    document.getElementById("profile-education").innerHTML = renderEducation(person.education);
    document.getElementById("profile-certifications").innerHTML = renderCertifications(person.certifications);
    document.getElementById("profile-history").innerHTML = renderHistory(person.history);
    document.getElementById("profile-projects").innerHTML = renderProjects(person.projects);
    document.getElementById("profile-recognitions").innerHTML = renderRecognitions(person.recognitions);
    document.getElementById("profile-interactions").innerHTML = renderInteractions(person.interactions);
    document.getElementById("profile-documents").innerHTML = renderDocuments(person.documents);
    document.getElementById("profile-communications").innerHTML = renderCommunications(person.communications);
    document.getElementById("profile-related").innerHTML = renderRelatedPeople(person, relatedPeople);

    var contact = person.contact || {};
    var emailBtn = document.getElementById("profile-email-btn");
    if (emailBtn) {
      if (!contact.email) {
        emailBtn.hidden = true;
      } else {
        emailBtn.hidden = false;
        emailBtn.onclick = function () {
          if (global.LioEmailCompose && typeof global.LioEmailCompose.open === "function") {
            global.LioEmailCompose.open({
              to: [{ name: person.name, email: contact.email }],
              recipientSlug: person.id,
              lockedTo: true,
              showExternalMailtoLink: true,
              source: "profile",
            });
            return;
          }
          window.location.href = "mailto:" + contact.email;
        };
      }
    }
    var teamsBtn = document.getElementById("profile-teams-btn");
    if (teamsBtn) {
      teamsBtn.href = contact.email
        ? "https://teams.microsoft.com/l/chat/0/0?users=" + encodeURIComponent(contact.email)
        : "#";
      teamsBtn.onclick = function (event) {
        event.preventDefault();
        openPersonChat(contact.email, contact.teams || contact.email);
      };
    }
    document.getElementById("profile-schedule-btn").href =
      "https://outlook.office.com/calendar/action/compose?subject=Reuni%C3%A3o%20com%20" + encodeURIComponent(person.name);
    document.getElementById("profile-org-link").href = orgChartHref(person.id);
    document.getElementById("profile-message-btn").onclick = function () {
      window.alert("Mensagem interna para " + person.name + " — em breve.");
    };
    document.getElementById("profile-vcard-btn").onclick = function () {
      openVCardModal(person);
    };
    document.getElementById("profile-print-btn").onclick = function () {
      window.print();
    };

    setupTabs();
    toggleEditButtons();
  }

  function showLoading() {
    var errorEl = document.getElementById("profile-error");
    var root = document.getElementById("profile-root");
    var loading = document.getElementById("profile-loading");
    if (errorEl) errorEl.hidden = true;
    if (root) root.hidden = true;
    if (loading) loading.hidden = false;
  }

  function showError() {
    var loading = document.getElementById("profile-loading");
    if (loading) loading.hidden = true;
    document.getElementById("profile-error").hidden = false;
    var root = document.getElementById("profile-root");
    if (root) root.hidden = true;
  }

  function parseJsonField(value, fallback) {
    if (value == null) return fallback;
    if (typeof value === "object") return value;
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch (_error) {
        return fallback;
      }
    }
    return fallback;
  }

  function formatHireDate(isoDate) {
    if (!isoDate) return "—";
    var parts = String(isoDate).split("-");
    if (parts.length !== 3) return isoDate;
    var monthIndex = parseInt(parts[1], 10);
    var monthLabel = monthNames[monthIndex] || parts[1];
    return monthLabel.slice(0, 3) + " de " + parts[0];
  }

  function normalizeContactRef(value) {
    if (!value || typeof value !== "object") return null;
    var slug = value.slug || value.id || null;
    if (!value.name && !slug) return null;
    return {
      id: slug,
      name: value.name || "",
      since: value.since || "",
    };
  }

  function mapApiProfileToLegacy(dto) {
    VIEWER_ROLE = mapViewerRole(dto.viewerContext);
    var personalData = parseJsonField(dto.personalData, {}) || {};
    var availability = parseJsonField(personalData.availability, personalData.availability) || {};
    var stats = parseJsonField(personalData.stats, {}) || {};
    var skills = (dto.skills || []).map(function (skill) {
      if (typeof skill === "string") {
        return { name: skill, level: 0, endorsements: 0 };
      }
      return {
        name: skill.name || skill.Name || "",
        level: skill.level || skill.Level || 0,
        endorsements: skill.endorsements || skill.Endorsements || 0,
      };
    });

    return {
      id: dto.slug,
      orgChartId: dto.orgChartId,
      name: dto.name || "",
      title: dto.title || "",
      dept: dto.departmentName || "",
      img:
        dto.photoUrl ||
        dto.PhotoUrl ||
        dto.portalPhotoUrl ||
        dto.PortalPhotoUrl ||
        "",
      graphPhotoUrl: dto.graphPhotoUrl || dto.GraphPhotoUrl || null,
      portalPhotoUrl: dto.portalPhotoUrl || dto.PortalPhotoUrl || null,
      aboutMe: personalData.aboutMe || personalData.bio || dto.bio || "",
      bio: personalData.bio || dto.bio || "",
      pronouns: personalData.pronouns || dto.pronouns || "",
      tags: dto.tags || [],
      tagLabels: (dto.tags || []).map(function (t) {
        if (t === "ceo") return "CEO";
        if (t === "director") return "Liderança";
        if (t === "member") return "Colaborador";
        return t;
      }),
      contact: {
        email: dto.email || "",
        phone: dto.phone || "",
        location: dto.location || personalData.cityState || "",
        teams: dto.teamsUpn || dto.email || "",
      },
      personal: personalData.visibility ? personalData : { visibility: "public", fullName: dto.name || "" },
      availability: availability,
      managerId: dto.managerSlug || null,
      managerName: dto.managerName || null,
      admission: formatHireDate(dto.hireDate),
      roleTenure: personalData.roleTenure || null,
      skills: skills,
      languages: parseJsonField(personalData.languages, []),
      links: parseJsonField(personalData.links, {}),
      education: parseJsonField(personalData.education, []),
      certifications: parseJsonField(personalData.certifications, []),
      careerHistory: parseJsonField(personalData.careerHistory, []),
      history: mergeProfileHistory(personalData),
      projects: parseJsonField(personalData.projects, []),
      recognitions: parseJsonField(personalData.recognitions, []),
      interactions: parseJsonField(personalData.interactions, []),
      documents: parseJsonField(personalData.documents, []),
      communications: parseJsonField(personalData.communications, []),
      groups: parseJsonField(personalData.groups, []),
      mentor: normalizeContactRef(personalData.mentor),
      buddy: normalizeContactRef(personalData.buddy),
      stats: {
        tenureYears: stats.tenureYears,
        directReports: stats.directReports,
        groups: stats.groups,
        recognitions: stats.recognitions,
        projectsCount: stats.projectsCount,
      },
    };
  }

  function mapHierarchyMember(member) {
    if (!member) return null;
    return {
      id: member.slug || member.Slug || "",
      name: member.name || member.Name || "",
      title: member.title || member.Title || "",
      img: member.photoUrl || member.PhotoUrl || "",
      dept: member.departmentName || member.DepartmentName || "",
    };
  }

  function mapApiHierarchyToLegacy(dto) {
    if (!dto) {
      return { manager: null, chain: [], peers: [], directReports: [], directReportsCount: 0 };
    }
    return {
      manager: mapHierarchyMember(dto.manager || dto.Manager),
      chain: (dto.chain || dto.Chain || []).map(mapHierarchyMember),
      peers: (dto.peers || dto.Peers || []).map(mapHierarchyMember),
      directReports: (dto.directReports || dto.DirectReports || []).map(mapHierarchyMember),
      directReportsCount:
        dto.directReportsCount !== undefined && dto.directReportsCount !== null
          ? dto.directReportsCount
          : dto.DirectReportsCount || 0,
    };
  }

  function mapApiSummaryToLegacy(summary) {
    return {
      id: summary.slug,
      name: summary.name,
      title: summary.title || "",
      dept: summary.departmentName || "",
      img: summary.photoUrl || "",
      managerId: summary.managerSlug || null,
    };
  }

  function normalizePeopleList(raw) {
    if (Array.isArray(raw)) return raw;
    if (raw && Array.isArray(raw.items)) return raw.items;
    if (raw && Array.isArray(raw.value)) return raw.value;
    return [];
  }

  function loadFromApi(profileId) {
    if (!global.LioApi || global.LioApi.useMock) {
      return Promise.reject(new Error("API unavailable"));
    }

    return global.LioApi
      .get("/people/" + encodeURIComponent(profileId) + "/profile")
      .then(function (dto) {
        var person = mapApiProfileToLegacy(dto);
        var hierarchyPromise = global.LioApi
          .get("/people/" + encodeURIComponent(profileId) + "/hierarchy")
          .then(mapApiHierarchyToLegacy)
          .catch(function () {
            return { manager: null, chain: [], peers: [], directReports: [], directReportsCount: 0 };
          });
        var relatedPromise = person.dept
          ? global.LioApi
              .get("/people?limit=20&q=" + encodeURIComponent(person.dept))
              .then(function (peopleList) {
                return normalizePeopleList(peopleList)
                  .map(mapApiSummaryToLegacy)
                  .filter(function (p) {
                    return p.id !== person.id;
                  });
              })
              .catch(function () {
                return [];
              })
          : Promise.resolve([]);

        return hierarchyPromise.then(function (hierarchy) {
          person.stats = person.stats || {};
          person.stats.directReports = hierarchy.directReportsCount;
          return relatedPromise.then(function (relatedPeople) {
            return {
              person: person,
              hierarchy: hierarchy,
              relatedPeople: relatedPeople,
            };
          });
        });
      });
  }

  var activeLoadId = 0;

  function init() {
    var loadId = ++activeLoadId;
    setupVCardModal();
    mountProfileModalsToBody();
    setupProfileEditModals();
    var profileId = getProfileId();

    showLoading();

    function finishLoad(id) {
      return loadFromApi(id)
        .then(function (result) {
          if (loadId !== activeLoadId) return;
          try {
            renderProfile(result.person, result.hierarchy, result.relatedPeople);
          } catch (error) {
            console.error("[ProfilePage] renderProfile failed", error);
            showError();
          }
        })
        .catch(function () {
          if (loadId !== activeLoadId) return;
          showError();
        });
    }

    if (profileId) {
      return finishLoad(profileId);
    }

    if (!global.LioApi || global.LioApi.useMock) {
      showError();
      return Promise.resolve();
    }

    return global.LioApi
      .get("/me")
      .then(function (me) {
        if (loadId !== activeLoadId) return;
        if (!me || !me.slug) {
          showError();
          return;
        }
        var url = new URL(window.location.href);
        url.searchParams.set("id", me.slug);
        window.history.replaceState(null, "", url.pathname + "?" + url.searchParams.toString());
        return finishLoad(me.slug);
      })
      .catch(function () {
        if (loadId !== activeLoadId) return;
        showError();
      });
  }

  global.ProfilePage = {
    init: init,
    bumpLoadGeneration: function () {
      activeLoadId += 1;
    },
    setViewerRole: function (role) {
      VIEWER_ROLE = role;
    }
  };
})(window);
