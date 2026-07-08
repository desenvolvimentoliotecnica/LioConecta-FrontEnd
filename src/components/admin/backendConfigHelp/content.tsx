import type { ReactNode } from "react";
import {
  HelpHeading,
  HelpLead,
  HelpList,
  HelpNote,
  HelpTable,
  type BackendConfigHelpContext,
} from "./helpParts";

export type BackendConfigHelpEntry = {
  title: string;
  render: (ctx: BackendConfigHelpContext) => ReactNode;
};

function azureAdHelp(ctx: BackendConfigHelpContext) {
  const { portalOrigin, devOrigin } = ctx;

  return (
    <>
      <HelpLead>
        Esta seção alimenta o login Microsoft no <strong>navegador</strong> (popup MSAL) para chat Teams e
        calendário Outlook. É <strong>diferente</strong> de <code>graph.*</code>, usado pela API no servidor.
      </HelpLead>

      <HelpTable
        headers={["Seção admin", "Finalidade"]}
        rows={[
          [<code key="a">azure_ad.*</code>, "MSAL no browser (client ID + tenant)"],
          [<code key="g">graph.*</code>, "API backend (client secret)"],
          [<code key="c">chat.*</code>, "Habilitar módulo e criptografia de tokens"],
        ]}
      />

      <HelpHeading>1. Preencher Azure AD nesta seção</HelpHeading>
      <HelpList>
        <li>
          <strong>Tenant ID</strong> — GUID do tenant Entra ID
        </li>
        <li>
          <strong>Client ID</strong> — Application (client) ID da App Registration
        </li>
        <li>
          <strong>Instance URL</strong> — <code>https://login.microsoftonline.com/</code> (padrão)
        </li>
        <li>
          <strong>Audience</strong> — normalmente o mesmo Client ID ou API identifier da app
        </li>
      </HelpList>
      <HelpNote>
        Se <code>graph.*</code> já estiver configurado, use o <strong>mesmo tenant e client ID</strong> da mesma app
        registration.
      </HelpNote>

      <HelpHeading>2. Azure Portal (Entra ID)</HelpHeading>
      <p>
        <strong>Authentication → Single-page application (SPA)</strong>
      </p>
      <HelpList>
        <li>
          Redirect URI dev: <code>{devOrigin}</code>
        </li>
        <li>
          Redirect URI produção: <code>{portalOrigin}</code>
        </li>
      </HelpList>
      <p>
        <strong>API permissions (Delegated)</strong> — chat, calendário e vínculo de conta
      </p>
      <HelpList>
        <li>
          <code>Chat.Read</code>, <code>Chat.ReadWrite</code>, <code>ChatMessage.Send</code>
        </li>
        <li>
          <code>Calendars.ReadWrite</code> (calendário Outlook)
        </li>
        <li>
          <code>User.Read</code>, <code>offline_access</code>
        </li>
      </HelpList>
      <HelpNote>Conceda <strong>admin consent</strong> no tenant após adicionar as permissões.</HelpNote>

      <HelpHeading>3. Validar no portal</HelpHeading>
      <HelpList ordered>
        <li>Salve esta seção e recarregue o portal (F5)</li>
        <li>Abra <strong>Mensagens</strong> ou <strong>Calendário</strong></li>
        <li>Clique em <strong>Vincular conta</strong> e autorize no popup Microsoft</li>
      </HelpList>

      <HelpNote warn>
        Se aparecer «Configuração MSAL indisponível», tenant ou client ID desta seção ainda estão vazios no banco —
        salve os campos acima e recarregue.
      </HelpNote>
    </>
  );
}

