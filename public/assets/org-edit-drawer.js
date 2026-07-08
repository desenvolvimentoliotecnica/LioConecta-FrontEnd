(function (global) {

  const EMPTY_GUID = "00000000-0000-0000-0000-000000000000";

  let initialized = false;

  let departments = [];

  let positionsByPersonId = {};

  let searchTimer = null;

  let onSavedCallback = null;

  let currentContext = null;

  const deptColors = {
    Executiva: { stroke: "#a78bfa" },
    Diretoria: { stroke: "#a78bfa" },
    Administrativo: { stroke: "#94a3b8" },
    Produto: { stroke: "#93c5fd" },
    "Recursos Humanos": { stroke: "#f9a8d4" },
    Marketing: { stroke: "#86efac" },
    TI: { stroke: "#67e8f9" },
    Comercial: { stroke: "#fdba74" },
    Financeiro: { stroke: "#fcd34d" }
  };

  const deptPaletteAliases = {
    diretoria: "Diretoria",
    administrativo: "Administrativo",
    financeiro: "Financeiro",
    comercial: "Comercial",
    marketing: "Marketing",
    produto: "Produto",
    ti: "TI",
    tecnologia: "TI",
    rh: "Recursos Humanos",
    "recursos humanos": "Recursos Humanos",
    executiva: "Executiva"
  };

  function resolveDeptPaletteKey(dept) {
    const base = String(dept || "")
      .split(" · ")[0]
      .trim();
    if (!base) return "Executiva";
    if (deptColors[base]) return base;

    const normalized = base.toLowerCase();
    if (deptPaletteAliases[normalized]) return deptPaletteAliases[normalized];

    for (const key of Object.keys(deptColors)) {
      if (normalized.indexOf(key.toLowerCase()) >= 0) return key;
    }
    for (const alias of Object.keys(deptPaletteAliases)) {
      if (normalized.indexOf(alias) >= 0) return deptPaletteAliases[alias];
    }
    return "Executiva";
  }

  function resolveDeptStrokeColor(context) {
    const dept = pickField(context, [
      "dept",
      "departmentName",
      "DepartmentName",
      "graphDepartmentName",
      "GraphDepartmentName"
    ]);
    const palette = deptColors[resolveDeptPaletteKey(dept)] || deptColors.Executiva;
    return palette.stroke;
  }

  function pickField(source, keys) {

    if (!source) return "";

    for (let i = 0; i < keys.length; i += 1) {

      const value = source[keys[i]];

      if (value !== undefined && value !== null && String(value).trim() !== "") {

        return String(value).trim();

      }

    }

    return "";

  }



  function normalizeName(value) {

    return String(value || "")

      .trim()

      .toLowerCase();

  }



  function isEmptyGuid(value) {

    return !value || String(value).toLowerCase() === EMPTY_GUID;

  }



  function getPolicy() {

    const ctx = global.__lioOrgBootContext || {};

    return ctx.policy || {};

  }



  function getDrawer() {

    return document.getElementById("org-edit-drawer");

  }



  function ensureDrawerPortal() {

    const drawer = getDrawer();

    if (!drawer || drawer.__lioPortalAttached) return;

    document.body.appendChild(drawer);

    drawer.__lioPortalAttached = true;

  }



  function setAlert(message, type) {

    const alert = document.getElementById("org-edit-alert");

    if (!alert) return;

    if (!message) {

      alert.hidden = true;

      alert.textContent = "";

      alert.className = "org-edit-drawer__alert";

      return;

    }

    alert.hidden = false;

    alert.textContent = message;

    alert.className = "org-edit-drawer__alert org-edit-drawer__alert--" + (type || "error");

  }



  function setSaving(isSaving) {

    const saveBtn = document.getElementById("org-edit-save-btn");

    const deleteBtn = document.getElementById("org-edit-delete-btn");

    if (saveBtn) {

      saveBtn.disabled = isSaving;

      saveBtn.textContent = isSaving ? "Salvando…" : "Salvar";

    }

    if (deleteBtn) deleteBtn.disabled = isSaving;

  }



  function resolveDepartmentId(context) {

    const direct = pickField(context, ["orgDepartmentId", "OrgDepartmentId"]);

    if (direct) return direct;



    const deptName = pickField(context, [

      "departmentName",

      "DepartmentName",

      "graphDepartmentName",

      "GraphDepartmentName",

      "dept"

    ]);

    if (!deptName) return "";



    const baseName = deptName.split(" · ")[0].trim();

    const match = departments.find(function (dept) {

      const name = dept.name || dept.Name || "";

      return normalizeName(name) === normalizeName(baseName);

    });

    return match ? String(match.id || match.Id) : "";

  }



  function resolveManager(context) {

    let positionId = pickField(context, ["managerPositionId", "ManagerPositionId"]);

    let name = pickField(context, ["managerName", "ManagerName"]);



    if (!positionId) {

      const managerPersonId = pickField(context, [

        "managerPersonId",

        "ManagerPersonId",

        "managerId",

        "ManagerId"

      ]);

      if (managerPersonId) {

        positionId = positionsByPersonId[String(managerPersonId).toLowerCase()] || "";

      }

    }



    if (!name) {

      name = pickField(context, ["graphManagerName", "GraphManagerName"]);

    }



    return { positionId: positionId || "", name: name || "" };

  }



  function populateDepartmentsSelect(selectedId) {

    const select = document.getElementById("org-edit-department");

    if (!select) return;

    const options = ['<option value="">Selecione…</option>'];

    departments

      .filter(function (dept) {

        return dept.isActive !== false && dept.IsActive !== false;

      })

      .sort(function (a, b) {

        const orderA = a.sortOrder !== undefined ? a.sortOrder : a.SortOrder || 0;

        const orderB = b.sortOrder !== undefined ? b.sortOrder : b.SortOrder || 0;

        if (orderA !== orderB) return orderA - orderB;

        const nameA = a.name || a.Name || "";

        const nameB = b.name || b.Name || "";

        return nameA.localeCompare(nameB, "pt-BR");

      })

      .forEach(function (dept) {

        const id = dept.id || dept.Id;

        const name = dept.name || dept.Name || "";

        const selected = selectedId && String(selectedId) === String(id) ? " selected" : "";

        options.push('<option value="' + id + '"' + selected + ">" + name + "</option>");

      });

    select.innerHTML = options.join("");

  }



  function rebuildPositionsIndex(list) {

    positionsByPersonId = {};

    (list || []).forEach(function (position) {

      const personId = position.personId || position.PersonId;

      const positionId = position.id || position.Id;

      if (personId && positionId) {

        positionsByPersonId[String(personId).toLowerCase()] = positionId;

      }

    });

  }



  function loadReferenceData() {

    if (!global.LioApi || global.LioApi.useMock) {

      return Promise.resolve();

    }

    return Promise.all([

      global.LioApi.get("/org-chart/departments"),

      global.LioApi.get("/org-chart/positions")

    ])

      .then(function (results) {

        departments = Array.isArray(results[0]) ? results[0] : [];

        rebuildPositionsIndex(Array.isArray(results[1]) ? results[1] : []);

      })

      .catch(function () {

        departments = [];

        positionsByPersonId = {};

      });

  }



  function hideManagerResults() {

    const results = document.getElementById("org-edit-manager-results");

    if (results) {

      results.hidden = true;

      results.innerHTML = "";

    }

  }



  function setManagerSelection(managerPositionId, managerName) {

    const hidden = document.getElementById("org-edit-manager-position-id");

    const pill = document.getElementById("org-edit-manager-pill");

    const label = document.getElementById("org-edit-manager-pill-label");

    const input = document.getElementById("org-edit-manager-search");

    if (hidden) hidden.value = managerPositionId || "";

    if (pill) pill.hidden = !managerPositionId;

    if (label) label.textContent = managerName || "";

    if (input) input.value = "";

    hideManagerResults();

  }



  function canEditAvatarInDrawer(context) {
    const policy = getPolicy();
    if (!(policy.canEdit === true || policy.CanEdit === true)) return false;
    if (!context) return false;
    return !!pickField(context, ["personId", "PersonId", "slug", "Slug"]);
  }

  function openAvatarPicker(context) {
    if (!global.AvatarPicker || typeof global.AvatarPicker.open !== "function") return;

    const photoUrl = pickField(context, ["photoUrl", "PhotoUrl", "img"]);
    const graphPhotoUrl =
      pickField(context, ["graphPhotoUrl", "GraphPhotoUrl"]) ||
      (global.PersonAvatar && global.PersonAvatar.resolveGraphPhotoUrl(photoUrl));

    global.AvatarPicker.open({
      personName: pickField(context, ["displayName", "personName", "name"]),
      personId: pickField(context, ["personId", "PersonId"]),
      slug: pickField(context, ["slug", "Slug"]),
      photoUrl: photoUrl,
      graphPhotoUrl: graphPhotoUrl,
      currentUrl:
        global.PersonAvatar && global.PersonAvatar.resolvePhotoUrlFromSource
          ? global.PersonAvatar.resolvePhotoUrlFromSource({
              photoUrl: photoUrl,
              graphPhotoUrl: graphPhotoUrl,
              portalPhotoUrl: pickField(context, ["portalPhotoUrl", "PortalPhotoUrl"])
            })
          : photoUrl,
      onSaved: function (savedUrl, result) {
        if (currentContext) {
          var portalUrl =
            savedUrl &&
            global.PersonAvatar &&
            global.PersonAvatar.isPortalAvatarUrl(savedUrl)
              ? savedUrl
              : null;
          if (result) {
            currentContext.photoUrl =
              result.photoUrl || result.PhotoUrl || savedUrl || graphPhotoUrl || "";
            currentContext.portalPhotoUrl =
              result.portalPhotoUrl || result.PortalPhotoUrl || portalUrl;
            currentContext.graphPhotoUrl =
              result.graphPhotoUrl || result.GraphPhotoUrl || graphPhotoUrl || null;
          } else {
            currentContext.photoUrl = savedUrl || graphPhotoUrl || "";
            if (portalUrl) currentContext.portalPhotoUrl = portalUrl;
          }
          renderAvatar(currentContext);
        }
        setAlert("Avatar atualizado.", "success");
        if (typeof onSavedCallback === "function") {
          onSavedCallback();
        } else if (typeof global.reloadOrganogram === "function") {
          global.reloadOrganogram();
        }
      }
    });
  }

  function renderAvatar(context) {

    const wrap = document.getElementById("org-edit-avatar-wrap");

    if (!wrap) return;

    const stroke = resolveDeptStrokeColor(context);

    wrap.style.setProperty("--org-avatar-stroke", stroke);

    const photoUrl = pickField(context, ["photoUrl", "PhotoUrl", "img"]);

    const resolved =
      global.PersonAvatar && typeof PersonAvatar.resolvePhotoUrlFromSource === "function"
        ? PersonAvatar.resolvePhotoUrlFromSource({
            photoUrl: photoUrl,
            graphPhotoUrl: pickField(context, ["graphPhotoUrl", "GraphPhotoUrl"]),
            portalPhotoUrl: pickField(context, ["portalPhotoUrl", "PortalPhotoUrl"])
          })
        : global.PersonAvatar && typeof PersonAvatar.resolvePhotoUrl === "function"
          ? PersonAvatar.resolvePhotoUrl(photoUrl)
          : photoUrl;

    let inner = "";

    if (global.PersonAvatar && typeof PersonAvatar.renderAvatarMarkup === "function") {

      inner = PersonAvatar.renderAvatarMarkup(resolved || photoUrl, {

        className: "org-edit-drawer__avatar"

      });

    } else if (resolved || photoUrl) {

      inner =

        '<img class="org-edit-drawer__avatar" src="' +

        String(resolved || photoUrl).replace(/"/g, "&quot;") +

        '" alt="" />';

    } else {

      inner =

        '<span class="org-edit-drawer__avatar org-edit-drawer__avatar--placeholder" aria-hidden="true">' +

        '<i class="fa-solid fa-user"></i></span>';

    }

    var changeBtn = canEditAvatarInDrawer(context)
      ? '<button type="button" class="org-edit-drawer__avatar-change" id="org-edit-avatar-change">' +
        '<i class="fa-solid fa-pen" aria-hidden="true"></i> Alterar avatar</button>'
      : "";

    wrap.innerHTML = '<div class="org-edit-drawer__avatar-ring">' + inner + "</div>" + changeBtn;

    wrap.removeAttribute("aria-hidden");

    var changeButton = document.getElementById("org-edit-avatar-change");
    if (changeButton) {
      changeButton.onclick = function () {
        openAvatarPicker(context);
      };
    }

  }



  function searchManagers(query) {

    if (!global.LioApi || global.LioApi.useMock || !query || query.length < 2) {

      hideManagerResults();

      return;

    }

    global.LioApi.get("/people?q=" + encodeURIComponent(query))

      .then(function (raw) {

        const items = Array.isArray(raw) ? raw : raw && raw.items ? raw.items : [];

        const results = document.getElementById("org-edit-manager-results");

        if (!results) return;

        if (!items.length) {

          results.hidden = true;

          results.innerHTML = "";

          return;

        }

        results.innerHTML = items

          .slice(0, 8)

          .map(function (person) {

            const id = person.id || person.Id;

            const name = person.name || person.Name || "";

            const title = person.title || person.Title || "";

            return (

              '<button type="button" class="org-edit-drawer__search-item" data-person-id="' +

              id +

              '" data-person-name="' +

              name.replace(/"/g, "&quot;") +

              '">' +

              name +

              (title ? " · " + title : "") +

              "</button>"

            );

          })

          .join("");

        results.hidden = false;

      })

      .catch(function () {

        hideManagerResults();

      });

  }



  function fillReadonlySection(context) {

    const titleEl = document.getElementById("org-edit-graph-title");

    const deptEl = document.getElementById("org-edit-graph-department");

    const managerEl = document.getElementById("org-edit-graph-manager");

    if (titleEl) titleEl.textContent = context.graphTitle || "—";

    if (deptEl) deptEl.textContent = context.graphDepartmentName || "—";

    if (managerEl) managerEl.textContent = context.graphManagerName || "—";

  }



  function updateDisplayNameField() {

    const policy = getPolicy();

    const allowed = policy.allowedFields || policy.AllowedFields || [];

    const input = document.getElementById("org-edit-display-name");

    const fieldWrap = document.getElementById("org-edit-display-name-field");

    if (!input || !fieldWrap) return;



    const canEditName =

      policy.allowDisplayNameEdit === true ||

      allowed.indexOf("displayName") >= 0 ||

      allowed.indexOf("DisplayName") >= 0;



    input.readOnly = !canEditName;

    fieldWrap.classList.toggle("org-edit-drawer__field--readonly", !canEditName);

  }



  function bindStaticEvents() {

    const drawer = getDrawer();

    if (!drawer || drawer.__lioOrgEditBound) return;

    drawer.__lioOrgEditBound = true;



    drawer.querySelectorAll("[data-close-org-edit]").forEach(function (el) {

      el.addEventListener("click", close);

    });



    document.addEventListener("keydown", function (event) {

      if (event.key === "Escape" && drawer.classList.contains("is-open")) {

        close();

      }

    });



    const managerInput = document.getElementById("org-edit-manager-search");

    if (managerInput) {

      managerInput.addEventListener("input", function () {

        clearTimeout(searchTimer);

        const query = managerInput.value.trim();

        searchTimer = setTimeout(function () {

          searchManagers(query);

        }, 250);

      });

    }



    const managerResults = document.getElementById("org-edit-manager-results");

    if (managerResults) {

      managerResults.addEventListener("click", function (event) {

        const item = event.target.closest("[data-person-id]");

        if (!item) return;

        const personId = String(item.getAttribute("data-person-id") || "").toLowerCase();

        const personName = item.getAttribute("data-person-name") || "";

        const positionId = positionsByPersonId[personId];

        if (!positionId) {

          setAlert("Este colaborador ainda não possui posição no organograma governado.", "error");

          return;

        }

        if (currentContext && currentContext.positionId && String(positionId) === String(currentContext.positionId)) {

          setAlert("A posição não pode reportar a si mesma.", "error");

          return;

        }

        setManagerSelection(positionId, personName);

        setAlert(null);

      });

    }



    const clearManagerBtn = document.getElementById("org-edit-manager-clear");

    if (clearManagerBtn) {

      clearManagerBtn.addEventListener("click", function () {

        setManagerSelection("", "");

      });

    }



    const saveBtn = document.getElementById("org-edit-save-btn");

    if (saveBtn) {

      saveBtn.addEventListener("click", function () {

        void save();

      });

    }



    const deleteBtn = document.getElementById("org-edit-delete-btn");

    if (deleteBtn) {

      deleteBtn.addEventListener("click", function () {

        void removePosition();

      });

    }

  }



  function readForm() {

    const title = document.getElementById("org-edit-title");

    const department = document.getElementById("org-edit-department");

    const visible = document.getElementById("org-edit-visible");

    const displayName = document.getElementById("org-edit-display-name");

    const managerPositionId = document.getElementById("org-edit-manager-position-id");

    return {

      title: title ? title.value.trim() : "",

      orgDepartmentId: department && department.value ? department.value : null,

      isVisible: visible ? visible.checked : true,

      displayName: displayName ? displayName.value.trim() : "",

      managerPositionId:

        managerPositionId && managerPositionId.value ? managerPositionId.value : null

    };

  }



  function save() {

    if (!global.LioApi || global.LioApi.useMock || !currentContext) return Promise.resolve();

    const form = readForm();

    if (!form.title) {

      setAlert("Informe o cargo ou função.", "error");

      return Promise.resolve();

    }



    setSaving(true);

    setAlert(null);



    const body = {

      title: form.title,

      orgDepartmentId: form.orgDepartmentId,

      managerPositionId: form.managerPositionId,

      isVisible: form.isVisible

    };

    if (form.displayName) {

      body.displayName = form.displayName;

    }



    const request =

      currentContext.mode === "create"

        ? global.LioApi.post("/org-chart/positions", {

            personId: currentContext.personId,

            title: form.title,

            orgDepartmentId: form.orgDepartmentId,

            managerPositionId: form.managerPositionId,

            isVisible: form.isVisible

          })

        : global.LioApi.patch(

            "/org-chart/positions/" + encodeURIComponent(currentContext.positionId),

            body

          );



    return request

      .then(function () {

        setAlert("Posição salva com sucesso.", "success");

        if (typeof onSavedCallback === "function") {

          onSavedCallback();

        } else if (typeof global.reloadOrganogram === "function") {

          global.reloadOrganogram();

        }

        setTimeout(close, 500);

      })

      .catch(function () {

        setAlert("Não foi possível salvar a posição.", "error");

      })

      .finally(function () {

        setSaving(false);

      });

  }



  function removePosition() {

    if (!global.LioApi || global.LioApi.useMock || !currentContext || currentContext.mode === "create") {

      return Promise.resolve();

    }

    if (!window.confirm("Remover esta posição do organograma governado?")) return Promise.resolve();



    setSaving(true);

    setAlert(null);



    return global.LioApi.delete("/org-chart/positions/" + encodeURIComponent(currentContext.positionId))

      .then(function () {

        if (typeof onSavedCallback === "function") {

          onSavedCallback();

        } else if (typeof global.reloadOrganogram === "function") {

          global.reloadOrganogram();

        }

        close();

      })

      .catch(function () {

        setAlert("Não foi possível remover a posição.", "error");

      })

      .finally(function () {

        setSaving(false);

      });

  }



  function applyFormState(context) {

    const titleInput = document.getElementById("org-edit-title");

    const displayNameInput = document.getElementById("org-edit-display-name");

    const visibleInput = document.getElementById("org-edit-visible");



    if (titleInput) titleInput.value = context.title || "";

    if (displayNameInput) {

      displayNameInput.value = context.displayName || context.personName || context.name || "";

    }

    if (visibleInput) visibleInput.checked = context.isVisible !== false;



    renderAvatar(context);

    fillReadonlySection(context);

    updateDisplayNameField();



    const departmentId = resolveDepartmentId(context);

    populateDepartmentsSelect(departmentId);



    const manager = resolveManager(context);

    setManagerSelection(manager.positionId, manager.name);

  }



  function init() {

    if (initialized) return;

    initialized = true;

    ensureDrawerPortal();

    bindStaticEvents();

  }



  function open(context, onSaved) {

    init();

    const drawer = getDrawer();

    if (!drawer || !context) return;



    onSavedCallback = typeof onSaved === "function" ? onSaved : null;

    currentContext = Object.assign({ mode: "edit" }, context);



    const isCreate = currentContext.mode === "create" || isEmptyGuid(currentContext.positionId);

    if (isCreate) currentContext.mode = "create";



    const titleEl = document.getElementById("org-edit-drawer-title");

    const subtitleEl = document.getElementById("org-edit-drawer-subtitle");

    const deleteBtn = document.getElementById("org-edit-delete-btn");



    if (titleEl) {

      titleEl.textContent = isCreate ? "Atribuir posição" : "Editar posição";

    }

    if (subtitleEl) {

      subtitleEl.textContent = currentContext.personName || currentContext.name || "";

    }

    if (deleteBtn) deleteBtn.hidden = isCreate;



    setAlert(null);

    applyFormState(currentContext);



    void loadReferenceData().then(function () {

      if (!currentContext) return;

      applyFormState(currentContext);

    });



    drawer.hidden = false;

    requestAnimationFrame(function () {

      drawer.classList.add("is-open");

    });

    document.body.style.overflow = "hidden";

    const departmentSelect = document.getElementById("org-edit-department");

    if (departmentSelect) departmentSelect.focus();

  }



  function close() {

    const drawer = getDrawer();

    if (!drawer) return;

    drawer.classList.remove("is-open");

    document.body.style.overflow = "";

    setTimeout(function () {

      drawer.hidden = true;

      currentContext = null;

      onSavedCallback = null;

      setAlert(null);

      hideManagerResults();

    }, 220);

  }



  function openFromNode(person) {

    if (!person) return;

    open({

      mode: isEmptyGuid(person.positionId) ? "create" : "edit",

      positionId: person.positionId,

      personId: person.personId,
      slug: person.slug || person.Slug || "",

      personName: person.name,

      title: person.title,

      photoUrl: person.photoUrl || person.img,

      departmentName: person.departmentName || person.dept,

      dept: person.dept || person.departmentName,

      orgDepartmentId: person.orgDepartmentId,

      managerPositionId: person.managerPositionId,

      managerPersonId: person.managerPersonId,

      managerName: person.managerName,

      isVisible: person.isVisible !== false,

      displayName: person.displayName || person.name,

      graphTitle: person.graphTitle,

      graphDepartmentName: person.graphDepartmentName,

      graphManagerName: person.graphManagerName

    });

  }



  global.OrgEditDrawer = {

    init: init,

    open: open,

    openFromNode: openFromNode,

    close: close

  };

})(window);


