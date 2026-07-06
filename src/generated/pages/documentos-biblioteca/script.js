(function () {
      const areaLabels = {
        conhecimento: "Conhecimento",
        historia: "História",
        marca: "Marca",
        treinamentos: "Treinamentos",
        cases: "Cases",
        publicacoes: "Publicações"
      };

      const mediaLabels = {
        ebook: "E-book",
        artigo: "Artigo",
        video: "Vídeo",
        case: "Case",
        publicacao: "Publicação",
        acervo: "Acervo"
      };

      const mediaIcons = {
        ebook: "fa-book-open",
        artigo: "fa-newspaper",
        video: "fa-circle-play",
        case: "fa-trophy",
        publicacao: "fa-book",
        acervo: "fa-images"
      };

      const items = [
        {
          id: "guia-cultura",
          title: "Guia de Cultura Organizacional Lio",
          desc: "E-book interativo com missão, visão, valores, comportamentos esperados e histórias que definem a identidade da companhia.",
          area: "conhecimento",
          media: "ebook",
          date: "Mar/2026",
          featured: true,
          curated: true
        },
        {
          id: "historia-30-anos",
          title: "História da Lio — 30 Anos de Trajetória",
          desc: "Linha do tempo ilustrada com marcos, fundadores, expansão e evolução dos negócios ao longo de três décadas.",
          area: "historia",
          media: "publicacao",
          date: "Jan/2026",
          featured: false,
          curated: true
        },
        {
          id: "identidade-visual",
          title: "Manual de Identidade Visual",
          desc: "Diretrizes oficiais de logo, cores, tipografia, aplicações e usos incorretos da marca Lio Tecnica.",
          area: "marca",
          media: "ebook",
          date: "Fev/2026",
          featured: false,
          curated: true
        },
        {
          id: "brandbook",
          title: "Brandbook Completo",
          desc: "Documento ampliado de posicionamento de marca, tom de voz, arquétipos e exemplos de comunicação institucional.",
          area: "marca",
          media: "ebook",
          date: "Nov/2025",
          featured: false,
          curated: false
        },
        {
          id: "case-rh-digital",
          title: "Case: Transformação Digital no RH",
          desc: "Estudo de caso sobre digitalização de processos de admissão, folha e gestão de pessoas com resultados mensuráveis.",
          area: "cases",
          media: "case",
          date: "Dez/2025",
          featured: false,
          curated: true
        },
        {
          id: "case-expansao",
          title: "Case: Expansão Comercial 2025",
          desc: "Relato da estratégia de crescimento regional, metas batidas, lições aprendidas e indicadores de performance.",
          area: "cases",
          media: "case",
          date: "Mar/2026",
          featured: false,
          curated: false
        },
        {
          id: "ebook-lideranca",
          title: "E-book: Liderança Colaborativa",
          desc: "Material de desenvolvimento sobre feedback, delegação, conversas difíceis e construção de times de alta performance.",
          area: "treinamentos",
          media: "ebook",
          date: "Out/2025",
          featured: false,
          curated: false
        },
        {
          id: "trilha-onboarding",
          title: "Trilha de Onboarding — Vídeos",
          desc: "Playlist com boas-vindas, tour virtual, apresentação das áreas e primeiros passos para novos colaboradores.",
          area: "treinamentos",
          media: "video",
          date: "Mar/2026",
          featured: false,
          curated: true
        },
        {
          id: "artigo-inovacao",
          title: "Artigo: Inovação e Sustentabilidade",
          desc: "Publicação interna sobre práticas ESG, projetos verdes e iniciativas de inovação aberta na Lio Tecnica.",
          area: "publicacoes",
          media: "artigo",
          date: "Fev/2026",
          featured: false,
          curated: false
        },
        {
          id: "revista-lioconecta",
          title: "Revista LioConnecta — Edição 12",
          desc: "Edição trimestral com entrevistas, destaques de colaboradores, novidades da empresa e agenda de eventos internos.",
          area: "publicacoes",
          media: "publicacao",
          date: "Mar/2026",
          featured: false,
          curated: true
        },
        {
          id: "fotos-institucionais",
          title: "Repositório de Fotos Institucionais",
          desc: "Banco de imagens oficiais de eventos, sede, equipes e campanhas internas para uso autorizado em materiais.",
          area: "marca",
          media: "acervo",
          date: "Jan/2026",
          featured: false,
          curated: false
        },
        {
          id: "apresentacoes-historicas",
          title: "Acervo de Apresentações Históricas",
          desc: "Coleção de decks estratégicos, resultados anuais e comunicados de liderança arquivados para consulta.",
          area: "historia",
          media: "acervo",
          date: "Ago/2025",
          featured: false,
          curated: false
        },
        {
          id: "icones-logos",
          title: "Biblioteca de Ícones e Logos",
          desc: "Download centralizado de logos, ícones, selos e variações aprovadas para apresentações e documentos internos.",
          area: "marca",
          media: "acervo",
          date: "Mar/2026",
          featured: false,
          curated: true
        },
        {
          id: "glossario",
          title: "Glossário Corporativo",
          desc: "Artigo de referência com siglas, termos técnicos, nomenclaturas de produtos e vocabulário usado na organização.",
          area: "conhecimento",
          media: "artigo",
          date: "Set/2025",
          featured: false,
          curated: false
        }
      ];

      function pdfUrl(id) {
        return "/documents/biblioteca/" + id + ".pdf";
      }

      function renderItem(item) {
        const featuredClass = item.featured ? " is-featured" : "";
        const mediaClass = item.media === "video" ? "video" : item.media === "case" ? "case" : item.media === "acervo" ? "acervo" : item.media === "artigo" ? "artigo" : "ebook";
        const mediaBadgeClass = item.media === "video" ? " doc-card__media--video" : item.media === "case" ? " doc-card__media--case" : item.media === "acervo" ? " doc-card__media--acervo" : "";
        const curatedBadge = item.curated ? '<span class="doc-card__updated">Curado</span>' : "";
        const primaryLabel = item.media === "video" ? "Assistir" : item.media === "acervo" ? "Explorar" : "Acessar";
        const primaryIcon = item.media === "video" ? "fa-play" : item.media === "acervo" ? "fa-folder-open" : "fa-book-open";
        const url = pdfUrl(item.id);

        return `
          <article class="doc-card${featuredClass}" data-area="${item.area}" data-id="${item.id}">
            <div class="doc-card__head">
              <div class="doc-card__icon doc-card__icon--${mediaClass}" aria-hidden="true">
                <i class="fa-solid ${mediaIcons[item.media] || "fa-book"}"></i>
              </div>
              <div class="doc-card__main">
                <h2 class="doc-card__title">${item.title}</h2>
                <p class="doc-card__desc">${item.desc}</p>
              </div>
            </div>
            <div class="doc-card__tags">
              <span class="doc-card__media${mediaBadgeClass}">${mediaLabels[item.media] || item.media}</span>
              <span class="doc-card__area doc-card__area--${item.area}">${areaLabels[item.area] || item.area}</span>
              ${curatedBadge}
            </div>
            <div class="doc-card__meta">
              <span><i class="fa-regular fa-calendar" aria-hidden="true"></i> Publicado ${item.date}</span>
            </div>
            <div class="doc-card__footer">
              <button type="button" class="doc-card__open" data-action="view"><i class="fa-solid ${primaryIcon}" aria-hidden="true"></i> ${primaryLabel}</button>
              <div class="doc-card__actions">
                <button type="button" class="doc-card__btn" data-action="view" aria-label="Visualizar ${item.title}"><i class="fa-regular fa-eye" aria-hidden="true"></i></button>
                <a class="doc-card__btn" href="${url}" download aria-label="Baixar ${item.title}"><i class="fa-solid fa-download" aria-hidden="true"></i></a>
                <a class="doc-card__btn" href="#" aria-label="Salvar ${item.title}"><i class="fa-regular fa-bookmark" aria-hidden="true"></i></a>
              </div>
            </div>
          </article>
        `;
      }

      const root = document.getElementById("library-root");
      const countEl = document.getElementById("library-count");
      const filters = document.getElementById("library-filters");

      if (!root) return;

      root.innerHTML = items.map(renderItem).join("");

      function applyFilter(filter) {
        let visible = 0;

        root.querySelectorAll(".doc-card").forEach(function (card) {
          const area = card.getAttribute("data-area");
          const match = filter === "all" || area === filter;

          card.hidden = !match;
          if (match) visible += 1;
        });

        if (countEl) {
          countEl.textContent = "Exibindo " + visible + " material" + (visible === 1 ? "" : "is");
        }
      }

      applyFilter("all");

      if (filters) {
        filters.addEventListener("click", function (event) {
          const chip = event.target.closest(".filter-chip");
          if (!chip) return;

          filters.querySelectorAll(".filter-chip").forEach(function (btn) {
            btn.classList.remove("is-active");
          });
          chip.classList.add("is-active");
          applyFilter(chip.getAttribute("data-filter") || "all");
        });
      }

      var modal = document.getElementById("library-pdf-modal");
      var modalTitle = document.getElementById("library-pdf-title");
      var modalMeta = document.getElementById("library-pdf-meta");
      var modalFrame = document.getElementById("library-pdf-frame");
      var modalDownload = document.getElementById("library-pdf-download");
      var modalCloseBtn = document.getElementById("library-pdf-close");

      function ensureModal() {
        if (modal) return;

        var wrapper = document.createElement("div");
        wrapper.id = "library-pdf-modal";
        wrapper.className = "library-pdf-modal";
        wrapper.hidden = true;
        wrapper.innerHTML =
          '<div class="library-pdf-modal__backdrop" data-close aria-hidden="true"></div>' +
          '<div class="library-pdf-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="library-pdf-title">' +
            '<header class="library-pdf-modal__header">' +
              '<div class="library-pdf-modal__header-text">' +
                '<h2 class="library-pdf-modal__title" id="library-pdf-title"></h2>' +
                '<p class="library-pdf-modal__meta" id="library-pdf-meta"></p>' +
              '</div>' +
              '<button type="button" class="library-pdf-modal__close" id="library-pdf-close" aria-label="Fechar visualizador">' +
                '<i class="fa-solid fa-xmark" aria-hidden="true"></i>' +
              '</button>' +
            '</header>' +
            '<iframe class="library-pdf-modal__frame" id="library-pdf-frame" title=""></iframe>' +
            '<footer class="library-pdf-modal__footer">' +
              '<a class="library-pdf-modal__download" id="library-pdf-download" href="#" download>' +
                '<i class="fa-solid fa-download" aria-hidden="true"></i> Baixar PDF' +
              '</a>' +
              '<button type="button" class="library-pdf-modal__btn-close" data-close>Fechar</button>' +
            '</footer>' +
          '</div>';

        document.body.appendChild(wrapper);
        modal = wrapper;
        modalTitle = document.getElementById("library-pdf-title");
        modalMeta = document.getElementById("library-pdf-meta");
        modalFrame = document.getElementById("library-pdf-frame");
        modalDownload = document.getElementById("library-pdf-download");
        modalCloseBtn = document.getElementById("library-pdf-close");

        modal.addEventListener("click", function (event) {
          if (event.target.closest("[data-close]")) {
            closeLibraryModal();
          }
        });

        document.addEventListener("keydown", function (event) {
          if (event.key === "Escape" && modal && !modal.hidden) {
            closeLibraryModal();
          }
        });
      }

      function findItem(id) {
        for (var i = 0; i < items.length; i += 1) {
          if (items[i].id === id) return items[i];
        }
        return null;
      }

      function openLibraryModal(id) {
        var item = findItem(id);
        if (!item) return;

        ensureModal();

        var url = pdfUrl(id);
        modalTitle.textContent = item.title;
        modalMeta.textContent =
          (mediaLabels[item.media] || item.media) + " · " +
          (areaLabels[item.area] || item.area) + " · Publicado " + item.date;
        modalFrame.title = item.title;
        modalFrame.src = url;
        modalDownload.href = url;
        modalDownload.setAttribute("download", item.id + ".pdf");

        modal.hidden = false;
        document.body.style.overflow = "hidden";
        modalCloseBtn.focus();
      }

      function closeLibraryModal() {
        if (!modal || modal.hidden) return;
        modal.hidden = true;
        modalFrame.removeAttribute("src");
        modalFrame.src = "about:blank";
        document.body.style.overflow = "";
      }

      root.addEventListener("click", function (event) {
        var viewBtn = event.target.closest("[data-action='view']");
        if (!viewBtn) return;

        var card = viewBtn.closest(".doc-card");
        if (!card) return;

        var id = card.getAttribute("data-id");
        if (!id) return;

        event.preventDefault();
        openLibraryModal(id);
      });
    })();