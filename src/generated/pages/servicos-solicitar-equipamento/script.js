(function () {
      const catLabels = {
        "notebook": "Notebook",
        "periferico": "Periférico",
        "mobilidade": "Mobilidade",
        "acessorio": "Acessório"
};
      const catIcons = {
        "notebook": "fa-laptop",
        "periferico": "fa-keyboard",
        "mobilidade": "fa-mobile-screen",
        "acessorio": "fa-plug"
};
      const items = [
        {
                "title": "Notebook corporativo",
                "desc": "Dell Latitude ou Lenovo ThinkPad conforme perfil. SSD 512 GB, 16 GB RAM, Windows 11 Pro.",
                "cat": "notebook",
                "provider": "Catálogo TI",
                "status": "disponivel",
                "featured": true
        },
        {
                "title": "Monitor adicional",
                "desc": "Monitor 24\" Full HD para estações fixas. Sujeito à aprovação do gestor direto.",
                "cat": "periferico",
                "provider": "Logitech/Dell",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Teclado e mouse",
                "desc": "Kit ergonômico sem fio para home office ou substituição por desgaste.",
                "cat": "periferico",
                "provider": "Logitech",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Headset",
                "desc": "Headset com cancelamento de ruído para reuniões e atendimento.",
                "cat": "acessorio",
                "provider": "Jabra",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Celular corporativo",
                "desc": "Aparelho + linha para cargos com mobilidade externa ou plantão.",
                "cat": "mobilidade",
                "provider": "Política TI",
                "status": "sob_analise",
                "featured": false
        },
        {
                "title": "Dock station",
                "desc": "Estação de acoplamento USB-C para conectar notebook a monitores e rede.",
                "cat": "acessorio",
                "provider": "Dell/CalDigit",
                "status": "disponivel",
                "featured": false
        }
];
      const statusLabels = {"disponivel": "Disponível", "sob_analise": "Sob análise", "indisponivel": "Indisponível"};

      function renderItem(item) {
        const featuredClass = item.featured ? " is-featured" : "";
        const statusClass = " benefit-card__status--" + item.status;
        const catBadgeClass = " benefit-card__cat--" + item.cat;
        return `
          <article class="benefit-card${featuredClass}" data-cat="${item.cat}">
            <div class="benefit-card__head">
              <div class="benefit-card__icon benefit-card__icon--${item.cat}" aria-hidden="true">
                <i class="fa-solid ${catIcons[item.cat] || "fa-headset"}"></i>
              </div>
              <div class="benefit-card__main">
                <h2 class="benefit-card__title">${item.title}</h2>
                <p class="benefit-card__desc">${item.desc}</p>
              </div>
            </div>
            <div class="benefit-card__tags">
              <span class="benefit-card__cat${catBadgeClass}">${catLabels[item.cat] || item.cat}</span>
              <span class="benefit-card__status${statusClass}">${statusLabels[item.status] || item.status}</span>
            </div>
            <div class="benefit-card__meta">
              <span><i class="fa-solid fa-server" aria-hidden="true"></i> ${item.provider}</span>
            </div>
            <div class="benefit-card__footer">
              <a class="benefit-card__open" href="#"><i class="fa-regular fa-eye" aria-hidden="true"></i> Acessar</a>
              <div class="benefit-card__actions">
                <a class="benefit-card__btn" href="#" aria-label="Abrir ${item.title}"><i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></a>
                <a class="benefit-card__btn" href="#" aria-label="Salvar ${item.title}"><i class="fa-regular fa-bookmark" aria-hidden="true"></i></a>
              </div>
            </div>
          </article>`;
      }

      const root = document.getElementById("ti-equip-root");
      const countEl = document.getElementById("ti-equip-count");
      const filters = document.getElementById("ti-equip-filters");
      if (!root) return;
      root.innerHTML = items.map(renderItem).join("");

      function applyFilter(filter) {
        let visible = 0;
        root.querySelectorAll(".benefit-card").forEach(function (card) {
          const match = filter === "all" || card.getAttribute("data-cat") === filter;
          card.hidden = !match;
          if (match) visible += 1;
        });
        if (countEl) {
          countEl.textContent = "Exibindo " + visible + " item" + (visible === 1 ? "" : "s");
        }
      }

      applyFilter("all");
      if (filters) {
        filters.addEventListener("click", function (event) {
          const chip = event.target.closest(".filter-chip");
          if (!chip) return;
          filters.querySelectorAll(".filter-chip").forEach(function (btn) { btn.classList.remove("is-active"); });
          chip.classList.add("is-active");
          applyFilter(chip.getAttribute("data-filter") || "all");
        });
      }
    })();
