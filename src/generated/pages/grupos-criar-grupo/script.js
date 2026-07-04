(function () {
      const nameInput = document.getElementById("group-name");
      const descInput = document.getElementById("group-desc");
      const previewName = document.getElementById("preview-name");
      const previewDesc = document.getElementById("preview-desc");
      const previewType = document.getElementById("preview-type");
      const previewAccess = document.getElementById("preview-access");
      const previewIcon = document.getElementById("preview-icon");
      const form = document.getElementById("create-group-form");

      const groupIcons = [
        { icon: "fa-users", label: "Usuários" },
        { icon: "fa-user-group", label: "Grupo" },
        { icon: "fa-people-group", label: "Pessoas" },
        { icon: "fa-people-line", label: "Equipe" },
        { icon: "fa-people-roof", label: "Comunidade" },
        { icon: "fa-user-plus", label: "Convite" },
        { icon: "fa-handshake", label: "Parceria" },
        { icon: "fa-building", label: "Empresa" },
        { icon: "fa-briefcase", label: "Negócios" },
        { icon: "fa-sitemap", label: "Estrutura" },
        { icon: "fa-diagram-project", label: "Projeto" },
        { icon: "fa-tasks", label: "Tarefas" },
        { icon: "fa-clipboard-list", label: "Checklist" },
        { icon: "fa-lightbulb", label: "Ideia" },
        { icon: "fa-rocket", label: "Lançamento" },
        { icon: "fa-star", label: "Destaque" },
        { icon: "fa-trophy", label: "Conquista" },
        { icon: "fa-bullseye", label: "Meta" },
        { icon: "fa-chart-line", label: "Crescimento" },
        { icon: "fa-chart-pie", label: "Indicadores" },
        { icon: "fa-chart-bar", label: "Relatórios" },
        { icon: "fa-code", label: "Código" },
        { icon: "fa-laptop-code", label: "Desenvolvimento" },
        { icon: "fa-microchip", label: "Tecnologia" },
        { icon: "fa-server", label: "Infraestrutura" },
        { icon: "fa-database", label: "Dados" },
        { icon: "fa-cloud", label: "Cloud" },
        { icon: "fa-shield-halved", label: "Segurança" },
        { icon: "fa-lock", label: "Privacidade" },
        { icon: "fa-comments", label: "Discussão" },
        { icon: "fa-message", label: "Mensagens" },
        { icon: "fa-bullhorn", label: "Comunicação" },
        { icon: "fa-envelope", label: "E-mail" },
        { icon: "fa-share-nodes", label: "Compartilhar" },
        { icon: "fa-book", label: "Conhecimento" },
        { icon: "fa-book-open", label: "Leitura" },
        { icon: "fa-graduation-cap", label: "Aprendizado" },
        { icon: "fa-chalkboard-user", label: "Treinamento" },
        { icon: "fa-palette", label: "Design" },
        { icon: "fa-pen-nib", label: "Conteúdo" },
        { icon: "fa-camera", label: "Fotografia" },
        { icon: "fa-video", label: "Vídeo" },
        { icon: "fa-microphone", label: "Podcast" },
        { icon: "fa-heart", label: "Interesse" },
        { icon: "fa-heart-pulse", label: "Saúde" },
        { icon: "fa-dumbbell", label: "Esporte" },
        { icon: "fa-leaf", label: "Sustentabilidade" },
        { icon: "fa-seedling", label: "ESG" },
        { icon: "fa-calendar", label: "Eventos" },
        { icon: "fa-gift", label: "Celebração" },
        { icon: "fa-cake-candles", label: "Aniversário" },
        { icon: "fa-music", label: "Música" },
        { icon: "fa-gamepad", label: "Games" },
        { icon: "fa-futbol", label: "Futebol" },
        { icon: "fa-globe", label: "Global" },
        { icon: "fa-compass", label: "Exploração" },
        { icon: "fa-map", label: "Local" },
        { icon: "fa-flag", label: "Iniciativa" },
        { icon: "fa-wrench", label: "Operações" },
        { icon: "fa-gear", label: "Configuração" },
        { icon: "fa-puzzle-piece", label: "Integração" },
        { icon: "fa-cubes", label: "Módulos" },
        { icon: "fa-layer-group", label: "Camadas" },
        { icon: "fa-infinity", label: "Contínuo" },
        { icon: "fa-bolt", label: "Agilidade" },
        { icon: "fa-fire", label: "Engajamento" },
        { icon: "fa-gem", label: "Premium" },
        { icon: "fa-hand-holding-heart", label: "Voluntariado" },
        { icon: "fa-scale-balanced", label: "Compliance" },
        { icon: "fa-truck", label: "Logística" },
        { icon: "fa-store", label: "Varejo" },
        { icon: "fa-cart-shopping", label: "Comercial" },
        { icon: "fa-headset", label: "Suporte" },
        { icon: "fa-mug-hot", label: "Informal" },
        { icon: "fa-mountain-sun", label: "Outdoor" },
        { icon: "fa-plane", label: "Viagens" },
        { icon: "fa-car", label: "Mobilidade" },
        { icon: "fa-house", label: "Home office" },
        { icon: "fa-bell", label: "Alertas" },
        { icon: "fa-bookmark", label: "Favoritos" },
        { icon: "fa-thumbs-up", label: "Reconhecimento" },
        { icon: "fa-circle-nodes", label: "Rede" },
        { icon: "fa-network-wired", label: "Conexões" },
        { icon: "fa-flask", label: "Laboratório" },
        { icon: "fa-vial", label: "Pesquisa" },
        { icon: "fa-stethoscope", label: "Bem-estar" },
        { icon: "fa-spa", label: "Relaxamento" },
        { icon: "fa-paw", label: "Pets" },
        { icon: "fa-child", label: "Família" },
        { icon: "fa-language", label: "Idiomas" },
        { icon: "fa-earth-americas", label: "Américas" },
        { icon: "fa-hourglass-half", label: "Tempo" },
        { icon: "fa-recycle", label: "Reciclagem" }
      ];

      function renderIconPicker() {
        const picker = document.getElementById("icon-picker");
        if (!picker) return;

        picker.innerHTML = groupIcons.map(function (item, index) {
          const selected = index === 0 ? " is-selected" : "";
          return (
            '<button class="icon-picker__btn' + selected + '" type="button" data-icon="' + item.icon + '" aria-label="' + item.label + '">' +
            '<i class="fa-solid ' + item.icon + '" aria-hidden="true"></i></button>'
          );
        }).join("");
      }

      renderIconPicker();

      function setupOptionGroup(container, attrName, onSelect) {
        if (!container) return;

        container.addEventListener("click", function (event) {
          const option = event.target.closest("[data-" + attrName + "]");
          if (!option) return;

          container.querySelectorAll(".option-card, .icon-picker__btn").forEach(function (btn) {
            btn.classList.remove("is-selected");
          });
          option.classList.add("is-selected");
          onSelect(option);
        });
      }

      function updatePreview() {
        if (previewName) {
          previewName.textContent = nameInput && nameInput.value.trim()
            ? nameInput.value.trim()
            : "Nome do grupo";
        }
        if (previewDesc) {
          previewDesc.textContent = descInput && descInput.value.trim()
            ? descInput.value.trim()
            : "A descrição aparecerá aqui conforme você preenche o formulário.";
        }
      }

      if (nameInput) nameInput.addEventListener("input", updatePreview);
      if (descInput) descInput.addEventListener("input", updatePreview);

      setupOptionGroup(document.getElementById("type-options"), "type", function (option) {
        if (previewType) previewType.textContent = option.getAttribute("data-label") || "Departamental";
      });

      setupOptionGroup(document.getElementById("access-options"), "access", function (option) {
        if (previewAccess) previewAccess.textContent = option.getAttribute("data-label") || "Aberto";
      });

      setupOptionGroup(document.getElementById("icon-picker"), "icon", function (option) {
        const iconClass = option.getAttribute("data-icon") || "fa-users";
        if (previewIcon) previewIcon.innerHTML = '<i class="fa-solid ' + iconClass + '" aria-hidden="true"></i>';
      });

      if (form) {
        form.addEventListener("submit", function (event) {
          event.preventDefault();
        });
      }

      updatePreview();
    })();