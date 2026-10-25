/* vendas.js — tela de Vendas completa (clone Nex) */
document.body.dataset.tela = 'vendas';
let carrinho = [];
let produtoPendente = null;
let clienteSelecionado = null;
let observacoes = '';
let selectedIndex = -1;
let listaVendas = [];
let pedidosAbertos = [];
let orcamentosSalvos = [];
let modoAtual = 'venda';
const $ = id => document.getElementById(id);

/* ========== ABAS ========== */
function mostrarAbaVenda(aba) {
  var tabs = document.querySelectorAll('.venda-tab');
  tabs.forEach(function(t) { t.classList.remove('active'); });
  var tabMap = { nova:0, historico:1, aberto:2, online:3, orcamentos:4 };
  if (tabMap[aba] !== undefined && tabs[tabMap[aba]]) tabs[tabMap[aba]].classList.add('active');

  // Ocultar todas as abas de conteúdo primeiro
  ['abaHistorico','abaAberto','abaOnline','abaOrcamentos'].forEach(function(id) {
    var el = $(id);
    if (el) el.style.display = 'none';
  });

  // Mostrar apenas a aba selecionada (se não for 'nova')
  var showMap = { historico:'abaHistorico', aberto:'abaAberto', online:'abaOnline', orcamentos:'abaOrcamentos' };
  if (showMap[aba]) {
    var el = $(showMap[aba]);
    if (el) el.style.display = 'flex'; // Usar flex para manter layout consistente
  }

  // Elementos do formulário de venda/entrada
  var searchSection = document.querySelector('.search-section');
  var searchDropdown = $('searchDropdown');
  var vendaMiddle = document.querySelector('.venda-middle');
  var vendaFooter = document.querySelector('.venda-footer');
  var vendaActions = document.querySelector('.venda-actions');

  // Se estiver em qualquer aba que não seja 'nova', esconder TODO o formulário de entrada
  var esconderFormulario = aba !== 'nova';

  if (searchSection) searchSection.style.display = esconderFormulario ? 'none' : '';
  if (searchDropdown) searchDropdown.style.display = 'none';
  if (vendaMiddle) vendaMiddle.style.display = esconderFormulario ? 'none' : '';
  if (vendaFooter) vendaFooter.style.display = esconderFormulario ? 'none' : '';
  // Manter botões de ação visíveis mas desabilitados ou apenas visuais conforme NEX
  // No NEX, os botões superiores permanecem, mas o foco muda totalmente para a lista

  if (aba === 'historico') carregarHistorico();
  if (aba === 'aberto') renderPedidosAbertos();
  if (aba === 'orcamentos') renderOrcamentos();
}

function setModoVenda(modo) {
  modoAtual = modo;
  carrinho = []; clienteSelecionado = null; observacoes = ''; selectedIndex = -1;
  renderCarrinho();
  $('produtoBusca').value = '';
  document.querySelectorAll('.venda-action-btn').forEach(function(b) { b.classList.remove('active'); });
  var titulo = $('pageTitle');
  var btnConcluir = $('btnConcluir');
  if (modo === 'venda') {
    if (titulo) titulo.textContent = 'Venda';
    if (btnConcluir) btnConcluir.innerHTML = 'CONCLUIR VENDA <kbd>F2</kbd>';
    mostrarAbaVenda('nova');
    var btns = document.querySelectorAll('.venda-action-btn');
    if (btns[0]) btns[0].classList.add('active');
  } else if (modo === 'pedido') {
    if (titulo) titulo.textContent = 'Pedido';
    if (btnConcluir) btnConcluir.innerHTML = 'SALVAR PEDIDO <kbd>F2</kbd>';
    mostrarAbaVenda('nova');
    var btns = document.querySelectorAll('.venda-action-btn');
    if (btns[1]) btns[1].classList.add('active');
  } else if (modo === 'orcamento') {
    if (titulo) titulo.textContent = 'Or\u00e7amento';
    if (btnConcluir) btnConcluir.innerHTML = 'SALVAR OR\u00c7AMENTO <kbd>F2</kbd>';
    mostrarAbaVenda('nova');
    var btns = document.querySelectorAll('.venda-action-btn');
    if (btns[2]) btns[2].classList.add('active');
  }
  setTimeout(function() { $('produtoBusca').focus(); }, 50);
}

function novaVenda() {
  setModoVenda('venda');
  toast('Nova venda iniciada');
}

