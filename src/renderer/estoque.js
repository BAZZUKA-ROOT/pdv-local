/* estoque.js — tela de Estoque completa (clone Nex) */
let listaEstoque = [];
let listaTransacoes = [];
const $ = id => document.getElementById(id);

/* ========== ABAS ========== */
function mostrarAba(aba) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  if (event && event.target) event.target.classList.add('active');
  ['abaEstoque','abaTransacoes','abaValidade','abaInventario'].forEach(id => $(id).style.display = 'none');
  const map = { estoque:'abaEstoque', transacoes:'abaTransacoes', validade:'abaValidade', inventario:'abaInventario' };
  $(map[aba]).style.display = '';
  if (aba === 'transacoes') carregarTransacoes();
  if (aba === 'validade') renderValidades();
  if (aba === 'inventario') renderInventario();
}

/* ========== ESTOQUE POR PRODUTO ========== */
async function carregarEstoque() {
  listaEstoque = await api.listarEstoque();
  renderEstoque();
}

function renderEstoque(filtro = '') {
  const tbody = $('tbodyEstoque');
  const tfoot = $('tfootEstoque');
  let filtrados = filtro ? listaEstoque.filter(p =>
    p.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    (p.codigo || '').includes(filtro)
  ) : listaEstoque;

  if (!filtrados.length) {
    tbody.innerHTML = '<tr><td colspan="10" class="empty-grid">Nenhum produto no estoque</td></tr>';
    tfoot.innerHTML = '';
    return;
  }

  let totalCusto = 0, totalPreco = 0, totalEstoque = 0;
  filtrados.forEach(p => {
    totalCusto += Number(p.custo_total) || 0;
    totalPreco += Number(p.preco_total) || 0;
    totalEstoque += Number(p.estoque) || 0;
  });

  tbody.innerHTML = filtrados.map(p => {
    const disponivel = p.estoque;
    const estAdquirido = p.estoque;
    const revendaPct = p.markup_pct || 0;
    return `
    <tr>
      <td style="text-align:center"><div class="img-placeholder" title="Adicionar imagem"><svg viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg></div></td>
      <td>${p.nome}</td>
      <td>${p.codigo || '-'}</td>
      <td class="num ${p.estoque <= 0 ? 'neg' : ''}">${p.estoque}</td>
      <td class="num">${disponivel}</td>
      <td class="num">${estAdquirido}</td>
      <td class="num">${brl(p.custo)}</td>
      <td class="num">${brl(p.preco)}</td>
      <td class="num">${revendaPct}%</td>
      <td><span class="row-action" onclick="abrirAjuste(${p.id}, '${p.nome.replace(/'/g, "\\'")}')">Ajustar</span></td>
    </tr>`;
  }).join('');

  tfoot.innerHTML = `
    <tr>
      <td colspan="3" style="text-align:right;font-weight:700">TOTAIS:</td>
      <td class="num">${totalEstoque}</td>
      <td class="num">${totalEstoque}</td>
      <td class="num">${totalEstoque}</td>
      <td class="num fin">${brl(totalCusto / (filtrados.length || 1))}</td>
      <td class="num fin">${brl(totalPreco / (filtrados.length || 1))}</td>
      <td class="num"></td>
      <td></td>
    </tr>
    <tr>
      <td colspan="6" style="text-align:right;font-weight:700">Valor Total em Estoque:</td>
      <td class="num fin">${brl(totalCusto)}</td>
      <td class="num fin">${brl(totalPreco)}</td>
      <td colspan="2"></td>
    </tr>`;
}

/* ========== TRANSAÇÕES ========== */
async function carregarTransacoes() {
  listaTransacoes = await api.listarTransacoes();
  const tbody = $('tbodyTransacoes');
  if (!listaTransacoes.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-grid">Nenhuma transação registrada</td></tr>';
    return;
  }
  tbody.innerHTML = listaTransacoes.map(t => `
    <tr>
      <td>${new Date(t.data_hora).toLocaleString('pt-BR')}</td>
      <td>${t.tipo}</td>
      <td>${t.produto_nome || '-'}</td>
      <td class="num">${t.quantidade > 0 ? '+' : ''}${t.quantidade}</td>
      <td>${t.motivo || '-'}</td>
      <td>${t.funcionario || '-'}</td>
    </tr>`).join('');
}

/* ========== AJUSTE DE ESTOQUE ========== */
function abrirAjuste(id, nome) {
  $('ajusteProdutoId').value = id;
  $('ajusteProdutoNome').textContent = nome;
  $('ajusteQtd').value = 1;
  $('ajusteMotivo').value = '';
  $('ajusteTipo').value = 'entrada';
  $('ajusteModal').style.display = '';
  setTimeout(() => $('ajusteQtd').focus(), 50);
}

async function confirmarAjuste() {
  const qtd = Number($('ajusteQtd').value);
  if (!qtd || qtd <= 0) { toast('Informe uma quantidade válida'); return; }
  const tipo = $('ajusteTipo').value;
  const quantidade = tipo === 'saida' ? -qtd : qtd;
  await api.ajustarEstoque({
    produto_id: Number($('ajusteProdutoId').value),
    quantidade,
    tipo,
    motivo: $('ajusteMotivo').value
  });
  fechar('ajusteModal');
  toast('Estoque ajustado');
  carregarEstoque();
}


/* ========== CONTROLE DE VALIDADE ========== */
var listaValidades = [];

