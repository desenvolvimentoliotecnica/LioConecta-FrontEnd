# API — Gestão de Cardápio (Facilities)

Contrato esperado pelo frontend LioConecta para o módulo de cardápio semanal.

## Leitura

### `GET /calendar/menu/{date}`

Retorna o cardápio publicado de um dia (formato `DailyMenuDto`).

- Autenticação: usuário logado
- 404 ou `published: false` → calendário exibe mensagem vazia

### `GET /facilities/menu/week?start={YYYY-MM-DD}`

Retorna a semana completa (segunda a domingo) para gestão/consulta.

### `GET /facilities/menu/week/pdf?start={YYYY-MM-DD}`

Gera e retorna o PDF da semana (A4 paisagem, grade Seg–Dom).

- Autenticação: usuário logado
- `Content-Type`: `application/pdf`
- `Content-Disposition`: attachment com nome `cardapio-semanal-{start}.pdf`
- `start` deve ser uma segunda-feira (`400` se inválido)

### `GET /facilities/menu/bootstrap`

Retorna `{ canEdit: boolean, templates: { lunchSections, mealTypes } }`.

## Escrita (requer role ou e-mail autorizado)

### `PUT /facilities/menu/{date}`

Body: `SaveDailyMenuRequest`

### `POST /facilities/menu/{date}/copy-from`

Body: `{ sourceDate: string }`

### `POST /facilities/menu/week/copy-from`

Body: `{ sourceWeekStart: string, targetWeekStart?: string }`

### `POST /facilities/menu/week/send-email`

Body: `{ weekStart, recipients?: string[], includePdf?: boolean }`

Quando `includePdf: true`, anexa o PDF gerado pela mesma lógica de `GET /facilities/menu/week/pdf`.

### `DELETE /facilities/menu/{date}`

Remove cardápio do dia.

## Configuração (Admin)

App settings:

| Key | Descrição |
|-----|-----------|
| `facilities.menu.allowed_roles` | JSON array de roles |
| `facilities.menu.allowed_emails` | JSON array de e-mails editores |
| `facilities.menu.email_recipients` | Destinatários padrão do envio semanal |

## Modelo `DailyMenuDto`

```json
{
  "date": "2026-07-07",
  "dayStatus": "normal",
  "dayStatusLabel": null,
  "meals": [
    {
      "mealType": "lunch",
      "sections": [
        { "key": "entrada", "label": "Entrada (Sopas)", "value": "Creme de tomate" }
      ]
    }
  ],
  "notes": null,
  "published": true,
  "updatedAt": "2026-07-07T12:00:00Z",
  "updatedBy": "user@liotecnica.com.br"
}
```

`dayStatus`: `normal` | `holiday` | `closed`

## Persistência sugerida

Tabela `cafeteria_menus`: `date` (PK), `payload` (JSONB), `published`, `updated_at`, `updated_by`.