function novoPedido() {
  setModoVenda('pedido');
  toast('Novo pedido \u2014 adicione itens e salve em aberto');
}

function novoOrcamento() {
  setModoVenda('orcamento');
  toast('Novo or\u00e7amento \u2014 adicione itens e salve');
}

function trocaDevolucao() {
  $('trocaModal').style.display = '';
  $('trocaVendaNum').value = '';
  $('trocaMotivo').value = '';
  setTimeout(function() { $('trocaVendaNum').focus(); }, 50);
}

function confirmarTroca() {
  var num = $('trocaVendaNum').value.trim();
  if (!num) { toast('Informe o n\u00famero da venda original'); return; }
  fechar('trocaModal');
  carrinho = []; clienteSelecionado = null; selectedIndex = -1;
  observacoes = 'TROCA/DEVOLU\u00c7\u00c3O \u2014 Venda orig: ' + num + ' | Motivo: ' + ($('trocaMotivo').value || '-');
  renderCarrinho();
  $('produtoBusca').value = '';
  $('produtoBusca').focus();
  toast('Troca iniciada para venda ' + num);
}

/* ========== PEDIDOS EM ABERTO ========== */
function salvarPedidoAberto() {
  if (carrinho.length === 0) { toast('Adicione itens antes de salvar'); return; }
  var total = carrinho.reduce(function(s, i) { return s + i.subtotal; }, 0);
  var pedido = {
    id: Date.now(), data: new Date().toISOString(),
    cliente: clienteSelecionado ? clienteSelecionado.nome : '-',
    itens: JSON.parse(JSON.stringify(carrinho)),
    total: total, obs: observacoes
  };
  pedidosAbertos.push(pedido);
  carrinho = []; clienteSelecionado = null; observacoes = ''; selectedIndex = -1;
  renderCarrinho(); renderPedidosAbertos();
  toast('Pedido salvo em aberto');
}

function renderPedidosAbertos() {
  var tbody = $('tbodyPedidosAbertos');
  if (!tbody) return;
  if (!pedidosAbertos.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-grid">Nenhum pedido em aberto</td></tr>';
    return;
  }
  tbody.innerHTML = pedidosAbertos.map(function(p) {
    return '<tr>' +
      '<td>' + new Date(p.data).toLocaleString('pt-BR') + '</td>' +
      '<td>' + p.cliente + '</td>' +
      '<td class="num">' + p.itens.length + '</td>' +
      '<td class="num">' + brl(p.total) + '</td>' +
      '<td class="text-sec" style="max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + (p.obs || '-') + '</td>' +
      '<td><span class="row-action" onclick="carregarPedidoAberto(' + p.id + ')">Carregar</span> ' +
      '<span class="row-action" style="color:var(--vermelho)" onclick="removerPedidoAberto(' + p.id + ')">Excluir</span></td>' +
      '</tr>';
  }).join('');
}

function carregarPedidoAberto(id) {
  var p = pedidosAbertos.find(function(x) { return x.id === id; });
  if (!p) return;
  carrinho = p.itens; selectedIndex = carrinho.length - 1;
  observacoes = p.obs || '';
  pedidosAbertos = pedidosAbertos.filter(function(x) { return x.id !== id; });
  mostrarAbaVenda('nova');
  document.querySelectorAll('.venda-tab').forEach(function(t) { t.classList.remove('active'); });
  document.querySelector('.venda-tab').classList.add('active');
  renderCarrinho(); renderPedidosAbertos();
  toast('Pedido carregado');
}

function removerPedidoAberto(id) {
  pedidosAbertos = pedidosAbertos.filter(function(x) { return x.id !== id; });
  renderPedidosAbertos();
  toast('Pedido removido');
}

/* ========== OR\u00c7AMENTOS ========== */
function salvarOrcamento() {
  if (carrinho.length === 0) { toast('Adicione itens antes de salvar'); return; }
  var total = carrinho.reduce(function(s, i) { return s + i.subtotal; }, 0);
  var orc = {
    id: Date.now(),
    numero: 'ORC-' + String(orcamentosSalvos.length + 1).padStart(4, '0'),
    data: new Date().toISOString(),
    cliente: clienteSelecionado ? clienteSelecionado.nome : '-',
    itens: JSON.parse(JSON.stringify(carrinho)),
    total: total, obs: observacoes,
    validade: new Date(Date.now() + 7 * 86400000).toISOString()
  };
  orcamentosSalvos.push(orc);
  carrinho = []; clienteSelecionado = null; observacoes = ''; selectedIndex = -1;
  renderCarrinho(); renderOrcamentos();
  toast('Or\u00e7amento ' + orc.numero + ' salvo');
}

