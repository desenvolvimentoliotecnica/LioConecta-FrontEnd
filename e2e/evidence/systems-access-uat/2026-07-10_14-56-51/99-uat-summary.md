# UAT Solicitar acesso a sistemas — evidências

## Resultado: PASSOU

- **Run:** `2026-07-10_14-56-51`
- **Marker:** E2E-SYSTEMS-ACCESS-1783706211124
- **RecordId / Protocolo:** dfe93f85-ec0f-41b9-a0c5-915fdd5e8e41 / 234
- **GLPI URL:** https://servicedesk.liotecnica.com.br/front/ticket.form.php?id=234
- **Sistema:** Fluig (`fluig`)
- **Atores:** colaborador

## Fluxo validado

1. Hub Acesso a Sistemas
2. Modal Solicitar acesso (sistema, ambiente PRD, serviço ITIL, justificativa com marker)
3. POST Help Desk/GLPI com protocolo
4. Resultado com Ver no GLPI + Acompanhar meus chamados
5. Modal Acompanhar ticket com fila carregada (protocolo visível)

## Prints

| # | Arquivo | Etapa |
|---|---------|-------|
| 01 | `01-colaborador-hub-sistemas.png` | Hub de sistemas |
| 02 | `02-colaborador-modal-preenchido.png` | Modal preenchido |
| 03 | `03-colaborador-resultado-glpi.png` | Protocolo GLPI |
| 04 | `04-colaborador-help-desk-acompanhar.png` | Fila Acompanhar ticket |

Gerado em: 2026-07-10T17:57:03.489Z
