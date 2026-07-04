import json
import os
import re
import unicodedata


def slug(name):
    n = unicodedata.normalize("NFD", name)
    n = "".join(c for c in n if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]+", "-", n.lower()).strip("-")


avatars_pool = [
    "avatar-maria-silva.png",
    "avatar-carlos-mendes.png",
    "avatar-julia-santos.png",
    "avatar-rh.png",
    "avatar-marketing.png",
    "avatar-ti.png",
    "avatar-alejandro-lopez.png",
    "avatar-nexora-news.png",
]

ceo = {
    "name": "Júlio Schwartzman",
    "title": "CEO · Diretoria Executiva",
    "img": "avatar-julio-schwartzman.png",
    "dept": "Executiva",
    "deptId": "executiva",
    "tags": ["ceo"],
}

branches = [
    {
        "id": "produto",
        "dept": "Produto",
        "director": {
            "name": "Carlos Mendes",
            "title": "Diretor de Produto",
            "img": "avatar-carlos-mendes.png",
        },
        "team": [
            {"name": "Maria Silva", "title": "Gerente de Projetos"},
            {"name": "Ricardo Souza", "title": "Product Owner"},
            {"name": "Julia Santos", "title": "Designer de Produto"},
        ],
    },
    {
        "id": "rh",
        "dept": "Recursos Humanos",
        "director": {
            "name": "Patricia Nunes",
            "title": "Coordenadora de RH",
            "img": "avatar-rh.png",
        },
        "team": [
            {"name": "Renata Gomes", "title": "Analista de RH"},
            {"name": "Helena Prado", "title": "Business Partner"},
            {"name": "Diego Martins", "title": "Recrutador"},
        ],
    },
    {
        "id": "marketing",
        "dept": "Marketing",
        "director": {
            "name": "Camila Rocha",
            "title": "Coord. de Comunicação",
            "img": "avatar-marketing.png",
        },
        "team": [
            {"name": "Fernanda Lima", "title": "Analista de Marketing"},
            {"name": "Thiago Barros", "title": "Designer Gráfico"},
            {"name": "Simone Alves", "title": "Analista de Conteúdo"},
        ],
    },
    {
        "id": "ti",
        "dept": "TI",
        "director": {
            "name": "Igor Martins",
            "title": "Tech Lead",
            "img": "avatar-ti.png",
        },
        "team": [
            {"name": "Tiago Nunes", "title": "Desenvolvedor Frontend"},
            {"name": "William Souza", "title": "DevOps Engineer"},
            {"name": "Rafael Costa", "title": "Desenvolvedor Backend"},
        ],
    },
    {
        "id": "comercial",
        "dept": "Comercial",
        "director": {
            "name": "João Pereira",
            "title": "Gerente Comercial",
            "img": "avatar-nexora-news.png",
        },
        "team": [
            {"name": "Una Ferreira", "title": "Executiva Comercial"},
            {"name": "Xavier Dias", "title": "SDR"},
            {"name": "Lucas Ferreira", "title": "Account Executive"},
        ],
    },
    {
        "id": "financeiro",
        "dept": "Financeiro",
        "director": {
            "name": "Marcos Vieira",
            "title": "Gerente Financeiro",
            "img": "avatar-maria-silva.png",
        },
        "team": [
            {"name": "Vicente Lima", "title": "Analista Financeiro"},
            {"name": "Natália Rocha", "title": "Analista de Controladoria"},
            {"name": "Bianca Alves", "title": "Assistente Financeiro"},
        ],
    },
]

skills_by_dept = {
    "Executiva": ["Estratégia", "Governança", "Liderança executiva", "Relacionamento institucional"],
    "Produto": ["Roadmap", "Discovery", "UX Research", "Gestão ágil"],
    "Recursos Humanos": ["People analytics", "Recrutamento", "Desenvolvimento organizacional", "Cultura"],
    "Marketing": ["Branding", "Conteúdo", "Campanhas", "Comunicação interna"],
    "TI": ["Arquitetura", "DevOps", "Segurança", "Desenvolvimento"],
    "Comercial": ["Negociação", "CRM", "Prospecção", "Relacionamento com clientes"],
    "Financeiro": ["Controladoria", "Orçamento", "Fluxo de caixa", "Compliance financeiro"],
}

