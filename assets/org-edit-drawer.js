(function (global) {
  const EMPTY_GUID = "00000000-0000-0000-0000-000000000000";
  let initialized = false;
  let departments = [];
  let positionsByPersonId = {};
  let searchTimer = null;
  let onSavedCallback = null;
  let currentContext = null;

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

  function updateDisplayNameVisibility() {
    const policy = getPolicy();
    const allowed = policy.allowedFields || policy.AllowedFields || [];
    const fieldWrap = document.getElementById("org-edit-display-name-field");
    if (!fieldWrap) return;
    const canEditName =
      policy.allowDisplayNameEdit === true ||
      allowed.indexOf("displayName") >= 0 ||
      allowed.indexOf("DisplayName") >= 0;
    fieldWrap.hidden = !canEditName;
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
      setAlert("Informe o título da posição.", "error");
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

  function init() {
    if (initialized) return;
    initialized = true;
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

    document.getElementById("org-edit-title").value = currentContext.title || "";
    document.getElementById("org-edit-display-name").value =
      currentContext.displayName || currentContext.personName || currentContext.name || "";
    document.getElementById("org-edit-visible").checked = currentContext.isVisible !== false;

    setAlert(null);
    updateDisplayNameVisibility();
    fillReadonlySection(currentContext);
    setManagerSelection(currentContext.managerPositionId || "", currentContext.managerName || "");

    void loadReferenceData().then(function () {
      populateDepartmentsSelect(currentContext.orgDepartmentId);
    });

    drawer.hidden = false;
    requestAnimationFrame(function () {
      drawer.classList.add("is-open");
    });
    document.body.style.overflow = "hidden";
    const titleInput = document.getElementById("org-edit-title");
    if (titleInput) titleInput.focus();
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
      personName: person.name,
      title: person.title,
      orgDepartmentId: person.orgDepartmentId,
      managerPositionId: person.managerPositionId,
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
