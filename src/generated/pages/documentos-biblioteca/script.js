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

      function renderItem(item) {
        const featuredClass = item.featured ? " is-featured" : "";
        const mediaClass = item.media === "video" ? "video" : item.media === "case" ? "case" : item.media === "acervo" ? "acervo" : item.media === "artigo" ? "artigo" : "ebook";
        const mediaBadgeClass = item.media === "video" ? " doc-card__media--video" : item.media === "case" ? " doc-card__media--case" : item.media === "acervo" ? " doc-card__media--acervo" : "";
        const curatedBadge = item.curated ? '<span class="doc-card__updated">Curado</span>' : "";
        const primaryLabel = item.media === "video" ? "Assistir" : item.media === "acervo" ? "Explorar" : "Acessar";
        const primaryIcon = item.media === "video" ? "fa-play" : item.media === "acervo" ? "fa-folder-open" : "fa-book-open";

        return `
          <article class="doc-card${featuredClass}" data-area="${item.area}">
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
              <a class="doc-card__open" href="#"><i class="fa-solid ${primaryIcon}" aria-hidden="true"></i> ${primaryLabel}</a>
              <div class="doc-card__actions">
                <a class="doc-card__btn" href="#" aria-label="Salvar ${item.title}"><i class="fa-regular fa-bookmark" aria-hidden="true"></i></a>
                <a class="doc-card__btn" href="#" aria-label="Compartilhar ${item.title}"><i class="fa-solid fa-share-nodes" aria-hidden="true"></i></a>
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
    })();