function renderOrcamentos() {
  var tbody = $('tbodyOrcamentos');
  if (!tbody) return;
  if (!orcamentosSalvos.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-grid">Nenhum or\u00e7amento salvo</td></tr>';
    return;
  }
  tbody.innerHTML = orcamentosSalvos.map(function(o) {
    var vencida = new Date(o.validade) < new Date();
    return '<tr>' +
      '<td>' + o.numero + '</td>' +
      '<td>' + new Date(o.data).toLocaleDateString('pt-BR') + '</td>' +
      '<td>' + o.cliente + '</td>' +
      '<td class="num">' + o.itens.length + '</td>' +
      '<td class="num">' + brl(o.total) + '</td>' +
      '<td style="color:' + (vencida ? 'var(--vermelho)' : 'var(--texto-sec)') + '">' + new Date(o.validade).toLocaleDateString('pt-BR') + (vencida ? ' (vencido)' : '') + '</td>' +
      '<td><span class="row-action" onclick="converterOrcamentoEmVenda(' + o.id + ')">Converter</span> ' +
      '<span class="row-action" style="color:var(--vermelho)" onclick="removerOrcamento(' + o.id + ')">Excluir</span></td>' +
      '</tr>';
  }).join('');
}

function converterOrcamentoEmVenda(id) {
  var o = orcamentosSalvos.find(function(x) { return x.id === id; });
  if (!o) return;
  carrinho = o.itens; selectedIndex = carrinho.length - 1;
  observacoes = o.obs || '';
  orcamentosSalvos = orcamentosSalvos.filter(function(x) { return x.id !== id; });
  mostrarAbaVenda('nova');
  document.querySelectorAll('.venda-tab').forEach(function(t) { t.classList.remove('active'); });
  document.querySelector('.venda-tab').classList.add('active');
  renderCarrinho(); renderOrcamentos();
  toast('Or\u00e7amento convertido em venda');
}

function removerOrcamento(id) {
  orcamentosSalvos = orcamentosSalvos.filter(function(x) { return x.id !== id; });
  renderOrcamentos();
  toast('Or\u00e7amento removido');
}

/* ========== HIST\u00d3RICO ========== */
async function carregarHistorico() {
  listaVendas = await api.listarVendas();
  renderHistorico();
}

function renderHistorico(filtro) {
  var tbody = $('tbodyHistorico');
  var termo = (filtro || '').toLowerCase();
  var filtradas = termo ? listaVendas.filter(function(v) {
    return (v.numero || '').toLowerCase().includes(termo) ||
      (v.cliente_nome || '').toLowerCase().includes(termo);
  }) : listaVendas;
  if (!filtradas.length) {
    tbody.innerHTML = '<tr><td colspan="8" class="empty-grid">Nenhuma venda encontrada</td></tr>';
    return;
  }
  tbody.innerHTML = filtradas.map(function(v) {
    return '<tr>' +
      '<td>' + (v.numero || '-') + '</td>' +
      '<td>' + new Date(v.data_hora).toLocaleString('pt-BR') + '</td>' +
      '<td>' + (v.cliente_nome || '-') + '</td>' +
      '<td>' + (v.vendedor_nome || '-') + '</td>' +
      '<td class="num">' + (v.num_itens || 0) + '</td>' +
      '<td class="num">' + brl(v.total) + '</td>' +
      '<td><span style="color:' + (v.status === 'concluida' ? 'var(--verde)' : 'var(--amarelo)') + ';font-weight:600">' + (v.status === 'concluida' ? 'Conclu\u00edda' : v.status) + '</span></td>' +
      '<td><span class="row-action" onclick="verDetalhesVenda(' + v.id + ')">Ver</span></td>' +
      '</tr>';
  }).join('');
}

