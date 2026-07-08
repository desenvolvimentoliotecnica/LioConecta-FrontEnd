(function (global) {
  const deptColors = {
    Executiva: { stroke: "#a78bfa", badge: "#ede9fe", text: "#6d28d9" },
    Produto: { stroke: "#93c5fd", badge: "#dbeafe", text: "#1d4ed8" },
    "Recursos Humanos": { stroke: "#f9a8d4", badge: "#fce7f3", text: "#be185d" },
    Marketing: { stroke: "#86efac", badge: "#dcfce7", text: "#15803d" },
    TI: { stroke: "#67e8f9", badge: "#cffafe", text: "#0e7490" },
    Comercial: { stroke: "#fdba74", badge: "#ffedd5", text: "#c2410c" },
    Financeiro: { stroke: "#fcd34d", badge: "#fef3c7", text: "#b45309" }
  };

  const monthLabels = [
    "jan", "fev", "mar", "abr", "mai", "jun",
    "jul", "ago", "set", "out", "nov", "dez"
  ];

  let returnFocus = null;
  let initialized = false;

  const MODAL_HTML =
    '<div class="org-profile-modal" id="org-profile-modal" hidden>' +
    '<div class="org-profile-modal__backdrop" data-close-profile></div>' +
    '<div class="org-profile-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="org-profile-name">' +
    '<button class="org-profile-modal__close" type="button" data-close-profile aria-label="Fechar perfil">&times;</button>' +
    '<header class="org-profile-modal__header">' +
    '<img class="org-profile-modal__avatar" id="org-profile-avatar" src="" alt="" />' +
    '<h2 class="org-profile-modal__name" id="org-profile-name"></h2>' +
    '<p class="org-profile-modal__role" id="org-profile-role"></p>' +
    '<span class="org-profile-modal__dept" id="org-profile-dept"></span>' +
    "</header>" +
    '<div class="org-profile-modal__body">' +
    '<div class="org-profile-modal__field"><span class="org-profile-modal__label">E-mail corporativo</span><span class="org-profile-modal__value" id="org-profile-email"></span></div>' +
    '<div class="org-profile-modal__field"><span class="org-profile-modal__label">Telefone / Ramal</span><span class="org-profile-modal__value" id="org-profile-phone"></span></div>' +
    '<div class="org-profile-modal__field"><span class="org-profile-modal__label">Localização</span><span class="org-profile-modal__value" id="org-profile-location"></span></div>' +
    '<div class="org-profile-modal__field"><span class="org-profile-modal__label">Reporta-se a</span><span class="org-profile-modal__value" id="org-profile-manager"></span></div>' +
    '<div class="org-profile-modal__field"><span class="org-profile-modal__label">Admissão</span><span class="org-profile-modal__value" id="org-profile-admission"></span></div>' +
    "</div>" +
    '<footer class="org-profile-modal__footer">' +
    '<a class="org-profile-modal__action" id="org-profile-email-link" href="#"><i class="fa-regular fa-envelope" aria-hidden="true"></i> E-mail</a>' +
    '<button class="org-profile-modal__action" type="button" id="org-profile-message-btn"><i class="fa-regular fa-comment" aria-hidden="true"></i> Mensagem</button>' +
    '<a class="org-profile-modal__action org-profile-modal__action--primary" id="org-profile-full-link" href="pessoas-perfil.html"><i class="fa-regular fa-user" aria-hidden="true"></i> Ver perfil completo</a>' +
    "</footer></div></div>";

  function slugifyName(name) {
    return name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function slugifyEmailLocal(name) {
    return slugifyName(name).replace(/-/g, ".");
  }

  function formatHireDate(value) {
    if (!value) return "—";
    var parts = String(value).slice(0, 10).split("-");
    if (parts.length !== 3) return String(value);
    var month = Number(parts[1]);
    if (!month || month < 1 || month > 12) return String(value);
    return parts[2].padStart(2, "0") + " " + monthLabels[month - 1] + " de " + parts[0];
  }

  function pickField(source, keys) {
    if (!source) return "";
    for (var i = 0; i < keys.length; i += 1) {
      var value = source[keys[i]];
      if (value !== undefined && value !== null && String(value).trim() !== "") {
        return String(value).trim();
      }
    }
    return "";
  }

  function buildProfileFromApiNode(node, managerNode) {
    var email = pickField(node, ["email", "Email"]);
    var phone = pickField(node, ["phone", "Phone"]);
    var location = pickField(node, ["location", "Location"]);
    var hireDate = pickField(node, ["hireDate", "HireDate"]);
    var teamsUpn = pickField(node, ["teamsUpn", "TeamsUpn"]) || email;
    var managerLabel = "—";
    if (managerNode) {
      var managerName = pickField(managerNode, ["name", "Name"]);
      var managerTitle = pickField(managerNode, ["title", "Title"]) || "Colaborador";
      if (managerName) managerLabel = managerName + " · " + managerTitle;
    }
    return {
      email: email,
      phone: phone || "—",
      location: location || "—",
      admission: hireDate ? formatHireDate(hireDate) : "—",
      managerLabel: managerLabel,
      teamsUpn: teamsUpn
    };
  }

  /** @deprecated Usado apenas por dados estáticos legados do organograma demo. */
  function buildProfileExtras(name, dept) {
    return {
      email: slugifyEmailLocal(name) + "@liotecnica.com.br",
      phone: "—",
      location: dept === "Executiva" ? "Campinas, SP · Matriz" : "Campinas, SP · " + dept,
      admission: "—"
    };
  }

  function resolveProfile(person) {
    var provided = person.profile || {};
    var email = pickField(provided, ["email"]) || pickField(person, ["email", "Email"]);
    var phone = pickField(provided, ["phone"]) || pickField(person, ["phone", "Phone"]);
    var location = pickField(provided, ["location"]) || pickField(person, ["location", "Location"]);
    var hireDate =
      pickField(provided, ["hireDate"]) ||
      pickField(person, ["hireDate", "HireDate"]);
    var admission = pickField(provided, ["admission"]);
    if (!admission && hireDate) admission = formatHireDate(hireDate);
    if (!email && person.name && person.dept) {
      email = buildProfileExtras(person.name, person.dept).email;
    }
    return {
      email: email || "—",
      phone: phone || "—",
      location: location || "—",
      admission: admission || "—",
      managerLabel: provided.managerLabel,
      teamsUpn: pickField(provided, ["teamsUpn"]) || pickField(person, ["teamsUpn", "TeamsUpn"]) || email
    };
  }

  function getDeptColors(dept) {
    return deptColors[dept] || deptColors.Executiva;
  }

  function getManagerLabel(person, nodeIndex) {
    const profile = person.profile || {};
    if (profile.managerLabel) return profile.managerLabel;
    if (!person.pid) return "—";
    const manager = nodeIndex[person.pid] || nodeIndex[String(person.pid)] || nodeIndex[Number(person.pid)];
    return manager ? manager.name + " · " + manager.title : "—";
  }

  function ensureModal() {
    if (!document.getElementById("org-profile-modal")) {
      document.body.insertAdjacentHTML("beforeend", MODAL_HTML);
    }
  }

  function close() {
    const modal = document.getElementById("org-profile-modal");
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
    if (returnFocus && returnFocus.focus) {
      returnFocus.focus();
      returnFocus = null;
    }
  }

  function renderProfileFields(person, profile, nodeIndex) {
    var emailEl = document.getElementById("org-profile-email");
    var phoneEl = document.getElementById("org-profile-phone");
    var locationEl = document.getElementById("org-profile-location");
    var managerEl = document.getElementById("org-profile-manager");
    var admissionEl = document.getElementById("org-profile-admission");
    var emailLink = document.getElementById("org-profile-email-link");

    if (profile.email && profile.email !== "—") {
      emailEl.innerHTML = '<a href="mailto:' + profile.email + '">' + profile.email + "</a>";
      emailLink.href = "mailto:" + profile.email;
      emailLink.removeAttribute("aria-disabled");
    } else {
      emailEl.textContent = "—";
      emailLink.href = "#";
      emailLink.setAttribute("aria-disabled", "true");
    }

    phoneEl.textContent = profile.phone || "—";
    locationEl.textContent = profile.location || "—";
    managerEl.textContent = profile.managerLabel || getManagerLabel(person, nodeIndex || {});
    admissionEl.textContent = profile.admission || "—";
  }

  function maybeFetchProfileDetails(slug, person, profile, nodeIndex) {
    if (!slug || !global.LioApi || global.LioApi.useMock) return;
    if (profile.admission && profile.admission !== "—") return;

    global.LioApi.get("/people/" + encodeURIComponent(slug) + "/profile")
      .then(function (data) {
        if (!data) return;
        var hireDate = data.hireDate || data.HireDate;
        if (hireDate) {
          profile.admission = formatHireDate(hireDate);
        }
        if ((!profile.phone || profile.phone === "—") && (data.phone || data.Phone)) {
          profile.phone = data.phone || data.Phone;
        }
        if ((!profile.location || profile.location === "—") && (data.location || data.Location)) {
          profile.location = data.location || data.Location;
        }
        renderProfileFields(person, profile, nodeIndex);
      })
      .catch(function () {});
  }

  function insertModalAvatarPlaceholder(header, beforeEl) {
    if (!header || header.querySelector(".org-profile-modal__avatar--placeholder")) return;
    var placeholder = document.createElement("span");
    placeholder.className = "org-profile-modal__avatar org-profile-modal__avatar--placeholder";
    placeholder.setAttribute("aria-hidden", "true");
    placeholder.innerHTML = '<i class="fa-solid fa-user"></i>';
    header.insertBefore(placeholder, beforeEl || header.firstChild);
  }

  function applyModalAvatar(person) {
    var avatarEl = document.getElementById("org-profile-avatar");
    var header = avatarEl && avatarEl.parentElement;
    if (!avatarEl || !header) return;

    header.querySelectorAll(".org-profile-modal__avatar--placeholder").forEach(function (el) {
      el.remove();
    });

    var src = global.PersonAvatar
      ? global.PersonAvatar.resolvePhotoUrl(person.img)
      : null;

    if (src) {
      avatarEl.hidden = false;
      avatarEl.src = src;
      avatarEl.alt = "Foto de " + person.name;
      avatarEl.onerror = function () {
        avatarEl.hidden = true;
        avatarEl.removeAttribute("src");
        insertModalAvatarPlaceholder(header, avatarEl);
      };
      return;
    }

    avatarEl.hidden = true;
    avatarEl.removeAttribute("src");
    insertModalAvatarPlaceholder(header, avatarEl);
  }

  function open(person, nodeIndex, onMessage) {
    ensureModal();
    const modal = document.getElementById("org-profile-modal");
    if (!modal || !person) return;

    const colors = getDeptColors(person.dept);
    const profile = resolveProfile(person);
    const slug = person.slug || slugifyName(person.name);

    modal.style.setProperty("--org-profile-accent", colors.stroke);
    modal.style.setProperty("--org-profile-badge-bg", colors.badge);
    modal.style.setProperty("--org-profile-badge-text", colors.text);

    applyModalAvatar(person);
    document.getElementById("org-profile-name").textContent = person.name;
    document.getElementById("org-profile-role").textContent = person.title;
    document.getElementById("org-profile-dept").textContent = person.dept;

    renderProfileFields(person, profile, nodeIndex || {});

    document.getElementById("org-profile-full-link").href =
      "/pessoas/perfil?id=" + encodeURIComponent(slug);

    document.getElementById("org-profile-message-btn").onclick = function () {
      if (typeof onMessage === "function") {
        onMessage(Object.assign({}, person, { profile: profile }));
      }
      close();
    };

    maybeFetchProfileDetails(slug, person, profile, nodeIndex);

    returnFocus = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = "hidden";

    const closeBtn = modal.querySelector(".org-profile-modal__close");
    if (closeBtn) closeBtn.focus();
  }

  function init() {
    if (initialized) return;
    initialized = true;
    ensureModal();
    const modal = document.getElementById("org-profile-modal");
    if (!modal) return;

    modal.querySelectorAll("[data-close-profile]").forEach(function (el) {
      el.addEventListener("click", close);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && modal && !modal.hidden) {
        close();
      }
    });
  }

  global.OrgProfileModal = {
    init: init,
    open: open,
    close: close,
    slugifyName: slugifyName,
    slugifyEmailLocal: slugifyEmailLocal,
    formatHireDate: formatHireDate,
    buildProfileFromApiNode: buildProfileFromApiNode,
    buildProfileExtras: buildProfileExtras
  };
})(window);
