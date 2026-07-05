(function () {
      const root = document.getElementById("directory-root");
      const countEl = document.getElementById("directory-count");
      const filters = document.getElementById("directory-filters");
      let activeFilter = "all";
      let directoryData = null;

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

      function photoUrl(url) {
        if (!url) return "/avatar-ti.png";
        if (/^(https?:|data:|blob:)/i.test(url)) return url;
        return url.startsWith("/") ? url : "/" + url;
      }

      function renderPerson(person) {
        const avatar = photoUrl(person.photoUrl);
        const profileHref = "/pessoas/perfil?id=" + encodeURIComponent(person.slug);
        const mailHref = person.email ? "mailto:" + encodeURIComponent(person.email) : "#";
        const teamsHref = person.email || person.teamsUpn
          ? "https://teams.microsoft.com/l/chat/0/0?users=" + encodeURIComponent(person.email || person.teamsUpn)
          : "#";

        return (
          '<article class="person-card">' +
          '<img class="person-card__avatar" src="' + escapeAttr(avatar) + '" alt="" />' +
          '<h2 class="person-card__name">' + escapeHtml(person.name) + "</h2>" +
          '<p class="person-card__role">' + escapeHtml(person.title || "Colaborador") + "</p>" +
          '<div class="person-card__actions">' +
          '<a class="person-card__btn" href="' + escapeAttr(mailHref) + '" aria-label="Enviar e-mail para ' + escapeAttr(person.name) + '"><i class="fa-regular fa-envelope" aria-hidden="true"></i></a>' +
          '<a class="person-card__btn" href="' + escapeAttr(teamsHref) + '" target="_blank" rel="noopener noreferrer" aria-label="Enviar mensagem para ' + escapeAttr(person.name) + '"><i class="fa-regular fa-comment" aria-hidden="true"></i></a>' +
          '<a class="person-card__btn" href="' + escapeAttr(profileHref) + '" aria-label="Ver perfil de ' + escapeAttr(person.name) + '"><i class="fa-regular fa-user" aria-hidden="true"></i></a>' +
          "</div></article>"
        );
      }

      function renderDepartment(dept) {
        const cards = (dept.people || []).map(renderPerson).join("");
        return (
          '<section class="dept-group" data-dept="' + escapeAttr(dept.id) + '" aria-label="' + escapeAttr(dept.name) + '">' +
          '<div class="dept-group__header">' +
          '<h2 class="dept-group__title">' + escapeHtml(dept.name) + "</h2>" +
          '<span class="dept-group__count">' + dept.count + " colaboradores</span>" +
          "</div>" +
          '<div class="directory-grid">' + cards + "</div></section>"
        );
      }

      function renderFilters(departments) {
        if (!filters) return;
        const chips = ['<button class="filter-chip is-active" type="button" data-filter="all">Todos</button>'];
        departments.forEach(function (dept) {
          chips.push(
            '<button class="filter-chip" type="button" data-filter="' +
              escapeAttr(dept.id) +
              '">' +
              escapeHtml(dept.name) +
              "</button>"
          );
        });
        filters.innerHTML = chips.join("");
      }

      function updateCount(visibleTotal, groupCount) {
        if (!countEl) return;
        var suffix = directoryData && directoryData.syncedAtUtc
          ? " · atualizado em " + new Date(directoryData.syncedAtUtc).toLocaleString("pt-BR")
          : "";
        if (activeFilter === "all") {
          countEl.textContent =
            "Exibindo " + visibleTotal + " colaboradores em " + groupCount + " departamentos" + suffix;
        } else {
          countEl.textContent = "Exibindo " + visibleTotal + " colaboradores" + suffix;
        }
      }

      function applyFilter(filter) {
        activeFilter = filter;
        var visibleTotal = 0;
        var groupCount = 0;

        root.querySelectorAll(".dept-group").forEach(function (group) {
          var match = filter === "all" || group.getAttribute("data-dept") === filter;
          group.hidden = !match;
          if (match) {
            groupCount += 1;
            visibleTotal += group.querySelectorAll(".person-card").length;
          }
        });

        updateCount(visibleTotal, groupCount);
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
        var departments = data.departments || [];
        if (!departments.length) {
          showError("Nenhum colaborador encontrado no diretório.");
          return;
        }

        renderFilters(departments);
        root.innerHTML = departments.map(renderDepartment).join("");
        applyFilter(activeFilter);
      }

      if (filters) {
        filters.addEventListener("click", function (event) {
          var chip = event.target.closest(".filter-chip");
          if (!chip) return;
          filters.querySelectorAll(".filter-chip").forEach(function (btn) {
            btn.classList.remove("is-active");
          });
          chip.classList.add("is-active");
          applyFilter(chip.getAttribute("data-filter") || "all");
        });
      }

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