export const BACKEND_CONFIG_HELP: Record<string, BackendConfigHelpEntry> = {
  database: {
    title: "Ajuda — Banco de dados (PostgreSQL)",
    render: () => (
      <>
        <HelpLead>
          Connection string Npgsql do banco principal (<code>app_settings</code>). A API e os workers usam esta
          configuração na inicialização.
        </HelpLead>
        <HelpHeading>O que configurar</HelpHeading>
        <HelpList>
          <li>
            <strong>PostgreSQL — connection string</strong> — host, porta, database, usuário e senha
          </li>
        </HelpList>
        <HelpHeading>Após alterar</HelpHeading>
        <HelpList ordered>
          <li>Salve a seção</li>
          <li>Reinicie a API LioConecta — alterações em conexão exigem restart</li>
          <li>Confirme health check e login no portal</li>
        </HelpList>
        <HelpNote warn>
          Em ambientes novos, a tabela <code>app_settings</code> pode ser populada via bootstrap{" "}
          <code>LIOSNECTA_BOOTSTRAP_DB</code> antes do primeiro start.
        </HelpNote>
      </>
    ),
  },

  redis: {
    title: "Ajuda — Redis",
    render: () => (
      <>
        <HelpLead>
          Redis é usado como backplane do SignalR (chat em tempo real) e em health checks. Não armazena dados de
          negócio permanentes.
        </HelpLead>
        <HelpHeading>Formato da connection string</HelpHeading>
        <HelpList>
          <li>
            Exemplo local: <code>localhost:6379</code>
          </li>
          <li>
            Com senha: <code>senha@host:6379</code> ou formato StackExchange.Redis completo
          </li>
        </HelpList>
        <HelpHeading>Após alterar</HelpHeading>
        <HelpNote>Reinicie a API. Sem Redis, SignalR pode degradar para polling configurado em Chat.</HelpNote>
      </>
    ),
  },

  azure_ad: {
    title: "Ajuda — Azure AD (MSAL no portal)",
    render: azureAdHelp,
  },

  auth: {
    title: "Ajuda — Autenticação do portal",
    render: () => (
      <>
        <HelpLead>
          Políticas de login do portal LioConecta: provedor LDAP ou dev, JWT emitido pela API e lista de super-admins.
        </HelpLead>
        <HelpHeading>Campos principais</HelpHeading>
        <HelpList>
          <li>
            <strong>Provedor</strong> — <code>ldap</code> em produção; <code>dev</code> apenas para testes locais
          </li>
          <li>
            <strong>DevAuth</strong> — quando Sim em Development, endpoints podem ficar abertos sem token
          </li>
          <li>
            <strong>JWT — chave de assinatura</strong> — secreto simétrico; troca invalida sessões ativas
          </li>
          <li>
            <strong>JWT — expiração</strong> — minutos até o token expirar (padrão 480 = 8 h)
          </li>
          <li>
            <strong>E-mails Admin</strong> — JSON com e-mails corporativos que recebem role Admin no login LDAP
          </li>
        </HelpList>
        <HelpHeading>Relação com outras seções</HelpHeading>
        <HelpList>
          <li>
            <code>ldap.*</code> — servidor e credenciais do Active Directory
          </li>
          <li>
            <code>azure_ad.*</code> — validação de tokens Microsoft e MSAL no browser (não substitui LDAP)
          </li>
        </HelpList>
        <HelpNote warn>Alterações em chave JWT ou provedor exigem reinício da API.</HelpNote>
      </>
    ),
  },

  ldap: {
    title: "Ajuda — LDAP / Active Directory",
    render: () => (
      <>
        <HelpLead>
          Autenticação corporativa por e-mail e senha do domínio. Usuários fazem login no portal com credenciais AD.
        </HelpLead>
        <HelpHeading>Passo a passo</HelpHeading>
        <HelpList ordered>
          <li>
            Ative <strong>LDAP habilitado</strong>
          </li>
          <li>
            Informe host, porta (389 ou 636 com SSL) e base de busca (<code>DC=...</code>)
          </li>
          <li>
            Configure conta de serviço (bind DN + senha) com permissão de leitura no AD
          </li>
          <li>
            Ajuste filtro de usuário — padrão <code>(userPrincipalName={"{"}0{"}"})</code>
          </li>
          <li>Salve e use <strong>Testar conexão LDAP</strong></li>
        </HelpList>
        <HelpHeading>Em Auth</HelpHeading>
        <HelpNote>
          Defina <code>auth.provider</code> = <code>ldap</code> e inclua e-mails de Admin em{" "}
          <code>auth.super_admin_emails</code>.
        </HelpNote>
      </>
    ),
  },

  cors: {
    title: "Ajuda — CORS",
    render: (ctx) => (
      <>
        <HelpLead>
          Lista JSON de origens permitidas a chamar a API a partir do navegador. Essencial quando front e API estão em
          domínios diferentes.
        </HelpLead>
        <HelpHeading>Exemplo</HelpHeading>
        <p>
          <code>
            ["{ctx.devOrigin}","{ctx.portalOrigin}"]
          </code>
        </p>
        <HelpHeading>Boas práticas</HelpHeading>
        <HelpList>
          <li>Inclua todas as URLs do portal (dev, homolog, produção)</li>
          <li>Não use wildcard <code>*</code> em produção</li>
          <li>Após alterar, reinicie a API se o CORS for aplicado no startup</li>
        </HelpList>
      </>
    ),
  },

  totvs: {
    title: "Ajuda — TOTVS",
    render: () => (
      <>
        <HelpLead>
          Integração REST com ERP TOTVS para dados expostos pela API (complementar ao TOTVS RM em painel dedicado).
        </HelpLead>
        <HelpHeading>Campos</HelpHeading>
        <HelpList>
          <li>
            <strong>Base URL</strong> — endpoint raiz da API TOTVS
          </li>
          <li>
            <strong>API key</strong> — credencial secreta fornecida pela infra/TOTVS
          </li>
        </HelpList>
        <HelpNote>
          Ponto e holerite via SQL Server RM são configurados em{" "}
          <strong>Admin → TOTVS RM — Ponto</strong>, não nesta seção.
        </HelpNote>
      </>
    ),
  },

  glpi: {
    title: "Ajuda — GLPI",
    render: () => (
      <>
        <HelpLead>
          Service desk GLPI — chamados, catálogo do Help Desk e links «Ver no GLPI» no portal.
        </HelpLead>
        <HelpHeading>Mapeamento dos tokens (não inverta)</HelpHeading>
        <HelpTable
          headers={["Token na infra", "Campo admin"]}
          rows={[
            ["Token API / App token (Lioconecta)", "App token → header App-Token"],
            ["Token serviço / User token (glpi_system_service)", "User token → Authorization: user_token …"],
          ]}
        />
        <HelpHeading>Configuração</HelpHeading>
        <HelpList ordered>
          <li>
            <strong>Base URL</strong> — ex.: <code>https://servicedesk…/api.php/v1</code>
          </li>
          <li>
            <strong>Portal URL</strong> — link web para abrir tickets no navegador
          </li>
          <li>Preencha App token e User token conforme tabela acima</li>
          <li>
            <strong>Perfil ativo</strong> — use <code>0</code> para perfil padrão do usuário de serviço
          </li>
          <li>Salve e clique em <strong>Testar conexão GLPI</strong> (valida initSession)</li>
        </HelpList>
        <HelpHeading>Help Desk — áreas do catálogo</HelpHeading>
        <HelpNote>
          JSON com áreas do wizard mobile: id, name, icon, entityId, categoryRootIds. Área TI com{" "}
          <code>categoryRootIds</code> vazio carrega catálogo ITIL completo.
        </HelpNote>
      </>
    ),
  },

  graph: {
    title: "Ajuda — Microsoft Graph",
    render: () => (
      <>
        <HelpLead>
          Credenciais <strong>application</strong> (client secret) para a API acessar Graph no servidor: diretório,
          Planner, presença, fotos e testes de Teams.
        </HelpLead>
        <HelpHeading>App Registration (Entra ID)</HelpHeading>
        <HelpList ordered>
          <li>Crie ou reutilize app registration corporativa</li>
          <li>
            Copie <strong>Tenant ID</strong>, <strong>Client ID</strong> e gere <strong>Client secret</strong>
          </li>
          <li>
            Adicione permissões <strong>Application</strong> conforme módulo (ex.:{" "}
            <code>User.Read.All</code>, <code>Tasks.ReadWrite.All</code> para Planner)
          </li>
          <li>Conceda admin consent</li>
        </HelpList>
        <HelpHeading>Validação</HelpHeading>
        <HelpList ordered>
          <li>Salve tenant, client ID e secret</li>
          <li>Use <strong>Testar conexão Graph</strong></li>
          <li>
            Worker <code>graph-directory-sync</code> atualiza <code>graph.directory_last_sync_utc</code> automaticamente
          </li>
        </HelpList>
        <HelpNote>
          MSAL no browser usa <code>azure_ad.*</code> — mesma app pode compartilhar tenant/client ID, mas chaves
          separadas no admin.
        </HelpNote>
      </>
    ),
  },

  chat: {
    title: "Ajuda — Microsoft Teams Chat",
    render: () => (
      <>
        <HelpLead>
          Widget de <strong>Mensagens</strong> no portal, sincronizado com conversas reais do Microsoft Teams via Graph.
          Sem mocks — requer Graph, Azure AD e tokens delegados por usuário.
        </HelpLead>
        <HelpHeading>Pré-requisitos</HelpHeading>
        <HelpList ordered>
          <li>
            <code>graph.*</code> configurado e testado
          </li>
          <li>
            <code>azure_ad.*</code> com redirect URIs SPA
          </li>
          <li>
            <code>chat.teams.token_encryption_key</code> — string secreta longa para tokens OAuth no banco
          </li>
        </HelpList>
        <HelpHeading>Habilitar</HelpHeading>
        <HelpList>
          <li>
            <code>chat.teams.enabled</code> = Sim
          </li>
          <li>
            Modo <code>delegated</code> (padrão) — usuário clica «Vincular conta Teams»
          </li>
          <li>
            SignalR habilitado recomendado; polling como fallback (<code>polling_interval_seconds</code>)
          </li>
        </HelpList>
        <HelpHeading>Validação</HelpHeading>
        <HelpList ordered>
          <li>Salve Chat e clique <strong>Testar integração Chat Teams</strong></li>
          <li>No portal: Mensagens → Vincular conta → autorize scopes no popup</li>
        </HelpList>
      </>
    ),
  },

  planner: {
    title: "Ajuda — Microsoft Planner",
    render: () => (
      <>
        <HelpLead>
          Integração com plano Microsoft Planner exibido em <strong>Minhas Atividades</strong>. Reutiliza credenciais{" "}
          <code>graph.*</code>.
        </HelpLead>
        <HelpHeading>Configuração</HelpHeading>
        <HelpList ordered>
          <li>
            Ative <strong>Planner — integração habilitada</strong>
          </li>
          <li>
            Informe <strong>ID do plano</strong> (GUID na URL do Planner no Teams)
          </li>
          <li>
            Opcional: <strong>bucket padrão</strong> para novas tarefas criadas pelo portal
          </li>
          <li>Salve e use <strong>Testar conexão Planner</strong></li>
        </HelpList>
        <HelpHeading>Permissão Graph</HelpHeading>
        <HelpNote>
          Requer <code>Tasks.ReadWrite.All</code> (application) na app registration com admin consent.
        </HelpNote>
      </>
    ),
  },

  calendar: {
    title: "Ajuda — Calendário Outlook",
    render: (ctx) => (
      <>
        <HelpLead>
          Página <code>/calendario</code> com eventos reais do Outlook via Graph. Tokens delegados por usuário (MSAL).
        </HelpLead>
        <HelpHeading>Pré-requisitos</HelpHeading>
        <HelpList>
          <li>
            <code>azure_ad.tenant_id</code> e <code>azure_ad.client_id</code> preenchidos
          </li>
          <li>
            Redirect URI SPA no Azure: <code>{ctx.devOrigin}</code> (dev) e <code>{ctx.portalOrigin}</code> (deploy)
          </li>
          <li>
            <code>calendar.token_encryption_key</code> — obrigatória, independente do Chat
          </li>
          <li>Permissão delegada <code>Calendars.ReadWrite</code> na app SPA</li>
        </HelpList>
        <HelpNote warn>
          Erro <code>AADSTS500113</code> no popup = falta registrar a redirect URI exata do ambiente em Authentication →
          SPA (ex.: <code>http://localhost:5173</code> no dev local). Em servidor por IP (ex.{" "}
          <code>10.0.0.79:8092</code>), use <strong>HTTPS</strong> — o MSAL não funciona em <code>http://</code> fora de
          localhost (<code>crypto_nonexistent</code>).
        </HelpNote>
        <HelpHeading>Chave de criptografia (<code>calendar.token_encryption_key</code>)</HelpHeading>
        <HelpLead>
          Esta chave <strong>não vem do Azure</strong> nem do Microsoft 365. É um segredo que <strong>você gera</strong>{" "}
          para a API criptografar os tokens OAuth do Outlook (access/refresh) antes de gravá-los no PostgreSQL.
        </HelpLead>
        <HelpList>
          <li>Use uma string aleatória longa (recomendado: 32+ bytes em Base64 ou 64+ caracteres hex)</li>
          <li>
            É <strong>independente</strong> de <code>chat.teams.token_encryption_key</code> — calendário e chat podem
            ter chaves diferentes
          </li>
          <li>Guarde uma cópia em local seguro (cofre de senhas). Se perder a chave, usuários precisarão vincular a conta de novo</li>
          <li>Evite trocar a chave em produção sem planejamento — tokens já salvos não serão legíveis com outra chave</li>
        </HelpList>
        <HelpHeading>Como gerar uma chave</HelpHeading>
        <p>
          <strong>PowerShell (Windows):</strong>
        </p>
        <pre className="backend-config-page__help-code">
          {`[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))`}
        </pre>
        <p>
          <strong>OpenSSL (Linux/macOS/Git Bash):</strong>
        </p>
        <pre className="backend-config-page__help-code">
          {`openssl rand -base64 48`}
        </pre>
        <HelpNote>
          Cole o resultado no campo <strong>Calendário — chave de criptografia de tokens</strong>, teste a conexão e
          salve. O teste aceita o valor do formulário antes de persistir.
        </HelpNote>

        <HelpHeading>Habilitar</HelpHeading>
        <HelpList ordered>
          <li>
            <code>calendar.enabled</code> = Sim
          </li>
          <li>Ajuste scopes JSON, visão padrão e flags de aniversários/cardápio</li>
          <li>Salve e teste com <strong>Testar conexão Calendário</strong></li>
          <li>Usuário vincula conta em <code>/calendario</code></li>
        </HelpList>
      </>
    ),
  },

  workers: {
    title: "Ajuda — Workers em background",
    render: () => (
      <>
        <HelpLead>
          Intervalos (em minutos) dos jobs hosted services que rodam dentro da API: sync TOTVS, Graph, ponto, holerite e
          enquetes.
        </HelpLead>
        <HelpHeading>Workers principais</HelpHeading>
        <HelpTable
          headers={["Setting", "Função"]}
          rows={[
            ["workers.totvs_sync_interval_minutes", "Sync dados TOTVS REST"],
            ["workers.graph_sync_interval_minutes", "Sync presença/fotos Graph"],
            ["workers.graph_directory_sync_interval_minutes", "Sync diretório AD → people"],
            ["workers.totvs_timesheet_sync_interval_minutes", "Cache espelho de ponto RM"],
            ["workers.totvs_payslip_sync_interval_minutes", "Cache holerites RM"],
            ["workers.poll_closure_interval_minutes", "Notifica enquetes encerradas"],
          ]}
        />
        <HelpNote>
          TTLs de cache definem quando dados considerados obsoletos disparam nova sync. Valores baixos aumentam carga no
          RM/Graph.
        </HelpNote>
      </>
    ),
  },

  serilog: {
    title: "Ajuda — Logging (Serilog)",
    render: () => (
      <>
        <HelpLead>Nível mínimo de log da API (Serilog). Controla verbosidade em console e sinks configurados.</HelpLead>
        <HelpHeading>Níveis comuns</HelpHeading>
        <HelpList>
          <li>
            <code>Information</code> — padrão produção
          </li>
          <li>
            <code>Debug</code> — diagnóstico detalhado (evite em prod)
          </li>
          <li>
            <code>Warning</code> / <code>Error</code> — apenas alertas e falhas
          </li>
        </HelpList>
        <HelpNote>Alteração pode exigir reinício da API para aplicar no pipeline Serilog.</HelpNote>
      </>
    ),
  },

  media: {
    title: "Ajuda — Mídia e uploads",
    render: () => (
      <>
        <HelpLead>
          Armazenamento local de arquivos até migração para S3/SharePoint. Três contextos: comunicados, feed e fotos de
          pessoas.
        </HelpLead>
        <HelpHeading>Comunicados</HelpHeading>
        <HelpList>
          <li>Pasta, tamanho máximo (bytes) e MIME types JSON (jpeg, png, webp)</li>
        </HelpList>
        <HelpHeading>Feed</HelpHeading>
        <HelpList>
          <li>Posts com imagens e vídeos — limites maiores que comunicados</li>
        </HelpList>
        <HelpHeading>Pessoas</HelpHeading>
        <HelpList>
          <li>Fotos baixadas do Graph servidas em <code>/media/people</code></li>
        </HelpList>
        <HelpNote>
          Caminhos podem ser relativos ao ContentRoot da API ou absolutos no servidor. Garanta permissão de escrita da
          conta do serviço IIS/Kestrel.
        </HelpNote>
      </>
    ),
  },

  benefits: {
    title: "Ajuda — Benefícios (portais externos)",
    render: () => (
      <>
        <HelpLead>
          URLs dos portais de benefícios exibidos na página <strong>Benefícios</strong> (botão «Abrir portal»). Cada
          benefício tem chave própria em <code>benefits.*</code>.
        </HelpLead>
        <HelpHeading>Como editar</HelpHeading>
        <HelpList ordered>
          <li>Localize o benefício pelo label no formulário</li>
          <li>Informe URL completa (<code>https://...</code>) do portal do fornecedor</li>
          <li>Salve a seção — links aparecem imediatamente no portal após reload</li>
        </HelpList>
        <HelpNote>URLs vazias ocultam ou desabilitam o botão correspondente na UI.</HelpNote>
      </>
    ),
  },

  leave: {
    title: "Ajuda — Férias e ausências",
    render: () => (
      <>
        <HelpLead>
          Configurações de notificação, e-mail e links dos serviços de férias. Chaves em <code>leave.*</code>.
          A aprovação formal continua no RM Labore; o portal notifica e espelha status.
        </HelpLead>
        <HelpHeading>Notificação no portal</HelpHeading>
        <HelpList>
          <li>
            <code>leave.notify_roles</code> — JSON array de roles (default <code>[&quot;HR&quot;]</code>) além do gestor direto
          </li>
          <li>
            <code>leave.notify_emails</code> — e-mails adicionais (também usados como allow-list de gestão)
          </li>
        </HelpList>
        <HelpHeading>E-mail SMTP (override de desenvolvimento)</HelpHeading>
        <HelpList>
          <li>
            <code>leave.email.enabled</code> — liga o disparo de e-mail ao criar solicitação
          </li>
          <li>
            <code>leave.email.dev_override_enabled</code> — <strong>já vem ligado</strong>; redireciona todos os e-mails
          </li>
          <li>
            <code>leave.email.dev_override_to</code> — destinatário único (default{" "}
            <code>leonardo.mendes@liotecnica.com.br</code>)
          </li>
        </HelpList>
        <HelpNote>
          Em produção, desligue <code>leave.email.dev_override_enabled</code> (ou limpe o e-mail de override) para enviar
          aos gestores/RH reais. Com override ativo, o assunto/corpo incluem o prefixo{" "}
          <code>[DEV OVERRIDE]</code> e a lista de destinatários originais.
        </HelpNote>
        <HelpHeading>URLs de serviços</HelpHeading>
        <HelpList ordered>
          <li>Identifique o serviço (férias, licença, etc.) pelo label</li>
          <li>Preencha URL do portal ou formulário externo corporativo</li>
          <li>Salve — usuários acessam via cards/links na página de férias e ausências</li>
        </HelpList>
      </>
    ),
  },

  observability: {
    title: "Ajuda — Observabilidade",
    render: () => (
      <>
        <HelpLead>
          Telemetria da API: OpenTelemetry, auditoria de acesso, page views, auth audit e políticas de retenção. Painel
          admin em <code>/admin/observabilidade</code>.
        </HelpLead>
        <HelpHeading>OpenTelemetry</HelpHeading>
        <HelpList>
          <li>OTLP endpoint (ex.: Tempo/Jaeger em <code>:4317</code>)</li>
          <li>Prometheus <code>/metrics</code> para scrape</li>
          <li>Trace sample ratio 0–1 para controlar volume</li>
        </HelpList>
        <HelpHeading>Auditoria e privacidade</HelpHeading>
        <HelpList>
          <li>Access audit — padrões JSON de rotas GET sensíveis</li>
          <li>Page views — batch do front-end</li>
          <li>Modo IP: full, hash ou both nos eventos de acesso</li>
        </HelpList>
        <HelpHeading>Retenção</HelpHeading>
        <HelpNote>
          Job diário purga registros antigos conforme dias configurados por tipo (events, page views, access, agregados).
        </HelpNote>
      </>
    ),
  },

  organogram: {
    title: "Ajuda — Organograma (governança)",
    render: () => (
      <>
        <HelpLead>
          O organograma exibido no portal pode divergir do Microsoft Graph. Governança, posições e departamentos ficam
          no domínio do organograma — <strong>não</strong> em <code>app_settings</code>.
        </HelpLead>
        <HelpHeading>Fluxo recomendado</HelpHeading>
        <HelpList ordered>
          <li>
            Configure <code>graph.*</code> e aguarde sync do diretório
          </li>
          <li>
            Abra <strong>Gestão do organograma</strong> — importe do Graph se necessário
          </li>
          <li>Defina permissões: quem pode editar posições e departamentos</li>
          <li>Ative governança antes de liberar modo edição no organograma público</li>
        </HelpList>
        <HelpHeading>Importação</HelpHeading>
        <HelpNote>
          Após importar do Graph, alterações manuais são preservadas nas reimportações. Use mapeamento de departamentos
          abaixo para alinhar unidades AD à estrutura desejada.
        </HelpNote>
      </>
    ),
  },

  systems: {
    title: "Ajuda — Hub de Sistemas",
    render: () => (
      <>
        <HelpLead>
          Controle de permissões para gestão do catálogo de sistemas no hub <strong>Acesso a Sistemas</strong>. As
          alterações são persistidas em <strong>/admin/app-settings</strong> (chaves <code>systems.*</code>).
        </HelpLead>
        <HelpHeading>O que configurar</HelpHeading>
        <HelpList>
          <li>Perfis autorizados a criar, editar e desativar sistemas</li>
          <li>E-mails extras na whitelist sem depender da role</li>
          <li>Ambiente do portal via <code>portal.environment</code> (dev, hml, prd)</li>
        </HelpList>
        <HelpHeading>Acesso rápido</HelpHeading>
        <HelpNote>
          Use <strong>Abrir Hub de Sistemas</strong> para validar as regras após salvar. O CRUD fica no próprio hub para
          usuários autorizados.
        </HelpNote>
      </>
    ),
  },

  loop: {
    title: "Ajuda — Loop de Projetos",
    render: () => (
      <>
        <HelpLead>
          Controle de visibilidade e permissões do módulo <strong>Loop de Projetos</strong> (∞) no menu lateral. As
          alterações são persistidas em <strong>/admin/app-settings</strong> (chaves <code>loop.*</code>).
        </HelpLead>
        <HelpHeading>O que configurar</HelpHeading>
        <HelpList>
          <li>Quem pode ver o módulo Loop no menu</li>
          <li>Permissões de criação/edição de projetos (conforme campos abaixo)</li>
        </HelpList>
        <HelpHeading>Acesso rápido</HelpHeading>
        <HelpNote>
          Use <strong>Abrir Loop de Projetos</strong> para validar as regras após salvar. Confirme que o usuário de teste
          possui um dos perfis ou e-mails liberados.
        </HelpNote>
      </>
    ),
  },
};

export function hasBackendConfigHelp(categoryId: string): boolean {
  return categoryId in BACKEND_CONFIG_HELP;
}

export function getBackendConfigHelpTitle(categoryId: string): string | undefined {
  return BACKEND_CONFIG_HELP[categoryId]?.title;
}
