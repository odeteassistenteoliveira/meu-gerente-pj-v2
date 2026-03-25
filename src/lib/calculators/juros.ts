// ─────────────────────────────────────────────
// ENGINE DE CÁLCULOS FINANCEIROS
// Todas as funções são puras — sem side effects
// ─────────────────────────────────────────────

/** Arredonda para N casas decimais */
const round = (val: number, dec = 2) => Math.round(val * 10 ** dec) / 10 ** dec;

// ── Juros Compostos ────────────────────────
export function jurosCompostos(params: {
  principal: number;
  taxaMensal: number; // em decimal, ex: 0.02 para 2%
  prazoMeses: number;
}): {
  montante: number;
  juros: number;
  parcelaMensal: number;
  evolucaoMensal: { mes: number; saldo: number; jurosMes: number }[];
} {
  const { principal, taxaMensal, prazoMeses } = params;
  const montante = principal * Math.pow(1 + taxaMensal, prazoMeses);
  const juros = montante - principal;

  // Parcela pelo sistema Price
  const parcelaMensal =
    taxaMensal > 0
      ? (principal * taxaMensal * Math.pow(1 + taxaMensal, prazoMeses)) /
        (Math.pow(1 + taxaMensal, prazoMeses) - 1)
      : principal / prazoMeses;

  const evolucaoMensal = Array.from({ length: prazoMeses }, (_, i) => {
    const mes = i + 1;
    const saldo = principal * Math.pow(1 + taxaMensal, mes);
    const jurosMes = saldo - principal * Math.pow(1 + taxaMensal, mes - 1);
    return { mes, saldo: round(saldo), jurosMes: round(jurosMes) };
  });

  return {
    montante: round(montante),
    juros: round(juros),
    parcelaMensal: round(parcelaMensal),
    evolucaoMensal,
  };
}

// ── Taxa mensal → anual ────────────────────
export function taxaMensalParaAnual(taxaMensal: number): number {
  return round((Math.pow(1 + taxaMensal, 12) - 1) * 100, 4);
}

export function taxaAnualParaMensal(taxaAnual: number): number {
  return round((Math.pow(1 + taxaAnual / 100, 1 / 12) - 1) * 100, 6);
}

// ── Antecipação de Recebíveis ──────────────
export function antecipacaoRecebiveis(params: {
  valorFace: number;       // valor total a receber
  taxaMensal: number;      // taxa cobrada pela antecipação (decimal)
  diasAntecipados: number; // quantos dias antes do vencimento
}): {
  valorLiquido: number;
  desconto: number;
  taxaEfetiva: number;
  valePena: boolean;
  justificativa: string;
} {
  const { valorFace, taxaMensal, diasAntecipados } = params;
  const taxaDiaria = taxaMensal / 30;
  const desconto = valorFace * taxaDiaria * diasAntecipados;
  const valorLiquido = valorFace - desconto;
  const taxaEfetiva = (desconto / valorLiquido) * (30 / diasAntecipados) * 100;

  // Vale a pena se a taxa for menor que o custo de capital de giro (~2% a.m.)
  const valePena = taxaEfetiva < 2.0;
  const justificativa = valePena
    ? `Taxa efetiva de ${round(taxaEfetiva)}% a.m. está abaixo do custo médio de capital de giro (2% a.m.). Vale antecipar.`
    : `Taxa efetiva de ${round(taxaEfetiva)}% a.m. está acima do custo médio de capital de giro. Verifique alternativas mais baratas.`;

  return {
    valorLiquido: round(valorLiquido),
    desconto: round(desconto),
    taxaEfetiva: round(taxaEfetiva),
    valePena,
    justificativa,
  };
}

// ── Ponto de Equilíbrio ────────────────────
export function pontoEquilibrio(params: {
  custoFixoMensal: number;
  precoVendaUnitario: number;
  custoVariavelUnitario: number;
}): {
  unidades: number;
  receitaMinima: number;
  margemContribuicao: number;
  margemContribuicaoPerc: number;
} {
  const { custoFixoMensal, precoVendaUnitario, custoVariavelUnitario } = params;
  const margemContribuicao = precoVendaUnitario - custoVariavelUnitario;
  const margemContribuicaoPerc = (margemContribuicao / precoVendaUnitario) * 100;
  const unidades = Math.ceil(custoFixoMensal / margemContribuicao);
  const receitaMinima = unidades * precoVendaUnitario;

  return {
    unidades,
    receitaMinima: round(receitaMinima),
    margemContribuicao: round(margemContribuicao),
    margemContribuicaoPerc: round(margemContribuicaoPerc),
  };
}

// ── Capital de Giro Necessário ─────────────
export function capitalDeGiro(params: {
  prazoMedioRecebimento: number; // dias
  prazoMedioEstoque: number;     // dias
  prazoMedioPagamento: number;   // dias
  custosDiarios: number;         // R$/dia
}): {
  cicloCaixa: number;            // dias
  necessidadeCapitalGiro: number;
} {
  const { prazoMedioRecebimento, prazoMedioEstoque, prazoMedioPagamento, custosDiarios } = params;
  const cicloCaixa = prazoMedioRecebimento + prazoMedioEstoque - prazoMedioPagamento;
  const necessidadeCapitalGiro = round(cicloCaixa * custosDiarios);

  return { cicloCaixa, necessidadeCapitalGiro };
}

// ── Investimento PJ — Renda Fixa ──────────
export function rentabilidadePJ(params: {
  valor: number;
  taxaAnual: number;    // % a.a. ou % CDI
  tipo: "prefixado" | "cdi";
  cdiAtual?: number;    // % a.a., necessário se tipo = "cdi"
  prazoDias: number;
}): {
  bruto: number;
  ir: number;
  iof: number;
  liquido: number;
  rentabilidadeLiquidaAnual: number;
} {
  const { valor, taxaAnual, tipo, cdiAtual, prazoDias } = params;
  const taxaEfetiva = tipo === "cdi" ? (taxaAnual / 100) * (cdiAtual || 10.65) / 100 : taxaAnual / 100;
  const taxaPeriodo = Math.pow(1 + taxaEfetiva, prazoDias / 252) - 1;
  const bruto = round(valor * (1 + taxaPeriodo));
  const lucro = bruto - valor;

  // IOF regressivo (zerado após 30 dias)
  const iof = prazoDias < 30
    ? round(lucro * Math.max(0, (30 - prazoDias) / 30) * 0.96)
    : 0;

  // IR PJ: 15% flat sobre o lucro
  const baseIR = lucro - iof;
  const ir = round(baseIR * 0.15);
  const liquido = round(bruto - ir - iof);
  const rentabilidadeLiquidaAnual = round(((liquido / valor) ** (252 / prazoDias) - 1) * 100, 4);

  return { bruto, ir, iof, liquido, rentabilidadeLiquidaAnual };
}
