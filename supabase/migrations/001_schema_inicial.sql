-- ─────────────────────────────────────────────
-- MEU GERENTE PJ — Schema Inicial
-- Migration: 001_schema_inicial
-- ─────────────────────────────────────────────

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Enums ──────────────────────────────────
CREATE TYPE plano_assinatura AS ENUM ('starter', 'essencial', 'profissional', 'premium');
CREATE TYPE setor_empresa AS ENUM ('comercio','servicos','industria','agronegocio','tecnologia','saude','construcao','outro');
CREATE TYPE regime_tributario AS ENUM ('mei','simples_nacional','lucro_presumido','lucro_real');
CREATE TYPE modulo_ia AS ENUM ('calculadora','taxas','credito','bancario','investimentos','geral');

-- ── Perfil da Empresa ──────────────────────
CREATE TABLE empresas (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cnpj             VARCHAR(18) UNIQUE,
  razao_social     TEXT,
  nome_fantasia    TEXT,
  setor            setor_empresa DEFAULT 'servicos',
  faturamento_anual NUMERIC(15,2),
  regime_tributario regime_tributario DEFAULT 'simples_nacional',
  plano            plano_assinatura DEFAULT 'starter',
  ativo            BOOLEAN DEFAULT true,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── Sessões de Chat ────────────────────────
CREATE TABLE sessoes_chat (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id  UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  modulo      modulo_ia NOT NULL DEFAULT 'geral',
  titulo      TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Mensagens ─────────────────────────────
CREATE TABLE mensagens (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sessao_id   UUID NOT NULL REFERENCES sessoes_chat(id) ON DELETE CASCADE,
  role        TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content     TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Uso de IA (para controle de custos) ───
CREATE TABLE uso_ia (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id   UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  modulo       modulo_ia NOT NULL,
  modelo       TEXT NOT NULL,
  tokens_input  INTEGER DEFAULT 0,
  tokens_output INTEGER DEFAULT 0,
  custo_estimado NUMERIC(10,6) DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── Simulações Salvas ──────────────────────
CREATE TABLE simulacoes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id  UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  modulo      modulo_ia NOT NULL,
  titulo      TEXT,
  params      JSONB NOT NULL DEFAULT '{}',
  resultado   JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Índices ────────────────────────────────
CREATE INDEX idx_empresas_user_id      ON empresas(user_id);
CREATE INDEX idx_sessoes_empresa_id    ON sessoes_chat(empresa_id);
CREATE INDEX idx_mensagens_sessao_id   ON mensagens(sessao_id);
CREATE INDEX idx_uso_ia_empresa_id     ON uso_ia(empresa_id);
CREATE INDEX idx_simulacoes_empresa_id ON simulacoes(empresa_id);

-- ── Row Level Security (RLS) ───────────────
ALTER TABLE empresas        ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessoes_chat     ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensagens        ENABLE ROW LEVEL SECURITY;
ALTER TABLE uso_ia           ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulacoes       ENABLE ROW LEVEL SECURITY;

-- Políticas: usuário só vê os próprios dados
CREATE POLICY "empresa_owner" ON empresas
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "sessao_owner" ON sessoes_chat
  FOR ALL USING (
    empresa_id IN (SELECT id FROM empresas WHERE user_id = auth.uid())
  );

CREATE POLICY "mensagem_owner" ON mensagens
  FOR ALL USING (
    sessao_id IN (
      SELECT s.id FROM sessoes_chat s
      JOIN empresas e ON s.empresa_id = e.id
      WHERE e.user_id = auth.uid()
    )
  );

CREATE POLICY "uso_ia_owner" ON uso_ia
  FOR ALL USING (
    empresa_id IN (SELECT id FROM empresas WHERE user_id = auth.uid())
  );

CREATE POLICY "simulacao_owner" ON simulacoes
  FOR ALL USING (
    empresa_id IN (SELECT id FROM empresas WHERE user_id = auth.uid())
  );

-- ── Trigger: updated_at automático ────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_empresas_updated_at
  BEFORE UPDATE ON empresas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_sessoes_updated_at
  BEFORE UPDATE ON sessoes_chat
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