async function verDetalhesVenda(id) {
  var dados = await api.detalhesVenda(id);
  if (!dados || !dados.venda) return;
  var v = dados.venda;
  var msg = 'Venda ' + v.numero + '\nData: ' + new Date(v.data_hora).toLocaleString('pt-BR') + '\n';
  msg += 'Cliente: ' + (v.cliente_nome || '-') + '\nVendedor: ' + (v.vendedor_nome || '-') + '\n';
  msg += 'Total: ' + brl(v.total) + '\nForma: ' + v.forma_pagamento + '\nItens:\n';
  (dados.itens || []).forEach(function(i) {
    msg += '  ' + i.quantidade + 'x ' + (i.nome || '?') + ' \u2014 ' + brl(i.subtotal) + '\n';
  });
  alert(msg);
}

/* ========== CARRINHO ========== */
function atualizarTotais() {
  var totalQty = carrinho.reduce(function(s, i) { return s + i.quantidade; }, 0);
  var total = carrinho.reduce(function(s, i) { return s + i.subtotal; }, 0);
  $('itemCount').textContent = carrinho.length + ' item(ns)';
  $('totalQty').textContent = totalQty;
  $('totalValue').textContent = brl(total);
  $('btnConcluir').disabled = carrinho.length === 0;
}

function renderCarrinho() {
  var tbody = $('cartItems');
  if (carrinho.length === 0) {
    tbody.innerHTML = '<tr class="empty-cart"><td colspan="5"><div class="empty-state"><span class="zzz"><svg viewBox="0 0 24 24" style="width:32px;height:32px;fill:currentColor"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0020 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg></span><p>Carrinho vazio \u2014 busque um produto acima</p></div></td></tr>';
    atualizarTotais();
    return;
  }
  tbody.innerHTML = carrinho.map(function(it, idx) {
    return '<tr class="' + (idx === selectedIndex ? 'sel' : '') + '" data-idx="' + idx + '">' +
      '<td class="col-num">' + (idx + 1) + '</td>' +
      '<td class="col-qtd">' + it.quantidade + 'x</td>' +
      '<td><div class="item-nome">' + it.nome + '</div>' +
      '<div class="item-preco-linha">' + it.codigo + ' \u00b7 Pre\u00e7o: ' + brl(it.preco_unitario) +
      (it.desconto > 0 ? ' \u00b7 Desc: ' + brl(it.desconto) : '') +
      ' <span class="link-desconto" data-desc="' + idx + '">Aplicar desconto</span></div></td>' +
      '<td class="col-preco">' + brl(it.subtotal) + '</td>' +
      '<td class="col-del"><button class="del-btn" data-del="' + idx + '">\u2715</button></td></tr>';
  }).join('');
  tbody.querySelectorAll('[data-del]').forEach(function(b) {
    b.addEventListener('click', function() { removerItem(parseInt(b.dataset.del)); });
  });
  tbody.querySelectorAll('[data-desc]').forEach(function(s) {
    s.addEventListener('click', function() { aplicarDesconto(parseInt(s.dataset.desc)); });
  });
  tbody.querySelectorAll('tr[data-idx]').forEach(function(tr) {
    tr.addEventListener('click', function() { selectedIndex = parseInt(tr.dataset.idx); renderCarrinho(); });
  });
  atualizarTotais();
}

function removerItem(idx) {
  carrinho.splice(idx, 1);
  if (selectedIndex >= carrinho.length) selectedIndex = carrinho.length - 1;
  renderCarrinho();
}

function aplicarDesconto(idx) {
  var it = carrinho[idx];
  var v = prompt('Desconto para "' + it.nome + '" (R$):', it.desconto || 0);
  if (v === null) return;
  var desc = Math.max(0, Number(v) || 0);
  it.desconto = desc;
  it.subtotal = Math.max(0, it.quantidade * it.preco_unitario - desc);
  renderCarrinho();
}

/* ========== BUSCA DE PRODUTOS ========== */
var buscaTimer = null;

