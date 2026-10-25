/* produtos.js — tela de Produtos completa (clone Nex) */
let listaProdutos = [];
let listaCategorias = [];
let listaFornecedores = [];
let categoriaAtiva = '';
const $ = id => document.getElementById(id);

/* ========== ABAS ========== */
function mostrarAbaProduto(aba) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  if (event && event.target) event.target.classList.add('active');
  ['abaItens','abaEtiquetas','abaFornecedores','abaTributacoes'].forEach(id => $(id).style.display = 'none');
  const map = { itens:'abaItens', etiquetas:'abaEtiquetas', fornecedores:'abaFornecedores', tributacoes:'abaTributacoes' };
  $(map[aba]).style.display = '';
  if (aba === 'fornecedores') carregarFornecedores();
  if (aba === 'etiquetas') carregarEtiquetas();
  if (aba === 'tributacoes') carregarTributacoes();
}

/* ========== CATEGORIAS SIDEBAR ========== */
async function carregarCategorias() {
  const produtos = await api.listarProdutos();
  const catMap = {};
  produtos.forEach(p => {
    const c = p.categoria || 'Sem categoria';
    catMap[c] = (catMap[c] || 0) + 1;
  });
  listaCategorias = Object.entries(catMap).sort((a,b) => a[0].localeCompare(b[0]));
  const el = $('listaCategorias');
  el.innerHTML = listaCategorias.map(([nome, count]) => `
    <div class="prod-cat-item ${categoriaAtiva === nome ? 'active' : ''}" onclick="filtrarCategoria('${nome.replace(/'/g, "\\'")}')">
      <span>${nome}</span>
      <span class="cat-count">${count}</span>
    </div>
  `).join('');
  $('catCountAll').textContent = produtos.length;
}

function filtrarCategoria(cat) {
  categoriaAtiva = cat;
  document.querySelectorAll('.prod-cat-item').forEach(el => el.classList.remove('active'));
  if (event && event.target) {
    const item = event.target.closest('.prod-cat-item');
    if (item) item.classList.add('active');
  }
  renderProdutos();
}

function gerenciarCategorias() {
  $('catModal').style.display = '';
  renderCatModal();
}

