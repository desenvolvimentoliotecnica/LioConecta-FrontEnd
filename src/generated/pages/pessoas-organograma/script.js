(function () {
      const orgBootId = (window.__lioOrgBootId = (window.__lioOrgBootId || 0) + 1);
      OrgProfileModal.init();
      const DEFAULT_ORG_FOCUS_SLUGS = ["julio", "julio-schwartzman"];
      /** >1 aproxima o card; <1 mostra mais contexto ao redor do nó focado. */
      const ORG_FOCUS_ZOOM = 0.65;
      const ORG_FOCUS_TOP_PAD = 36;
      const ORG_FOCUS_PAD_X = 180;
      const ORG_FOCUS_PAD_Y = 160;

      const deptColors = {
        Executiva: { fill: "#f5f3ff", stroke: "#a78bfa", badge: "#ede9fe", text: "#6d28d9" },
        Diretoria: { fill: "#f5f3ff", stroke: "#a78bfa", badge: "#ede9fe", text: "#6d28d9" },
        Administrativo: { fill: "#f8fafc", stroke: "#94a3b8", badge: "#f1f5f9", text: "#475569" },
        Produto: { fill: "#eff6ff", stroke: "#93c5fd", badge: "#dbeafe", text: "#1d4ed8" },
        "Recursos Humanos": { fill: "#fdf2f8", stroke: "#f9a8d4", badge: "#fce7f3", text: "#be185d" },
        Marketing: { fill: "#f0fdf4", stroke: "#86efac", badge: "#dcfce7", text: "#15803d" },
        TI: { fill: "#ecfeff", stroke: "#67e8f9", badge: "#cffafe", text: "#0e7490" },
        Comercial: { fill: "#fff7ed", stroke: "#fdba74", badge: "#ffedd5", text: "#c2410c" },
        Financeiro: { fill: "#fffbeb", stroke: "#fcd34d", badge: "#fef3c7", text: "#b45309" }
      };

      const deptPaletteAliases = {
        diretoria: "Diretoria",
        administrativo: "Administrativo",
        financeiro: "Financeiro",
        comercial: "Comercial",
        marketing: "Marketing",
        produto: "Produto",
        ti: "TI",
        tecnologia: "TI",
        rh: "Recursos Humanos",
        "recursos humanos": "Recursos Humanos",
        executiva: "Executiva"
      };

      function resolveDeptPaletteKey(dept) {
        const base = String(dept || "")
          .split(" · ")[0]
          .trim();
        if (!base) return "Executiva";
        if (deptColors[base]) return base;

        const normalized = base.toLowerCase();
        if (deptPaletteAliases[normalized]) return deptPaletteAliases[normalized];

        for (const key of Object.keys(deptColors)) {
          if (normalized.indexOf(key.toLowerCase()) >= 0) return key;
        }
        for (const alias of Object.keys(deptPaletteAliases)) {
          if (normalized.indexOf(alias) >= 0) return deptPaletteAliases[alias];
        }
        return "Executiva";
      }

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

      function resolvePhotoUrl(url) {
        if (!url || !String(url).trim()) return "";
        const trimmed = String(url).trim();
        if (/^(https?:|data:|blob:)/i.test(trimmed)) return trimmed;
        return trimmed.startsWith("/") ? trimmed : "/" + trimmed;
      }

      function renderOrgNodeAvatar(node, data) {
        const colors = getDeptColors(data.dept);
        const layout = getCardLayout(node, data);
        const r = 26;
        const clipId = "lioClip" + node.id;
        const placeholderId = "lioAvatarPh" + node.id;
        const photo = data.img ? String(data.img).trim() : "";

        if (!photo) {
          return renderOrgAvatarPlaceholder(layout, colors, r, placeholderId, false);
        }

        const safePhoto = String(photo).replace(/"/g, "&quot;");
        return (
          renderOrgAvatarPlaceholder(layout, colors, r, placeholderId, true) +
          '<clipPath id="' + clipId + '"><circle cx="' + layout.cx + '" cy="' + layout.imgCy + '" r="' + r + '"></circle></clipPath>' +
          '<image preserveAspectRatio="xMidYMid slice" clip-path="url(#' + clipId + ')" ' +
          'xlink:href="' + safePhoto + '" href="' + safePhoto + '" x="' + (layout.cx - r) + '" y="' + layout.imgY + '" width="' + (r * 2) + '" height="' + (r * 2) + '" ' +
          'onload="var p=document.getElementById(\'' + placeholderId + '\');if(p){p.setAttribute(\'visibility\',\'hidden\');}" ' +
          'onerror="this.setAttribute(\'visibility\',\'hidden\');var p=document.getElementById(\'' + placeholderId + '\');if(p){p.removeAttribute(\'visibility\');}" />' +
          '<circle cx="' + layout.cx + '" cy="' + layout.imgCy + '" r="' + r + '" fill="none" stroke="' + colors.stroke + '" stroke-width="2.5"></circle>'
        );
      }

      function renderOrgAvatarPlaceholder(layout, colors, r, id, hidden) {
        const size = r * 2;
        const x = layout.cx - r;
        const y = layout.imgY;
        const visibility = hidden ? ' visibility="hidden"' : "";
        return (
          '<g id="' + id + '"' + visibility + ">" +
          '<circle cx="' + layout.cx + '" cy="' + layout.imgCy + '" r="' + r + '" fill="' + colors.badge + '"></circle>' +
          '<foreignObject x="' + x + '" y="' + y + '" width="' + size + '" height="' + size + '">' +
          '<div xmlns="http://www.w3.org/1999/xhtml" class="lio-node-avatar-placeholder">' +
          '<i class="fa-solid fa-user" aria-hidden="true"></i></div></foreignObject>' +
          '<circle cx="' + layout.cx + '" cy="' + layout.imgCy + '" r="' + r + '" fill="none" stroke="' + colors.stroke + '" stroke-width="2.5"></circle>' +
          "</g>"
        );
      }

      function renderUnassignedAvatarMarkup(photoUrlValue) {
        const src = resolvePhotoUrl(photoUrlValue);
        if (!src) {
          return (
            '<span class="org-unassigned__avatar org-unassigned__avatar--placeholder" aria-hidden="true">' +
            '<i class="fa-solid fa-user"></i></span>'
          );
        }
        return (
          '<img class="org-unassigned__avatar" src="' +
          escapeAttr(src) +
          '" alt="" loading="lazy" data-org-avatar-img />'
        );
      }

      function bindUnassignedAvatarFallbacks(root) {
        if (!root) return;
        root.querySelectorAll("img[data-org-avatar-img]").forEach(function (img) {
          if (img.dataset.fallbackBound === "1") return;
          img.dataset.fallbackBound = "1";
          img.addEventListener("error", function () {
            const placeholder = document.createElement("span");
            placeholder.className = "org-unassigned__avatar org-unassigned__avatar--placeholder";
            placeholder.setAttribute("aria-hidden", "true");
            placeholder.innerHTML = '<i class="fa-solid fa-user"></i>';
            img.replaceWith(placeholder);
          });
        });
      }

      function localAvatarUrl(file) {
        if (!file) return "";
        return file.startsWith("/") ? file : "/" + file;
      }

      function getDeptColors(dept) {
        return deptColors[resolveDeptPaletteKey(dept)] || deptColors.Executiva;
      }

      const ORG_CARD_WIDTH = 268;
      const ORG_CARD_HEIGHT = 184;
      const ORG_CARD_TEXT_PAD = 24;

      function orgTextWidth(node) {
        return Math.max(120, node.w - ORG_CARD_TEXT_PAD);
      }

      function escapeXmlText(value) {
        return String(value || "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;");
      }

      var orgTextMeasureCanvas;

      function measureOrgText(text, fontSize, fontWeight) {
        if (!orgTextMeasureCanvas) {
          orgTextMeasureCanvas = document.createElement("canvas");
        }
        const ctx = orgTextMeasureCanvas.getContext("2d");
        ctx.font = (fontWeight || 400) + " " + fontSize + "px system-ui, -apple-system, sans-serif";
        return ctx.measureText(text).width;
      }

      function truncateOrgTextWithEllipsis(text, maxWidth, fontSize, fontWeight) {
        const src = String(text || "");
        if (!src) return "";
        if (measureOrgText(src, fontSize, fontWeight) <= maxWidth) return src;
        const ellipsis = "…";
        let out = src;
        while (out.length > 1 && measureOrgText(out + ellipsis, fontSize, fontWeight) > maxWidth) {
          out = out.slice(0, -1);
        }
        return out + ellipsis;
      }

      function wrapOrgTextLines(text, maxWidth, maxLines, fontSize, fontWeight) {
        const words = String(text || "").trim().split(/\s+/).filter(Boolean);
        if (!words.length) return [];

        const lines = [];
        let line = "";

        for (let wi = 0; wi < words.length; wi++) {
          const word = words[wi];
          const candidate = line ? line + " " + word : word;

          if (measureOrgText(candidate, fontSize, fontWeight) <= maxWidth) {
            line = candidate;
            continue;
          }

          if (line) {
            lines.push(line);
            line = word;
            if (lines.length >= maxLines) {
              let rest = word;
              for (let j = wi + 1; j < words.length; j++) rest += " " + words[j];
              lines[maxLines - 1] = truncateOrgTextWithEllipsis(
                lines[maxLines - 1] + " " + rest,
                maxWidth,
                fontSize,
                fontWeight
              );
              return lines.slice(0, maxLines);
            }
          } else {
            lines.push(truncateOrgTextWithEllipsis(word, maxWidth, fontSize, fontWeight));
            line = "";
            if (lines.length >= maxLines) return lines.slice(0, maxLines);
          }
        }

        if (line) {
          if (lines.length < maxLines) {
            lines.push(line);
          } else {
            lines[maxLines - 1] = truncateOrgTextWithEllipsis(
              lines[maxLines - 1] + " " + line,
              maxWidth,
              fontSize,
              fontWeight
            );
          }
        }

        return lines.slice(0, maxLines);
      }

      function renderOrgSvgText(value, opts) {
        const text = String(value || "");
        if (!text) return "";

        const fontSize = opts.fontSize || 13;
        const fontWeight = opts.fontWeight || 400;
        const maxWidth = opts.maxWidth || 200;
        const maxLines = opts.maxLines || 1;
        const x = opts.x;
        const y = opts.y;
        const fill = opts.fill || "#4a5568";
        const lineHeight = opts.lineHeight || Math.ceil(fontSize * 1.2);
        const styleParts = ["font-size:" + fontSize + "px"];
        if (fontWeight) styleParts.push("font-weight:" + fontWeight);
        const strokeBits = opts.stroke
          ? ' stroke="' + opts.stroke + '" stroke-width="' + (opts.strokeWidth || 2.5) +
            '" paint-order="stroke fill" stroke-linejoin="round"'
          : "";
        const baseTemplate =
          '<text style="' + styleParts.join(";") + ';" fill="' + fill + '"' + strokeBits +
          ' x="' + x + '" y="' + y + '" text-anchor="middle"></text>';

        if (typeof OrgChart !== "undefined" && typeof OrgChart.wrapText === "function") {
          try {
            const wrapped = OrgChart.wrapText(text, baseTemplate, maxWidth, maxLines);
            if (wrapped) return wrapped;
          } catch (e) {}
        }

        const lines = maxLines === 1
          ? [truncateOrgTextWithEllipsis(text, maxWidth, fontSize, fontWeight)]
          : wrapOrgTextLines(text, maxWidth, maxLines, fontSize, fontWeight);
        if (!lines.length) return "";

        let svg = baseTemplate.replace(/<\/text>$/, ">");
        lines.forEach(function (line, index) {
          svg += '<tspan x="' + x + '" dy="' + (index === 0 ? 0 : lineHeight) + '">' +
            escapeXmlText(line) + "</tspan>";
        });
        svg += "</text>";
        return svg;
      }

      function isJulioSchwartzmanNode(data) {
        const slug = normalizeSlugKey(data && data.slug);
        if (slug === "julio" || slug === "julio-schwartzman") return true;
        const name = String((data && data.name) || "").toUpperCase();
        return name.indexOf("JULIO") >= 0 && name.indexOf("SCHWARTZMAN") >= 0;
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
          img: localAvatarUrl(ceoData.avatar),
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
            img: localAvatarUrl(branch.director.avatar),
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
              img: localAvatarUrl(member.avatar || avatarFn()),
              dept: branch.dept,
              tags: ["member"],
              profile: OrgProfileModal.buildProfileExtras(member.name, branch.dept)
            });
          });
        });

        return nodes;
      }

      function getCardLayout(node, data) {
        const isJulio = isJulioSchwartzmanNode(data);
        const contentH = isJulio ? 88 : 116;
        const top = Math.max(8, Math.round((node.h - contentH) / 2));
        const cx = node.w / 2;
        return {
          top: top,
          cx: cx,
          imgY: top,
          imgCy: top + 26,
          nameY: top + (isJulio ? 58 : 60),
          titleY: top + (isJulio ? 76 : 76),
          badgeY: top + 92,
          badgeTextY: top + 107
        };
      }

      function patchOrgChartCommunityStubs() {
        if (!window.OrgChart || OrgChart.__lioCommunityPatched) return;
        OrgChart.__lioCommunityPatched = true;
        OrgChart._communityMessages = [];

        if (OrgChart.exportUI && OrgChart.exportUI.prototype) {
          OrgChart.exportUI.prototype.isVisible = function () {
            return false;
          };
          OrgChart.exportUI.prototype.show = function () {};
          OrgChart.exportUI.prototype.refresh = function () {};
        }

        OrgChart._communityAlert = function () {
          OrgChart._communityMessages = [];
        };
      }

      function setupLioTemplate() {
        patchOrgChartCommunityStubs();
        OrgChart.templates.lio = Object.assign({}, OrgChart.templates.ana);
        OrgChart.templates.lio.size = [ORG_CARD_WIDTH, ORG_CARD_HEIGHT];
        OrgChart.templates.lio.expandCollapseSize = 28;

        OrgChart.templates.lio.node = function (node, data) {
          const colors = getDeptColors(data.dept);
          return (
            '<rect x="0" y="0" height="' + node.h + '" width="' + node.w +
            '" fill="' + colors.fill + '" stroke-width="1.5" stroke="' + colors.stroke +
            '" rx="10" ry="10"></rect>' +
            renderOrgNodeAvatar(node, data) +
            '<g class="lio-node-menu-btn" style="cursor:pointer;" transform="matrix(1,0,0,1,' + (node.w - 22) + ', 10)" data-lio-node-menu="' + node.id + '" aria-label="Ações">' +
            '<rect x="-4" y="-2" width="22" height="16" rx="6" fill="#ffffff" fill-opacity="0.9"></rect>' +
            '<circle cx="2" cy="6" r="1.7" fill="' + colors.text + '"></circle>' +
            '<circle cx="8" cy="6" r="1.7" fill="' + colors.text + '"></circle>' +
            '<circle cx="14" cy="6" r="1.7" fill="' + colors.text + '"></circle>' +
            '</g>'
          );
        };

        OrgChart.templates.lio.img_0 = function () {
          return "";
        };

        OrgChart.templates.lio.field_0 = function (node, data, template, config, value) {
          const isJulio = isJulioSchwartzmanNode(data);
          const layout = getCardLayout(node, data);
          return renderOrgSvgText(value, {
            x: layout.cx,
            y: layout.nameY,
            maxWidth: orgTextWidth(node),
            maxLines: 2,
            fontSize: isJulio ? 16 : 14,
            fontWeight: 700,
            fill: "#1e293b",
            stroke: "#ffffff",
            strokeWidth: 2.5
          });
        };

        OrgChart.templates.lio.field_1 = function (node, data, template, config, value) {
          const isJulio = isJulioSchwartzmanNode(data);
          const layout = getCardLayout(node, data);
          return renderOrgSvgText(value, {
            x: layout.cx,
            y: layout.titleY,
            maxWidth: orgTextWidth(node),
            maxLines: 2,
            fontSize: isJulio ? 15 : 13,
            fill: "#4a5568"
          });
        };

        OrgChart.templates.lio.field_2 = function (node, data, template, config, value) {
          if (isJulioSchwartzmanNode(data)) return "";
          const colors = getDeptColors(data.dept);
          const layout = getCardLayout(node, data);
          const deptFontSize = 11;
          const measured = measureOrgText(String(value || ""), deptFontSize, 700) + 16;
          const badgeW = Math.min(node.w - 16, Math.max(104, measured));
          const badgeX = (node.w - badgeW) / 2;
          const textW = Math.max(72, badgeW - 16);
          return (
            '<rect x="' + badgeX + '" y="' + layout.badgeY + '" width="' + badgeW + '" height="22" rx="11" ry="11" fill="' + colors.badge + '"></rect>' +
            renderOrgSvgText(value, {
              x: layout.cx,
              y: layout.badgeTextY,
              maxWidth: textW,
              maxLines: 1,
              fontSize: deptFontSize,
              fontWeight: 700,
              fill: colors.text
            })
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

        if (action === "solicitar-posicao") {
          if (!canRequestPositionOnNode(window.__lioOrgChart, nodeId)) return;
          closeOrgNodeMenu();
          const chart = window.__lioOrgChart;
          const layoutNode = chart && chart.getNode ? chart.getNode(nodeId) : null;
          openOrgPositionRequestModal({
            level: layoutNode && typeof layoutNode.level === "number" ? layoutNode.level : 0,
            side: "card",
            anchorNodeId: nodeId,
            person: person,
            nodeIndex: nodeIndex
          });
          return;
        }

        if (action === "promover") {
          showOrgAction("Promover " + person.name + " — fluxo em breve para gestores e RH.");
        }
      }

      function getOrgPositionPolicy() {
        const ctx = window.__lioOrgBootContext || {};
        const directReportsCount =
          typeof ctx.directReportsCount === "number" ? ctx.directReportsCount : 0;
        return {
          enabled: directReportsCount > 0,
          minLevel:
            typeof ctx.focusChartLevel === "number" ? ctx.focusChartLevel : null
        };
      }

      function canUseOrgPositionRequests() {
        const policy = getOrgPositionPolicy();
        return policy.enabled && policy.minLevel !== null;
      }

      function isChartLevelAllowedForPositionRequest(level) {
        const policy = getOrgPositionPolicy();
        if (!policy.enabled || policy.minLevel === null) return false;
        return level >= policy.minLevel;
      }

      function canRequestPositionOnNode(chart, nodeId) {
        if (!canUseOrgPositionRequests() || !chart || typeof chart.getNode !== "function") {
          return false;
        }
        const node = chart.getNode(nodeId);
        if (!node || typeof node.level !== "number") return false;
        return isChartLevelAllowedForPositionRequest(node.level);
      }

      function rememberFocusChartLevel(bootContext, chart, nodeId) {
        if (!bootContext || !chart || typeof chart.getNode !== "function") return;
        const node = chart.getNode(nodeId);
        if (!node || typeof node.level !== "number") return;
        bootContext.focusChartLevel = node.level;
      }

      function getChartRootIds(chart) {
        if (chart.config.roots && chart.config.roots.length) {
          return chart.config.roots.slice();
        }
        const nodes = chart.config.nodes || [];
        const idSet = new Set(nodes.map(function (n) {
          return n.id;
        }));
        return nodes
          .filter(function (n) {
            return !n.pid || !idSet.has(n.pid);
          })
          .map(function (n) {
            return n.id;
          });
      }

      function getVisibleLevelBounds(chart) {
        const byLevel = {};
        const visibleIds = Array.isArray(chart.visibleNodeIds) ? chart.visibleNodeIds : [];

        function addNode(node) {
          if (!node) return;
          const level = typeof node.level === "number" ? node.level : 0;
          if (!byLevel[level]) {
            byLevel[level] = {
              minX: Infinity,
              maxX: -Infinity,
              minY: Infinity,
              maxY: -Infinity,
              centerY: 0,
              count: 0,
              nodes: []
            };
          }
          const row = byLevel[level];
          row.minX = Math.min(row.minX, node.x);
          row.maxX = Math.max(row.maxX, node.x + node.w);
          row.minY = Math.min(row.minY, node.y);
          row.maxY = Math.max(row.maxY, node.y + node.h);
          row.centerY += node.y + node.h / 2;
          row.count += 1;
          row.nodes.push(node);
        }

        if (visibleIds.length) {
          visibleIds.forEach(function (nodeId) {
            addNode(chart.getNode(nodeId));
          });
        } else {
          function visit(nodeId) {
            const node = chart.getNode(nodeId);
            if (!node) return;
            addNode(node);
            if (node.collapsed) return;
            (node.childrenIds || []).forEach(visit);
          }
          getChartRootIds(chart).forEach(visit);
        }

        Object.keys(byLevel).forEach(function (key) {
          const row = byLevel[key];
          row.centerY = row.centerY / row.count;
          row.connectorY = resolveLevelConnectorY(row);
        });

        return byLevel;
      }

      function resolveLevelConnectorY(row) {
        if (!row || !row.nodes.length) return 0;
        const sample = row.nodes[0];
        if (typeof sample.py === "number" && sample.py > 0 && sample.py < sample.y) {
          return sample.py;
        }
        return row.minY - 36;
      }

      function getMinVisibleLevel(bounds) {
        const levels = Object.keys(bounds).map(Number);
        if (!levels.length) return 0;
        return Math.min.apply(null, levels);
      }

      function getOrgNodeElement(chart, nodeId) {
        if (!chart || typeof chart.getNodeElement !== "function") return null;
        return (
          chart.getNodeElement(nodeId) ||
          chart.getNodeElement(String(nodeId)) ||
          chart.getNodeElement(Number(nodeId))
        );
      }

      function rectsOverlap(a, b) {
        return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
      }

      function getViewportVisibleRowNodes(chart, container, row) {
        const treeRect = container.getBoundingClientRect();
        return row.nodes.filter(function (node) {
          const el = getOrgNodeElement(chart, node.id);
          if (!el) return false;
          const rect = el.getBoundingClientRect();
          return rectsOverlap(rect, treeRect) && rect.width > 6 && rect.height > 6;
        });
      }

      function getRowExtremeNodes(row) {
        let leftNode = row.nodes[0];
        let rightNode = row.nodes[0];
        row.nodes.forEach(function (node) {
          if (node.x < leftNode.x) leftNode = node;
          if (node.x + node.w > rightNode.x + rightNode.w) rightNode = node;
        });
        return { leftNode: leftNode, rightNode: rightNode };
      }

      function getNodeScreenRect(chart, node) {
        const el = getOrgNodeElement(chart, node.id);
        return el ? el.getBoundingClientRect() : null;
      }

      function isNodeVisibleInTree(rect, treeRect) {
        if (!rect || rect.width < 6 || rect.height < 6) return false;
        return rectsOverlap(rect, treeRect);
      }

      function isExtremeCardVisibleForSide(rect, treeRect, side) {
        if (!isNodeVisibleInTree(rect, treeRect)) return false;
        const edgeMargin = 3;
        if (side === "left") {
          return rect.left >= treeRect.left + edgeMargin;
        }
        return rect.right <= treeRect.right - edgeMargin;
      }

      function canPlaceLeftLevelButton(rect, treeRect, btnSize, gap) {
        if (!isExtremeCardVisibleForSide(rect, treeRect, "left")) return false;
        return rect.left - treeRect.left - btnSize - gap >= 4;
      }

      function canPlaceRightLevelButton(rect, treeRect, btnSize, gap) {
        if (!isExtremeCardVisibleForSide(rect, treeRect, "right")) return false;
        return rect.right - treeRect.left + gap + btnSize <= treeRect.width - 4;
      }

      function getOrgChartScale(chart) {
        if (!chart || typeof chart.getScale !== "function") return 1;
        const scale = chart.getScale();
        return typeof scale === "number" && scale > 0 ? scale : 1;
      }

      function buildLevelAddBtnHtml(left, top, size, level, side, anchorId) {
        return (
          '<button type="button" class="lio-level-add-btn" data-org-level="' + level +
          '" data-org-level-side="' + side + '" data-org-level-anchor="' + anchorId +
          '" style="left:' + Math.round(left) + "px;top:" + Math.round(top) +
          "px;width:" + Math.round(size) + "px;height:" + Math.round(size) + 'px"' +
          ' title="Adicionar posição neste nível" aria-label="Adicionar posição neste nível">' +
          '<span class="lio-level-add-btn__icon" aria-hidden="true" style="font-size:' +
          Math.round(size * 0.5) + 'px">+</span></button>'
        );
      }

      function ensureLevelActionsOverlay(container) {
        let overlay = container.querySelector("#lio-org-level-actions-overlay");
        if (!overlay) {
          overlay = document.createElement("div");
          overlay.id = "lio-org-level-actions-overlay";
          overlay.className = "lio-org-level-actions-overlay";
          container.appendChild(overlay);
        }
        const legacySvgLayer = container.querySelector("#lio-org-level-actions");
        if (legacySvgLayer) legacySvgLayer.remove();
        return overlay;
      }

      function collectLevelButtonDebug(chart, container) {
        const bounds = getVisibleLevelBounds(chart);
        const minLevel = getMinVisibleLevel(bounds);
        const rows = [];

        Object.keys(bounds)
          .sort(function (a, b) {
            return Number(a) - Number(b);
          })
          .forEach(function (levelKey) {
            const level = Number(levelKey);
            const row = bounds[levelKey];
            if (!row || !row.count) return;
            rows.push({
              level: level,
              skipped: level <= minLevel,
              count: row.count,
              viewportNodes: getViewportVisibleRowNodes(chart, container, row).length
            });
          });

        const buttons = container.querySelectorAll("#lio-org-level-actions-overlay .lio-level-add-btn");
        return {
          minLevel: minLevel,
          rows: rows,
          buttonCount: buttons.length,
          chartScale: getOrgChartScale(chart),
          visibleNodeIds: Array.isArray(chart.visibleNodeIds) ? chart.visibleNodeIds.length : 0
        };
      }

      function renderOrgLevelAddButtons(chart, container) {
        const overlay = ensureLevelActionsOverlay(container);
        if (!overlay || !chart) return;

        if (!canUseOrgPositionRequests()) {
          overlay.innerHTML = "";
          return;
        }

        const bounds = getVisibleLevelBounds(chart);
        const minLevel = getMinVisibleLevel(bounds);
        const treeRect = container.getBoundingClientRect();
        const chartScale = getOrgChartScale(chart);
        const btnSize = Math.max(28, Math.min(56, Math.round(52 * chartScale)));
        const gap = Math.max(6, Math.round(10 * chartScale));
        const parts = [];

        Object.keys(bounds)
          .sort(function (a, b) {
            return Number(a) - Number(b);
          })
          .forEach(function (levelKey) {
            const row = bounds[levelKey];
            if (!row || !row.count) return;
            const level = Number(levelKey);
            if (level <= minLevel) return;
            if (!isChartLevelAllowedForPositionRequest(level)) return;

            const viewportNodes = getViewportVisibleRowNodes(chart, container, row);
            if (!viewportNodes.length) return;

            const extremes = getRowExtremeNodes(row);
            const leftRect = getNodeScreenRect(chart, extremes.leftNode);
            const rightRect = getNodeScreenRect(chart, extremes.rightNode);
            const showLeft = canPlaceLeftLevelButton(leftRect, treeRect, btnSize, gap);
            const showRight = canPlaceRightLevelButton(rightRect, treeRect, btnSize, gap);
            if (!showLeft && !showRight) return;

            let rowTop = Infinity;
            let rowBottom = -Infinity;

            viewportNodes.forEach(function (node) {
              const rect = getOrgNodeElement(chart, node.id).getBoundingClientRect();
              rowTop = Math.min(rowTop, rect.top);
              rowBottom = Math.max(rowBottom, rect.bottom);
            });

            const anchorId = viewportNodes[0].id;
            const rowCenterY = (rowTop + rowBottom) / 2;
            const top = Math.max(4, Math.min(treeRect.height - btnSize - 4, rowCenterY - treeRect.top - btnSize / 2));

            if (showLeft && leftRect) {
              const leftX = leftRect.left - treeRect.left - btnSize - gap;
              parts.push(buildLevelAddBtnHtml(leftX, top, btnSize, level, "left", anchorId));
            }

            if (showRight && rightRect) {
              const rightX = rightRect.right - treeRect.left + gap;
              parts.push(buildLevelAddBtnHtml(rightX, top, btnSize, level, "right", anchorId));
            }
          });

        overlay.innerHTML = parts.join("");
        window.__lioOrgLevelButtonsDebug = function () {
          return collectLevelButtonDebug(chart, container);
        };
      }

      function resolveLevelManagerLabel(chart, nodeIndex, row) {
        if (!row || !row.nodes.length) return "A definir pelo RH";
        const first = row.nodes[0];
        const person = nodeIndex[first.id];
        if (!person || !person.pid) return "A definir pelo RH";
        const manager = nodeIndex[person.pid] || nodeIndex[String(person.pid)] || nodeIndex[Number(person.pid)];
        if (!manager) return "A definir pelo RH";
        return manager.name + " · " + (manager.title || "Gestor");
      }

      let orgPositionRequestContext = null;
      let orgPositionModalBodyOverflow = "";

      function ensurePositionRequestModalOnBody() {
        const modal = document.getElementById("org-position-request-modal");
        if (!modal) return null;
        if (modal.parentNode !== document.body) {
          document.body.appendChild(modal);
        }
        return modal;
      }

      function lockBodyForPositionModal() {
        orgPositionModalBodyOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
      }

      function unlockBodyForPositionModal() {
        document.body.style.overflow = orgPositionModalBodyOverflow;
      }

      function closeOrgPositionRequestModal() {
        const modal = document.getElementById("org-position-request-modal");
        if (modal) modal.hidden = true;
        unlockBodyForPositionModal();
        orgPositionRequestContext = null;
      }

      function openOrgPositionRequestModal(context) {
        const modal = ensurePositionRequestModalOnBody();
        const titleInput = document.getElementById("org-position-request-job-title");
        const deptInput = document.getElementById("org-position-request-dept");
        const managerInput = document.getElementById("org-position-request-manager");
        const notesInput = document.getElementById("org-position-request-notes");
        if (!modal || !titleInput || !deptInput || !managerInput || !notesInput) return;

        const chart = window.__lioOrgChart;
        const row = chart ? getVisibleLevelBounds(chart)[context.level] : null;
        let managerLabel = "A definir pelo RH";
        let deptHint = "";

        if (context.person && context.side === "card") {
          const person = context.person;
          if (person.pid && context.nodeIndex) {
            const manager =
              context.nodeIndex[person.pid] ||
              context.nodeIndex[String(person.pid)] ||
              context.nodeIndex[Number(person.pid)];
            if (manager) {
              managerLabel = manager.name + " · " + (manager.title || "Gestor");
            }
          }
          deptHint = String(person.dept || "").split(" · ")[0];
        } else if (row && context.nodeIndex) {
          managerLabel = resolveLevelManagerLabel(chart, context.nodeIndex, row);
          const sample = context.nodeIndex[row.nodes[0].id];
          deptHint = sample ? String(sample.dept || "").split(" · ")[0] : "";
        }

        orgPositionRequestContext = context;
        titleInput.value = "";
        deptInput.value = deptHint;
        managerInput.value = managerLabel;
        notesInput.value = "";
        modal.hidden = false;
        lockBodyForPositionModal();
        titleInput.focus();
      }

      function setupOrgPositionRequestModal() {
        const modal = ensurePositionRequestModalOnBody();
        const form = document.getElementById("org-position-request-form");
        if (!modal || !form || modal.dataset.bound === "1") return;
        modal.dataset.bound = "1";

        modal.querySelectorAll("[data-close-position-request]").forEach(function (el) {
          el.addEventListener("click", closeOrgPositionRequestModal);
        });

        form.addEventListener("submit", function (event) {
          event.preventDefault();
          const title = document.getElementById("org-position-request-job-title");
          const jobTitle = title ? String(title.value || "").trim() : "";
          if (!jobTitle) return;
          closeOrgPositionRequestModal();
          showOrgAction(
            "Solicitação de nova posição (“" +
              jobTitle +
              "”) registrada — fluxo de aprovação com RH em breve."
          );
        });

        document.addEventListener("keydown", function (event) {
          if (event.key === "Escape" && modal && !modal.hidden) {
            closeOrgPositionRequestModal();
          }
        });
      }

      function bindOrgLevelButtonViewportSync(chart, container, refresh) {
        let syncRaf = 0;

        function scheduleViewportSync() {
          if (syncRaf) return;
          syncRaf = requestAnimationFrame(function () {
            syncRaf = 0;
            refresh();
          });
        }

        const content = container.querySelector("[data-boc-content]");
        if (content) {
          content.addEventListener("wheel", scheduleViewportSync, { passive: true });
          content.addEventListener("pointerdown", scheduleViewportSync, { passive: true });
          content.addEventListener("pointermove", scheduleViewportSync, { passive: true });
          content.addEventListener("pointerup", scheduleViewportSync, { passive: true });
        }

        const chartGroup = container.querySelector("[data-boc-content] svg > g");
        if (chartGroup && typeof MutationObserver !== "undefined") {
          const observer = new MutationObserver(scheduleViewportSync);
          observer.observe(chartGroup, { attributes: true, attributeFilter: ["transform"] });
        }

        window.addEventListener("resize", scheduleViewportSync, { passive: true });
      }

      function scheduleOrgLevelButtonRefresh() {
        if (typeof window.__lioRefreshOrgLevelButtons !== "function") return;
        [0, 120, 400, 900].forEach(function (delay) {
          setTimeout(window.__lioRefreshOrgLevelButtons, delay);
        });
      }

      function setupOrgLevelAddButtons(chart, nodeIndex) {
        const chartBootId = window.__lioOrgBootId;
        let refreshLevelButtonsTimer;

        function renderLevelButtonsNow() {
          if (chartBootId !== window.__lioOrgBootId) return;
          renderOrgLevelAddButtons(chart, treeEl);
        }

        function refreshLevelButtonsDebounced() {
          clearTimeout(refreshLevelButtonsTimer);
          refreshLevelButtonsTimer = setTimeout(renderLevelButtonsNow, 16);
        }

        window.__lioRefreshOrgLevelButtons = renderLevelButtonsNow;

        if (typeof chart.onRedraw === "function") {
          chart.onRedraw(refreshLevelButtonsDebounced);
        }
        if (typeof chart.onExpandCollapseButtonClick === "function") {
          chart.onExpandCollapseButtonClick(function () {
            refreshLevelButtonsDebounced();
          });
        }
        if (typeof chart.onInit === "function") {
          chart.onInit(refreshLevelButtonsDebounced);
        }

        bindOrgLevelButtonViewportSync(chart, treeEl, renderLevelButtonsNow);

        treeEl.addEventListener("click", function (event) {
          const target = event.target.closest(".lio-level-add-btn");
          if (!target) return;
          event.stopPropagation();
          event.preventDefault();
          const level = Number(target.getAttribute("data-org-level") || "0");
          if (!isChartLevelAllowedForPositionRequest(level)) return;
          const side = target.getAttribute("data-org-level-side") || "left";
          const anchorNodeId = Number(target.getAttribute("data-org-level-anchor") || "0");
          openOrgPositionRequestModal({
            level: level,
            side: side,
            anchorNodeId: anchorNodeId,
            nodeIndex: nodeIndex
          });
        });
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

        const positionItem = menu.querySelector('[data-action="solicitar-posicao"]');
        if (positionItem) {
          const allowed = canRequestPositionOnNode(window.__lioOrgChart, nodeId);
          positionItem.hidden = !allowed;
          positionItem.disabled = !allowed;
        }
      }

      function findMenuButton(el) {
        while (el && el !== treeEl) {
          if (el.getAttribute && el.getAttribute("data-lio-node-menu")) return el;
          el = el.parentNode;
        }
        return null;
      }

      function getOrgChartPanelSize(container) {
        const panel = container.querySelector("[data-boc-content]") || container;
        return {
          width: panel.clientWidth || container.clientWidth || 960,
          height: panel.clientHeight || container.clientHeight || 560
        };
      }

      function applyFocusViewport(chart, nodeId, container) {
        const node = chart.getNode(nodeId);
        if (!node || typeof chart.setViewBox !== "function") return false;

        const nx = Number(node.x);
        const ny = Number(node.y);
        const nw = Number(node.w);
        const nh = Number(node.h);
        if (![nx, ny, nw, nh].every(function (value) {
          return Number.isFinite(value);
        })) {
          return false;
        }

        chart.config.scaleInitial = OrgChart.match.none;

        const viewW = (nw + ORG_FOCUS_PAD_X * 2) / ORG_FOCUS_ZOOM;
        const viewH = (nh + ORG_FOCUS_PAD_Y * 2 + 100) / ORG_FOCUS_ZOOM;

        chart.setViewBox([
          nx + nw / 2 - viewW / 2,
          ny - ORG_FOCUS_TOP_PAD / ORG_FOCUS_ZOOM,
          viewW,
          viewH
        ]);
        return true;
      }

      function withFocusGuard(chart, fn) {
        window.__lioOrgFocusing = true;
        const originalFit = chart.fit;
        chart.fit = function () {
          return chart;
        };
        try {
          fn();
        } finally {
          chart.fit = originalFit;
          window.__lioOrgFocusing = false;
        }
      }

      function scheduleFocusViewport(chart, nodeId, container, onDone) {
        const delays = [0, 80, 200, 450, 800, 1200, 1800];
        let doneCalled = false;

        function tryApply() {
          let applied = false;
          withFocusGuard(chart, function () {
            applied = applyFocusViewport(chart, nodeId, container);
          });
          if (applied && onDone && !doneCalled) {
            doneCalled = true;
            onDone();
          }
          return applied;
        }

        delays.forEach(function (delay) {
          setTimeout(tryApply, delay);
        });

        setTimeout(function () {
          const applied = tryApply();
          if (!applied) {
            fitOrgChartInPanel(chart, container);
          }
          if (typeof window.__lioRefreshOrgLevelButtons === "function") {
            window.__lioRefreshOrgLevelButtons();
          }
          if (onDone && !doneCalled) {
            doneCalled = true;
            onDone();
          }
        }, 2000);
      }

      function pinOrgChartToTop(container, topPadding) {
        const content = container.querySelector("[data-boc-content]");
        const chartGroup = content?.querySelector("svg > g");
        if (!chartGroup || !content) return;

        const transform = chartGroup.getAttribute("transform") || "";
        const match = transform.match(/matrix\(([^)]+)\)/);
        if (!match) return;

        const parts = match[1].split(/[\s,]+/).map(Number);
        if (parts.length < 6) return;

        const box = chartGroup.getBBox();
        const scale = parts[0] || 1;
        const sidePadding = 24;
        const contentWidth = content.clientWidth || container.clientWidth || 0;
        parts[4] = sidePadding + Math.max(0, contentWidth / scale - box.width) / 2 - box.x;
        parts[5] = topPadding - box.y;
        chartGroup.setAttribute("transform", "matrix(" + parts.join(",") + ")");
      }

      function fitOrgChartInPanel(chart, container) {
        if (chart && typeof chart.fit === "function") {
          chart.fit();
        }
        requestAnimationFrame(function () {
          pinOrgChartToTop(container, 24);
          if (typeof window.__lioRefreshOrgLevelButtons === "function") {
            window.__lioRefreshOrgLevelButtons();
          }
        });
      }

      function normalizeSlugKey(slug) {
        return String(slug || "").trim().toLowerCase();
      }

      function slugTokens(slug) {
        return normalizeSlugKey(slug).split(/[-_]+/).filter(Boolean);
      }

      function findChartNode(nodes, slug) {
        if (!nodes || !nodes.length || !slug) return null;

        const key = normalizeSlugKey(slug);
        let found = nodes.find(function (node) {
          return normalizeSlugKey(node.slug) === key;
        });
        if (found) return found;

        const tokens = slugTokens(slug);
        if (tokens.length) {
          found = nodes.find(function (node) {
            const name = normalizeSlugKey(node.name);
            return tokens.every(function (token) {
              return name.indexOf(token) >= 0;
            });
          });
          if (found) return found;
        }

        for (var i = 0; i < DEFAULT_ORG_FOCUS_SLUGS.length; i++) {
          const preferred = DEFAULT_ORG_FOCUS_SLUGS[i];
          found = nodes.find(function (node) {
            return normalizeSlugKey(node.slug) === preferred;
          });
          if (found) return found;
        }

        return null;
      }

      function findUnassignedPersonBySlug(unassignedPeople, slug) {
        if (!unassignedPeople || !unassignedPeople.length || !slug) return null;
        const key = normalizeSlugKey(slug);
        return (
          unassignedPeople.find(function (person) {
            return normalizeSlugKey(person.slug) === key;
          }) || null
        );
      }

      function findUnassignedPerson(unassignedPeople, slug) {
        const exact = findUnassignedPersonBySlug(unassignedPeople, slug);
        if (exact) return exact;
        if (!unassignedPeople || !unassignedPeople.length || !slug) return null;

        const tokens = slugTokens(slug);
        if (!tokens.length) return null;
        return unassignedPeople.find(function (person) {
          const name = normalizeSlugKey(person.name);
          return tokens.every(function (token) {
            return name.indexOf(token) >= 0;
          });
        });
      }

      function isChartFocusInUnassigned(nodes, unassignedPeople, focusSlug) {
        if (!focusSlug) return false;
        if (findChartNode(nodes, focusSlug)) return false;
        return !!findUnassignedPersonBySlug(unassignedPeople, focusSlug);
      }

      function getFocusSlug() {
        return new URLSearchParams(window.location.search).get("focus");
      }

      function getViewMode() {
        return new URLSearchParams(window.location.search).get("view") === "full" ? "full" : "scoped";
      }

      function isAdminOrHr(me) {
        if (!me || !Array.isArray(me.roles)) return false;
        return me.roles.some(function (role) {
          return role === "Admin" || role === "HR" || role === 1 || role === 3;
        });
      }

      function resolveBootContext() {
        const viewMode = getViewMode();
        const fromQuery = getFocusSlug();
        if (!window.LioApi || window.LioApi.useMock) {
          return Promise.resolve({
            focusSlug: fromQuery || "leonardo-mendes",
            viewMode: viewMode,
            isAdminOrHr: false,
            meSlug: null,
            meName: null
          });
        }
        return window.LioApi.get("/me")
          .then(function (me) {
            return {
              focusSlug: fromQuery || (me && me.slug) || null,
              viewMode: viewMode,
              isAdminOrHr: isAdminOrHr(me),
              meSlug: me && me.slug,
              meName: me && me.name
            };
          })
          .catch(function () {
            return {
              focusSlug: fromQuery || "leonardo-mendes",
              viewMode: viewMode,
              isAdminOrHr: false,
              meSlug: null,
              meName: null
            };
          });
      }

      function getApiNodeSlug(node) {
        return node.slug || node.Slug || "";
      }

      function getApiNodeId(node) {
        return node.id || node.Id;
      }

      function getApiNodeManagerId(node) {
        return node.managerId !== undefined ? node.managerId : node.ManagerId;
      }

      function buildChildrenIndexByManagerId(apiNodes) {
        const children = {};
        apiNodes.forEach(function (node) {
          const managerId = getApiNodeManagerId(node);
          if (!managerId) return;
          if (!children[managerId]) children[managerId] = [];
          children[managerId].push(node);
        });
        return children;
      }

      function collectDescendantSlugSet(focusSlug, apiNodes) {
        const slugToId = {};
        apiNodes.forEach(function (node) {
          const slug = getApiNodeSlug(node);
          if (slug) slugToId[normalizeSlugKey(slug)] = getApiNodeId(node);
        });
        const focusId = slugToId[normalizeSlugKey(focusSlug)];
        if (!focusId) return new Set();

        const children = buildChildrenIndexByManagerId(apiNodes);
        const slugs = new Set();
        const stack = [focusId];
        const visited = {};

        while (stack.length) {
          const id = stack.pop();
          if (visited[id]) continue;
          visited[id] = true;
          (children[id] || []).forEach(function (child) {
            const slug = getApiNodeSlug(child);
            if (!slug) return;
            slugs.add(slug);
            stack.push(getApiNodeId(child));
          });
        }
        return slugs;
      }

      function apiHasSlug(apiNodes, slug) {
        const key = normalizeSlugKey(slug);
        return apiNodes.some(function (node) {
          return normalizeSlugKey(getApiNodeSlug(node)) === key;
        });
      }

      function repairFilteredApiNodeManagers(filteredNodes, allApiNodes) {
        const visibleIds = new Set();
        filteredNodes.forEach(function (node) {
          visibleIds.add(getApiNodeId(node));
        });
        const nodeById = {};
        allApiNodes.forEach(function (node) {
          nodeById[getApiNodeId(node)] = node;
        });

        return filteredNodes.map(function (node) {
          let managerId = getApiNodeManagerId(node);
          const visited = {};
          while (managerId && !visibleIds.has(managerId) && !visited[managerId]) {
            visited[managerId] = true;
            const manager = nodeById[managerId];
            managerId = manager ? getApiNodeManagerId(manager) : null;
          }
          if (!managerId || !visibleIds.has(managerId)) {
            return Object.assign({}, node, { managerId: null, ManagerId: null });
          }
          return Object.assign({}, node, { managerId: managerId, ManagerId: managerId });
        });
      }

      function buildVisibleSlugSet(focusSlug, hierarchy, allApiNodes) {
        const set = new Set();
        if (!focusSlug) return set;

        const chain = hierarchy ? hierarchy.chain || hierarchy.Chain || [] : [];
        chain.forEach(function (member) {
          const slug = member.slug || member.Slug || member.id || member.Id;
          if (slug && apiHasSlug(allApiNodes, slug)) set.add(slug);
        });
        if (apiHasSlug(allApiNodes, focusSlug)) set.add(focusSlug);
        collectDescendantSlugSet(focusSlug, allApiNodes).forEach(function (slug) {
          if (apiHasSlug(allApiNodes, slug)) set.add(slug);
        });
        return set;
      }

      function filterApiNodesToVisible(apiNodes, slugSet) {
        const normalized = new Set();
        slugSet.forEach(function (slug) {
          normalized.add(normalizeSlugKey(slug));
        });
        return apiNodes.filter(function (node) {
          return normalized.has(normalizeSlugKey(getApiNodeSlug(node)));
        });
      }

      function formatScopedOrgCount(nodes, focusName) {
        const label = focusName ? "Árvore de " + focusName : "Sua árvore hierárquica";
        return label + " · " + nodes.length + (nodes.length === 1 ? " pessoa" : " pessoas");
      }

      function updateOrgToolbar(bootContext) {
        const hint = document.getElementById("org-view-hint");
        const toggle = document.getElementById("org-view-full-toggle");
        const searchInput = document.getElementById("org-people-search");
        if (!bootContext) return;

        if (hint) {
          if (bootContext.viewMode === "full") {
            hint.textContent = "Organograma completo da empresa";
          } else if (bootContext.focusSlug && bootContext.meSlug === bootContext.focusSlug && bootContext.meName) {
            hint.textContent = "Sua árvore hierárquica";
          } else if (bootContext.focusName) {
            hint.textContent = "Árvore de " + bootContext.focusName;
          } else {
            hint.textContent = "Sua árvore hierárquica";
          }
        }

        if (toggle) {
          if (bootContext.isAdminOrHr) {
            toggle.hidden = false;
            toggle.textContent =
              bootContext.viewMode === "full" ? "Ver minha árvore" : "Ver organograma completo";
          } else {
            toggle.hidden = true;
          }
        }

        if (searchInput && bootContext.focusName && !searchInput.value) {
          searchInput.placeholder = "Buscar pessoa para focar...";
        }
      }

      function reloadOrganogram() {
        window.__lioOrgBootId = (window.__lioOrgBootId || 0) + 1;
        window.__lioOrgFocusReady = null;
        bootOrganogram();
      }

      function navigateOrgChartUrl(mutator) {
        const url = new URL(window.location.href);
        mutator(url);
        window.history.pushState(null, "", url.pathname + url.search);
        reloadOrganogram();
      }

      function setupOrgPeopleSearch() {
        const input = document.getElementById("org-people-search");
        const results = document.getElementById("org-search-results");
        if (!input || !results || input.__lioOrgSearchBound) return;
        input.__lioOrgSearchBound = true;

        let debounceTimer = null;
        let activeIndex = -1;
        let lastItems = [];

        function hideResults() {
          results.hidden = true;
          results.innerHTML = "";
          input.setAttribute("aria-expanded", "false");
          activeIndex = -1;
          lastItems = [];
        }

        function normalizePeopleList(raw) {
          if (Array.isArray(raw)) return raw;
          if (raw && Array.isArray(raw.items)) return raw.items;
          if (raw && Array.isArray(raw.value)) return raw.value;
          return [];
        }

        function selectPerson(slug) {
          if (!slug) return;
          hideResults();
          input.value = "";
          navigateOrgChartUrl(function (url) {
            url.searchParams.set("focus", slug);
            url.searchParams.delete("view");
          });
        }

        function renderResults(items) {
          lastItems = items;
          activeIndex = -1;
          if (!items.length) {
            results.innerHTML = '<div class="org-search-results__empty">Nenhuma pessoa encontrada.</div>';
            results.hidden = false;
            input.setAttribute("aria-expanded", "true");
            return;
          }
          results.innerHTML = items
            .map(function (person, index) {
              const slug = person.slug || person.Slug || "";
              const name = person.name || person.Name || "";
              const title = person.title || person.Title || "";
              const dept = person.departmentName || person.DepartmentName || "";
              const meta = [title, dept].filter(Boolean).join(" · ");
              return (
                '<button type="button" class="org-search-results__item" role="option" data-org-search-index="' +
                index +
                '" data-org-search-slug="' +
                escapeAttr(slug) +
                '"><span class="org-search-results__name">' +
                escapeHtml(name) +
                '</span><span class="org-search-results__meta">' +
                escapeHtml(meta) +
                "</span></button>"
              );
            })
            .join("");
          results.hidden = false;
          input.setAttribute("aria-expanded", "true");
        }

        function runSearch() {
          const term = input.value.trim();
          if (term.length < 2) {
            hideResults();
            return;
          }
          if (!window.LioApi || window.LioApi.useMock) return;
          window.LioApi.get("/people?limit=8&q=" + encodeURIComponent(term))
            .then(function (raw) {
              renderResults(normalizePeopleList(raw));
            })
            .catch(function () {
              hideResults();
            });
        }

        input.addEventListener("input", function () {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(runSearch, 300);
        });

        input.addEventListener("keydown", function (event) {
          if (event.key === "Escape") {
            hideResults();
            return;
          }
          if (results.hidden || !lastItems.length) return;
          if (event.key === "ArrowDown") {
            event.preventDefault();
            activeIndex = Math.min(activeIndex + 1, lastItems.length - 1);
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            activeIndex = Math.max(activeIndex - 1, 0);
          } else if (event.key === "Enter" && activeIndex >= 0) {
            event.preventDefault();
            const person = lastItems[activeIndex];
            selectPerson(person.slug || person.Slug);
            return;
          } else {
            return;
          }
          results.querySelectorAll(".org-search-results__item").forEach(function (btn, index) {
            btn.classList.toggle("is-active", index === activeIndex);
          });
        });

        results.addEventListener("click", function (event) {
          const item = event.target.closest("[data-org-search-slug]");
          if (!item) return;
          selectPerson(item.getAttribute("data-org-search-slug"));
        });

        document.addEventListener("click", function (event) {
          if (!event.target.closest(".org-page-toolbar") && !event.target.closest("#org-search-results")) {
            hideResults();
          }
        });
      }

      function setupOrgViewToggle() {
        const toggle = document.getElementById("org-view-full-toggle");
        if (!toggle || toggle.__lioOrgToggleBound) return;
        toggle.__lioOrgToggleBound = true;
        toggle.addEventListener("click", function () {
          const isFull = getViewMode() === "full";
          navigateOrgChartUrl(function (url) {
            if (isFull) url.searchParams.delete("view");
            else url.searchParams.set("view", "full");
          });
        });
      }

      function resolveDefaultFocusSlug(nodes) {
        const found = findChartNode(nodes, "julio");
        return found ? found.slug : null;
      }

      function resolveChartFocusSlug(nodes, unassignedPeople, bootContext) {
        const preferred =
          bootContext && bootContext.focusSlug
            ? bootContext.focusSlug
            : getFocusSlug();
        if (preferred) {
          const chartNode = findChartNode(nodes, preferred);
          if (chartNode) return chartNode.slug;
          const unassigned = findUnassignedPerson(unassignedPeople, preferred);
          if (unassigned) return unassigned.slug;
          return preferred;
        }
        return resolveDefaultFocusSlug(nodes);
      }

      function escapeHtml(value) {
        return String(value || "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;");
      }

      function escapeAttr(value) {
        return escapeHtml(value).replace(/'/g, "&#39;");
      }

      function getUnassignedNodes(payload) {
        const explicit = payload.unassignedNodes || payload.UnassignedNodes;
        if (explicit) return explicit;
        const nodes = payload.nodes || payload.Nodes || [];
        return nodes.filter(function (node) {
          const managerId = node.managerId !== undefined ? node.managerId : node.ManagerId;
          return managerId == null;
        });
      }

      function getChartApiNodes(payload) {
        const apiNodes = payload && payload.nodes ? payload.nodes : [];
        if (payload.unassignedNodes || payload.UnassignedNodes) {
          return apiNodes;
        }
        return apiNodes.filter(function (node) {
          const managerId = node.managerId !== undefined ? node.managerId : node.ManagerId;
          return managerId != null;
        });
      }

      function getUnassignedCount(payload) {
        if (payload.unassignedCount !== undefined) return payload.unassignedCount;
        if (payload.UnassignedCount !== undefined) return payload.UnassignedCount;
        return getUnassignedNodes(payload).length;
      }

      function buildUnassignedPerson(apiNode) {
        const dept = apiNode.departmentName || apiNode.DepartmentName || "Sem departamento";
        const name = apiNode.name || apiNode.Name || "";
        return {
          slug: apiNode.slug || apiNode.Slug || "",
          name: name,
          title: apiNode.title || apiNode.Title || "Colaborador",
          img: resolvePhotoUrl(apiNode.photoUrl || apiNode.PhotoUrl),
          dept: dept,
          profile: OrgProfileModal.buildProfileExtras(name, dept)
        };
      }

      function renderUnassignedSection(unassignedPeople, focusSlug, nodeIndexBySlug) {
        const section = document.getElementById("org-unassigned-section");
        const tbody = document.getElementById("org-unassigned-body");
        const desc = document.getElementById("org-unassigned-desc");
        if (!section || !tbody) return null;

        if (!unassignedPeople.length) {
          section.hidden = true;
          tbody.innerHTML = "";
          return null;
        }

        section.hidden = false;
        if (desc) {
          desc.textContent =
            unassignedPeople.length +
            (unassignedPeople.length === 1
              ? " colaborador sem gestor definido no diretório Graph."
              : " colaboradores sem gestor definido no diretório Graph.") +
            " Eles não aparecem no organograma acima.";
        }

        tbody.innerHTML = unassignedPeople
          .slice()
          .sort(function (a, b) {
            return a.name.localeCompare(b.name, "pt-BR");
          })
          .map(function (person) {
            const profileHref = "/pessoas/perfil?id=" + encodeURIComponent(person.slug);
            const focused =
              focusSlug && normalizeSlugKey(person.slug) === normalizeSlugKey(focusSlug)
                ? " is-focused"
                : "";
            return (
              '<tr class="org-unassigned__row' +
              focused +
              '" data-unassigned-slug="' +
              escapeAttr(person.slug) +
              '">' +
              '<td><div class="org-unassigned__person">' +
              renderUnassignedAvatarMarkup(person.img) +
              '<span class="org-unassigned__name">' +
              escapeHtml(person.name) +
              "</span></div></td>" +
              "<td>" +
              escapeHtml(person.title) +
              "</td>" +
              '<td><span class="org-unassigned__dept">' +
              escapeHtml(person.dept) +
              "</span></td>" +
              '<td><div class="org-unassigned__actions">' +
              '<button type="button" class="org-unassigned__btn" data-unassigned-profile="' +
              escapeAttr(person.slug) +
              '">Ver perfil</button>' +
              '<a class="org-unassigned__btn" href="' +
              escapeAttr(profileHref) +
              '" aria-label="Abrir perfil completo de ' +
              escapeAttr(person.name) +
              '"><i class="fa-regular fa-user" aria-hidden="true"></i></a>' +
              "</div></td></tr>"
            );
          })
          .join("");

        tbody.querySelectorAll("[data-unassigned-profile]").forEach(function (btn) {
          btn.addEventListener("click", function () {
            const slug = btn.getAttribute("data-unassigned-profile");
            const person = nodeIndexBySlug[slug];
            if (!person) return;
            OrgProfileModal.open(person, nodeIndexBySlug, function (p) {
              showOrgAction("Mensagem para " + p.name + " — chat interno em breve.");
            });
          });
        });

        bindUnassignedAvatarFallbacks(tbody);

        return section;
      }

      function focusUnassignedRow(slug, section) {
        if (!slug || !section) return;
        const row = section.querySelector('[data-unassigned-slug="' + CSS.escape(slug) + '"]');
        if (!row) return;
        row.classList.add("is-focused");
        row.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      function buildNodesFromApi(apiNodes) {
        const guidToNumeric = {};
        let nextNum = 1;
        apiNodes.forEach(function (node) {
          guidToNumeric[node.id] = nextNum++;
        });

        return apiNodes.map(function (node) {
          const dept = node.departmentName || "Sem departamento";
          const isOrphan = node.isOrphan === true || node.IsOrphan === true;
          const managerNumeric =
            !isOrphan && node.managerId && guidToNumeric[node.managerId]
              ? guidToNumeric[node.managerId]
              : undefined;
          const deptLabel = isOrphan ? dept + " · Gestor ext." : dept;
          return {
            id: guidToNumeric[node.id],
            slug: node.slug,
            name: node.name,
            title: node.title || "Colaborador",
            img: resolvePhotoUrl(node.photoUrl || node.PhotoUrl),
            dept: deptLabel,
            tags: node.tags || [],
            isOrphan: isOrphan,
            pid: managerNumeric,
            profile: OrgProfileModal.buildProfileExtras(node.name, deptLabel)
          };
        });
      }

      function formatOrgCount(payload, nodes, unassignedCount) {
        const total = payload.total !== undefined ? payload.total : payload.Total || nodes.length + unassignedCount;
        const areas = new Set(nodes.map(function (n) { return n.dept; })).size;
        const orphanCount =
          payload.orphanCount !== undefined ? payload.orphanCount : payload.OrphanCount || 0;
        let text =
          total +
          " colaboradores · " +
          areas +
          " áreas no organograma · clique nos números abaixo dos diretores para expandir os times";
        if (unassignedCount > 0) {
          text += " · " + unassignedCount + " listados abaixo sem reporte definido";
        }
        if (orphanCount > 0) {
          text += " · " + orphanCount + " com gestor externo";
        }
        const syncedAt = payload.syncedAtUtc || payload.SyncedAtUtc;
        if (syncedAt) {
          text += " · atualizado em " + new Date(syncedAt).toLocaleString("pt-BR");
        }
        return text;
      }

      function initOrgChart(nodes, payload, unassignedPeople, nodeIndexBySlug, unassignedSection, bootContext, bootId) {
        if (bootId !== window.__lioOrgBootId) return;
        patchOrgChartCommunityStubs();
        bootContext = bootContext || { viewMode: "scoped" };
        const nodeIndex = {};
        nodes.forEach(function (node) {
          nodeIndex[node.id] = node;
        });
        unassignedPeople.forEach(function (person) {
          nodeIndex["unassigned:" + person.slug] = person;
        });

        const focusSlug = resolveChartFocusSlug(nodes, unassignedPeople, bootContext);
        const focusInUnassigned = isChartFocusInUnassigned(nodes, unassignedPeople, focusSlug);
        const unassignedCount = getUnassignedCount(payload || {});
        const hasChartFocus = !!focusSlug && !focusInUnassigned;
        const focusNode = focusSlug ? findChartNode(nodes, focusSlug) : null;
        if (focusNode && bootContext) {
          bootContext.focusName = focusNode.name;
          updateOrgToolbar(bootContext);
        }

        if (!nodes.length) {
          if (countEl) {
            countEl.textContent =
              unassignedPeople.length > 0
                ? "Nenhum colaborador com linha de reporte no organograma. Veja a lista abaixo."
                : "Nenhum colaborador no organograma. Execute o worker Graph.";
          }
          if (focusInUnassigned) {
            focusUnassignedRow(focusSlug, unassignedSection);
          }
          return;
        }

        if (window.__lioOrgChart && typeof window.__lioOrgChart.destroy === "function") {
          window.__lioOrgChart.destroy();
        }

        const chart = new OrgChart(treeEl, {
          template: "lio",
          align: OrgChart.align.center,
          orientation: OrgChart.orientation.top,
          padding: 20,
          mouseScroll: OrgChart.action.zoom,
          scaleInitial: hasChartFocus ? OrgChart.match.none : OrgChart.match.boundary,
          collapse:
            bootContext.viewMode === "scoped"
              ? { level: 20, allChildren: false }
              : { level: 2, allChildren: true },
          nodeBinding: {
            field_0: "name",
            field_1: "title",
            field_2: "dept",
            img_0: "img"
          }
        });

        window.__lioOrgChart = chart;

        setupOrgNodeMenu(nodeIndex);
        setupOrgPositionRequestModal();
        setupOrgLevelAddButtons(chart, nodeIndex);

        chart.onInit(function () {
          if (!countEl) return;
          if (bootContext.viewMode === "scoped") {
            countEl.textContent = formatScopedOrgCount(nodes, bootContext.focusName || bootContext.meName);
            return;
          }
          countEl.textContent = formatOrgCount(payload || {}, nodes, unassignedCount);
        });

        let chartLoadedHandled = false;

        function onChartLoaded() {
          if (chartLoadedHandled) return;
          if (bootId !== window.__lioOrgBootId) return;
          if (window.__lioOrgFocusReady) return;
          chartLoadedHandled = true;

          if (focusInUnassigned) {
            focusUnassignedRow(focusSlug, unassignedSection);
            window.__lioOrgFocusReady = { slug: normalizeSlugKey(focusSlug), mode: "unassigned" };
            scheduleOrgLevelButtonRefresh();
            return;
          }
          if (focusSlug) {
            focusOrgChartNode(focusSlug, nodes, chart, bootContext.viewMode);
            scheduleOrgLevelButtonRefresh();
            return;
          }
          fitOrgChartInPanel(chart, treeEl);
          window.__lioOrgFocusReady = { slug: "", mode: "fit-all" };
          scheduleOrgLevelButtonRefresh();
        }

        chart.load(nodes, onChartLoaded);
        setTimeout(onChartLoaded, 1500);
      }

      function focusOrgChartNode(slug, nodes, chart, viewMode) {
        if (!slug || !chart) return;
        const target = findChartNode(nodes, slug);
        if (!target) {
          fitOrgChartInPanel(chart, treeEl);
          window.__lioOrgFocusReady = { slug: "", mode: "not-found" };
          return;
        }

        function markFocusReady() {
          rememberFocusChartLevel(window.__lioOrgBootContext, chart, target.id);
          window.__lioOrgFocusReady = {
            slug: normalizeSlugKey(slug),
            nodeId: target.id,
            zoom: ORG_FOCUS_ZOOM
          };
          scheduleOrgLevelButtonRefresh();
        }

        function applyFocusAfterRootChange() {
          scheduleFocusViewport(chart, target.id, treeEl, markFocusReady);
        }

        if (viewMode === "full" && typeof chart.changeRoots === "function") {
          chart.changeRoots(target.id, [target.id], applyFocusAfterRootChange);
          setTimeout(function () {
            if (!window.__lioOrgFocusReady) {
              applyFocusAfterRootChange();
            }
          }, 3000);
          return;
        }

        applyFocusAfterRootChange();
      }

      function bootOrganogram() {
        const bootId = window.__lioOrgBootId;
        return resolveBootContext()
          .then(function (bootContext) {
            if (bootId !== window.__lioOrgBootId) return;
            window.__lioOrgBootContext = bootContext;
            updateOrgToolbar(bootContext);
            return Promise.all([
              window.LioApi.get("/people/org-chart"),
              bootContext.focusSlug
                ? window.LioApi.get("/people/" + encodeURIComponent(bootContext.focusSlug) + "/hierarchy").catch(
                    function () {
                      return null;
                    }
                  )
                : Promise.resolve(null)
            ]).then(function (results) {
              return { bootContext: bootContext, payload: results[0], hierarchy: results[1] };
            });
          })
          .then(function (bundle) {
            if (!bundle || bootId !== window.__lioOrgBootId) return;
            const bootContext = bundle.bootContext;
            const payload = bundle.payload || {};
            if (bundle.hierarchy) {
              bootContext.directReportsCount =
                bundle.hierarchy.directReportsCount !== undefined &&
                bundle.hierarchy.directReportsCount !== null
                  ? bundle.hierarchy.directReportsCount
                  : bundle.hierarchy.DirectReportsCount || 0;
            } else {
              bootContext.directReportsCount = 0;
            }
            window.__lioOrgBootContext = bootContext;
            const allApiNodes = getChartApiNodes(payload);
            let apiNodes = allApiNodes;

            if (bootContext.viewMode === "scoped" && bootContext.focusSlug) {
              const slugSet = buildVisibleSlugSet(bootContext.focusSlug, bundle.hierarchy, allApiNodes);
              apiNodes = filterApiNodesToVisible(allApiNodes, slugSet);
              apiNodes = repairFilteredApiNodeManagers(apiNodes, allApiNodes);
            }

            const unassignedApi =
              bootContext.viewMode === "full" ? getUnassignedNodes(payload) : [];

            if (!apiNodes.length && !unassignedApi.length) {
              if (countEl) countEl.textContent = "Nenhum colaborador no organograma. Execute o worker Graph.";
              return;
            }

            const unassignedPeople = unassignedApi.map(buildUnassignedPerson);
            const nodeIndexBySlug = {};
            unassignedPeople.forEach(function (person) {
              nodeIndexBySlug[person.slug] = person;
            });

            const nodes = buildNodesFromApi(apiNodes);
            nodes.forEach(function (node) {
              nodeIndexBySlug[node.slug] = node;
            });

            const unassignedSection = renderUnassignedSection(
              unassignedPeople,
              bootContext.focusSlug,
              nodeIndexBySlug
            );
            initOrgChart(nodes, payload, unassignedPeople, nodeIndexBySlug, unassignedSection, bootContext, bootId);
          })
          .catch(function () {
            if (bootId !== window.__lioOrgBootId) return;
            if (countEl) countEl.textContent = "Não foi possível carregar o organograma.";
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

      setupOrgPeopleSearch();
      setupOrgViewToggle();

      if (!window.LioApi || window.LioApi.useMock) {
        if (countEl) {
          countEl.textContent = "API indisponível — ative o backend e desabilite VITE_USE_MOCK.";
        }
        return;
      }

      bootOrganogram();
    })();