function initBusca() {
  var input = $('produtoBusca');
  var dropdown = $('searchDropdown');
  var results = $('dropdownResults');

  input.addEventListener('input', function() {
    clearTimeout(buscaTimer);
    var termo = input.value.trim();
    if (!termo) { dropdown.style.display = 'none'; return; }
    buscaTimer = setTimeout(async function() {
      var lista = await api.buscarProdutos(termo);
      if (!lista.length) {
        results.innerHTML = '<tr><td colspan="4" style="color:var(--texto-sec);padding:14px">Nenhum produto encontrado</td></tr>';
      } else {
        results.innerHTML = lista.map(function(p) {
          return '<tr data-id="' + p.id + '"><td>' + (p.codigo || '-') + '</td><td class="prod-nome">' + p.nome +
            '</td><td class="prod-preco">' + brl(p.preco) + '</td><td class="' + (p.estoque <= 0 ? 'estoque-baixo' : '') + '">' + p.estoque + '</td></tr>';
        }).join('');
        results.querySelectorAll('tr[data-id]').forEach(function(tr) {
          tr.addEventListener('dblclick', function() {
            var found = lista.find(function(p) { return p.id == tr.dataset.id; });
            if (found) selecionarProduto(found);
          });
        });
      }
      dropdown.style.display = '';
    }, 180);
  });

  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      var primeiro = results.querySelector('tr[data-id]');
      if (primeiro) {
        var pid = primeiro.dataset.id;
        api.buscarProdutos(input.value.trim()).then(function(l) {
          var p = l.find(function(x) { return x.id == pid; });
          if (p) selecionarProduto(p);
        });
      }
    }
    if (e.key === 'Escape') dropdown.style.display = 'none';
  });

  document.addEventListener('click', function(e) {
    if (!e.target.closest('.search-section') && !e.target.closest('.search-dropdown')) {
      dropdown.style.display = 'none';
    }
  });
}

function selecionarProduto(p) {
  if (!p) return;
  $('searchDropdown').style.display = 'none';
  $('produtoBusca').value = '';
  produtoPendente = p;
  $('precoModalNome').textContent = p.codigo + ' \u2014 ' + p.nome;
  $('precoUnitario').value = p.preco;
  $('precoModal').style.display = '';
  setTimeout(function() { $('precoUnitario').focus(); $('precoUnitario').select(); }, 50);
}

function fecharModalPreco() {
  fechar('precoModal');
  produtoPendente = null;
}

function confirmarAdicionarItem() {
  if (!produtoPendente) return;
  var preco = Number($('precoUnitario').value);
  if (!preco || preco <= 0) { toast('Informe um pre\u00e7o v\u00e1lido'); return; }
  var qtd = Number($('quantidade').value) || 1;
  var it = {
    produto_id: produtoPendente.id, nome: produtoPendente.nome,
    codigo: produtoPendente.codigo || '-', quantidade: qtd,
    preco_unitario: preco, desconto: 0, subtotal: qtd * preco
  };
  carrinho.push(it);
  selectedIndex = carrinho.length - 1;
  fecharModalPreco();
  renderCarrinho();
  $('produtoBusca').focus();
}

/* ========== MODAIS ========== */
async function abrirCliente() {
  var lista = await api.listarClientes();
  var sel = $('clienteSelect');
  sel.innerHTML = '<option value="">\u2014 Selecione um cliente \u2014</option>' +
    lista.map(function(c) { return '<option value="' + c.id + '">' + c.nome + (c.cpf_cnpj ? ' (' + c.cpf_cnpj + ')' : '') + '</option>'; }).join('');
  if (clienteSelecionado) sel.value = clienteSelecionado.id;
  $('clienteModal').style.display = '';
}

function confirmarCliente() {
  var id = Number($('clienteSelect').value);
  if (!id) { clienteSelecionado = null; }
  else {
    var nome = $('clienteSelect').options[$('clienteSelect').selectedIndex].text;
    clienteSelecionado = { id: id, nome: nome };
  }
  fechar('clienteModal');
  toast(clienteSelecionado ? 'Cliente: ' + clienteSelecionado.nome.split('(')[0].trim() : 'Cliente removido');
}

function abrirEntrega() {
  $('entregaModal').style.display = '';
  $('entregaEndereco').value = '';
  $('entregaObs').value = '';
  setTimeout(function() { $('entregaEndereco').focus(); }, 50);
}

function confirmarEntrega() {
  var endereco = $('entregaEndereco').value.trim();
  if (!endereco) { toast('Informe o endere\u00e7o de entrega'); return; }
  fechar('entregaModal');
  observacoes = (observacoes ? observacoes + ' | ' : '') + 'ENTREGA: ' + endereco + ($('entregaObs').value ? ' \u2014 ' + $('entregaObs').value : '');
  toast('Endere\u00e7o de entrega registrado');
}

function abrirObservacoes() {
  $('obsTexto').value = observacoes;
  $('obsModal').style.display = '';
  setTimeout(function() { $('obsTexto').focus(); }, 50);
}

function confirmarObs() {
  observacoes = $('obsTexto').value;
  fechar('obsModal');
  toast('Observa\u00e7\u00f5es salvas');
}

