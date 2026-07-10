(function () {
      const catLabels = {
        "vpn": "VPN",
        "remoto": "Remoto",
        "doc": "Documentação"
};
      const catIcons = {
        "vpn": "fa-lock",
        "remoto": "fa-house-laptop",
        "doc": "fa-book"
};
      const items = [
        {
                "title": "Instalar VPN FortiClient",
                "desc": "Download, instalação e perfil de conexão para Windows e macOS.",
                "cat": "vpn",
                "provider": "Fortinet",
                "status": "disponivel",
                "featured": false,
                "actionLabel": "Solicitar"
        },
        {
                "title": "Reset senha VPN",
                "desc": "Redefinição de credenciais após bloqueio ou troca de dispositivo.",
                "cat": "vpn",
                "provider": "Self-service",
                "status": "disponivel",
                "featured": false,
                "actionLabel": "Solicitar"
        },
        {
                "title": "Acesso RDP / VDI",
                "desc": "Área de trabalho remota para sistemas que exigem ambiente corporativo.",
                "cat": "remoto",
                "provider": "VMware Horizon",
                "status": "sob_analise",
                "featured": false,
                "actionLabel": "Solicitar"
        },
        {
                "title": "Guia home office",
                "desc": "Checklist de segurança, ergonomia e conectividade para trabalho remoto.",
                "cat": "doc",
                "provider": "Wiki TI",
                "status": "disponivel",
                "featured": false,
                "actionLabel": "Visualizar"
        },
        {
                "title": "Política de acesso remoto",
                "desc": "Normas de uso, horários, MFA e responsabilidades do colaborador.",
                "cat": "doc",
                "provider": "Compliance",
                "status": "disponivel",
                "featured": false,
                "actionLabel": "Visualizar"
        },
        {
                "title": "Configurar MFA",
                "desc": "Ativação do Microsoft Authenticator para VPN, e-mail e sistemas críticos.",
                "cat": "vpn",
                "provider": "Microsoft",
                "status": "disponivel",
                "featured": false,
                "actionLabel": "Solicitar"
        }
];
      const statusLabels = {"disponivel": "Disponível", "sob_analise": "Sob análise", "indisponivel": "Indisponível"};

      function renderItem(item) {
        const featuredClass = item.featured ? " is-featured" : "";
        const statusClass = " benefit-card__status--" + item.status;
        const catBadgeClass = " benefit-card__cat--" + item.cat;
        const actionLabel = item.actionLabel || "Solicitar";
        const actionIcon = actionLabel === "Visualizar" ? "fa-regular fa-eye" : "fa-solid fa-paper-plane";
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
              <a class="benefit-card__open" href="#"><i class="${actionIcon}" aria-hidden="true"></i> ${actionLabel}</a>
            </div>
          </article>`;
      }

      const root = document.getElementById("ti-vpn-root");
      const countEl = document.getElementById("ti-vpn-count");
      const filters = document.getElementById("ti-vpn-filters");
      if (!root) return;
      root.innerHTML = items.map(renderItem).join("");

      function applyFilter(filter) {
        const query = (document.getElementById("ti-vpn-search")?.value || "").trim().toLowerCase();
        let visible = 0;
        root.querySelectorAll(".benefit-card").forEach(function (card) {
          const catMatch = filter === "all" || card.getAttribute("data-cat") === filter;
          const title = (card.querySelector(".benefit-card__title")?.textContent || "").toLowerCase();
          const desc = (card.querySelector(".benefit-card__desc")?.textContent || "").toLowerCase();
          const textMatch = !query || title.includes(query) || desc.includes(query);
          const match = catMatch && textMatch;
          card.hidden = !match;
          if (match) visible += 1;
        });
        if (countEl) {
          countEl.textContent = "Exibindo " + visible + " recurso" + (visible === 1 ? "" : "s");
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

      const searchInput = document.getElementById("ti-vpn-search");
      if (searchInput) {
        searchInput.addEventListener("input", function () {
          const active = filters ? filters.querySelector(".filter-chip.is-active") : null;
          applyFilter(active ? active.getAttribute("data-filter") || "all" : "all");
        });
      }
    })();
