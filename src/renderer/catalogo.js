/* catalogo.js — tela de Catálogo Online */
let listaProdutos = [];
const $ = id => document.getElementById(id);

async function carregarCatalogo() {
  listaProdutos = await api.listarProdutos();
  renderCatalogo();
  atualizarResumo();
}

function renderCatalogo(filtro = '') {
  const tbody = $('tbodyCatalogo');
  const filtrados = filtro ? listaProdutos.filter(p =>
    p.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    (p.codigo || '').includes(filtro)
  ) : listaProdutos;

  if (!filtrados.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-grid">Nenhum produto encontrado</td></tr>';
    return;
  }

  tbody.innerHTML = filtrados.map(p => `
    <tr>
      <td style="text-align:center">
        <label class="toggle-switch" style="display:inline-block">
          <input type="checkbox" ${p.publicado ? 'checked' : ''} onchange="togglePublicar(${p.id}, this.checked)">
          <span class="toggle-slider"></span>
        </label>
      </td>
      <td style="text-align:center"><div class="img-placeholder" title="Adicionar imagem"><svg viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg></div></td>
      <td>${p.nome}</td>
      <td>${p.codigo || '-'}</td>
      <td class="num">${brl(p.preco)}</td>
      <td class="num ${p.estoque <= 0 ? 'neg' : ''}">${p.estoque}</td>
      <td>${p.categoria || '-'}</td>
    </tr>`).join('');
}

function togglePublicar(id, publicado) {
  // Simula publicação local — no futuro pode persistir no banco
  const p = listaProdutos.find(x => x.id === id);
  if (p) p.publicado = publicado;
  atualizarResumo();
  toast(publicado ? 'Produto publicado na loja online' : 'Produto removido da loja online');
}

function atualizarResumo() {
  const publicados = listaProdutos.filter(p => p.publicado).length;
  $('resumoPublicados').textContent = publicados;
  $('resumoTotal').textContent = listaProdutos.length;
}

function salvarConfigLoja() {
  toast('Configurações da loja salvas');
}

document.addEventListener('DOMContentLoaded', () => {
  carregarCatalogo();
  $('buscaCatalogo').addEventListener('input', e => renderCatalogo(e.target.value));
});