/* ========== CONCLUIR VENDA ========== */
var modoAtual = 'venda';
function concluirVenda() {
  if (carrinho.length === 0) return;
  if (modoAtual === 'pedido') { salvarPedidoAberto(); return; }
  if (modoAtual === 'orcamento') { salvarOrcamento(); return; }
  var total = carrinho.reduce(function(s, i) { return s + i.subtotal; }, 0);
  $('pagTotal').textContent = brl(total);
  $('formaPagamento').value = 'Dinheiro';
  $('pagModal').style.display = '';
}

async function finalizarVenda() {
  var total = carrinho.reduce(function(s, i) { return s + i.subtotal; }, 0);
  var custoTotal = carrinho.reduce(function(s, i) { return s + (i.preco_unitario * i.quantidade * 0.4); }, 0);
  var venda = {
    subtotal: total, desconto: 0, total: total, custo_total: custoTotal,
    cliente_id: clienteSelecionado ? clienteSelecionado.id : null,
    vendedor_id: $('vendedorSelect').value || null,
    observacoes: observacoes,
    forma_pagamento: $('formaPagamento').value,
    itens: carrinho.map(function(i) {
      return { produto_id: i.produto_id, quantidade: i.quantidade,
        preco_unitario: i.preco_unitario, desconto: i.desconto, subtotal: i.subtotal };
    })
  };
  try {
    await api.adicionarVenda(venda);
    fechar('pagModal');
    carrinho = []; clienteSelecionado = null; observacoes = ''; selectedIndex = -1;
    renderCarrinho();
    toast('Venda conclu\u00edda com sucesso!');
    $('produtoBusca').focus();
  } catch (err) {
    toast('Erro ao salvar venda: ' + err.message);
  }
}

/* ========== ATALHOS DE TECLADO ========== */
function initAtalhos() {
  document.addEventListener('keydown', function(e) {
    var modalAberto = ['precoModal','clienteModal','obsModal','pagModal','trocaModal','entregaModal'].some(function(id) {
      return $(id) && $(id).style.display !== 'none';
    });
    if (e.key === 'F2') { e.preventDefault(); if ($('precoModal').style.display !== 'none') confirmarAdicionarItem(); else concluirVenda(); }
    if (e.key === 'F3') { e.preventDefault(); if (selectedIndex >= 0 && !modalAberto) aplicarDesconto(selectedIndex); else if (!modalAberto) novaVenda(); }
    if (e.key === 'F4') { e.preventDefault(); if (!modalAberto) abrirObservacoes(); }
    if (e.key === 'F5') { e.preventDefault(); if (!modalAberto) abrirCliente(); }
    if (e.key === 'F6') { e.preventDefault(); if (!modalAberto) $('vendedorSelect').focus(); }
    if (e.key === 'F9') { e.preventDefault(); if (!modalAberto) abrirEntrega(); }
    if (e.key === 'F10') { e.preventDefault(); if (selectedIndex >= 0 && !modalAberto) aplicarDesconto(selectedIndex); }
    if (e.key === 'F12') {
      e.preventDefault();
      if (selectedIndex >= 0 && !modalAberto) {
        var it = carrinho[selectedIndex];
        var v = prompt('Quantidade para "' + it.nome + '":', it.quantidade);
        if (v !== null) {
          var q = Math.max(1, parseInt(v) || 1);
          it.quantidade = q;
          it.subtotal = q * it.preco_unitario - (it.desconto || 0);
          renderCarrinho();
        }
      }
    }
    if (e.key === 'Delete') { e.preventDefault(); if (selectedIndex >= 0 && !modalAberto) removerItem(selectedIndex); }
    if (e.key === 'Escape') {
      ['precoModal','clienteModal','obsModal','pagModal','trocaModal','entregaModal'].forEach(function(id) { fechar(id); });
      $('searchDropdown').style.display = 'none';
    }
  });
}

/* ========== INIT ========== */
async function initVendedores() {
  var lista = await api.listarVendedores();
  var sel = $('vendedorSelect');
  sel.innerHTML = '<option value="">Selecione um vendedor: - F6</option>' +
    lista.map(function(v) { return '<option value="' + v.id + '">' + v.nome + '</option>'; }).join('');
}

document.addEventListener('DOMContentLoaded', function() {
  initBusca();
  initAtalhos();
  initVendedores();
  renderCarrinho();
});