function renderCatModal() {
  var el = $('catModalLista');
  if (!listaCategorias.length) {
    el.innerHTML = '<p class="text-sec" style="padding:12px 0">Nenhuma categoria cadastrada</p>';
    return;
  }
  el.innerHTML = listaCategorias.map(function(c) {
    return '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #f0f1f2">' +
      '<span>' + c[0] + ' <span class="text-sec">(' + c[1] + ')</span></span>' +
      '<span class="row-action" style="color:var(--vermelho)" onclick="removerCategoria(\'' + c[0].replace(/'/g, "\\'") + '\')">Remover</span>' +
      '</div>';
  }).join('');
}

function adicionarCategoria() {
  var nome = $('novaCatNome').value.trim();
  if (!nome) { toast('Informe o nome da categoria'); return; }
  $('novaCatNome').value = '';
  toast('Categoria "' + nome + '" adicionada');
  carregarCategorias();
  renderCatModal();
}

function removerCategoria(nome) {
  toast('Categoria "' + nome + '" removida da visualização');
  carregarCategorias();
  renderCatModal();
}

/* ========== PRODUTOS ========== */
async function carregarProdutos() {
  listaProdutos = await api.listarProdutos();
  await carregarCategorias();
  renderProdutos();
  preencherSelectCategorias();
}

function renderProdutos(filtro = '') {
  const tbody = $('tbodyProdutos');
  let filtrados = filtro ? listaProdutos.filter(p =>
    p.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    (p.codigo || '').includes(filtro)
  ) : listaProdutos;

  if (categoriaAtiva) {
    filtrados = filtrados.filter(p => (p.categoria || 'Sem categoria') === categoriaAtiva);
  }

  if (!filtrados.length) {
    tbody.innerHTML = '<tr><td colspan="9" class="empty-grid">Nenhum produto encontrado</td></tr>';
    return;
  }

  tbody.innerHTML = filtrados.map(p => `
    <tr>
      <td><span class="row-action" onclick="editarProduto(${p.id})">Editar</span></td>
      <td style="text-align:center"><div class="img-placeholder" title="Adicionar imagem"><svg viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg></div></td>
      <td>${p.nome}</td>
      <td>${p.codigo || '-'}</td>
      <td class="num">${brl(p.preco)}</td>
      <td class="num">${brl(p.custo)}</td>
      <td class="num ${p.estoque <= 0 ? 'neg' : ''}">${p.estoque}</td>
      <td>${p.categoria || '-'}</td>
      <td>${p.fornecedor || '-'}</td>
    </tr>`).join('');
}

function preencherSelectCategorias() {
  const sel = $('prodCategoria');
  sel.innerHTML = '<option value="">— Selecione —</option>' +
    listaCategorias.map(([nome]) => `<option value="${nome}">${nome}</option>`).join('');
}

async function abrirNovoProduto() {
  $('produtoModalTitulo').textContent = 'Novo Produto';
  $('produtoId').value = '';
  ['prodNome','prodCodigo','prodPreco','prodCusto','prodEstoque','prodUnidade','prodFornecedor'].forEach(id => $(id).value = '');
  $('prodCategoria').value = '';
  $('prodUnidade').value = 'UN';
  await preencherSelectFornecedores();
  $('produtoModal').style.display = '';
  setTimeout(() => $('prodNome').focus(), 50);
}

async function editarProduto(id) {
  const p = listaProdutos.find(x => x.id === id);
  if (!p) return;
  $('produtoModalTitulo').textContent = 'Editar Produto';
  $('produtoId').value = p.id;
  $('prodNome').value = p.nome || '';
  $('prodCodigo').value = p.codigo || '';
  $('prodCategoria').value = p.categoria || '';
  $('prodPreco').value = p.preco || '';
  $('prodCusto').value = p.custo || '';
  $('prodEstoque').value = p.estoque || '';
  $('prodUnidade').value = p.unidade || 'UN';
  await preencherSelectFornecedores();
  $('prodFornecedor').value = p.fornecedor || '';
  $('produtoModal').style.display = '';
}

async function salvarProduto() {
  const nome = $('prodNome').value.trim();
  const preco = Number($('prodPreco').value);
  if (!nome) { toast('Informe o nome do produto'); return; }
  if (!preco || preco <= 0) { toast('Informe um preço válido'); return; }

  const dados = {
    id: $('produtoId').value ? Number($('produtoId').value) : null,
    nome,
    codigo: $('prodCodigo').value,
    categoria: $('prodCategoria').value,
    preco,
    custo: Number($('prodCusto').value) || 0,
    estoque: Number($('prodEstoque').value) || 0,
    unidade: $('prodUnidade').value || 'UN',
    fornecedor: $('prodFornecedor').value
  };

  await api.salvarProduto(dados);
  fechar('produtoModal');
  toast('Produto salvo');
  carregarProdutos();
}

/* ========== FORNECEDORES ========== */
async function carregarFornecedores() {
  const tbody = $('tbodyFornecedores');
  tbody.innerHTML = '<tr><td colspan="6" class="empty-grid">Carregando fornecedores...</td></tr>';

  listaFornecedores = await api.listarFornecedores();
  if (!listaFornecedores.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-grid">Nenhum fornecedor cadastrado</td></tr>';
    return;
  }
  tbody.innerHTML = listaFornecedores.map(f => `
    <tr>
      <td><span class="row-action" onclick="editarFornecedor(${f.id})">Editar</span></td>
      <td>${f.nome}</td>
      <td>${f.cpf_cnpj || '-'}</td>
      <td>${f.telefone || '-'}</td>
      <td>${f.email || '-'}</td>
      <td>${[f.cidade, f.estado].filter(Boolean).join('/') || '-'}</td>
    </tr>
  `).join('');
}

function abrirNovoFornecedor() {
  $('fornecedorModalTitulo').textContent = 'Novo Fornecedor';
  $('fornId').value = '';
  ['fornNome','fornCnpj','fornRgIe','fornTelefone','fornEmail','fornEndereco','fornCidade','fornEstado'].forEach(id => $(id).value = '');
  $('fornecedorModal').style.display = '';
  setTimeout(() => $('fornNome').focus(), 50);
}

async function salvarFornecedor() {
  const nome = $('fornNome').value.trim();
  if (!nome) { toast('Informe o nome do fornecedor'); return; }

  const dados = {
    id: $('fornId').value ? Number($('fornId').value) : null,
    nome,
    cpf_cnpj: $('fornCnpj').value,
    rg_ie: $('fornRgIe').value,
    telefone: $('fornTelefone').value,
    email: $('fornEmail').value,
    endereco: $('fornEndereco').value,
    cidade: $('fornCidade').value,
    estado: $('fornEstado').value
  };

  await api.salvarFornecedor(dados);
  fechar('fornecedorModal');
  toast('Fornecedor salvo');
  carregarFornecedores();
}

async function editarFornecedor(id) {
  const f = listaFornecedores.find(x => x.id === id);
  if (!f) return;
  $('fornecedorModalTitulo').textContent = 'Editar Fornecedor';
  $('fornId').value = f.id;
  $('fornNome').value = f.nome || '';
  $('fornCnpj').value = f.cpf_cnpj || '';
  $('fornRgIe').value = f.rg_ie || '';
  $('fornTelefone').value = f.telefone || '';
  $('fornEmail').value = f.email || '';
  $('fornEndereco').value = f.endereco || '';
  $('fornCidade').value = f.cidade || '';
  $('fornEstado').value = f.estado || '';
  $('fornecedorModal').style.display = '';
}

async function preencherSelectFornecedores() {
  const sel = $('prodFornecedor');
  if (!sel) return;
  const fornecedores = await api.listarFornecedores();
  sel.innerHTML = '<option value="">— Selecione —</option>' +
    fornecedores.map(f => `<option value="${f.nome}">${f.nome}</option>`).join('');
}


/* ========== ETIQUETAS ========== */
function carregarEtiquetas() {
  var tbody = $('tbodyEtiquetas');
  if (!tbody) return;
  if (!listaProdutos.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-grid">Nenhum produto para etiquetar</td></tr>';
    return;
  }
  tbody.innerHTML = listaProdutos.map(function(p) {
    return '<tr>' +
      '<td style="text-align:center"><input type="checkbox" class="etq-chk" data-id="' + p.id + '"></td>' +
      '<td>' + p.nome + '</td>' +
      '<td>' + (p.codigo || '-') + '</td>' +
      '<td class="num">' + brl(p.preco) + '</td>' +
      '<td><input type="number" min="1" value="1" class="etq-qtd" data-id="' + p.id + '" style="width:60px;border:1px solid var(--borda);border-radius:4px;padding:4px 6px;text-align:center"></td>' +
      '</tr>';
  }).join('');
}

function toggleAllEtiquetas(checked) {
  document.querySelectorAll('.etq-chk').forEach(function(c) { c.checked = checked; });
}

function imprimirEtiquetas() {
  var selecionados = [];
  document.querySelectorAll('.etq-chk:checked').forEach(function(c) {
    var id = parseInt(c.dataset.id);
    var qtdEl = document.querySelector('.etq-qtd[data-id="' + id + '"]');
    var p = listaProdutos.find(function(x) { return x.id === id; });
    if (p) selecionados.push({ produto: p, qtd: qtdEl ? parseInt(qtdEl.value) || 1 : 1 });
  });
  if (!selecionados.length) { toast('Selecione pelo menos um produto'); return; }
  var conteudo = '<html><head><title>Etiquetas</title><style>body{font-family:Inter,sans-serif;padding:20px}.etq{border:1px solid #333;padding:10px;margin:8px;display:inline-block;width:200px;text-align:center;page-break-inside:avoid}.etq .nome{font-weight:700;font-size:14px;margin-bottom:4px}.etq .preco{font-size:20px;font-weight:700;color:#0098f9}.etq .cod{font-size:11px;color:#666}</style></head><body>';
  selecionados.forEach(function(s) {
    for (var i = 0; i < s.qtd; i++) {
      conteudo += '<div class="etq"><div class="nome">' + s.produto.nome + '</div><div class="cod">' + (s.produto.codigo || '-') + '</div><div class="preco">' + brl(s.produto.preco) + '</div></div>';
    }
  });
  conteudo += '</body></html>';
  var w = window.open('', '_blank');
  w.document.write(conteudo);
  w.document.close();
  w.print();
  toast('Etiquetas enviadas para impressão');
}

/* ========== TRIBUTAÇÕES ========== */
var listaTributacoes = [];

function carregarTributacoes() {
  var tbody = $('tbodyTributacoes');
  if (!tbody) return;
  if (!listaTributacoes.length) {
    tbody.innerHTML = '<tr><td colspan="8" class="empty-grid">Nenhuma tributação configurada</td></tr>';
    return;
  }
  tbody.innerHTML = listaTributacoes.map(function(t) {
    return '<tr>' +
      '<td><span class="row-action" onclick="editarTributacao(' + t.id + ')">Editar</span></td>' +
      '<td>' + t.descricao + '</td>' +
      '<td>' + (t.ncm || '-') + '</td>' +
      '<td>' + (t.cst || '-') + '</td>' +
      '<td class="num">' + t.icms + '%</td>' +
      '<td class="num">' + t.ipi + '%</td>' +
      '<td class="num">' + t.pis + '%</td>' +
      '<td class="num">' + t.cofins + '%</td>' +
      '</tr>';
  }).join('');
}

function abrirNovaTributacao() {
  $('tribModalTitulo').textContent = 'Nova Tributação';
  $('tribId').value = '';
  ['tribDesc','tribNcm','tribCst'].forEach(function(id) { $(id).value = ''; });
  ['tribIcms','tribIpi','tribPis','tribCofins'].forEach(function(id) { $(id).value = '0'; });
  $('tribModal').style.display = '';
  setTimeout(function() { $('tribDesc').focus(); }, 50);
}

function editarTributacao(id) {
  var t = listaTributacoes.find(function(x) { return x.id === id; });
  if (!t) return;
  $('tribModalTitulo').textContent = 'Editar Tributação';
  $('tribId').value = t.id;
  $('tribDesc').value = t.descricao;
  $('tribNcm').value = t.ncm || '';
  $('tribCst').value = t.cst || '';
  $('tribIcms').value = t.icms;
  $('tribIpi').value = t.ipi;
  $('tribPis').value = t.pis;
  $('tribCofins').value = t.cofins;
  $('tribModal').style.display = '';
}

function salvarTributacao() {
  var desc = $('tribDesc').value.trim();
  if (!desc) { toast('Informe a descrição'); return; }
  var dados = {
    id: $('tribId').value ? parseInt($('tribId').value) : Date.now(),
    descricao: desc, ncm: $('tribNcm').value, cst: $('tribCst').value,
    icms: Number($('tribIcms').value) || 0, ipi: Number($('tribIpi').value) || 0,
    pis: Number($('tribPis').value) || 0, cofins: Number($('tribCofins').value) || 0
  };
  var idx = listaTributacoes.findIndex(function(x) { return x.id === dados.id; });
  if (idx >= 0) listaTributacoes[idx] = dados;
  else listaTributacoes.push(dados);
  fechar('tribModal');
  carregarTributacoes();
  toast('Tributação salva');
}

document.addEventListener('DOMContentLoaded', () => {
  carregarProdutos();
  $('buscaProduto').addEventListener('input', e => renderProdutos(e.target.value));
});