async function abrirRegistrarValidade() {
  var produtos = await api.listarProdutos();
  var sel = $('valProduto');
  sel.innerHTML = '<option value="">— Selecione —</option>' +
    produtos.map(function(p) { return '<option value="' + p.id + '">' + p.nome + '</option>'; }).join('');
  $('valLote').value = '';
  $('valData').value = '';
  $('valQtd').value = '1';
  $('validadeModal').style.display = '';
  setTimeout(function() { $('valProduto').focus(); }, 50);
}

function salvarValidade() {
  var prodId = $('valProduto').value;
  var dataVal = $('valData').value;
  if (!prodId) { toast('Selecione um produto'); return; }
  if (!dataVal) { toast('Informe a data de validade'); return; }
  var prodNome = $('valProduto').options[$('valProduto').selectedIndex].text;
  listaValidades.push({
    id: Date.now(), produto_id: parseInt(prodId), produto_nome: prodNome,
    lote: $('valLote').value, validade: dataVal,
    quantidade: parseInt($('valQtd').value) || 1
  });
  fechar('validadeModal');
  renderValidades();
  toast('Validade registrada');
}

function renderValidades() {
  var tbody = $('tbodyValidades');
  if (!tbody) return;
  if (!listaValidades.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-grid">Nenhuma validade registrada</td></tr>';
    return;
  }
  var hoje = new Date();
  tbody.innerHTML = listaValidades.map(function(v) {
    var dtVal = new Date(v.validade);
    var diasRestantes = Math.ceil((dtVal - hoje) / 86400000);
    var status = diasRestantes < 0 ? 'Vencido' : diasRestantes <= 30 ? 'Próximo do vencimento' : 'OK';
    var cor = diasRestantes < 0 ? 'var(--vermelho)' : diasRestantes <= 30 ? 'var(--amarelo)' : 'var(--verde)';
    return '<tr>' +
      '<td>' + v.produto_nome + '</td>' +
      '<td>' + (v.lote || '-') + '</td>' +
      '<td>' + dtVal.toLocaleDateString('pt-BR') + '</td>' +
      '<td class="num">' + v.quantidade + '</td>' +
      '<td><span style="color:' + cor + ';font-weight:600">' + status + '</span></td>' +
      '<td><span class="row-action" style="color:var(--vermelho)" onclick="removerValidade(' + v.id + ')">Remover</span></td>' +
      '</tr>';
  }).join('');
}

function removerValidade(id) {
  listaValidades = listaValidades.filter(function(v) { return v.id !== id; });
  renderValidades();
  toast('Validade removida');
}

/* ========== INVENTÁRIO ========== */
var inventarioAtivo = false;
var listaInventario = [];

async function iniciarInventario() {
  var produtos = await api.listarProdutos();
  listaInventario = produtos.map(function(p) {
    return { id: p.id, nome: p.nome, codigo: p.codigo || '-', estoque_sistema: p.estoque, contagem: p.estoque };
  });
  inventarioAtivo = true;
  renderInventario();
  toast('Inventário iniciado — preencha as contagens físicas');
}

function renderInventario() {
  var tbody = $('tbodyInventario');
  if (!tbody) return;
  if (!listaInventario.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-grid">Clique em "Novo Inventário" para iniciar</td></tr>';
    return;
  }
  tbody.innerHTML = listaInventario.map(function(item, idx) {
    var diff = item.contagem - item.estoque_sistema;
    var corDiff = diff > 0 ? 'var(--verde)' : diff < 0 ? 'var(--vermelho)' : '#333';
    return '<tr>' +
      '<td>' + item.nome + '</td>' +
      '<td>' + item.codigo + '</td>' +
      '<td class="num">' + item.estoque_sistema + '</td>' +
      '<td class="num"><input type="number" min="0" value="' + item.contagem + '" onchange="atualizarContagem(' + idx + ', this.value)" style="width:70px;border:1px solid var(--borda);border-radius:4px;padding:4px 6px;text-align:center;font-weight:600"></td>' +
      '<td class="num" style="color:' + corDiff + ';font-weight:700">' + (diff >= 0 ? '+' : '') + diff + '</td>' +
      '<td>' + (diff !== 0 ? '<span class="row-action" onclick="aplicarAjusteInventario(' + idx + ')">Aplicar</span>' : '<span class="text-sec">OK</span>') + '</td>' +
      '</tr>';
  }).join('') +
    '<tr><td colspan="6" style="padding:12px;text-align:right"><button class="btn-concluir" onclick="finalizarInventario()">FINALIZAR INVENTÁRIO</button></td></tr>';
}

function atualizarContagem(idx, val) {
  listaInventario[idx].contagem = parseInt(val) || 0;
  renderInventario();
}

async function aplicarAjusteInventario(idx) {
  var item = listaInventario[idx];
  var diff = item.contagem - item.estoque_sistema;
  if (diff === 0) return;
  await api.ajustarEstoque({
    produto_id: item.id, quantidade: diff,
    tipo: diff > 0 ? 'entrada' : 'saida',
    motivo: 'Ajuste de inventário'
  });
  item.estoque_sistema = item.contagem;
  renderInventario();
  toast('Ajuste aplicado para ' + item.nome);
}

function finalizarInventario() {
  inventarioAtivo = false;
  listaInventario = [];
  renderInventario();
  carregarEstoque();
  toast('Inventário finalizado');
}

document.addEventListener('DOMContentLoaded', () => {
  carregarEstoque();
  $('buscaEstoque').addEventListener('input', e => renderEstoque(e.target.value));
});