# UAT Solicitações RH — pedido, conversa e aprovação

## Resultado: FALHOU

- **Run:** `2026-07-12_19-53-48`
- **Marker:** `E2E-SR-RH-1783896828513`
- **RequestId:** `53820aae-3b5e-4645-9666-ace7e60a9348`
- **Atores:** colaborador/RH (`leonardo.mendes@liotecnica.com.br` — mesmo usuário local com `rh_requests.manage`)
- **Pasta:** `e2e/evidence/solicitacoes-rh-uat/2026-07-12_19-53-48`
- **Erro:** browserContext.close: Target page, context or browser has been closed

## Fluxo validado

1. Colaborador abre Benefícios e envia pedido com observação (marker)
2. RH abre a fila, responde com mensagem + anexo PNG
3. Solicitante responde na aba Meus pedidos
4. RH aprova o pedido
5. API confirma status Approved e eventos Submitted/Message/Approved

## Prints

| # | Arquivo | Etapa |
|---|---------|-------|
| 01 | `01-colaborador-beneficios.png` | Lista de benefícios |
| 02 | `02-colaborador-beneficio-detalhe.png` | Detalhe do benefício |
| 03 | `03-colaborador-formulario-pedido.png` | Formulário de solicitação |
| 04 | `04-colaborador-pedido-enviado.png` | Após envio |
| 06 | `06-rh-detalhe-pendente.png` | Detalhe na fila RH |
| 07 | `07-rh-resposta-preenchida.png` | Resposta RH + anexo |
| 08 | `08-rh-conversa-apos-resposta.png` | Conversa após RH |
| 09 | `09-solicitante-meus-pedidos-detalhe.png` | Meus pedidos |
| 10 | `10-solicitante-resposta-preenchida.png` | Resposta do solicitante |
| 11 | `11-solicitante-conversa-completa.png` | Conversa completa |
| 12 | `12-rh-antes-aprovar.png` | Antes de aprovar |
| 13 | `13-rh-apos-aprovar.png` | Após aprovação |

Gerado em: 2026-07-12T22:58:48.749Z
