/* caixa.js — tela de Caixa completa (clone Nex) */
let caixaAtual = null;
let listaCaixas = [];
const $ = id => document.getElementById(id);

/* ========== ABAS ========== */
function mostrarAbaCaixa(aba) {
  document.querySelectorAll('.caixa-tab').forEach(t => t.classList.remove('active'));
  if (event && event.target) event.target.classList.add('active');
  ['abaCaixaAtual','abaCaixaAnteriores','abaConferir','abaContador'].forEach(id => $(id).style.display = 'none');
  const map = { atual:'abaCaixaAtual', anteriores:'abaCaixaAnteriores', conferir:'abaConferir', contador:'abaContador' };
  $(map[aba]).style.display = '';
  if (aba === 'anteriores') carregarCaixasAnteriores();
  if (aba === 'conferir') carregarConferir();
  if (aba === 'contador') initContador();
}

/* ========== CAIXA ATUAL ========== */
async function carregarCaixa() {
  caixaAtual = await api.caixaAtual();
  if (caixaAtual) {
    $('caixaAberto').style.display = '';
    $('caixaFechado').style.display = 'none';
    $('saldoInicial').textContent = brl(caixaAtual.saldo_inicial);
    $('totalVendas').textContent = brl(caixaAtual.total_vendas);
    $('lucroBruto').textContent = brl(caixaAtual.lucro_bruto);
    // Calcular entradas/saídas das movimentações
    const movs = await api.movimentacoesCaixaAtual();
    const entradas = movs.filter(m => m.tipo !== 'saida').reduce((s, m) => s + m.valor, 0);
    const saidas = movs.filter(m => m.tipo === 'saida').reduce((s, m) => s + m.valor, 0);
    $('totalEntradas').textContent = brl(entradas);
    $('totalSaidas').textContent = brl(saidas);
    $('saldoEsperado').textContent = brl(caixaAtual.saldo_inicial + caixaAtual.total_vendas + entradas - saidas);
    renderMovimentacoes(movs);
    await carregarMeiosPagamento();
  } else {
    $('caixaAberto').style.display = 'none';
    $('caixaFechado').style.display = '';
  }
}

async function carregarMeiosPagamento() {
  // Agrupa vendas do caixa atual por forma de pagamento
  const vendas = await api.listarVendas();
  const mpTotals = {};
  vendas.forEach(v => {
    if (!mpTotals[v.forma_pagamento]) mpTotals[v.forma_pagamento] = 0;
    mpTotals[v.forma_pagamento] += v.total || 0;
  });
  $('mpDinheiro').textContent = brl(mpTotals['Dinheiro'] || 0);
  $('mpCredito').textContent = brl(mpTotals['Cartão de Crédito'] || 0);
  $('mpDebito').textContent = brl(mpTotals['Cartão de Débito'] || 0);
  $('mpPix').textContent = brl(mpTotals['Pix'] || 0);
  $('mpTransferencia').textContent = brl(mpTotals['Transferência'] || 0);
  $('mpCrediario').textContent = brl(mpTotals['Crediário'] || 0);
  // Canais: assume tudo loja física por enquanto
  const totalGeral = Object.values(mpTotals).reduce((s, v) => s + v, 0);
  $('canalLoja').textContent = brl(totalGeral);
  $('canalOnline').textContent = brl(0);
}

function renderMovimentacoes(movs) {
  const el = $('movimentacoes');
  if (!movs.length) {
    el.innerHTML = '<div class="text-sec" style="padding:20px;text-align:center">Nenhuma movimentação</div>';
    return;
  }
  el.innerHTML = movs.map(m => `
    <div class="line">
      <span>${m.tipo} — ${m.descricao || '-'}</span>
      <span class="${m.tipo === 'saida' ? 'neg' : ''}" style="font-weight:600">${m.tipo === 'saida' ? '-' : '+'}${brl(m.valor)}</span>
    </div>
    <div class="text-sec" style="font-size:11px;margin-bottom:8px;padding-left:4px">${new Date(m.data_hora).toLocaleTimeString('pt-BR')}</div>
  `).join('');
}

/* ========== CAIXAS ANTERIORES ========== */
async function carregarCaixasAnteriores() {
  listaCaixas = await api.listarCaixas();
  const tbody = $('tbodyCaixasAnteriores');
  if (!listaCaixas.length) {
    tbody.innerHTML = '<tr><td colspan="8" class="empty-grid">Nenhum caixa registrado</td></tr>';
    return;
  }
  tbody.innerHTML = listaCaixas.map(c => `
    <tr>
      <td>${c.numero || '-'}</td>
      <td>${c.data_abertura ? new Date(c.data_abertura).toLocaleString('pt-BR') : '-'}</td>
      <td>${c.data_fechamento ? new Date(c.data_fechamento).toLocaleString('pt-BR') : '-'}</td>
      <td class="num">${brl(c.saldo_inicial)}</td>
      <td class="num">${brl(c.total_vendas)}</td>
      <td class="num">${c.saldo_final != null ? brl(c.saldo_final) : '-'}</td>
      <td>${c.usuario_abertura || '-'}</td>
      <td><span style="color:${c.status === 'aberto' ? 'var(--verde)' : 'var(--texto-sec)'};font-weight:600">${c.status === 'aberto' ? 'Aberto' : 'Fechado'}</span></td>
    </tr>`).join('');
}

