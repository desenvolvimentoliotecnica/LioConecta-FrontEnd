# EmailCompose — componente reutilizável

Modal global de composição de e-mail com TipTap, anexos, CC/CCO e envio via fila SMTP (`POST /api/v1/email/send`).

## Arquivos

| Arquivo | Função |
|---------|--------|
| `src/components/email/EmailComposeProvider.tsx` | Provider + bridge `window.LioEmailCompose` |
| `src/components/email/EmailComposeModal.tsx` | Modal (portal) |
| `src/components/email/RichTextEditor.tsx` | Editor TipTap |
| `src/api/hooks/useSendEmail.ts` | Upload + send mutations |
| `src/styles/email-compose-modal.css` | Estilos do modal |
| `src/styles/email-rich-text.css` | Estilos do editor |

Montado em `src/auth/AuthProvider.tsx` — disponível em **toda** a aplicação.

## React

```tsx
import { useEmailCompose } from "../components/email/EmailComposeProvider";

function Example() {
  const { openCompose } = useEmailCompose();

  return (
    <button
      type="button"
      onClick={() =>
        openCompose({
          to: [{ name: "Carlos Mendes", email: "carlos.mendes@liotecnica.com.br" }],
          subject: "Assunto",
          lockedTo: false,
          source: "example",
        })
      }
    >
      Enviar e-mail
    </button>
  );
}
```

## Legacy (HTML/JS)

```js
window.LioEmailCompose.open({
  to: [{ name: "Nome", email: "email@liotecnica.com.br" }],
  recipientSlug: "slug-do-colaborador",
  lockedTo: true,
  source: "profile",
});
```

## Opções (`EmailComposeOpenOptions`)

| Campo | Descrição |
|-------|-----------|
| `to` | Destinatários iniciais (chips quando `lockedTo`) |
| `recipientSlug` | Slug em `People` — backend resolve e-mail |
| `subject`, `bodyHtml`, `cc`, `bcc` | Valores iniciais |
| `lockedTo` | Para fixo (perfil) |
| `showBcc` | Exibir toggle CCO (default true) |
| `showExternalMailtoLink` | Link “Abrir no Outlook” |
| `source` | Metadata enviada ao backend (`profile`, `org-chart`, …) |

## API backend

- `POST /api/v1/email/attachments` — multipart, max 10 MB, 5 anexos
- `POST /api/v1/email/send` — enfileira mensagem (status `Pending`)

CC/CCO restritos a `@liotecnica.com.br`.

## Primeiro consumidor

Perfil de pessoas (`/pessoas/perfil?id={slug}`) — botão **E-mail** chama `LioEmailCompose.open` com `lockedTo: true` e `recipientSlug`.

Diretório (`/pessoas/diretorio`) — ícone de envelope em cada card abre o mesmo modal com `source: "directory"`.