education_by_dept = {
    "Executiva": [
        ("MBA em Gestão Empresarial", "FGV", "pos"),
        ("Administração de Empresas", "PUC-Campinas", "graduacao"),
    ],
    "Produto": [
        ("Gestão de Produtos Digitais", "PM3", "certificacao"),
        ("Design Digital", "IAC", "graduacao"),
    ],
    "Recursos Humanos": [
        ("Pós-graduação em Gestão de Pessoas", "ESAN", "pos"),
        ("Psicologia Organizacional", "PUC-Campinas", "graduacao"),
    ],
    "Marketing": [
        ("Marketing Digital", "ESPM", "pos"),
        ("Publicidade e Propaganda", "UNICAMP", "graduacao"),
    ],
    "TI": [
        ("Ciência da Computação", "UNICAMP", "graduacao"),
        ("Cloud Architecture", "AWS Training", "certificacao"),
    ],
    "Comercial": [
        ("Negócios e Vendas Consultivas", "FIA", "pos"),
        ("Administração de Empresas", "UNIP", "graduacao"),
    ],
    "Financeiro": [
        ("Contabilidade e Finanças", "Mackenzie", "graduacao"),
        ("Controladoria e Finanças", "FIPECAFI", "pos"),
    ],
}

education_type_labels = {
    "graduacao": "Graduação",
    "pos": "Pós-graduação",
    "certificacao": "Certificação",
    "tecnologo": "Tecnólogo",
}

marital_statuses = ["Solteiro(a)", "Casado(a)", "União estável", "Divorciado(a)"]
birth_months = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
]

interaction_templates = [
    ("recognition", "Reconhecimento no feed", "Recebeu elogio público por entrega de projeto.", "fa-solid fa-gift"),
    ("message", "Mensagem interna", "Conversou com colega sobre alinhamento de sprint.", "fa-regular fa-comment"),
    ("meeting", "Reunião registrada", "Participou de reunião de alinhamento semanal.", "fa-regular fa-calendar"),
    ("document", "Documento compartilhado", "Publicou material no módulo de documentos.", "fa-regular fa-file-lines"),
    ("group", "Atividade em grupo", "Interagiu no grupo departamental da intranet.", "fa-solid fa-users"),
]

pronouns_options = ["Ele/Dele", "Ela/Dela", "Elu/Delu"]
work_models = ["Presencial", "Híbrido", "Remoto"]
floors = ["2º andar", "3º andar", "4º andar"]

projects_by_dept = {
    "Executiva": [("proj-estrategia", "Plano Estratégico 2026", "Patrocinador", "ativo")],
    "Produto": [("proj-portal", "Portal LioConecta", "Gerente", "ativo")],
    "Recursos Humanos": [("proj-cultura", "Programa de Cultura", "Líder", "ativo")],
    "Marketing": [("proj-rebrand", "Rebranding LioTécnica", "Coordenador", "ativo")],
    "TI": [("proj-infra", "Modernização de Infra", "Tech Lead", "ativo")],
    "Comercial": [("proj-expansao", "Expansão Comercial 2026", "Executivo", "ativo")],
    "Financeiro": [("proj-orcamento", "Orçamento Anual", "Analista", "concluído")],
}

certifications_by_dept = {
    "Executiva": [("Executive Leadership Program", "Harvard Business Publishing", "2023")],
    "Produto": [("Certified Scrum Product Owner", "Scrum Alliance", "2024")],
    "Recursos Humanos": [("SHRM-CP", "SHRM", "2024")],
    "Marketing": [("Google Analytics Certification", "Google", "2024")],
    "TI": [("AWS Certified Solutions Architect", "AWS", "2025")],
    "Comercial": [("Salesforce Administrator", "Salesforce", "2024")],
    "Financeiro": [("CFA Level I", "CFA Institute", "2023")],
}

