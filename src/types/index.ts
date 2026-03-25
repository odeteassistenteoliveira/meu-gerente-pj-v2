// ─────────────────────────────────────────────
// TIPOS PRINCIPAIS — Meu Gerente PJ
// ─────────────────────────────────────────────

export type PlanoAssinatura = "starter" | "essencial" | "profissional" | "premium";

export type SetorEmpresa =
  | "comercio"
  | "servicos"
  | "industria"
  | "agronegocio"
  | "tecnologia"
  | "saude"
  | "construcao"
  | "outro";

export type RegimeTributario = "simples_nacional" | "lucro_presumido" | "lucro_real" | "mei";

// ── Perfil da Empresa ──────────────────────
export interface EmpresaPerfil {
  id: string;
  user_id: string;
  cnpj: string;
  razao_social: string;
  nome_fantasia?: string;
  setor: SetorEmpresa;
  faturamento_anual: number;
  regime_tributario: RegimeTributario;
  plano: PlanoAssinatura;
  created_at: string;
  updated_at: string;
}

// ── Chat / IA ──────────────────────────────
export type ModuloIA =
  | "calculadora"   // Calculadora Financeira Inteligente
  | "taxas"         // Consultor de Taxas e Tarifas
  | "credito"       // Simulador de Crédito IA
  | "bancario"      // Especialista Bancário Completo
  | "investimentos" // Investimentos PJ
  | "geral";        // Chat geral

export interface MensagemChat {
  id: string;
  role: "user" | "assistant";
  content: string;
  modulo: ModuloIA;
  created_at: string;
  metadata?: Record<string, unknown>;
}

export interface SessaoChat {
  id: string;
  empresa_id: string;
  modulo: ModuloIA;
  titulo?: string;
  mensagens: MensagemChat[];
  created_at: string;
  updated_at: string;
}

// ── Calculadora ───────────────────────────
export interface SimulacaoJuros {
  principal: number;
  taxa_mensal: number;
  prazo_meses: number;
  tipo: "composto" | "simples";
  resultado: {
    total: number;
    juros: number;
    parcela_mensal?: number;
  };
}

export interface SimulacaoCredito {
  valor_necessario: number;
  finalidade: string;
  prazo_meses: number;
  linhas_comparadas: LinhaCredito[];
}

export interface LinhaCredito {
  nome: string;
  instituicao: string;
  taxa_mensal: number;
  taxa_anual: number;
  cet_anual: number;
  prazo_max_meses: number;
  valor_max: number;
  requisitos: string[];
  parcela_mensal: number;
  custo_total: number;
  ranking: number;
}

// ── Taxas Maquininha ──────────────────────
export interface TaxaMaquininha {
  adquirente: string;
  bandeira: "visa" | "master" | "elo" | "amex" | "hiper";
  modalidade: "debito" | "credito_a_vista" | "credito_2x6" | "credito_7x12";
  taxa_percentual: number;
  atualizado_em: string;
}

export interface AnalyseTaxas {
  taxa_atual: number;
  modalidade: string;
  adquirente_atual: string;
  faturamento_mensal: number;
  custo_atual_mensal: number;
  melhor_opcao: TaxaMaquininha;
  economia_mensal: number;
  economia_anual: number;
}

// ── Investimentos PJ ──────────────────────
export type TipoInvestimento = "cdb" | "tesouro_direto" | "lci" | "lca" | "fundo_di" | "conta_corrente";

export interface SimulacaoInvestimento {
  valor: number;
  prazo_dias: number;
  tipo: TipoInvestimento;
  taxa_contratada?: number; // % CDI ou taxa prefixada
  instituicao?: string;
  resultado: {
    bruto: number;
    ir: number;
    iof: number;
    liquido: number;
    rentabilidade_liquida: number;
    cdi_equivalente: number;
  };
}

// ── API Responses ────────────────────────
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}
