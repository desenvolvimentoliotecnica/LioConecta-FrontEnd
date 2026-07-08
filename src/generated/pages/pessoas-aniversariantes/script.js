(function () {
      const root = document.getElementById("birthday-root");
      const countEl = document.getElementById("birthday-count");
      const filters = document.getElementById("birthday-filters");
      const monthSelect = document.getElementById("birthday-month-select");
      const searchInput = document.getElementById("birthday-search");
      const bannerTextEl = document.getElementById("birthday-banner-text");
      let activeFilter = "all";
      let searchQuery = "";
      const monthNames = [
        "janeiro", "fevereiro", "março", "abril", "maio", "junho",
        "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
      ];
      const monthNamesTitle = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
      ];

      if (!root) return;

      function escapeHtml(text) {
        return String(text || "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/"/g, "&quot;");
      }

      function normalizeSearch(value) {
        return String(value || "")
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
      }

      function renderAvatar(person) {
        if (window.PersonAvatar) {
          return window.PersonAvatar.renderAvatarMarkup(person.photoUrl, {
            escapeAttr: function (value) {
              return escapeHtml(value);
            }
          });
        }
        return '<span class="person-card__avatar person-card__avatar--placeholder" aria-hidden="true"><i class="fa-solid fa-user"></i></span>';
      }

      function formatBirthLabel(birthDate) {
        if (!birthDate) return "";
        var parts = birthDate.split("-");
        if (parts.length !== 3) return birthDate;
        return Number(parts[2]) + " de " + monthNames[Number(parts[1]) - 1];
      }

      function daysUntilBirthday(birthDate, today) {
        var parts = birthDate.split("-");
        var month = Number(parts[1]);
        var day = Number(parts[2]);
        var next = new Date(today.getFullYear(), month - 1, day);
        if (next < today) {
          next = new Date(today.getFullYear() + 1, month - 1, day);
        }
        return Math.round((next - today) / 86400000);
      }

      /** Dias até o aniversário neste ano (negativo se já passou). */
      function daysFromBirthdayThisYear(birthDate, today) {
        var parts = birthDate.split("-");
        var month = Number(parts[1]);
        var day = Number(parts[2]);
        var thisYear = new Date(today.getFullYear(), month - 1, day);
        return Math.round((thisYear - today) / 86400000);
      }

      function getNextCalendarMonth() {
        var today = new Date();
        return (today.getMonth() + 1) % 12 + 1;
      }

      function slugify(value) {
        return String(value || "sem-departamento")
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "") || "sem-departamento";
      }

      function isToday(person) {
        var today = new Date();
        return person.day === today.getDate() && person.month === today.getMonth() + 1;
      }

      function buildGroups(people) {
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        var currentMonth = today.getMonth() + 1;
        var groups = [
          { id: "today", name: "Hoje", people: [] },
          { id: "week", name: "Esta semana", people: [] },
          { id: "month", name: "Este mês", people: [] }
        ];
        var byCalendarMonth = {};

        people.forEach(function (person) {
          if (!person.birthDate) return;
          var daysThisYear = daysFromBirthdayThisYear(person.birthDate, today);
          var entry = {
            name: person.name,
            role: person.title || "Colaborador",
            dept: person.departmentName || "",
            deptId: slugify(person.departmentName || "sem-departamento"),
            day: Number(person.birthDate.split("-")[2]),
            month: Number(person.birthDate.split("-")[1]),
            days: daysThisYear,
            label: formatBirthLabel(person.birthDate),
            slug: person.slug,
            photoUrl: person.photoUrl,
            searchName: normalizeSearch(person.name)
          };

          if (daysThisYear === 0) {
            groups[0].people.push(entry);
          } else if (daysThisYear > 0 && daysThisYear <= 7) {
            groups[1].people.push(entry);
          } else if (entry.month === currentMonth) {
            groups[2].people.push(entry);
          } else {
            var calKey = "cal-" + entry.month;
            if (!byCalendarMonth[calKey]) {
              byCalendarMonth[calKey] = {
                id: calKey,
                name: monthNamesTitle[entry.month - 1],
                people: []
              };
            }
            byCalendarMonth[calKey].people.push(entry);
          }
        });

        groups[2].people.sort(function (a, b) { return a.day - b.day; });

        var result = groups.filter(function (g) { return g.people.length; });
        Object.keys(byCalendarMonth)
          .sort(function (a, b) { return Number(a.slice(4)) - Number(b.slice(4)); })
          .forEach(function (key) {
            if (byCalendarMonth[key].people.length) result.push(byCalendarMonth[key]);
          });
        return result;
      }

      function renderPerson(person) {
        var avatarMarkup = renderAvatar(person);
        var todayClass = isToday(person) ? " is-today" : "";
        var todayBadge = isToday(person) ? '<span class="person-card__today-badge">Hoje</span>' : "";
        var profileHref = "/pessoas/perfil?id=" + encodeURIComponent(person.slug);
        return (
          '<article class="person-card' + todayClass + '" data-day="' + person.day + '" data-month="' + person.month + '" data-days="' + person.days + '" data-name="' + escapeHtml(person.searchName) + '">' +
          todayBadge +
          avatarMarkup +
          '<h2 class="person-card__name">' + escapeHtml(person.name) + "</h2>" +
          '<p class="person-card__role">' + escapeHtml(person.role) + "</p>" +
          '<span class="person-card__dept">' + escapeHtml(person.dept) + "</span>" +
          '<p class="person-card__birthday">' + escapeHtml(person.label) + "</p>" +
          '<div class="person-card__actions">' +
          '<a class="person-card__btn" href="#" aria-label="Parabenizar ' + escapeHtml(person.name) + '"><i class="fa-regular fa-gift" aria-hidden="true"></i></a>' +
          '<a class="person-card__btn" href="' + profileHref + '" aria-label="Ver perfil de ' + escapeHtml(person.name) + '"><i class="fa-regular fa-user" aria-hidden="true"></i></a>' +
          "</div></article>"
        );
      }

      function renderGroup(group) {
        return (
          '<section class="dept-group" data-group="' + group.id + '" aria-label="' + escapeHtml(group.name) + '">' +
          '<div class="dept-group__header">' +
          '<h2 class="dept-group__title">' + escapeHtml(group.name) + "</h2>" +
          '<span class="dept-group__count">' + group.people.length + " aniversariantes</span>" +
          "</div>" +
          '<div class="directory-grid">' + group.people.map(renderPerson).join("") + "</div></section>"
        );
      }

      function cardMatchesPeriod(card) {
        var day = Number(card.getAttribute("data-day"));
        var month = Number(card.getAttribute("data-month"));
        var days = Number(card.getAttribute("data-days"));
        var today = new Date();
        var currentMonth = today.getMonth() + 1;
        var nextMonth = getNextCalendarMonth();

        if (activeFilter === "all") return true;
        if (activeFilter === "today") return days === 0;
        if (activeFilter === "week") return days >= 0 && days <= 7;
        if (activeFilter === "month") return month === currentMonth; // calendário, inclui já ocorridos
        if (activeFilter === "next-month") return month === nextMonth;
        if (activeFilter.indexOf("cal-") === 0) {
          return month === Number(activeFilter.slice(4));
        }
        return true;
      }

      function cardMatchesSearch(card) {
        if (!searchQuery) return true;
        var name = card.getAttribute("data-name") || "";
        return name.indexOf(searchQuery) !== -1;
      }

      function updateCount(visibleTotal, groupCount) {
        if (!countEl) return;
        if (searchQuery) {
          countEl.textContent = visibleTotal === 0
            ? "Nenhum aniversariante encontrado para \"" + searchQuery + "\""
            : "Exibindo " + visibleTotal + " resultado" + (visibleTotal === 1 ? "" : "s");
          return;
        }
        if (activeFilter === "all") {
          countEl.textContent = "Exibindo " + visibleTotal + " aniversariantes em " + groupCount + " períodos";
          return;
        }
        countEl.textContent = "Exibindo " + visibleTotal + " aniversariante" + (visibleTotal === 1 ? "" : "s");
      }

      function setActiveChip(filter) {
        if (!filters) return;
        filters.querySelectorAll(".filter-chip").forEach(function (btn) {
          var match = filter && btn.getAttribute("data-filter") === filter;
          btn.classList.toggle("is-active", match);
        });
      }

      function setMonthSelectValue(value) {
        if (!monthSelect) return;
        monthSelect.value = value || "";
        monthSelect.classList.toggle("is-active", Boolean(value));
      }

      function applyFilters() {
        var visibleTotal = 0;
        var groupCount = 0;
        root.querySelectorAll(".dept-group").forEach(function (group) {
          var visibleInGroup = 0;
          group.querySelectorAll(".person-card").forEach(function (card) {
            var match = cardMatchesPeriod(card) && cardMatchesSearch(card);
            card.hidden = !match;
            if (match) visibleInGroup += 1;
          });
          group.hidden = visibleInGroup === 0;
          if (visibleInGroup > 0) {
            groupCount += 1;
            visibleTotal += visibleInGroup;
          }
        });
        updateCount(visibleTotal, groupCount);
      }

      function updateWelcomeBanner(people) {
        if (!bannerTextEl) return;
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        var todayCount = 0;
        (people || []).forEach(function (person) {
          if (!person.birthDate) return;
          var days = daysUntilBirthday(person.birthDate, today);
          if (days === 0) todayCount += 1;
        });
        var total = (people || []).length;
        if (total === 0) {
          bannerTextEl.textContent = "Nenhum aniversariante nos próximos dias. Execute o sync do RM (TOTVS).";
          return;
        }
        if (todayCount === 0) {
          bannerTextEl.textContent =
            "Nenhum aniversariante hoje. Este mês e nos próximos 60 dias: " +
            total + " colaborador" + (total === 1 ? "" : "es") + " comemoram mais um ano de vida.";
        } else if (todayCount === 1) {
          bannerTextEl.textContent =
            "Hoje é aniversário de 1 colaborador. Este mês e nos próximos 60 dias: " + total + " celebrações no total.";
        } else {
          bannerTextEl.textContent =
            "Hoje são " + todayCount + " aniversariantes. Este mês e nos próximos 60 dias: " + total + " celebrações no total.";
        }
      }

      function renderMonthSelect(people) {
        if (!monthSelect) return;
        var today = new Date();
        var year = today.getFullYear();
        var counts = {};
        (people || []).forEach(function (person) {
          if (!person.birthDate) return;
          var month = Number(person.birthDate.split("-")[1]);
          counts[month] = (counts[month] || 0) + 1;
        });

        var options = ['<option value="">Todos os meses</option>'];
        for (var m = 1; m <= 12; m += 1) {
          var count = counts[m] || 0;
          var label = monthNamesTitle[m - 1] + " " + year;
          if (count > 0) label += " (" + count + ")";
          options.push(
            '<option value="cal-' + m + '"' + (count === 0 ? ' disabled' : '') + ">" +
            escapeHtml(label) +
            "</option>"
          );
        }
        monthSelect.innerHTML = options.join("");
      }

      function wireToolbar() {
        if (filters) {
          filters.addEventListener("click", function (event) {
            var chip = event.target.closest(".filter-chip");
            if (!chip) return;
            activeFilter = chip.getAttribute("data-filter") || "all";
            setActiveChip(activeFilter);
            setMonthSelectValue("");
            applyFilters();
          });
        }

        if (monthSelect) {
          monthSelect.addEventListener("change", function () {
            var value = monthSelect.value;
            if (value) {
              activeFilter = value;
              setActiveChip("");
              setMonthSelectValue(value);
            } else {
              activeFilter = "all";
              setActiveChip("all");
              setMonthSelectValue("");
            }
            applyFilters();
          });
        }

        if (searchInput) {
          searchInput.addEventListener("input", function () {
            searchQuery = normalizeSearch(searchInput.value.trim());
            applyFilters();
          });
        }
      }

      wireToolbar();

      root.innerHTML = '<p class="page-empty-note">Carregando aniversariantes...</p>';

      if (!window.LioApi || window.LioApi.useMock) {
        root.innerHTML = '<p class="page-empty-note">API indisponível. Ative o backend e desabilite VITE_USE_MOCK.</p>';
        if (countEl) countEl.textContent = "";
        if (bannerTextEl) bannerTextEl.textContent = "Conecte-se ao backend para ver aniversariantes reais.";
        return;
      }

      window.LioApi.get("/people/birthdays?days=60")
        .then(function (people) {
          people = people || [];
          updateWelcomeBanner(people);
          renderMonthSelect(people);
          if (!people.length) {
            root.innerHTML = '<p class="page-empty-note">Nenhum aniversariante nos próximos 60 dias com data de nascimento registrada. Execute o sync do RM (TOTVS).</p>';
            if (countEl) countEl.textContent = "Exibindo 0 aniversariantes";
            return;
          }
          var groups = buildGroups(people);
          if (!groups.length) {
            root.innerHTML = '<p class="page-empty-note">Nenhum aniversariante nos próximos 60 dias.</p>';
            if (countEl) countEl.textContent = "Exibindo 0 aniversariantes";
            return;
          }
          root.innerHTML = groups.map(renderGroup).join("");
          applyFilters();
        })
        .catch(function () {
          root.innerHTML = '<p class="page-empty-note">Não foi possível carregar aniversariantes.</p>';
          if (countEl) countEl.textContent = "";
          if (bannerTextEl) bannerTextEl.textContent = "Não foi possível carregar os aniversariantes.";
        });
    })();