groups_by_dept = {
    "executiva": ("grupo-diretoria", "Diretoria Executiva", 8),
    "produto": ("grupo-produto", "Produto & Inovação", 14),
    "rh": ("grupo-rh", "People & Cultura", 12),
    "marketing": ("grupo-marketing", "Marketing Interno", 16),
    "ti": ("grupo-ti", "Engenharia & TI", 18),
    "comercial": ("grupo-comercial", "Time Comercial", 15),
    "financeiro": ("grupo-financeiro", "Finanças & Controladoria", 11),
}

recognition_titles = [
    ("Espírito colaborativo", "Destaque por apoiar colegas em entregas críticas."),
    ("Entrega excepcional", "Reconhecimento por superar metas do trimestre."),
    ("Inovação prática", "Ideia implementada que melhorou processos internos."),
]

default_documents = [
    ("Manual do Colaborador", "manual", "documentos-manuais-procedimentos.html", "2026-05-15"),
    ("Política de Segurança da Informação", "politica", "documentos-politicas-internas.html", "2026-04-20"),
]

default_communications = [
    ("Campanha de segurança da informação", "urgente", "comunicados-urgentes.html", "2026-05-10"),
    ("Comunicado departamental", "departamental", "comunicados-departamentais.html", "2026-06-01"),
]

avatar_i = 0


def avatar_for(entry):
    global avatar_i
    if entry.get("img"):
        return entry["img"]
    a = avatars_pool[avatar_i % len(avatars_pool)]
    avatar_i += 1
    return a


def make_skill_objects(skill_names, seed):
    return [
        {
            "name": name,
            "level": 3 + (seed + index) % 3,
            "endorsements": 5 + (seed + index * 3) % 20,
        }
        for index, name in enumerate(skill_names)
    ]


def make_links(sid, dept, seed):
    links = {
        "linkedin": f"https://www.linkedin.com/in/{sid}",
    }
    if dept == "TI":
        links["github"] = f"https://github.com/{sid}"
    if dept in ("Marketing", "Produto") and seed % 2 == 0:
        links["portfolio"] = f"https://{sid}.liotecnica.com.br"
    return links


def make_projects(dept, admission, seed):
    templates = projects_by_dept.get(dept, projects_by_dept["Produto"])
    projects = []
    for index, (proj_id, name, role, status) in enumerate(templates[: 1 + seed % 2]):
        projects.append(
            {
                "id": proj_id,
                "name": name,
                "role": role,
                "status": status,
                "since": admission,
            }
        )
    return projects


def make_groups(dept_id, seed):
    group_id, name, members = groups_by_dept.get(dept_id, groups_by_dept["produto"])
    role = "Administrador" if seed % 7 == 0 else "Membro"
    return [
        {
            "id": group_id,
            "name": name,
            "role": role,
            "members": members + (seed % 4),
            "url": "grupos-meus-grupos.html",
        }
    ]


def make_recognitions(person, seed):
    author_id = person.get("managerId")
    author_name = person.get("managerName") or "LioConecta"
    recognitions = []
    for index, (title, detail) in enumerate(recognition_titles[: 1 + seed % 2]):
        day = max(28 - index * 7 - (seed % 4), 1)
        recognitions.append(
            {
                "date": f"2026-06-{day:02d}",
                "author": author_name,
                "authorId": author_id or "julio-schwartzman",
                "title": title,
                "detail": detail,
                "feedUrl": f"intranet-wireframe.html#post-{20 + seed + index:03d}",
            }
        )
    return recognitions


def make_documents(seed):
    return [
        {
            "title": title,
            "type": doc_type,
            "url": url,
            "date": date,
        }
        for title, doc_type, url, date in default_documents[: 1 + seed % 2]
    ]


def make_communications(seed):
    return [
        {
            "title": title,
            "type": comm_type,
            "url": url,
            "date": date,
        }
        for title, comm_type, url, date in default_communications[: 1 + seed % 2]
    ]


