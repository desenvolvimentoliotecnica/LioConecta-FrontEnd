(function (global) {
  var ANIMALS = [
    { id: "cat", label: "Gato" },
    { id: "dog", label: "Cachorro" },
    { id: "rabbit", label: "Coelho" },
    { id: "bear", label: "Urso" },
    { id: "fox", label: "Raposa" },
    { id: "owl", label: "Coruja" },
    { id: "penguin", label: "Pinguim" },
    { id: "frog", label: "Sapo" },
    { id: "turtle", label: "Tartaruga" },
    { id: "elephant", label: "Elefante" },
    { id: "lion", label: "Leão" },
    { id: "monkey", label: "Macaco" },
    { id: "panda", label: "Panda" },
    { id: "koala", label: "Coala" },
    { id: "hedgehog", label: "Ouriço" },
    { id: "duck", label: "Pato" },
    { id: "chick", label: "Pintinho" },
    { id: "bee", label: "Abelha" },
    { id: "butterfly", label: "Borboleta" },
    { id: "fish", label: "Peixe" },
    { id: "whale", label: "Baleia" },
    { id: "dolphin", label: "Golfinho" },
    { id: "snail", label: "Caracol" },
    { id: "crab", label: "Caranguejo" },
    { id: "octopus", label: "Polvo" },
    { id: "giraffe", label: "Girafa" },
    { id: "zebra", label: "Zebra" },
    { id: "pig", label: "Porco" },
    { id: "cow", label: "Vaca" },
    { id: "sheep", label: "Ovelha" },
    { id: "deer", label: "Veado" },
    { id: "raccoon", label: "Guaxinim" }
  ];

  var BASE = "/assets/avatars/animals/avatar-";
  var modalEl = null;
  var currentOptions = null;
  var selectedUrl = null;
  var initialized = false;

  function avatarUrl(animalId) {
    return BASE + animalId + ".png";
  }

  function escapeAttr(value) {
    return String(value || "").replace(/"/g, "&quot;");
  }

  function ensureModal() {
    if (modalEl) return modalEl;

    modalEl = document.createElement("div");
    modalEl.id = "avatar-picker-modal";
    modalEl.className = "avatar-picker";
    modalEl.hidden = true;
    modalEl.setAttribute("role", "dialog");
    modalEl.setAttribute("aria-modal", "true");
    modalEl.setAttribute("aria-labelledby", "avatar-picker-title");
    modalEl.innerHTML =
      '<div class="avatar-picker__backdrop" data-close-avatar-picker></div>' +
      '<div class="avatar-picker__dialog">' +
      '<header class="avatar-picker__header">' +
      '<div><h2 class="avatar-picker__title" id="avatar-picker-title">Escolher avatar</h2>' +
      '<p class="avatar-picker__subtitle" id="avatar-picker-subtitle"></p></div>' +
      '<button type="button" class="avatar-picker__close" data-close-avatar-picker aria-label="Fechar">&times;</button>' +
      "</header>" +
      '<div class="avatar-picker__body">' +
      '<p class="avatar-picker__hint">Selecione um avatar do portal. Se você escolher um, ele prevalece sobre a foto do Microsoft Graph.</p>' +
      '<div class="avatar-picker__grid" id="avatar-picker-grid"></div>' +
      "</div>" +
      '<footer class="avatar-picker__footer">' +
      '<p class="avatar-picker__error" id="avatar-picker-error" hidden></p>' +
      '<button type="button" class="avatar-picker__btn avatar-picker__btn--ghost" id="avatar-picker-use-graph" hidden>Usar foto do Graph</button>' +
      '<button type="button" class="avatar-picker__btn" data-close-avatar-picker>Cancelar</button>' +
      '<button type="button" class="avatar-picker__btn avatar-picker__btn--primary" id="avatar-picker-save">Salvar avatar</button>' +
      "</footer></div>";

    document.body.appendChild(modalEl);
    return modalEl;
  }

  function setError(message) {
    var el = document.getElementById("avatar-picker-error");
    if (!el) return;
    if (message) {
      el.textContent = message;
      el.hidden = false;
    } else {
      el.textContent = "";
      el.hidden = true;
    }
  }

  function markSelected(url) {
    selectedUrl = url || null;
    var grid = document.getElementById("avatar-picker-grid");
    if (!grid) return;
    grid.querySelectorAll(".avatar-picker__option").forEach(function (btn) {
      var optionUrl = btn.getAttribute("data-avatar-url");
      btn.classList.toggle("is-selected", !!url && optionUrl === url);
    });
  }

  function renderGrid(currentUrl) {
    var grid = document.getElementById("avatar-picker-grid");
    if (!grid) return;

    grid.innerHTML = ANIMALS.map(function (animal) {
      var url = avatarUrl(animal.id);
      var selected = currentUrl === url ? " is-selected" : "";
      return (
        '<button type="button" class="avatar-picker__option' + selected + '" data-avatar-url="' + escapeAttr(url) + '" aria-label="' + escapeAttr(animal.label) + '">' +
        '<img class="avatar-picker__thumb" src="' + escapeAttr(url) + '" alt="" loading="lazy" />' +
        '<span class="avatar-picker__label">' + escapeAttr(animal.label) + "</span></button>"
      );
    }).join("");

    selectedUrl = currentUrl && global.PersonAvatar && global.PersonAvatar.isPortalAvatarUrl(currentUrl) ? currentUrl : null;
  }

  function buildSaveEndpoint(options) {
    if (options.saveEndpoint) return options.saveEndpoint;
    if (options.mode === "me" || options.isSelf) return "/me/profile/avatar";
    if (options.personId) return "/people/" + encodeURIComponent(options.personId) + "/profile/avatar";
    if (options.slug) return "/people/" + encodeURIComponent(options.slug) + "/profile/avatar";
    return "/me/profile/avatar";
  }

  function saveAvatar(url) {
    if (!currentOptions) return Promise.resolve(null);

    var endpoint = buildSaveEndpoint(currentOptions);
    var payload = { photoUrl: url };

    if (!global.LioApi) {
      return Promise.reject(new Error("API indisponível"));
    }

    return global.LioApi.patch(endpoint, payload);
  }

  function close() {
    if (!modalEl) return;
    modalEl.hidden = true;
    document.body.style.overflow = "";
    setError("");
    currentOptions = null;
    selectedUrl = null;
  }

  function open(options) {
    options = options || {};
    ensureModal();
    init();

    currentOptions = options;
    var currentUrl =
      options.currentUrl ||
      (global.PersonAvatar && global.PersonAvatar.resolvePhotoUrl(options.photoUrl)) ||
      options.photoUrl ||
      "";

    if (global.PersonAvatar && global.PersonAvatar.isPortalAvatarUrl(currentUrl)) {
      selectedUrl = currentUrl;
    } else {
      selectedUrl = null;
    }

    var subtitle = document.getElementById("avatar-picker-subtitle");
    if (subtitle) {
      subtitle.textContent = options.personName ? "Para " + options.personName : "";
    }

    renderGrid(selectedUrl);

    var useGraphBtn = document.getElementById("avatar-picker-use-graph");
    var graphUrl =
      options.graphPhotoUrl ||
      (global.PersonAvatar && global.PersonAvatar.resolveGraphPhotoUrl(options.photoUrl));

    if (useGraphBtn) {
      useGraphBtn.hidden = !graphUrl;
    }

    setError("");
    modalEl.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function init() {
    if (initialized) return;
    initialized = true;
    ensureModal();

    modalEl.addEventListener("click", function (event) {
      if (event.target.closest("[data-close-avatar-picker]")) {
        close();
        return;
      }

      var option = event.target.closest(".avatar-picker__option");
      if (option) {
        markSelected(option.getAttribute("data-avatar-url"));
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && modalEl && !modalEl.hidden) close();
    });

    var saveBtn = document.getElementById("avatar-picker-save");
    if (saveBtn) {
      saveBtn.addEventListener("click", function () {
        if (!selectedUrl) {
          setError("Selecione um avatar antes de salvar.");
          return;
        }

        setError("");
        saveBtn.disabled = true;
        saveBtn.textContent = "Salvando…";

        saveAvatar(selectedUrl)
          .then(function (result) {
            var savedUrl =
              (result && (result.photoUrl || result.PhotoUrl)) || selectedUrl;
            if (typeof currentOptions.onSaved === "function") {
              currentOptions.onSaved(savedUrl, result);
            }
            close();
          })
          .catch(function (error) {
            var message = "Não foi possível salvar o avatar.";
            if (error && error.body && error.body.message) message = error.body.message;
            setError(message);
          })
          .finally(function () {
            saveBtn.disabled = false;
            saveBtn.textContent = "Salvar avatar";
          });
      });
    }

    var useGraphBtn = document.getElementById("avatar-picker-use-graph");
    if (useGraphBtn) {
      useGraphBtn.addEventListener("click", function () {
        setError("");
        useGraphBtn.disabled = true;

        saveAvatar(null)
          .then(function (result) {
            var graphUrl =
              currentOptions.graphPhotoUrl ||
              (global.PersonAvatar && global.PersonAvatar.resolveGraphPhotoUrl(currentOptions.photoUrl));
            if (typeof currentOptions.onSaved === "function") {
              currentOptions.onSaved(graphUrl || null, result);
            }
            close();
          })
          .catch(function () {
            setError("Não foi possível restaurar a foto do Graph.");
          })
          .finally(function () {
            useGraphBtn.disabled = false;
          });
      });
    }
  }

  global.AvatarPicker = {
    init: init,
    open: open,
    close: close,
    avatarUrl: avatarUrl,
    animals: ANIMALS
  };
})(window);
