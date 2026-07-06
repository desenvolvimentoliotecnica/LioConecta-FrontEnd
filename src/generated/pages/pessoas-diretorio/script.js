(function () {
      const root = document.getElementById("directory-root");
      const countEl = document.getElementById("directory-count");
      const scrollTopBtn = document.getElementById("directory-scroll-top");
      let activeFilter = "all";
      let searchQuery = "";
      let directoryData = null;
      let toolbarController = null;

      var PT_LOWER_WORDS = {
        de: true,
        da: true,
        do: true,
        das: true,
        dos: true,
        e: true,
        em: true,
        na: true,
        no: true,
        nas: true,
        nos: true,
        a: true,
        o: true,
        as: true,
        os: true,
        para: true,
        por: true,
        com: true,
        sem: true,
        ao: true,
        aos: true
      };

      if (!root) return;

      function escapeHtml(text) {
        return String(text || "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/"/g, "&quot;");
      }

      function escapeAttr(text) {
        return escapeHtml(text);
      }

      function formatWordPart(word, isFirst) {
        if (!word) return word;
        var lower = word.toLowerCase();
        if (/^(i{1,3}|iv|vi{0,3}|ix|x{1,3})$/i.test(word)) {
          return word.toUpperCase();
        }
        if (!isFirst && PT_LOWER_WORDS[lower]) {
          return lower;
        }
        return lower.charAt(0).toUpperCase() + lower.slice(1);
      }

      function formatSegment(segment, isFirstWord) {
        if (!segment) return segment;
        if (segment.indexOf(".") !== -1) {
          var parts = segment.split(".");
          var formatted = [];
          for (var i = 0; i < parts.length; i += 1) {
            if (parts[i]) {
              formatted.push(formatWordPart(parts[i], isFirstWord && i === 0));
            }
            if (i < parts.length - 1) {
              formatted.push(".");
            }
          }
          return formatted.join("");
        }
        return formatWordPart(segment, isFirstWord);
      }

      function toTitleCase(text) {
        var value = String(text || "").trim();
        if (!value) return "";

        return value
          .split(/\s+/)
          .map(function (word, index) {
            if (word.indexOf("-") !== -1) {
              return word
                .split("-")
                .map(function (part, partIndex) {
                  return formatSegment(part, index === 0 && partIndex === 0);
                })
                .join("-");
            }
            return formatSegment(word, index === 0);
          })
          .join(" ");
      }

      function deptKey(dept) {
        return dept.id || dept.Id || "";
      }

      function resolvePhotoUrl(url) {
        if (!url || !String(url).trim()) return null;
        var trimmed = String(url).trim();
        if (/^(https?:|data:|blob:)/i.test(trimmed)) return trimmed;
        return trimmed.startsWith("/") ? trimmed : "/" + trimmed;
      }

      function renderAvatarMarkup(photoUrlValue) {
        var src = resolvePhotoUrl(photoUrlValue);
        if (!src) {
          return (
            '<span class="person-card__avatar person-card__avatar--placeholder" aria-hidden="true">' +
            '<i class="fa-solid fa-user"></i></span>'
          );
        }
        return (
          '<img class="person-card__avatar" src="' +
          escapeAttr(src) +
          '" alt="" loading="lazy" />'
        );
      }

      function replaceBrokenAvatar(img) {
        if (!img || !img.parentNode) return;
        var placeholder = document.createElement("span");
        placeholder.className = "person-card__avatar person-card__avatar--placeholder";
        placeholder.setAttribute("aria-hidden", "true");
        placeholder.innerHTML = '<i class="fa-solid fa-user"></i>';
        img.replaceWith(placeholder);
      }

      function renderPerson(person) {
        var name = toTitleCase(person.name || person.Name || "");
        var title = toTitleCase(person.title || person.Title || "Colaborador");
        var slug = person.slug || person.Slug || "";
        var email = person.email || person.Email || "";
        var teamsUpn = person.teamsUpn || person.TeamsUpn || email;
        var profileHref = "/pessoas/perfil?id=" + encodeURIComponent(slug);
        var mailHref = email ? "mailto:" + encodeURIComponent(email) : "#";
        var teamsHref = teamsUpn
          ? "https://teams.microsoft.com/l/chat/0/0?users=" + encodeURIComponent(teamsUpn)
          : "#";
        var searchText = (name + " " + title).toLowerCase();

        return (
          '<article class="person-card" data-search="' +
          escapeAttr(searchText) +
          '">' +
          renderAvatarMarkup(person.photoUrl || person.PhotoUrl) +
          '<h2 class="person-card__name">' +
          escapeHtml(name) +
          "</h2>" +
          '<p class="person-card__role">' +
          escapeHtml(title) +
          "</p>" +
          '<div class="person-card__actions">' +
          '<a class="person-card__btn" href="' +
          escapeAttr(mailHref) +
          '" aria-label="Enviar e-mail para ' +
          escapeAttr(name) +
          '"><i class="fa-regular fa-envelope" aria-hidden="true"></i></a>' +
          '<a class="person-card__btn" href="' +
          escapeAttr(teamsHref) +
          '" target="_blank" rel="noopener noreferrer" aria-label="Enviar mensagem para ' +
          escapeAttr(name) +
          '"><i class="fa-regular fa-comment" aria-hidden="true"></i></a>' +
          '<a class="person-card__btn" href="' +
          escapeAttr(profileHref) +
          '" aria-label="Ver perfil de ' +
          escapeAttr(name) +
          '"><i class="fa-regular fa-user" aria-hidden="true"></i></a>' +
          "</div></article>"
        );
      }

      function renderDepartment(dept) {
        var id = deptKey(dept);
        var panelId = "dept-panel-" + id;
        var name = toTitleCase(dept.name || dept.Name || "Sem departamento");
        var people = dept.people || dept.People || [];
        var cards = people.map(renderPerson).join("");
        return (
          '<section class="dept-group dept-group--open" data-dept="' +
          escapeAttr(id) +
          '" aria-label="' +
          escapeAttr(name) +
          '">' +
          '<button type="button" class="dept-group__header" aria-expanded="true" aria-controls="' +
          escapeAttr(panelId) +
          '">' +
          '<span class="dept-group__header-main">' +
          '<i class="fa-solid fa-chevron-down dept-group__chevron" aria-hidden="true"></i>' +
          '<span class="dept-group__title">' +
          escapeHtml(name) +
          "</span>" +
          "</span>" +
          '<span class="dept-group__count">' +
          (dept.count || people.length) +
          " colaboradores</span>" +
          "</button>" +
          '<div class="dept-group__panel" id="' +
          escapeAttr(panelId) +
          '">' +
          '<div class="directory-grid">' +
          cards +
          "</div></div></section>"
        );
      }

      function renderFilters(departments) {
        const filters = document.getElementById("directory-filters");
        if (!filters) return;

        const chips = ['<button class="filter-chip is-active" type="button" data-filter="all">Todos</button>'];
        departments.forEach(function (dept) {
          chips.push(
            '<button class="filter-chip" type="button" data-filter="' +
              escapeAttr(deptKey(dept)) +
              '">' +
              escapeHtml(toTitleCase(dept.name || dept.Name || "Sem departamento")) +
              "</button>"
          );
        });
        filters.innerHTML = chips.join("");

        filters.querySelectorAll(".filter-chip").forEach(function (btn) {
          btn.classList.toggle("is-active", (btn.getAttribute("data-filter") || "all") === activeFilter);
        });
      }

      function updateCount(visibleTotal, groupCount) {
        if (!countEl) return;
        var suffix =
          directoryData && directoryData.syncedAtUtc
            ? " · atualizado em " + new Date(directoryData.syncedAtUtc).toLocaleString("pt-BR")
            : "";
        if (searchQuery) {
          countEl.textContent = "Exibindo " + visibleTotal + " resultados para \"" + searchQuery + "\"" + suffix;
          return;
        }
        if (activeFilter === "all") {
          countEl.textContent =
            "Exibindo " + visibleTotal + " colaboradores em " + groupCount + " departamentos" + suffix;
        } else {
          countEl.textContent = "Exibindo " + visibleTotal + " colaboradores" + suffix;
        }
      }

      function setDeptGroupOpen(group, isOpen) {
        if (!group) return;
        group.classList.toggle("dept-group--open", isOpen);
        var header = group.querySelector(".dept-group__header");
        if (header) {
          header.setAttribute("aria-expanded", isOpen ? "true" : "false");
        }
      }

      function applyFilters() {
        var visibleTotal = 0;
        var groupCount = 0;
        var normalizedQuery = searchQuery.trim().toLowerCase();
        var shouldExpandVisible = activeFilter !== "all" || normalizedQuery.length > 0;

        root.querySelectorAll(".dept-group").forEach(function (group) {
          var deptId = group.getAttribute("data-dept") || "";
          var deptMatch = activeFilter === "all" || deptId === activeFilter;
          var visibleInGroup = 0;

          group.querySelectorAll(".person-card").forEach(function (card) {
            var haystack = card.getAttribute("data-search") || "";
            var textMatch = !normalizedQuery || haystack.indexOf(normalizedQuery) !== -1;
            var match = deptMatch && textMatch;
            card.hidden = !match;
            if (match) visibleInGroup += 1;
          });

          var showGroup = deptMatch && visibleInGroup > 0;
          group.hidden = !showGroup;
          if (showGroup) {
            groupCount += 1;
            visibleTotal += visibleInGroup;
            if (shouldExpandVisible) {
              setDeptGroupOpen(group, true);
            }
            var countBadge = group.querySelector(".dept-group__count");
            if (countBadge) {
              countBadge.textContent = visibleInGroup + " colaborador" + (visibleInGroup === 1 ? "" : "es");
            }
          }
        });

        updateCount(visibleTotal, groupCount);
      }

      function bindToolbarEvents() {
        if (toolbarController) {
          toolbarController.abort();
        }
        toolbarController = new AbortController();
        var signal = toolbarController.signal;

        var filters = document.getElementById("directory-filters");
        var searchInput = document.getElementById("directory-search");

        if (filters) {
          filters.addEventListener(
            "click",
            function (event) {
              var chip = event.target.closest(".filter-chip");
              if (!chip || !filters.contains(chip)) return;
              event.preventDefault();
              filters.querySelectorAll(".filter-chip").forEach(function (btn) {
                btn.classList.remove("is-active");
              });
              chip.classList.add("is-active");
              activeFilter = chip.getAttribute("data-filter") || "all";
              applyFilters();
            },
            { signal }
          );
        }

        if (searchInput) {
          searchInput.addEventListener(
            "input",
            function (event) {
              searchQuery = event.target.value || "";
              applyFilters();
            },
            { signal }
          );
        }

        root.addEventListener(
          "click",
          function (event) {
            var header = event.target.closest(".dept-group__header");
            if (!header || !root.contains(header)) return;
            var group = header.closest(".dept-group");
            if (!group) return;
            var isOpen = group.classList.toggle("dept-group--open");
            header.setAttribute("aria-expanded", isOpen ? "true" : "false");
          },
          { signal }
        );

        root.addEventListener(
          "error",
          function (event) {
            var target = event.target;
            if (target && target.classList && target.classList.contains("person-card__avatar")) {
              replaceBrokenAvatar(target);
            }
          },
          { capture: true, signal: signal }
        );
      }

      function bindScrollTopButton() {
        if (!scrollTopBtn) return;

        function updateScrollTopVisibility() {
          scrollTopBtn.hidden = window.scrollY < 320;
        }

        scrollTopBtn.addEventListener("click", function () {
          window.scrollTo({ top: 0, behavior: "smooth" });
        });

        window.addEventListener("scroll", updateScrollTopVisibility, { passive: true });
        updateScrollTopVisibility();
      }

      function ensureSearchInput() {
        var searchWrap = document.querySelector(".page-toolbar .page-search");
        if (!searchWrap || document.getElementById("directory-search")) return;

        searchWrap.innerHTML =
          '<i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>' +
          '<input id="directory-search" class="page-search__input" type="search" ' +
          'placeholder="Buscar por nome ou cargo..." autocomplete="off" spellcheck="false" />';
      }

      function showLoading() {
        root.innerHTML = '<p class="page-empty-note">Carregando diretório...</p>';
      }

      function showError(message) {
        root.innerHTML =
          '<p class="page-empty-note">' +
          escapeHtml(message) +
          " Execute o worker <strong>Sync diretório Microsoft Graph</strong> em Admin &gt; Workers.</p>";
      }

      function renderDirectory(data) {
        directoryData = data;
        var departments = data.departments || data.Departments || [];
        if (!departments.length) {
          showError("Nenhum colaborador encontrado no diretório.");
          return;
        }

        ensureSearchInput();
        renderFilters(departments);
        root.innerHTML = departments.map(renderDepartment).join("");
        bindToolbarEvents();
        applyFilters();
      }

      ensureSearchInput();
      bindToolbarEvents();
      bindScrollTopButton();
      showLoading();

      if (!window.LioApi || window.LioApi.useMock) {
        showError("API indisponível ou modo mock ativo.");
        return;
      }

      window.LioApi
        .get("/people/directory")
        .then(renderDirectory)
        .catch(function () {
          showError("Não foi possível carregar o diretório.");
        });
    })();