def enrich_mentor_buddy(people):
    by_id = {person["id"]: person for person in people}
    by_dept = {}
    for person in people:
        by_dept.setdefault(person["deptId"], []).append(person)

    for person in people:
        if "ceo" in person.get("tags", []):
            continue

        seed = sum(ord(c) for c in person["name"])
        admission_year = int(person["admission"].split()[-1])
        manager = by_id.get(person["managerId"]) if person.get("managerId") else None
        director = next(
            (
                candidate
                for candidate in people
                if candidate["deptId"] == person["deptId"]
                and "director" in candidate.get("tags", [])
            ),
            manager,
        )

        if admission_year >= 2024:
            dept_peers = [
                peer
                for peer in by_dept.get(person["deptId"], [])
                if peer["id"] != person["id"] and "member" in peer.get("tags", [])
            ]
            if dept_peers:
                buddy = dept_peers[seed % len(dept_peers)]
                person["buddy"] = {
                    "id": buddy["id"],
                    "name": buddy["name"],
                    "since": person["admission"],
                }
            if director:
                person["mentor"] = {
                    "id": director["id"],
                    "name": director["name"],
                    "since": person["admission"],
                }
        elif manager:
            person["mentor"] = {
                "id": manager["id"],
                "name": manager["name"],
                "since": person["admission"],
            }


