-- ──────────────────────────────────────────────────────
-- MIGRATION 006: Segurança e LGPD
-- Tabelas: consentimentos, audit_logs, exclusao_conta
-- Política de retenção e RLS
-- ──────────────────────────────────────────────────────

-- ═══ 1. TABELA DE CONSENTIMENTOS (LGPD) ═══════════════
CREATE TABLE IF NOT EXISTS consentimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,                    -- ex: 'termos_uso_e_privacidade'
  versao_termo TEXT NOT NULL,            -- ex: '1.0', '2.0'
  aceito BOOLEAN NOT NULL DEFAULT true,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS para consentimentos
ALTER TABLE consentimentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "consentimento_owner_select"
  ON consentimentos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "consentimento_owner_insert"
  ON consentimentos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Índice para busca por usuário
CREATE INDEX IF NOT EXISTS idx_consentimentos_user_id
  ON consentimentos(user_id);

-- ═══ 2. TABELA DE AUDIT LOG ═══════════════════════════
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  acao TEXT NOT NULL,                    -- ex: 'login', 'update_perfil', 'checkout', 'export_dados'
  recurso TEXT,                          -- ex: 'empresas', 'consentimentos'
  recurso_id TEXT,                       -- ID do registro afetado
  detalhes JSONB,                        -- dados adicionais (ex: campos alterados)
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: usuário vê apenas seus próprios logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_owner_select"
  ON audit_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Insert via service role apenas (não via frontend)
-- Não criamos policy de INSERT para user — será feito via service role

-- Índices
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id
  ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at
  ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_acao
  ON audit_logs(acao);

-- ═══ 3. TABELA DE EXCLUSÃO DE CONTA (LGPD) ═══════════
CREATE TABLE IF NOT EXISTS exclusao_conta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  solicitado_em TIMESTAMPTZ DEFAULT now(),
  excluir_em TIMESTAMPTZ NOT NULL,       -- data limite (15 dias após solicitação)
  status TEXT NOT NULL DEFAULT 'pendente', -- 'pendente', 'executado', 'cancelado'
  motivo TEXT,                            -- motivo informado pelo usuário
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE exclusao_conta ENABLE ROW LEVEL SECURITY;

CREATE POLICY "exclusao_owner_select"
  ON exclusao_conta FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "exclusao_owner_insert"
  ON exclusao_conta FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "exclusao_owner_update"
  ON exclusao_conta FOR UPDATE
  USING (auth.uid() = user_id);

-- ═══ 4. POLÍTICA DE RETENÇÃO ═════════════════════════
-- Função para limpar dados antigos (executar via cron/edge function)
CREATE OR REPLACE FUNCTION limpar_dados_expirados()
RETURNS void AS $$
BEGIN
  -- Audit logs: manter 2 anos
  DELETE FROM audit_logs
  WHERE created_at < now() - INTERVAL '2 years';

  -- Contas marcadas para exclusão (prazo de 15 dias)
  -- Deleta o user do auth (cascade apaga empresas, consentimentos, etc.)
  -- NOTA: executar via edge function com service_role
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══ 5. COMENTÁRIOS (documentação no banco) ══════════
COMMENT ON TABLE consentimentos IS 'Log de consentimentos LGPD — termos de uso, privacidade, etc.';
COMMENT ON TABLE audit_logs IS 'Audit trail — quem acessou o quê e quando (LGPD compliance)';
COMMENT ON TABLE exclusao_conta IS 'Fila de exclusão de contas — prazo legal de 15 dias';
COMMENT ON COLUMN consentimentos.versao_termo IS 'Versão do documento aceito (ex: 1.0, 2.0)';
COMMENT ON COLUMN audit_logs.acao IS 'Tipo de ação: login, update_perfil, checkout, export_dados, delete_conta, etc.';
