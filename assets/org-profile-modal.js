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

  function buildProfileExtras(name, dept) {
    const seed = name.split("").reduce(function (sum, char) {
      return sum + char.charCodeAt(0);
    }, 0);
    const months = ["jan", "mar", "mai", "jul", "set", "nov"];
    return {
      email: slugifyEmailLocal(name) + "@liotecnica.com.br",
      phone: "(19) 3" + String(1000 + (seed % 9000)).padStart(4, "0"),
      location: dept === "Executiva" ? "Campinas, SP · Matriz" : "Campinas, SP · " + dept,
      admission: months[seed % months.length] + " de " + (2018 + (seed % 7))
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

  function open(person, nodeIndex, onMessage) {
    ensureModal();
    const modal = document.getElementById("org-profile-modal");
    if (!modal || !person) return;

    const colors = getDeptColors(person.dept);
    const profile = Object.assign({}, buildProfileExtras(person.name, person.dept), person.profile || {});
    const slug = person.slug || slugifyName(person.name);

    modal.style.setProperty("--org-profile-accent", colors.stroke);
    modal.style.setProperty("--org-profile-badge-bg", colors.badge);
    modal.style.setProperty("--org-profile-badge-text", colors.text);

    document.getElementById("org-profile-avatar").src = person.img;
    document.getElementById("org-profile-avatar").alt = "Foto de " + person.name;
    document.getElementById("org-profile-name").textContent = person.name;
    document.getElementById("org-profile-role").textContent = person.title;
    document.getElementById("org-profile-dept").textContent = person.dept;
    document.getElementById("org-profile-email").innerHTML =
      '<a href="mailto:' + profile.email + '">' + profile.email + "</a>";
    document.getElementById("org-profile-phone").textContent = profile.phone;
    document.getElementById("org-profile-location").textContent = profile.location;
    document.getElementById("org-profile-manager").textContent = getManagerLabel(person, nodeIndex || {});
    document.getElementById("org-profile-admission").textContent = profile.admission;
    document.getElementById("org-profile-email-link").href = "mailto:" + profile.email;
    document.getElementById("org-profile-full-link").href =
      "/pessoas/perfil?id=" + encodeURIComponent(slug);

    document.getElementById("org-profile-message-btn").onclick = function () {
      if (typeof onMessage === "function") {
        onMessage(person);
      }
      close();
    };

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
    buildProfileExtras: buildProfileExtras
  };
})(window);
