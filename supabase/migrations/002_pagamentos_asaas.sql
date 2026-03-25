-- ─────────────────────────────────────────────────────────────
-- Migration 002: Suporte a pagamentos via Asaas
-- Execute no Supabase → SQL Editor
-- ─────────────────────────────────────────────────────────────

-- Colunas de integração Asaas
ALTER TABLE empresas
  ADD COLUMN IF NOT EXISTS asaas_customer_id      TEXT,
  ADD COLUMN IF NOT EXISTS asaas_subscription_id  TEXT,
  ADD COLUMN IF NOT EXISTS asaas_last_payment_id  TEXT;

-- Colunas de gestão de plano
ALTER TABLE empresas
  ADD COLUMN IF NOT EXISTS plano_ciclo     TEXT DEFAULT 'mensal'
    CHECK (plano_ciclo IN ('mensal', 'anual')),
  ADD COLUMN IF NOT EXISTS plano_validade  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS plano_pendente  TEXT;

-- Atualiza o check do plano para incluir os novos tiers
-- (só executa se a constraint existir com nome antigo)
DO $$
BEGIN
  -- Tenta remover constraint antiga se existir
  ALTER TABLE empresas DROP CONSTRAINT IF EXISTS empresas_plano_check;
EXCEPTION WHEN others THEN NULL;
END$$;

ALTER TABLE empresas
  ADD CONSTRAINT empresas_plano_check
  CHECK (plano IN ('starter', 'pro', 'essencial', 'profissional'));

-- Índices para busca rápida via webhook
CREATE INDEX IF NOT EXISTS idx_empresas_asaas_customer
  ON empresas (asaas_customer_id)
  WHERE asaas_customer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_empresas_asaas_subscription
  ON empresas (asaas_subscription_id)
  WHERE asaas_subscription_id IS NOT NULL;

-- ─── Comentários ───────────────────────────────────────────
COMMENT ON COLUMN empresas.asaas_customer_id     IS 'ID do cliente no Asaas (cus_...)';
COMMENT ON COLUMN empresas.asaas_subscription_id IS 'ID da assinatura ativa no Asaas';
COMMENT ON COLUMN empresas.plano_ciclo           IS 'mensal ou anual';
COMMENT ON COLUMN empresas.plano_validade        IS 'Data de expiração do plano atual';
COMMENT ON COLUMN empresas.plano_pendente        IS 'Plano aguardando confirmação de pagamento';
