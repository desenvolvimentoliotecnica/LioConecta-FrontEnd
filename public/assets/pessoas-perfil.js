(function (global) {
  "use strict";

  var VIEWER_ROLE = "colleague";

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
    transfer: "Transferência"
  };

  var monthNames = [
    "", "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
  ];

  function getDeptColors(dept) {
    return deptColors[dept] || deptColors.Executiva;
  }

  function getProfileId() {
    return new URLSearchParams(window.location.search).get("id");
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
    while (managerId && peopleIndex[managerId]) {
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
    return VIEWER_ROLE === "rh" || person.personal.visibility !== "rh-only";
  }

  function renderBreadcrumb(person, allPeople) {
    var peopleIndex = buildPeopleIndex(allPeople);
    var chain = buildHierarchyChain(person, peopleIndex);
    var html = '<a href="pessoas-organograma.html">Organograma</a>';
    chain.forEach(function (ancestor) {
      html +=
        '<span class="breadcrumb__sep">/</span>' +
        '<a href="pessoas-perfil.html?id=' + encodeURIComponent(ancestor.id) + '">' +
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

  function renderMiniOrg(person, allPeople) {
    var container = document.getElementById("profile-mini-org");
    if (!container) return;
    var peopleIndex = buildPeopleIndex(allPeople);
    var chain = buildHierarchyChain(person, peopleIndex);
    var html = '<span class="profile-mini-org__label">Cadeia hierárquica:</span>';
    html += '<a class="profile-mini-org__item" href="pessoas-organograma.html?focus=' +
      encodeURIComponent(person.id) + '"><i class="fa-solid fa-sitemap"></i> Organograma</a>';
    chain.forEach(function (node) {
      html += '<span class="profile-mini-org__sep">›</span>';
      html +=
        '<a class="profile-mini-org__item" href="pessoas-perfil.html?id=' +
        encodeURIComponent(node.id) + '">' +
        '<img src="' + node.img + '" alt="" />' + node.name + "</a>";
    });
    html += '<span class="profile-mini-org__sep">›</span>';
    html += '<span class="profile-mini-org__current">' + person.name + "</span>";
    container.innerHTML = html;
  }

  function renderStats(person) {
    var stats = person.stats || {};
    var items = [
      { value: stats.tenureYears || 0, label: "Anos de casa", tab: null },
      { value: (person.roleTenure && person.roleTenure.years) || 0, label: "Anos no cargo", tab: "career" },
      { value: stats.directReports || 0, label: "Reportes diretos", tab: "overview" },
      { value: stats.groups || 0, label: "Grupos", tab: "overview" },
      { value: stats.recognitions || 0, label: "Reconhecimentos", tab: "activity" },
      { value: stats.projectsCount || 0, label: "Projetos", tab: "career" }
    ];
    return items.map(function (item) {
      var tag = item.tab
        ? ' data-tab-target="' + item.tab + '" class="profile-stat profile-stat--link"'
        : ' class="profile-stat"';
      return (
        "<button type=\"button\"" + tag + ">" +
        '<span class="profile-stat__value">' + item.value + "</span>" +
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
      '<div class="profile-contact-item"><span class="profile-contact-item__label">Nome completo</span><span class="profile-contact-item__value">' + (personal.fullName || person.name) + "</span></div>" +
      '<div class="profile-contact-item"><span class="profile-contact-item__label">Data de nascimento</span><span class="profile-contact-item__value">' + (personal.birthDate || "—") + "</span></div>" +
      '<div class="profile-contact-item"><span class="profile-contact-item__label">CPF</span><span class="profile-contact-item__value">' + (personal.cpf || "—") + "</span></div>" +
      '<div class="profile-contact-item"><span class="profile-contact-item__label">RG</span><span class="profile-contact-item__value">' + (personal.rg || "—") + "</span></div>" +
      '<div class="profile-contact-item"><span class="profile-contact-item__label">Estado civil</span><span class="profile-contact-item__value">' + (personal.maritalStatus || "—") + "</span></div>" +
      '<div class="profile-contact-item"><span class="profile-contact-item__label">Nacionalidade</span><span class="profile-contact-item__value">' + (personal.nationality || "—") + "</span></div>"
    );
  }

  function renderContact(person) {
    var contact = person.contact || {};
    var avail = person.availability || {};
    var managerHtml = person.managerId
      ? '<a href="pessoas-perfil.html?id=' + person.managerId + '">' + person.managerName + "</a>"
      : "—";
    return (
      '<div class="profile-contact-item"><span class="profile-contact-item__label">E-mail</span><span class="profile-contact-item__value"><a href="mailto:' + contact.email + '">' + contact.email + "</a></span></div>" +
      '<div class="profile-contact-item"><span class="profile-contact-item__label">Telefone / Ramal</span><span class="profile-contact-item__value">' + (contact.phone || "—") + "</span></div>" +
      '<div class="profile-contact-item"><span class="profile-contact-item__label">Localização</span><span class="profile-contact-item__value">' + (contact.location || "—") + "</span></div>" +
      '<div class="profile-contact-item"><span class="profile-contact-item__label">Microsoft Teams</span><span class="profile-contact-item__value"><a href="https://teams.microsoft.com/l/chat/0/0?users=' + encodeURIComponent(contact.email || "") + '">' + (contact.teams || "—") + "</a></span></div>" +
      '<div class="profile-contact-item"><span class="profile-contact-item__label">Modelo de trabalho</span><span class="profile-contact-item__value">' + (avail.workModel || "—") + " · " + (avail.schedule || "") + "</span></div>" +
      '<div class="profile-contact-item"><span class="profile-contact-item__label">Escritório</span><span class="profile-contact-item__value">' + (avail.floor || "—") + " · " + (avail.room || "—") + "</span></div>" +
      '<div class="profile-contact-item"><span class="profile-contact-item__label">Admissão</span><span class="profile-contact-item__value">' + person.admission + "</span></div>" +
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
        '<span class="profile-contact-item__value"><a href="pessoas-perfil.html?id=' + person.buddy.id + '">' +
        person.buddy.name + "</a> · desde " + person.buddy.since + "</span></div>"
      );
    }
    if (person.mentor) {
      return (
        '<div class="profile-contact-item"><span class="profile-contact-item__label">Mentor</span>' +
        '<span class="profile-contact-item__value"><a href="pessoas-perfil.html?id=' + person.mentor.id + '">' +
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

  function renderHistory(history) {
    if (!history || !history.length) return '<p class="profile-empty">Nenhum histórico registrado.</p>';
    return history.map(function (item) {
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
        '<div class="profile-recognition__meta">Por <a href="pessoas-perfil.html?id=' + r.authorId + '">' + r.author + "</a> · " + formatDate(r.date) + "</div>" +
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

  function renderDirectReports(person, allPeople) {
    var reports = allPeople.filter(function (p) {
      return p.managerId === person.id;
    });
    if (!reports.length) return '<p class="profile-empty">Nenhum subordinado direto registrado.</p>';
    return reports.map(function (report) {
      return (
        '<a class="profile-report" href="pessoas-perfil.html?id=' + encodeURIComponent(report.id) + '">' +
        '<img class="profile-report__avatar" src="' + report.img + '" alt="" />' +
        "<div>" +
        '<div class="profile-report__name">' + report.name + "</div>" +
        '<div class="profile-report__role">' + report.title + "</div>" +
        "</div></a>"
      );
    }).join("");
  }

  function renderPeers(person, allPeople) {
    if (!person.managerId) return '<p class="profile-empty">Sem colegas de mesmo gestor.</p>';
    var peers = allPeople.filter(function (p) {
      return p.managerId === person.managerId && p.id !== person.id;
    });
    if (!peers.length) return '<p class="profile-empty">Nenhum colega direto registrado.</p>';
    return peers.map(function (peer) {
      return (
        '<a class="profile-peer" href="pessoas-perfil.html?id=' + encodeURIComponent(peer.id) + '">' +
        '<img class="profile-peer__avatar" src="' + peer.img + '" alt="" />' +
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
          '<a class="profile-related__chip" href="pessoas-perfil.html?id=' + encodeURIComponent(p.id) + '">' +
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

  function renderProfile(person, allPeople) {
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
    renderBreadcrumb(person, allPeople);
    renderBirthdayBanner(person);

    document.getElementById("profile-avatar").src = person.img;
    document.getElementById("profile-avatar").alt = "Foto de " + person.name;
    document.getElementById("profile-name").textContent = person.name;
    document.getElementById("profile-role").textContent = person.title;
    document.getElementById("profile-dept").textContent = person.dept;
    document.getElementById("profile-pronouns").textContent = person.pronouns || "";
    document.getElementById("profile-bio").textContent = person.aboutMe || person.bio || "";

    renderHeroBadges(person);
    renderMiniOrg(person, allPeople);

    document.getElementById("profile-stats").innerHTML = renderStats(person);
    document.getElementById("profile-personal").innerHTML = renderPersonalData(person);
    document.getElementById("profile-contact").innerHTML = renderContact(person);
    document.getElementById("profile-availability").innerHTML = renderAvailability(person);
    document.getElementById("profile-mentor").innerHTML = renderMentorBuddy(person);
    document.getElementById("profile-reports").innerHTML = renderDirectReports(person, allPeople);
    document.getElementById("profile-peers").innerHTML = renderPeers(person, allPeople);
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
    document.getElementById("profile-related").innerHTML = renderRelatedPeople(person, allPeople);

    var contact = person.contact || {};
    document.getElementById("profile-email-btn").href = "mailto:" + contact.email;
    document.getElementById("profile-teams-btn").href =
      "https://teams.microsoft.com/l/chat/0/0?users=" + encodeURIComponent(contact.email || "");
    document.getElementById("profile-schedule-btn").href =
      "https://outlook.office.com/calendar/action/compose?subject=Reuni%C3%A3o%20com%20" + encodeURIComponent(person.name);
    document.getElementById("profile-org-link").href =
      "pessoas-organograma.html?focus=" + encodeURIComponent(person.id);
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

  function mapApiProfileToLegacy(dto) {
    var personalData = parseJsonField(dto.personalData, {}) || {};
    var availability = parseJsonField(personalData.availability, personalData.availability) || {};
    var stats = parseJsonField(personalData.stats, {}) || {};
    var skills = (dto.skills || []).map(function (skill) {
      if (typeof skill === "string") {
        return { name: skill, level: 3, endorsements: 0 };
      }
      return {
        name: skill.name || skill.Name || "",
        level: skill.level || skill.Level || 3,
        endorsements: skill.endorsements || skill.Endorsements || 0,
      };
    });

    return {
      id: dto.slug,
      orgChartId: dto.orgChartId,
      name: dto.name,
      title: dto.title || "",
      dept: dto.departmentName || "",
      img: dto.photoUrl || "/avatar-maria-silva.png",
      aboutMe: personalData.aboutMe || personalData.bio || dto.bio || "",
      bio: personalData.bio || dto.bio || "",
      pronouns: personalData.pronouns || dto.pronouns || "",
      tags: dto.tags || ["member"],
      tagLabels: (dto.tags || []).map(function (t) {
        if (t === "ceo") return "CEO";
        if (t === "director") return "Liderança";
        return "Colaborador";
      }),
      contact: {
        email: dto.email,
        phone: dto.phone || "",
        location: dto.location || "",
        teams: dto.teamsUpn || personalData.teams || dto.email,
      },
      personal: personalData.visibility ? personalData : { visibility: "public", fullName: dto.name },
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
      history: parseJsonField(personalData.history, dto.hireDate
        ? [{
            type: "admission",
            title: dto.title || "",
            date: String(dto.hireDate).slice(0, 4),
            dept: dto.departmentName || "",
            note: "Admissão na LioTécnica.",
          }]
        : []),
      projects: parseJsonField(personalData.projects, []),
      recognitions: parseJsonField(personalData.recognitions, []),
      interactions: parseJsonField(personalData.interactions, []),
      documents: parseJsonField(personalData.documents, []),
      communications: parseJsonField(personalData.communications, []),
      groups: parseJsonField(personalData.groups, []),
      mentor: personalData.mentor || null,
      buddy: personalData.buddy || null,
      stats: {
        tenureYears: stats.tenureYears || 0,
        directReports: stats.directReports || 0,
        groups: stats.groups || (parseJsonField(personalData.groups, []).length || 0),
        recognitions: stats.recognitions || 0,
        projectsCount: stats.projectsCount || 0,
      },
    };
  }

  function mapApiSummaryToLegacy(summary) {
    return {
      id: summary.slug,
      name: summary.name,
      title: summary.title || "",
      dept: summary.departmentName || "",
      img: summary.photoUrl || "/avatar-maria-silva.png",
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
        return global.LioApi.get("/people?limit=100").then(function (peopleList) {
          var allPeople = normalizePeopleList(peopleList).map(mapApiSummaryToLegacy);
          return {
            person: mapApiProfileToLegacy(dto),
            allPeople: allPeople.length ? allPeople : [mapApiProfileToLegacy(dto)]
          };
        });
      });
  }

  function loadFromJson(profileId) {
    return fetch("/data/pessoas-perfis.json")
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        var person = (data.people || []).find(function (p) {
          return p.id === profileId || String(p.orgChartId) === profileId;
        });
        if (!person) {
          throw new Error("Profile not found in JSON");
        }
        return { person: person, allPeople: data.people || [] };
      });
  }

  var activeLoadId = 0;

  function init() {
    var loadId = ++activeLoadId;
    setupVCardModal();
    var profileId = getProfileId();
    if (!profileId) {
      showError();
      return Promise.resolve();
    }

    showLoading();

    return loadFromApi(profileId)
      .catch(function () {
        return loadFromJson(profileId);
      })
      .then(function (result) {
        if (loadId !== activeLoadId) return;
        renderProfile(result.person, result.allPeople);
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
