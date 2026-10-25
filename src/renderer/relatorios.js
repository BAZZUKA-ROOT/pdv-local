/* relatorios.js — tela de Relatórios completa (clone Nex) */
const $ = id => document.getElementById(id);
let relatorioAtual = 'resumo';

function carregarRelatorio(tipo) {
  relatorioAtual = tipo;
  document.querySelectorAll('.rel-item').forEach(i => i.classList.remove('active'));
  if (event && event.target) event.target.classList.add('active');

  const titulos = {
    'resumo': 'Resumo',
    'lucratividade': 'Lucratividade',
    'forn-compras': 'Compras por Fornecedor',
    'forn-produtos': 'Produtos por Fornecedor',
    'vendas-periodo': 'Vendas por Período',
    'vendas-vendedor': 'Vendas por Vendedor',
    'vendas-cliente': 'Vendas por Cliente',
    'vendas-forma': 'Formas de Pagamento',
    'vendas-hora': 'Vendas por Hora',
    'vendas-dia-semana': 'Vendas por Dia da Semana',
    'vendas-produto': 'Vendas por Produto',
    'vendas-categoria': 'Vendas por Categoria',
    'vendas-canceladas': 'Vendas Canceladas',
    'vendas-descontos': 'Descontos Aplicados',
    'vendas-ticket': 'Ticket Médio',
    'vendas-comparativo': 'Comparativo Mensal',
    'estoque-atual': 'Estoque Atual',
    'estoque-movimentacoes': 'Movimentações de Estoque',
    'estoque-valor': 'Valor do Estoque',
    'clientes-ranking': 'Ranking de Clientes',
    'clientes-inativos': 'Clientes Inativos',
    'contas-vencidas': 'Contas Vencidas',
    'contas-a-vencer': 'Contas a Vencer',
    'entregas-pendentes': 'Entregas Pendentes'
  };
  $('relTitulo').textContent = titulos[tipo] || 'Relatório';

  if (tipo === 'resumo') carregarResumo();
  else renderPlaceholder(tipo);
}

async function carregarResumo() {
  const dias = Number($('periodoSelect').value);
  const resumo = await api.relatorioResumo(dias);
  const topProdutos = await api.relatorioTopProdutos(dias);

  $('kpiFaturamento').textContent = brl(resumo.faturamento.faturamento);
  $('kpiNumVendas').textContent = resumo.faturamento.num_vendas;
  $('kpiTicketMedio').textContent = brl(resumo.faturamento.ticket_medio);
  $('kpiLucroBruto').textContent = brl(resumo.faturamento.lucro_bruto);

  const chart = $('chartHoras');
  if (!resumo.porHora.length) {
    chart.innerHTML = '<div class="text-sec" style="width:100%;text-align:center;align-self:center">Sem dados no período</div>';
  } else {
    const maxVal = Math.max(...resumo.porHora.map(h => h.faturamento));
    chart.innerHTML = resumo.porHora.map(h => {
      const height = maxVal > 0 ? (h.faturamento / maxVal * 100) : 0;
      return `<div class="bar" style="height:${height}%" title="${h.hora}: ${brl(h.faturamento)} (${h.num_vendas} vendas)"><span>${h.hora}</span></div>`;
    }).join('');
  }

  const tbodyPag = $('tbodyPagamentos');
  if (!resumo.porPagamento.length) {
    tbodyPag.innerHTML = '<tr><td colspan="3" class="empty-grid">Sem dados</td></tr>';
  } else {
    tbodyPag.innerHTML = resumo.porPagamento.map(p => `
      <tr>
        <td>${p.forma_pagamento}</td>
        <td class="num">${p.qtd}</td>
        <td class="num">${brl(p.total)}</td>
      </tr>
    `).join('');
  }

  const tbodyTop = $('tbodyTopProdutos');
  if (!topProdutos.length) {
    tbodyTop.innerHTML = '<tr><td colspan="4" class="empty-grid">Sem dados</td></tr>';
  } else {
    tbodyTop.innerHTML = topProdutos.map(p => `
      <tr>
        <td>${p.nome}</td>
        <td>${p.codigo || '-'}</td>
        <td class="num">${p.qtd}</td>
        <td class="num">${brl(p.total)}</td>
      </tr>
    `).join('');
  }

  // Restore default content structure
  $('relConteudo').innerHTML = `
    <div class="kpi-row">
      <div class="kpi"><div class="kpi-label">Faturamento</div><div class="kpi-value" id="kpiFaturamento">${brl(resumo.faturamento.faturamento)}</div></div>
      <div class="kpi"><div class="kpi-label">Quant. de Vendas</div><div class="kpi-value" id="kpiNumVendas">${resumo.faturamento.num_vendas}</div></div>
      <div class="kpi"><div class="kpi-label">Ticket Médio</div><div class="kpi-value" id="kpiTicketMedio">${brl(resumo.faturamento.ticket_medio)}</div></div>
      <div class="kpi"><div class="kpi-label">Lucro Bruto</div><div class="kpi-value" id="kpiLucroBruto">${brl(resumo.faturamento.lucro_bruto)}</div></div>
    </div>
    <h3 style="font-size:14px;font-weight:600;margin-bottom:12px">Vendas por Hora</h3>
    <div class="chart-bars" id="chartHoras">${chart.innerHTML}</div>
    <h3 style="font-size:14px;font-weight:600;margin:18px 0 12px">Meios de Pagamento</h3>
    <div class="grid-wrap">
      <table class="data-table">
        <thead><tr><th>Meio de Pagamento</th><th>Quantidade</th><th>Total</th></tr></thead>
        <tbody id="tbodyPagamentos">${tbodyPag.innerHTML}</tbody>
      </table>
    </div>
    <h3 style="font-size:14px;font-weight:600;margin:18px 0 12px">Top 10 Produtos</h3>
    <div class="grid-wrap">
      <table class="data-table">
        <thead><tr><th>Produto</th><th>Código</th><th>Quantidade</th><th>Total</th></tr></thead>
        <tbody id="tbodyTopProdutos">${tbodyTop.innerHTML}</tbody>
      </table>
    </div>
  `;
}

function renderPlaceholder(tipo) {
  $('relConteudo').innerHTML = `
    <div class="empty-grid" style="padding:80px 20px">
      <p style="font-size:16px;margin-bottom:8px"><svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:currentColor;vertical-align:middle"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg> Relatório: ${$('relTitulo').textContent}</p>
      <p class="text-sec">Este relatório será implementado com dados reais do banco de dados.</p>
      <p class="text-sec" style="margin-top:8px">Selecione "Resumo" na sidebar para ver o relatório completo já funcional.</p>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  carregarResumo();
  $('periodoSelect').addEventListener('change', () => {
    if (relatorioAtual === 'resumo') carregarResumo();
  });
});