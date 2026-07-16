# UAT Decisão de ajuste de ponto — evidências

## Resultado: PASSOU

- **Run:** `2026-07-16_11-25-54`
- **Ambiente:** `http://10.0.0.79:8092` / API `http://10.0.0.79:8092`
- **Marker:** E2E-PONTO-DEC-1784211954331
- **RecordId:** f3104bd0-f4a6-4f65-9da8-c2449478e6d8
- **Protocolo (UI):** Protocolo: PT-F3104BD0
- **Colaborador:** leonardo.mendes@liotecnica.com.br (Leonardo Sabino Mendes)
- **Gestor:** e2e.ponto.gestor@liotecnica.com.br

## Fluxo validado

1. Colaborador solicita ajuste de ponto (espelho → modal → protocolo)
2. Gestor recebe notificação de criação e abre deep-link de gestão
3. Gestor aprova a solicitação
4. Colaborador recebe notificação "Ajuste de ponto aprovado"
5. Deep-link `/servicos/ponto-eletronico?requestId=` abre o detalhe **Aprovado**

## Prints

| # | Arquivo | Etapa |
|---|---------|-------|
| 01 | `01-colaborador-espelho-ponto.png` | Espelho |
| 02 | `02-colaborador-dias-selecionados.png` | Seleção |
| 03 | `03-colaborador-modal-envio.png` | Modal |
| 04 | `04-colaborador-protocolo-sucesso.png` | Protocolo |
| 07 | `07-gestor-lista-notificacoes.png` | Notificações gestor |
| 08 | `08-gestor-gestao-deeplink.png` | Deep-link gestão |
| 09 | `09-gestor-detalhe-antes-aprovar.png` | Antes de aprovar |
| 10 | `10-gestor-apos-aprovar.png` | Após aprovar |
| 13 | `13-colaborador-lista-notificacoes.png` | Notificação decisão |
| 14 | `14-colaborador-deeplink-destino.png` | Deep-link colaborador |
| 15 | `15-colaborador-detalhe-aprovado.png` | Detalhe aprovado |

Pasta: `D:\Projetos\LioConecta.Portal\FrontEnd\e2e\evidence\ponto-decisao-notify-uat\2026-07-16_11-25-54`

Gerado em: 2026-07-16T14:26:25.899Z
