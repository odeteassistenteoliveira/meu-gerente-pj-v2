-- ─────────────────────────────────────────────
-- Migration 007: Adiciona 'educacao' ao ENUM setor_empresa
-- ─────────────────────────────────────────────
ALTER TYPE setor_empresa ADD VALUE IF NOT EXISTS 'educacao';