/* ========== CONFERIR MEIO DE PAGAMENTO ========== */
async function carregarConferir() {
  const vendas = await api.listarVendas();
  const mpMap = {};
  let totalGeral = 0;
  vendas.forEach(v => {
    const fp = v.forma_pagamento || 'Outro';
    if (!mpMap[fp]) mpMap[fp] = { qtd: 0, total: 0 };
    mpMap[fp].qtd++;
    mpMap[fp].total += v.total || 0;
    totalGeral += v.total || 0;
  });
  const entries = Object.entries(mpMap).sort((a, b) => b[1].total - a[1].total);
  // Lista resumo
  $('conferirLista').innerHTML = entries.length ? entries.map(([nome, d]) => `
    <div class="line"><span>${nome}</span><span style="font-weight:600">${brl(d.total)}</span></div>
  `).join('') : '<div class="text-sec" style="padding:12px">Sem dados</div>';
  // Tabela detalhada
  const tbody = $('tbodyConferir');
  if (!entries.length) {
    tbody.innerHTML = '<tr><td colspan="4" class="empty-grid">Sem dados</td></tr>';
  } else {
    tbody.innerHTML = entries.map(([nome, d]) => {
      const pct = totalGeral > 0 ? ((d.total / totalGeral) * 100).toFixed(1) : '0.0';
      return `<tr><td>${nome}</td><td class="num">${d.qtd}</td><td class="num">${brl(d.total)}</td><td class="num">${pct}%</td></tr>`;
    }).join('');
  }
}

/* ========== CONTADOR DE DINHEIRO ========== */
const CEDULAS_MOEDAS = [
  { label: 'R$ 200,00', valor: 200 },
  { label: 'R$ 100,00', valor: 100 },
  { label: 'R$ 50,00', valor: 50 },
  { label: 'R$ 20,00', valor: 20 },
  { label: 'R$ 10,00', valor: 10 },
  { label: 'R$ 5,00', valor: 5 },
  { label: 'R$ 2,00', valor: 2 },
  { label: 'R$ 1,00', valor: 1 },
  { label: 'R$ 0,50', valor: 0.5 },
  { label: 'R$ 0,25', valor: 0.25 },
  { label: 'R$ 0,10', valor: 0.1 },
  { label: 'R$ 0,05', valor: 0.05 },
];

function initContador() {
  const grid = $('contadorGrid');
  grid.innerHTML = CEDULAS_MOEDAS.map((cm, i) => `
    <div class="cd-item">
      <div class="cd-label">${cm.label}</div>
      <input type="number" min="0" value="0" data-idx="${i}" data-val="${cm.valor}" oninput="calcularContador()">
      <div class="cd-sub" id="cdSub${i}">R$ 0,00</div>
    </div>
  `).join('');
  $('contadorTotal').textContent = brl(0);
  $('contadorDiferenca').textContent = brl(0);
}

function calcularContador() {
  let total = 0;
  CEDULAS_MOEDAS.forEach((cm, i) => {
    const input = document.querySelector(`input[data-idx="${i}"]`);
    const qtd = Number(input?.value) || 0;
    const sub = qtd * cm.valor;
    total += sub;
    const subEl = $('cdSub' + i);
    if (subEl) subEl.textContent = brl(sub);
  });
  $('contadorTotal').textContent = brl(total);
  // Diferença em relação ao saldo esperado
  const esperado = caixaAtual ? (caixaAtual.saldo_inicial + caixaAtual.total_vendas) : 0;
  const diff = total - esperado;
  const diffEl = $('contadorDiferenca');
  diffEl.textContent = (diff >= 0 ? '+' : '') + brl(diff);
  diffEl.style.color = Math.abs(diff) < 0.01 ? 'var(--verde)' : 'var(--vermelho)';
}

/* ========== MODAIS ========== */
function abrirAbrirCaixa() {
  $('saldoInicialInput').value = 0;
  $('abrirCaixaModal').style.display = '';
  setTimeout(() => $('saldoInicialInput').focus(), 50);
}

async function confirmarAbrirCaixa() {
  const saldo = Number($('saldoInicialInput').value) || 0;
  await api.abrirCaixa({ saldo_inicial: saldo });
  fechar('abrirCaixaModal');
  toast('Caixa aberto');
  carregarCaixa();
}

function abrirMovimentacao(tipo) {
  $('movimentacaoTitulo').textContent = tipo === 'entrada' ? 'Adicionar Dinheiro' : 'Remover Valores';
  $('movimentacaoValor').value = '';
  $('movimentacaoDesc').value = '';
  $('movimentacaoModal').dataset.tipo = tipo;
  $('movimentacaoModal').style.display = '';
  setTimeout(() => $('movimentacaoValor').focus(), 50);
}

async function confirmarMovimentacao() {
  const valor = Number($('movimentacaoValor').value);
  if (!valor || valor <= 0) { toast('Informe um valor válido'); return; }
  const tipo = $('movimentacaoModal').dataset.tipo;
  await api.movimentacaoCaixa({ tipo, valor, descricao: $('movimentacaoDesc').value });
  fechar('movimentacaoModal');
  toast('Movimentação registrada');
  carregarCaixa();
}

function abrirFecharCaixa() {
  const saldoFinal = caixaAtual ? (caixaAtual.saldo_inicial + caixaAtual.total_vendas) : 0;
  $('saldoFinalInput').value = saldoFinal.toFixed(2);
  $('fecharCaixaModal').style.display = '';
  setTimeout(() => $('saldoFinalInput').focus(), 50);
}

async function confirmarFecharCaixa() {
  const saldoFinal = Number($('saldoFinalInput').value);
  await api.fecharCaixa({ id: caixaAtual.id, saldo_final: saldoFinal });
  fechar('fecharCaixaModal');
  toast('Caixa fechado');
  carregarCaixa();
}

document.addEventListener('DOMContentLoaded', () => {
  carregarCaixa();
});