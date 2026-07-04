(function () {
      OrgProfileModal.init();
      const avatars = [
        "avatar-maria-silva.png",
        "avatar-carlos-mendes.png",
        "avatar-julia-santos.png",
        "avatar-rh.png",
        "avatar-marketing.png",
        "avatar-ti.png",
        "avatar-alejandro-lopez.png",
        "avatar-nexora-news.png"
      ];

      const deptColors = {
        Executiva: { fill: "#f5f3ff", stroke: "#a78bfa", badge: "#ede9fe", text: "#6d28d9" },
        Produto: { fill: "#eff6ff", stroke: "#93c5fd", badge: "#dbeafe", text: "#1d4ed8" },
        "Recursos Humanos": { fill: "#fdf2f8", stroke: "#f9a8d4", badge: "#fce7f3", text: "#be185d" },
        Marketing: { fill: "#f0fdf4", stroke: "#86efac", badge: "#dcfce7", text: "#15803d" },
        TI: { fill: "#ecfeff", stroke: "#67e8f9", badge: "#cffafe", text: "#0e7490" },
        Comercial: { fill: "#fff7ed", stroke: "#fdba74", badge: "#ffedd5", text: "#c2410c" },
        Financeiro: { fill: "#fffbeb", stroke: "#fcd34d", badge: "#fef3c7", text: "#b45309" }
      };

      const ceo = {
        name: "Júlio Schwartzman",
        role: "CEO · Diretoria Executiva",
        avatar: "avatar-julio-schwartzman.png"
      };

      const branches = [
        {
          id: "produto",
          dept: "Produto",
          director: { name: "Carlos Mendes", role: "Diretor de Produto", avatar: "avatar-carlos-mendes.png" },
          team: [
            { name: "Maria Silva", role: "Gerente de Projetos" },
            { name: "Ricardo Souza", role: "Product Owner" },
            { name: "Julia Santos", role: "Designer de Produto" }
          ]
        },
        {
          id: "rh",
          dept: "Recursos Humanos",
          director: { name: "Patricia Nunes", role: "Coordenadora de RH", avatar: "avatar-rh.png" },
          team: [
            { name: "Renata Gomes", role: "Analista de RH" },
            { name: "Helena Prado", role: "Business Partner" },
            { name: "Diego Martins", role: "Recrutador" }
          ]
        },
        {
          id: "marketing",
          dept: "Marketing",
          director: { name: "Camila Rocha", role: "Coord. de Comunicação", avatar: "avatar-marketing.png" },
          team: [
            { name: "Fernanda Lima", role: "Analista de Marketing" },
            { name: "Thiago Barros", role: "Designer Gráfico" },
            { name: "Simone Alves", role: "Analista de Conteúdo" }
          ]
        },
        {
          id: "ti",
          dept: "TI",
          director: { name: "Igor Martins", role: "Tech Lead", avatar: "avatar-ti.png" },
          team: [
            { name: "Tiago Nunes", role: "Desenvolvedor Frontend" },
            { name: "William Souza", role: "DevOps Engineer" },
            { name: "Rafael Costa", role: "Desenvolvedor Backend" }
          ]
        },
        {
          id: "comercial",
          dept: "Comercial",
          director: { name: "João Pereira", role: "Gerente Comercial", avatar: "avatar-nexora-news.png" },
          team: [
            { name: "Una Ferreira", role: "Executiva Comercial" },
            { name: "Xavier Dias", role: "SDR" },
            { name: "Lucas Ferreira", role: "Account Executive" }
          ]
        },
        {
          id: "financeiro",
          dept: "Financeiro",
          director: { name: "Marcos Vieira", role: "Gerente Financeiro", avatar: "avatar-maria-silva.png" },
          team: [
            { name: "Vicente Lima", role: "Analista Financeiro" },
            { name: "Natália Rocha", role: "Analista de Controladoria" },
            { name: "Bianca Alves", role: "Assistente Financeiro" }
          ]
        }
      ];

      let avatarIndex = 0;

      function nextAvatar() {
        const avatar = avatars[avatarIndex % avatars.length];
        avatarIndex += 1;
        return avatar;
      }

      function getDeptColors(dept) {
        return deptColors[dept] || deptColors.Executiva;
      }

      function buildOrgChartNodes(ceoData, branchList, avatarFn) {
        const nodes = [];
        let nextId = 1;

        const ceoId = nextId++;
        nodes.push({
          id: ceoId,
          slug: OrgProfileModal.slugifyName(ceoData.name),
          name: ceoData.name,
          title: ceoData.role,
          img: ceoData.avatar,
          dept: "Executiva",
          tags: ["ceo"],
          profile: OrgProfileModal.buildProfileExtras(ceoData.name, "Executiva")
        });

        branchList.forEach(function (branch) {
          const directorId = nextId++;
          nodes.push({
            id: directorId,
            slug: OrgProfileModal.slugifyName(branch.director.name),
            pid: ceoId,
            name: branch.director.name,
            title: branch.director.role,
            img: branch.director.avatar,
            dept: branch.dept,
            tags: ["director"],
            profile: OrgProfileModal.buildProfileExtras(branch.director.name, branch.dept)
          });

          branch.team.forEach(function (member) {
            nodes.push({
              id: nextId++,
              slug: OrgProfileModal.slugifyName(member.name),
              pid: directorId,
              name: member.name,
              title: member.role,
              img: member.avatar || avatarFn(),
              dept: branch.dept,
              tags: ["member"],
              profile: OrgProfileModal.buildProfileExtras(member.name, branch.dept)
            });
          });
        });

        return nodes;
      }

      function getCardLayout(node) {
        const contentH = 108;
        const top = Math.max(8, Math.round((node.h - contentH) / 2));
        const cx = node.w / 2;
        return {
          top: top,
          cx: cx,
          imgY: top,
          imgCy: top + 26,
          nameY: top + 62,
          titleY: top + 78,
          badgeY: top + 88,
          badgeTextY: top + 103
        };
      }

      function setupLioTemplate() {
        OrgChart.templates.lio = Object.assign({}, OrgChart.templates.ana);
        OrgChart.templates.lio.size = [220, 168];
        OrgChart.templates.lio.expandCollapseSize = 28;

        OrgChart.templates.lio.node = function (node, data) {
          const colors = getDeptColors(data.dept);
          return (
            '<rect x="0" y="0" height="' + node.h + '" width="' + node.w +
            '" fill="' + colors.fill + '" stroke-width="1.5" stroke="' + colors.stroke +
            '" rx="10" ry="10"></rect>' +
            '<g class="lio-node-menu-btn" style="cursor:pointer;" transform="matrix(1,0,0,1,' + (node.w - 22) + ', 10)" data-lio-node-menu="' + node.id + '" aria-label="Ações">' +
            '<rect x="-4" y="-2" width="22" height="16" rx="6" fill="#ffffff" fill-opacity="0.9"></rect>' +
            '<circle cx="2" cy="6" r="1.7" fill="' + colors.text + '"></circle>' +
            '<circle cx="8" cy="6" r="1.7" fill="' + colors.text + '"></circle>' +
            '<circle cx="14" cy="6" r="1.7" fill="' + colors.text + '"></circle>' +
            '</g>'
          );
        };

        OrgChart.templates.lio.img_0 = function (node, data, template, config, value) {
          const colors = getDeptColors(data.dept);
          const layout = getCardLayout(node);
          const r = 26;
          const clipId = "lioClip" + node.id;
          return (
            '<clipPath id="' + clipId + '"><circle cx="' + layout.cx + '" cy="' + layout.imgCy + '" r="' + r + '"></circle></clipPath>' +
            '<image preserveAspectRatio="xMidYMid slice" clip-path="url(#' + clipId + ')" ' +
            'xlink:href="' + value + '" x="' + (layout.cx - r) + '" y="' + layout.imgY + '" width="' + (r * 2) + '" height="' + (r * 2) + '"></image>' +
            '<circle cx="' + layout.cx + '" cy="' + layout.imgCy + '" r="' + r + '" fill="none" stroke="' + colors.stroke + '" stroke-width="2.5"></circle>'
          );
        };

        OrgChart.templates.lio.field_0 = function (node, data, template, config, value) {
          const layout = getCardLayout(node);
          return (
            '<text data-width="' + (node.w - 20) + '" data-text-overflow="multiline" ' +
            'style="font-size:15px;font-weight:700;" fill="#1e293b" stroke="#ffffff" stroke-width="2.5" ' +
            'paint-order="stroke fill" stroke-linejoin="round" x="' + layout.cx + '" y="' + layout.nameY + '" text-anchor="middle">' + value + '</text>'
          );
        };

        OrgChart.templates.lio.field_1 = function (node, data, template, config, value) {
          const layout = getCardLayout(node);
          return (
            '<text data-width="' + (node.w - 20) + '" data-text-overflow="multiline" style="font-size:12px;" ' +
            'fill="#4a5568" x="' + layout.cx + '" y="' + layout.titleY + '" text-anchor="middle">' + value + '</text>'
          );
        };

        OrgChart.templates.lio.field_2 = function (node, data, template, config, value) {
          const colors = getDeptColors(data.dept);
          const layout = getCardLayout(node);
          const badgeW = Math.min(node.w - 16, Math.max(104, String(value).length * 8 + 28));
          const badgeX = (node.w - badgeW) / 2;
          return (
            '<rect x="' + badgeX + '" y="' + layout.badgeY + '" width="' + badgeW + '" height="22" rx="11" ry="11" fill="' + colors.badge + '"></rect>' +
            '<text style="font-size:12px;font-weight:700;" fill="' + colors.text + '" x="' + layout.cx + '" y="' + layout.badgeTextY + '" text-anchor="middle">' + value + '</text>'
          );
        };

        OrgChart.templates.lio.plus = function (node, data, template, config, defaultPosition) {
          const colors = getDeptColors(data.dept);
          const count = node.deepCollapsedChildCount || node.childrenIds.length;
          return (
            '<g transform="matrix(1,0,0,1,' + (defaultPosition.x - 14) + ',' + (defaultPosition.y - 6) + ')">' +
            '<circle cx="14" cy="14" r="14" fill="#ffffff" stroke="' + colors.stroke + '" stroke-width="1.5"></circle>' +
            '<text text-anchor="middle" style="font-size:12px;font-weight:700;cursor:pointer;" fill="' + colors.text + '" x="14" y="18">' +
            count + '</text></g>'
          );
        };

        OrgChart.templates.lio.minus = function (node, data, template, config, defaultPosition) {
          const colors = getDeptColors(data.dept);
          return (
            '<g transform="matrix(1,0,0,1,' + (defaultPosition.x - 14) + ',' + (defaultPosition.y - 6) + ')">' +
            '<circle cx="14" cy="14" r="14" fill="#ffffff" stroke="' + colors.stroke + '" stroke-width="1.5"></circle>' +
            '<line x1="7" y1="14" x2="21" y2="14" stroke="' + colors.text + '" stroke-width="1.5"></line></g>'
          );
        };
      }

      let orgActionToastTimer;
      let activeMenuNodeId = null;

      function showOrgAction(message) {
        const toast = document.getElementById("org-action-toast");
        if (!toast) return;
        toast.textContent = message;
        toast.hidden = false;
        clearTimeout(orgActionToastTimer);
        orgActionToastTimer = setTimeout(function () {
          toast.hidden = true;
        }, 4000);
      }

      function handleOrgAction(nodeId, action, nodeIndex) {
        const person = nodeIndex[nodeId] || nodeIndex[String(nodeId)] || nodeIndex[Number(nodeId)];
        if (!person) return;

        if (action === "perfil") {
          OrgProfileModal.open(person, nodeIndex, function (p) {
            showOrgAction("Mensagem para " + p.name + " — chat interno em breve.");
          });
          return;
        }

        if (action === "ferias") {
          showOrgAction("Solicitar férias para " + person.name + " — fluxo em breve no módulo de RH.");
          return;
        }

        if (action === "promover") {
          showOrgAction("Promover " + person.name + " — fluxo em breve para gestores e RH.");
        }
      }

      function closeOrgNodeMenu() {
        const menu = document.getElementById("org-node-menu");
        if (menu) menu.hidden = true;
        activeMenuNodeId = null;
      }

      function openOrgNodeMenu(nodeId, anchorEl) {
        const menu = document.getElementById("org-node-menu");
        if (!menu || !anchorEl) return;

        const rect = anchorEl.getBoundingClientRect();
        menu.hidden = false;
        activeMenuNodeId = nodeId;

        const menuWidth = menu.offsetWidth || 196;
        let left = rect.right - menuWidth;
        let top = rect.bottom + 6;

        if (left < 12) left = 12;
        if (top + menu.offsetHeight > window.innerHeight - 12) {
          top = rect.top - menu.offsetHeight - 6;
        }

        menu.style.left = left + "px";
        menu.style.top = top + "px";
      }

      function findMenuButton(el) {
        while (el && el !== treeEl) {
          if (el.getAttribute && el.getAttribute("data-lio-node-menu")) return el;
          el = el.parentNode;
        }
        return null;
      }

      function getFocusSlug() {
        return new URLSearchParams(window.location.search).get("focus");
      }

      function focusOrgChartNode(slug) {
        if (!slug || !chart) return;
        const target = nodes.find(function (node) {
          return node.slug === slug;
        });
        if (!target) return;
        chart.expand(target.id, target.id, function () {
          chart.center(target.id);
        });
      }

      function setupOrgNodeMenu(nodeIndex) {
        const menu = document.getElementById("org-node-menu");
        if (!menu) return;

        treeEl.addEventListener("click", function (event) {
          const menuBtn = findMenuButton(event.target);
          if (menuBtn) {
            event.stopPropagation();
            const nodeId = menuBtn.getAttribute("data-lio-node-menu");
            if (activeMenuNodeId === nodeId && !menu.hidden) {
              closeOrgNodeMenu();
            } else {
              openOrgNodeMenu(nodeId, menuBtn);
            }
            return;
          }

          if (!event.target.closest("#org-node-menu")) {
            closeOrgNodeMenu();
          }
        });

        menu.addEventListener("click", function (event) {
          const item = event.target.closest("[data-action]");
          if (!item || activeMenuNodeId === null) return;
          handleOrgAction(activeMenuNodeId, item.getAttribute("data-action"), nodeIndex);
          closeOrgNodeMenu();
        });

        document.addEventListener("keydown", function (event) {
          if (event.key === "Escape") closeOrgNodeMenu();
        });
      }

      const treeEl = document.getElementById("org-tree");
      const countEl = document.getElementById("org-count");

      if (!treeEl || typeof OrgChart === "undefined") return;

      setupLioTemplate();

      const nodes = buildOrgChartNodes(ceo, branches, nextAvatar);
      const nodeIndex = {};

      nodes.forEach(function (node) {
        nodeIndex[node.id] = node;
      });

      const chart = new OrgChart(treeEl, {
        template: "lio",
        collapse: { level: 2, allChildren: true },
        nodeBinding: {
          field_0: "name",
          field_1: "title",
          field_2: "dept",
          img_0: "img"
        }
      });

      setupOrgNodeMenu(nodeIndex);

      chart.onInit(function () {
        if (countEl) {
          countEl.textContent =
            nodes.length + " colaboradores · 6 áreas · clique nos números abaixo dos diretores para expandir os times";
        }
        const focusSlug = getFocusSlug();
        if (focusSlug) {
          focusOrgChartNode(focusSlug);
        }
      });

      chart.load(nodes);
    })();