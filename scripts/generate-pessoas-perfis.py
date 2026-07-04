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

avatar_i = 0


def avatar_for(entry):
    global avatar_i
    if entry.get("img"):
        return entry["img"]
    a = avatars_pool[avatar_i % len(avatars_pool)]
    avatar_i += 1
    return a


def make_person(entry, dept, dept_id, manager_id, manager_name, org_id, tags):
    sid = slug(entry["name"])
    seed = sum(ord(c) for c in entry["name"])
    months = ["jan", "mar", "mai", "jul", "set", "nov"]
    year = 2018 + (seed % 7)
    month = months[seed % len(months)]
    email = slug(entry["name"]).replace("-", ".") + "@liotecnica.com.br"
    phone = f"(19) 3{1000 + seed % 9000:04d}"
    loc = "Campinas, SP · Matriz" if dept == "Executiva" else f"Campinas, SP · {dept}"
    skills = skills_by_dept[dept][:3] + [entry["title"].split()[0]]
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
    birth_month = birth_months[seed % 12]
    cpf_suffix = f"{seed % 100:02d}"
    rg_number = f"{10 + seed % 89:02d}.{seed % 1000:03d}.{900 + seed % 100:03d}-{seed % 10}"
    personal = {
        "fullName": entry["name"],
        "birthDate": f"{birth_day} de {birth_month} de {birth_year}",
        "cpf": f"***.***.***-{cpf_suffix}",
        "rg": rg_number,
        "maritalStatus": marital_statuses[seed % len(marital_statuses)],
        "nationality": "Brasileira",
    }
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
        "admission": f"{month} de {year}",
        "bio": f"{entry['name']} atua em {dept} na LioConecta, com foco em {title_lower} e colaboração entre áreas.",
        "personal": personal,
        "skills": skills,
        "education": education,
        "history": history,
        "interactions": interactions,
        "stats": {
            "tenureYears": 2026 - year,
            "directReports": direct,
            "groups": 2 + (seed % 3),
            "recognitions": 5 + (seed % 15),
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

output = {"version": 1, "updatedAt": "2026-07-04", "people": people}
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
data_dir = os.path.join(root, "data")
os.makedirs(data_dir, exist_ok=True)
path = os.path.join(data_dir, "pessoas-perfis.json")
with open(path, "w", encoding="utf-8") as handle:
    json.dump(output, handle, ensure_ascii=False, indent=2)

print(f"Wrote {len(people)} profiles to {path}")
