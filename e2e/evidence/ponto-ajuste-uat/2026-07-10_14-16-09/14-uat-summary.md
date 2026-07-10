# UAT Ajuste de Ponto — evidências

## Resultado: PASSOU

- **Marker:** E2E-PONTO-1783703747749
- **RecordId:** b138057f-b092-480e-8b39-58129555304b
- **Protocolo (UI):** Protocolo: PT-B138057F
- **Colaborador:** leonardo.mendes@liotecnica.com.br (Leonardo Sabino Mendes)
- **Gestor (notificado):** e2e.ponto.gestor@liotecnica.com.br

## Fluxo validado

1. Colaborador abre espelho e seleciona **2 dias**
2. Preenche horários/motivo/anexo e envia
3. Recebe protocolo de sucesso
4. Vê a solicitação em **Minhas solicitações** e acompanha status **Pendente**
5. Sistema gera notificação `ServiceRequest` para o gestor (`ponto.notify_emails`)
6. Gestor vê a notificação e abre o deep-link de gestão
7. Gestor visualiza detalhes (original vs solicitado, motivo, timeline)

## Prints

| # | Arquivo | Etapa |
|---|---------|-------|
| 01 | `01-colaborador-espelho-ponto.png` | Espelho de ponto |
| 02 | `02-colaborador-dias-selecionados.png` | Seleção em massa |
| 03 | `03-colaborador-modal-ajuste-multidias.png` | Modal de solicitação |
| 04 | `04-colaborador-protocolo-sucesso.png` | Protocolo |
| 05 | `05-colaborador-minhas-solicitacoes.png` | Acompanhamento lista |
| 06 | `06-colaborador-detalhe-acompanhamento.png` | Detalhe / status |
| 09 | `09-gestor-lista-notificacoes.png` | Notificações do gestor |
| 10 | `10-gestor-gestao-deeplink.png` | Deep-link gestão |
| 11 | `11-gestor-detalhe-ajuste.png` | Detalhe view-only |
| 12 | `12-gestor-lista-gestao.png` | Lista gestão |

Gerado em: 2026-07-10T17:16:09.073Z
