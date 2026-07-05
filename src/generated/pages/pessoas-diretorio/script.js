(function () {
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

      const departments = [
        {
          id: "produto",
          name: "Produto",
          people: [
            ["Maria Silva", "Gerente de Projetos"],
            ["Carlos Mendes", "Analista de Produto"],
            ["Julia Santos", "Designer de Produto"],
            ["Ricardo Souza", "Product Owner"],
            ["Ana Costa", "UX Researcher"],
            ["Pedro Almeida", "Analista de Negócios"],
            ["Luciana Dias", "Scrum Master"],
            ["Marcos Vieira", "Analista de Produto Jr."],
            ["Isabela Moura", "Designer UI"],
            ["João Pedro", "Estagiário de Produto"]
          ]
        },
        {
          id: "rh",
          name: "Recursos Humanos",
          people: [
            ["Patricia Nunes", "Coordenadora de RH"],
            ["Renata Gomes", "Analista de RH"],
            ["Carla Mendes", "Business Partner"],
            ["Helena Prado", "Analista de Departamento Pessoal"],
            ["Diego Martins", "Recrutador"],
            ["Vanessa Lopes", "Analista de Treinamento"],
            ["André Luiz", "Coordenador de Benefícios"],
            ["Mariana Silva", "Assistente de RH"]
          ]
        },
        {
          id: "marketing",
          name: "Marketing",
          people: [
            ["Fernanda Lima", "Analista de Marketing"],
            ["Camila Rocha", "Coordenadora de Comunicação"],
            ["Thiago Barros", "Designer Gráfico"],
            ["Gustavo Pires", "Analista de Conteúdo"],
            ["Aline Teixeira", "Analista de Social Media"],
            ["Rodrigo Cunha", "Analista de Branding"],
            ["Eduarda Nascimento", "Analista de Eventos"],
            ["Larissa Fonseca", "Analista de CRM"]
          ]
        },
        {
          id: "ti",
          name: "Tecnologia da Informação",
          people: [
            ["Bruno Ferreira", "Analista de Infraestrutura"],
            ["Eduardo Ramos", "Especialista em Segurança"],
            ["Felipe Costa", "Desenvolvedor Backend"],
            ["Gabriel Santos", "Desenvolvedor Frontend"],
            ["Henrique Alves", "Analista de Suporte"],
            ["Ivan Mendes", "Engenheiro de Dados"],
            ["Juliana Ribeiro", "Analista de Sistemas"],
            ["Kauã Oliveira", "DevOps Engineer"],
            ["Leonardo Prado", "Arquiteto de Software"],
            ["Marcelo Duarte", "Analista de QA"]
          ]
        },
        {
          id: "comercial",
          name: "Comercial",
          people: [
            ["Alejandro López", "Executivo de Contas"],
            ["Beatriz Cavalcanti", "Gerente Comercial"],
            ["Caio Nunes", "Analista de Pré-vendas"],
            ["Débora Lima", "Executiva de Contas"],
            ["Elias Ferreira", "Coordenador Comercial"],
            ["Fabiana Souza", "Analista de Propostas"],
            ["Guilherme Rocha", "SDR"],
            ["Helena Cardoso", "Customer Success"],
            ["Igor Pimentel", "Analista Comercial"]
          ]
        },
        {
          id: "financeiro",
          name: "Financeiro",
          people: [
            ["Júlia Campos", "Controller"],
            ["Karina Dias", "Analista Financeiro"],
            ["Luana Freitas", "Analista de Contas a Pagar"],
            ["Milena Borges", "Analista de Contas a Receber"],
            ["Nicolas Viana", "Assistente Financeiro"]
          ]
        }
      ];

      let avatarIndex = 0;

      function nextAvatar() {
        const avatar = avatars[avatarIndex % avatars.length];
        avatarIndex += 1;
        return "/" + avatar;
      }

      function renderPerson(name, role) {
        const avatar = nextAvatar();
        return `
          <article class="person-card">
            <img class="person-card__avatar" src="${avatar}" alt="" />
            <h2 class="person-card__name">${name}</h2>
            <p class="person-card__role">${role}</p>
            <div class="person-card__actions">
              <a class="person-card__btn" href="#" aria-label="Enviar e-mail para ${name}"><i class="fa-regular fa-envelope" aria-hidden="true"></i></a>
              <a class="person-card__btn" href="#" aria-label="Enviar mensagem para ${name}"><i class="fa-regular fa-comment" aria-hidden="true"></i></a>
              <a class="person-card__btn" href="#" aria-label="Ver perfil de ${name}"><i class="fa-regular fa-user" aria-hidden="true"></i></a>
            </div>
          </article>
        `;
      }

      function renderDepartment(dept) {
        const cards = dept.people.map(function (person) {
          return renderPerson(person[0], person[1]);
        }).join("");

        return `
          <section class="dept-group" data-dept="${dept.id}" aria-label="${dept.name}">
            <div class="dept-group__header">
              <h2 class="dept-group__title">${dept.name}</h2>
              <span class="dept-group__count">${dept.people.length} colaboradores</span>
            </div>
            <div class="directory-grid">
              ${cards}
            </div>
          </section>
        `;
      }

      const root = document.getElementById("directory-root");
      const countEl = document.getElementById("directory-count");
      const filters = document.getElementById("directory-filters");
      let activeFilter = "all";

      if (!root) return;

      root.innerHTML = departments.map(renderDepartment).join("");

      function updateCount(visibleTotal, groupCount) {
        if (!countEl) return;
        if (activeFilter === "all") {
          countEl.textContent = "Exibindo " + visibleTotal + " colaboradores em " + groupCount + " departamentos";
        } else {
          countEl.textContent = "Exibindo " + visibleTotal + " colaboradores";
        }
      }

      function applyFilter(filter) {
        activeFilter = filter;
        let visibleTotal = 0;
        let groupCount = 0;

        root.querySelectorAll(".dept-group").forEach(function (group) {
          const match = filter === "all" || group.getAttribute("data-dept") === filter;
          group.hidden = !match;
          if (match) {
            groupCount += 1;
            visibleTotal += group.querySelectorAll(".person-card").length;
          }
        });

        updateCount(visibleTotal, groupCount);
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