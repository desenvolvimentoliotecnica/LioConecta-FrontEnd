(function () {
      const commentPool = [
        { author: "Ana Costa", avatar: "avatar-julia-santos.png", time: "Há 12 min", text: "Excelente iniciativa! Já compartilhei com minha equipe." },
        { author: "Pedro Almeida", avatar: "avatar-carlos-mendes.png", time: "Há 25 min", text: "Muito bom ver a empresa investindo nisso." },
        { author: "Fernanda Lima", avatar: "avatar-marketing.png", time: "Há 40 min", text: "Alguém sabe onde encontro mais detalhes?" },
        { author: "Ricardo Souza", avatar: "avatar-alejandro-lopez.png", time: "Há 1 h", text: "Parabéns a todos os envolvidos!" },
        { author: "Camila Rocha", avatar: "avatar-maria-silva.png", time: "Há 1 h", text: "Isso vai fazer muita diferença no dia a dia." },
        { author: "Bruno Ferreira", avatar: "avatar-ti.png", time: "Há 2 h", text: "Ótima comunicação, clara e objetiva." },
        { author: "Luciana Dias", avatar: "avatar-rh.png", time: "Há 2 h", text: "Já estou aguardando a próxima etapa." },
        { author: "Marcos Vieira", avatar: "avatar-carlos-mendes.png", time: "Há 3 h", text: "Concordo plenamente com a proposta." },
        { author: "Patricia Nunes", avatar: "avatar-julia-santos.png", time: "Há 3 h", text: "Vou participar com certeza!" },
        { author: "Diego Martins", avatar: "avatar-alejandro-lopez.png", time: "Há 4 h", text: "Muito relevante para o nosso setor." },
        { author: "Helena Prado", avatar: "avatar-maria-silva.png", time: "Há 5 h", text: "Adorei a iniciativa, parabéns!" },
        { author: "Thiago Barros", avatar: "avatar-marketing.png", time: "Há 5 h", text: "Quando entra em vigor?" },
        { author: "Renata Gomes", avatar: "avatar-rh.png", time: "Há 6 h", text: "Informação muito útil, obrigada!" },
        { author: "Felipe Castro", avatar: "avatar-ti.png", time: "Há 7 h", text: "Já votei na enquete, boa ideia." },
        { author: "Isabela Moura", avatar: "avatar-julia-santos.png", time: "Há 8 h", text: "Que orgulho fazer parte dessa empresa!" },
        { author: "Gustavo Pires", avatar: "avatar-carlos-mendes.png", time: "Há 9 h", text: "Evento foi incrível, parabéns ao time!" },
        { author: "Aline Teixeira", avatar: "avatar-maria-silva.png", time: "Há 10 h", text: "Merecido demais, parabéns!" },
        { author: "Rodrigo Cunha", avatar: "avatar-alejandro-lopez.png", time: "Há 11 h", text: "Boa sorte na nova jornada!" },
        { author: "Vanessa Lopes", avatar: "avatar-marketing.png", time: "Há 12 h", text: "Fico feliz em ver essas novidades." },
        { author: "Eduardo Ramos", avatar: "avatar-ti.png", time: "Ontem", text: "Treinamento já concluído por aqui." },
        { author: "Carla Mendes", avatar: "avatar-rh.png", time: "Ontem", text: "Calendário recebido, vou verificar as datas." },
        { author: "João Pedro", avatar: "avatar-carlos-mendes.png", time: "Ontem", text: "Coffee break sempre une o time!" },
        { author: "Mariana Silva", avatar: "avatar-julia-santos.png", time: "Ontem", text: "Centro de inovação ficou lindo!" },
        { author: "André Luiz", avatar: "avatar-alejandro-lopez.png", time: "Ontem", text: "Cinco anos voando, parabéns!" }
      ];

      function shuffle(list) {
        const items = list.slice();
        for (let i = items.length - 1; i > 0; i -= 1) {
          const j = Math.floor(Math.random() * (i + 1));
          [items[i], items[j]] = [items[j], items[i]];
        }
        return items;
      }

      function renderComment(comment) {
        return `
          <div class="comment">
            <img class="avatar avatar--xs" src="${comment.avatar}" alt="${comment.author}" />
            <div>
              <div class="comment__meta">${comment.author} <span class="comment__time">· ${comment.time}</span></div>
              <div class="comment__text">${comment.text}</div>
            </div>
          </div>
        `;
      }

      const posts = document.querySelectorAll(".feed-grid .card:not(.card--mood)");
      let available = shuffle(commentPool);

      posts.forEach(function (post) {
        const total = Math.floor(Math.random() * 3) + 1;
        const picked = [];

        for (let i = 0; i < total; i += 1) {
          if (!available.length) available = shuffle(commentPool);
          picked.push(available.shift());
        }

        const section = document.createElement("div");
        section.className = "comments";
        section.innerHTML = `
          <div class="comments__title">${picked.length} comentário${picked.length > 1 ? "s" : ""}</div>
          ${picked.map(renderComment).join("")}
          <div class="comments__input">Escreva um comentário...</div>
        `;
        post.appendChild(section);
      });
    })();