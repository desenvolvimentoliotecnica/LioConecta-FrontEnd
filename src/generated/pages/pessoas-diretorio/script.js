(function () {
      const root = document.getElementById("directory-root");
      const countEl = document.getElementById("directory-count");
      const scrollTopBtn = document.getElementById("directory-scroll-top");
      let activeFilter = "all";
      let searchQuery = "";
      let directoryData = null;
      let directoryPeopleBySlug = {};
      let toolbarController = null;

      if (window.OrgProfileModal && typeof window.OrgProfileModal.init === "function") {
        window.OrgProfileModal.init();
      }

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

      function normalizeSearch(value) {
        return String(value || "")
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
      }

      function deptKey(dept) {
        return dept.id || dept.Id || "";
      }

      function resolvePhotoUrl(url) {
        if (window.PersonAvatar) {
          return window.PersonAvatar.resolveGraphPhotoUrl(url);
        }
        if (!url || !String(url).trim()) return null;
        var trimmed = String(url).trim();
        var path = (trimmed.startsWith("/") ? trimmed : "/" + trimmed).split("?")[0].toLowerCase();
        return path.indexOf("/media/people/") === 0 ? path : null;
      }

      function renderAvatarMarkup(photoUrlValue) {
        if (window.PersonAvatar) {
          return window.PersonAvatar.renderAvatarMarkup(photoUrlValue, { escapeAttr: escapeAttr });
        }
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
        if (window.PersonAvatar) {
          window.PersonAvatar.replaceBroken(img, "person-card__avatar");
          return;
        }
        var placeholder = document.createElement("span");
        placeholder.className = "person-card__avatar person-card__avatar--placeholder";
        placeholder.setAttribute("aria-hidden", "true");
        placeholder.innerHTML = '<i class="fa-solid fa-user"></i>';
        img.replaceWith(placeholder);
      }

      function buildDirectoryPeopleIndex(departments) {
        var index = {};
        departments.forEach(function (dept) {
          var deptName = toTitleCase(dept.name || dept.Name || "Sem departamento");
          (dept.people || dept.People || []).forEach(function (person) {
            var slug = person.slug || person.Slug;
            if (!slug) return;
            index[slug] = { person: person, deptName: deptName };
          });
        });
        return index;
      }

      function resolveManagerLabel(person, peopleIndex) {
        var managerSlug = person.managerSlug || person.ManagerSlug;
        if (!managerSlug || !peopleIndex[managerSlug]) return "—";
        var manager = peopleIndex[managerSlug].person;
        var managerName = toTitleCase(manager.name || manager.Name || "");
        var managerTitle = toTitleCase(manager.title || manager.Title || "Colaborador");
        return managerName + " · " + managerTitle;
      }

      function mapPersonToProfileModal(person, deptName, peopleIndex) {
        var name = toTitleCase(person.name || person.Name || "");
        var title = toTitleCase(person.title || person.Title || "Colaborador");
        var slug = person.slug || person.Slug || "";
        var dept = toTitleCase(person.departmentName || person.DepartmentName || deptName || "Sem departamento");
        var email = person.email || person.Email || "";
        var teamsUpn = person.teamsUpn || person.TeamsUpn || email;
        var phone = person.phone || person.Phone || "";
        var location = person.location || person.Location || "";
        var hireDate = person.hireDate || person.HireDate || null;
        return {
          slug: slug,
          name: name,
          title: title,
          dept: dept,
          img: resolvePhotoUrl(person.photoUrl || person.PhotoUrl) || "",
          email: email,
          phone: phone,
          location: location,
          hireDate: hireDate,
          teamsUpn: teamsUpn,
          profile: {
            email: email,
            phone: phone,
            location: location,
            hireDate: hireDate,
            managerLabel: resolveManagerLabel(person, peopleIndex),
            teamsUpn: teamsUpn
          }
        };
      }

      function openPersonChat(email, teamsUpn) {
        var chatEmail = email || teamsUpn;
        if (!chatEmail) return;
        var chat = window.LioChat;
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

      function openDirectoryProfile(slug) {
        if (!slug || !window.OrgProfileModal || typeof window.OrgProfileModal.open !== "function") return;
        var entry = directoryPeopleBySlug[slug];
        if (!entry) return;
        var modalPerson = mapPersonToProfileModal(entry.person, entry.deptName, directoryPeopleBySlug);
        window.OrgProfileModal.open(modalPerson, {}, function (p) {
          openPersonChat(p.email, (p.profile && p.profile.teamsUpn) || p.teamsUpn);
        });
      }

      function openPersonEmail(slug, name, email) {
        if (!email) return;
        if (window.LioEmailCompose && typeof window.LioEmailCompose.open === "function") {
          window.LioEmailCompose.open({
            to: [{ name: name, email: email }],
            recipientSlug: slug || undefined,
            lockedTo: true,
            showExternalMailtoLink: true,
            source: "directory",
          });
          return;
        }
        window.location.href = "mailto:" + email;
      }

      function renderPerson(person) {
        var name = toTitleCase(person.name || person.Name || "");
        var title = toTitleCase(person.title || person.Title || "Colaborador");
        var slug = person.slug || person.Slug || "";
        var email = person.email || person.Email || "";
        var teamsUpn = person.teamsUpn || person.TeamsUpn || email;
        var teamsHref = teamsUpn
          ? "https://teams.microsoft.com/l/chat/0/0?users=" + encodeURIComponent(teamsUpn)
          : "#";
        var searchText = normalizeSearch(name + " " + title);
        var emailDisabled = email ? "" : " disabled";

        return (
          '<article class="person-card" data-search="' +
          escapeAttr(searchText) +
          '" data-person-slug="' +
          escapeAttr(slug) +
          '">' +
          renderAvatarMarkup(person.photoUrl || person.PhotoUrl) +
          '<h2 class="person-card__name">' +
          escapeHtml(name) +
          "</h2>" +
          '<p class="person-card__role">' +
          escapeHtml(title) +
          "</p>" +
          '<div class="person-card__actions">' +
          '<button type="button" class="person-card__btn" data-directory-email' +
          emailDisabled +
          ' data-person-slug="' +
          escapeAttr(slug) +
          '" data-person-email="' +
          escapeAttr(email) +
          '" data-person-name="' +
          escapeAttr(name) +
          '" aria-label="Enviar e-mail para ' +
          escapeAttr(name) +
          '"><i class="fa-regular fa-envelope" aria-hidden="true"></i></button>' +
          '<a class="person-card__btn" href="' +
          escapeAttr(teamsHref) +
          '" target="_blank" rel="noopener noreferrer" aria-label="Enviar mensagem para ' +
          escapeAttr(name) +
          '"><i class="fa-regular fa-comment" aria-hidden="true"></i></a>' +
          '<button type="button" class="person-card__btn" data-directory-profile data-person-slug="' +
          escapeAttr(slug) +
          '" aria-label="Ver perfil de ' +
          escapeAttr(name) +
          '"><i class="fa-regular fa-user" aria-hidden="true"></i></button>' +
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
          '<section class="dept-group" data-dept="' +
          escapeAttr(id) +
          '" aria-label="' +
          escapeAttr(name) +
          '">' +
          '<button type="button" class="dept-group__header" aria-expanded="false" aria-controls="' +
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

      function renderDepartmentSelect(departments) {
        var select = document.getElementById("directory-dept-select");
        if (!select) return;

        var options = ['<option value="all">Todos os departamentos</option>'];
        departments.forEach(function (dept) {
          var id = deptKey(dept);
          var name = toTitleCase(dept.name || dept.Name || "Sem departamento");
          var count = dept.count || (dept.people || dept.People || []).length;
          options.push(
            '<option value="' +
              escapeAttr(id) +
              '">' +
              escapeHtml(name) +
              " (" +
              count +
              ")</option>"
          );
        });
        select.innerHTML = options.join("");
        select.value = activeFilter;
        select.classList.toggle("is-active", activeFilter !== "all");
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
        var normalizedQuery = normalizeSearch(searchQuery.trim());
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

        var filters = document.getElementById("directory-dept-select");
        var searchInput = document.getElementById("directory-search");

        if (filters) {
          filters.addEventListener(
            "change",
            function (event) {
              activeFilter = event.target.value || "all";
              filters.classList.toggle("is-active", activeFilter !== "all");
              applyFilters();
              if (activeFilter !== "all") {
                var target = root.querySelector('.dept-group[data-dept="' + activeFilter + '"]');
                if (target) {
                  target.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }
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
            var emailBtn = event.target.closest("[data-directory-email]");
            if (emailBtn && root.contains(emailBtn) && !emailBtn.disabled) {
              event.preventDefault();
              openPersonEmail(
                emailBtn.getAttribute("data-person-slug") || "",
                emailBtn.getAttribute("data-person-name") || "",
                emailBtn.getAttribute("data-person-email") || ""
              );
              return;
            }

            var profileBtn = event.target.closest("[data-directory-profile]");
            if (profileBtn && root.contains(profileBtn)) {
              event.preventDefault();
              openDirectoryProfile(profileBtn.getAttribute("data-person-slug") || "");
              return;
            }

            var card = event.target.closest(".person-card");
            if (card && root.contains(card) && !event.target.closest(".person-card__btn")) {
              openDirectoryProfile(card.getAttribute("data-person-slug") || "");
              return;
            }

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

        renderDepartmentSelect(departments);
        directoryPeopleBySlug = buildDirectoryPeopleIndex(departments);
        root.innerHTML = departments.map(renderDepartment).join("");
        bindToolbarEvents();
        applyFilters();
      }

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