def make_person(entry, dept, dept_id, manager_id, manager_name, org_id, tags):
    sid = slug(entry["name"])
    seed = sum(ord(c) for c in entry["name"])
    months = ["jan", "mar", "mai", "jul", "set", "nov"]
    year = 2018 + (seed % 7)
    month = months[seed % len(months)]
    admission = f"{month} de {year}"
    email = slug(entry["name"]).replace("-", ".") + "@liotecnica.com.br"
    phone = f"(19) 3{1000 + seed % 9000:04d}"
    loc = "Campinas, SP · Matriz" if dept == "Executiva" else f"Campinas, SP · {dept}"
    skill_names = skills_by_dept[dept][:3] + [entry["title"].split()[0]]
    history = [
        {
            "date": str(year),
            "title": entry["title"],
            "dept": dept,
            "type": "atual",
            "note": "Cargo atual na LioConecta.",
        },
        {
            "date": str(year - 2),
            "title": entry["title"]
            .replace("Gerente", "Analista")
            .replace("Diretor", "Coordenador")
            .replace("CEO", "Diretor"),
            "dept": dept,
            "type": "promotion",
            "note": "Promoção por desempenho e entrega consistente.",
        },
        {
            "date": str(year - 4),
            "title": "Analista",
            "dept": dept,
            "type": "admission",
            "note": "Admissão na LioTécnica.",
        },
    ]
    interactions = []
    for i, (kind, title, detail, icon) in enumerate(interaction_templates):
        day = max(30 - i * 7 - (seed % 5), 1)
        interactions.append(
            {
                "date": f"2026-06-{day:02d}",
                "type": kind,
                "title": title,
                "detail": detail,
                "icon": icon,
                "feedUrl": f"intranet-wireframe.html#post-{19 + seed + i:03d}",
            }
        )
    direct = 6 if "ceo" in tags else (3 if "director" in tags else 0)
    title_lower = entry["title"].lower()
    education = []
    for index, (degree, institution, edu_type) in enumerate(education_by_dept[dept]):
        start = year - 8 - index * 3 - (seed % 2)
        end = start + (2 if edu_type == "certificacao" else 4)
        education.append(
            {
                "degree": degree,
                "institution": institution,
                "period": f"{start}–{end}",
                "type": edu_type,
                "note": education_type_labels.get(edu_type, edu_type),
            }
        )
    birth_year = 1978 + (seed % 18)
    birth_day = 1 + (seed % 28)
    birth_month_num = (seed % 12) + 1
    birth_month = birth_months[birth_month_num - 1]
    cpf_suffix = f"{seed % 100:02d}"
    rg_number = f"{10 + seed % 89:02d}.{seed % 1000:03d}.{900 + seed % 100:03d}-{seed % 10}"
    bio = (
        f"{entry['name']} atua em {dept} na LioConecta, com foco em {title_lower} "
        "e colaboração entre áreas."
    )
    personal = {
        "fullName": entry["name"],
        "birthDate": f"{birth_day} de {birth_month} de {birth_year}",
        "birthMonth": birth_month_num,
        "birthDay": birth_day,
        "cpf": f"***.***.***-{cpf_suffix}",
        "rg": rg_number,
        "maritalStatus": marital_statuses[seed % len(marital_statuses)],
        "nationality": "Brasileira",
        "visibility": "rh-only" if seed % 4 == 0 else "public",
    }
    projects = make_projects(dept, admission, seed)
    groups = make_groups(dept_id, seed)
    documents = make_documents(seed)
    person_stub = {"managerId": manager_id, "managerName": manager_name}
    recognitions = make_recognitions(person_stub, seed)
    role_years = max(1, min(2026 - year, 2026 - year))
    return {
        "id": sid,
        "orgChartId": org_id,
        "name": entry["name"],
        "title": entry["title"],
        "dept": dept,
        "deptId": dept_id,
        "img": avatar_for(entry),
        "tags": tags,
        "managerId": manager_id,
        "managerName": manager_name,
        "contact": {
            "email": email,
            "phone": phone,
            "location": loc,
            "teams": "@" + entry["name"],
        },
        "admission": admission,
        "bio": bio,
        "aboutMe": (
            f"Sou {entry['name'].split()[0]}, {entry['title'].lower()} na área de {dept}. "
            f"Trabalho na LioTécnica desde {admission} e gosto de conectar pessoas, "
            "compartilhar conhecimento e entregar resultados com impacto."
        ),
        "pronouns": pronouns_options[seed % len(pronouns_options)],
        "availability": {
            "workModel": work_models[seed % len(work_models)],
            "schedule": "9h–18h",
            "timezone": "America/Sao_Paulo",
            "floor": floors[seed % len(floors)],
            "room": f"{dept} · Sala {300 + seed % 20}",
        },
        "links": make_links(sid, dept, seed),
        "roleTenure": {
            "years": role_years,
            "since": admission,
            "title": entry["title"],
        },
        "personal": personal,
        "skills": make_skill_objects(skill_names, seed),
        "languages": [
            {"name": "Português", "level": "Nativo"},
            {"name": "Inglês", "level": "Avançado" if seed % 2 == 0 else "Intermediário"},
        ],
        "education": education,
        "certifications": [
            {
                "name": name,
                "issuer": issuer,
                "year": cert_year,
                "type": "certificacao",
            }
            for name, issuer, cert_year in certifications_by_dept.get(dept, [])
        ],
        "history": history,
        "projects": projects,
        "groups": groups,
        "recognitions": recognitions,
        "documents": documents,
        "communications": make_communications(seed),
        "interactions": interactions,
        "stats": {
            "tenureYears": 2026 - year,
            "directReports": direct,
            "groups": len(groups),
            "recognitions": len(recognitions) + (seed % 8),
            "documentsCount": len(documents),
            "projectsCount": len(projects),
        },
    }


people = []
oid = 1
ceo_id = slug(ceo["name"])
people.append(make_person(ceo, ceo["dept"], ceo["deptId"], None, None, oid, ceo["tags"]))
oid += 1

for branch in branches:
    director = branch["director"]
    director_id = slug(director["name"])
    people.append(
        make_person(
            director,
            branch["dept"],
            branch["id"],
            ceo_id,
            ceo["name"],
            oid,
            ["director"],
        )
    )
    oid += 1
    for member in branch["team"]:
        people.append(
            make_person(
                member,
                branch["dept"],
                branch["id"],
                director_id,
                director["name"],
                oid,
                ["member"],
            )
        )
        oid += 1

enrich_mentor_buddy(people)

output = {"version": 2, "updatedAt": "2026-07-04", "people": people}
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
data_dir = os.path.join(root, "data")
os.makedirs(data_dir, exist_ok=True)
path = os.path.join(data_dir, "pessoas-perfis.json")
with open(path, "w", encoding="utf-8") as handle:
    json.dump(output, handle, ensure_ascii=False, indent=2)

print(f"Wrote {len(people)} profiles to {path}")
