/* contas.js — tela de Contas a Pagar completa (clone Nex) */
let listaContas = [];
const $ = id => document.getElementById(id);

async function carregarContas() {
  listaContas = await api.listarContas();
  renderContas();
}

function diasRestantes(vencimento) {
  if (!vencimento) return '-';
  const hoje = new Date(); hoje.setHours(0,0,0,0);
  const venc = new Date(vencimento + 'T00:00:00');
  const diff = Math.ceil((venc - hoje) / (1000 * 60 * 60 * 24));
  if (diff < 0) return `${Math.abs(diff)} dias atrás`;
  if (diff === 0) return 'Hoje';
  return `${diff} dias`;
}

function mesAno(vencimento) {
  if (!vencimento) return '-';
  const d = new Date(vencimento + 'T00:00:00');
  return d.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
}

function semanaAno(vencimento) {
  if (!vencimento) return '-';
  const d = new Date(vencimento + 'T00:00:00');
  const inicio = new Date(d.getFullYear(), 0, 1);
  const semana = Math.ceil(((d - inicio) / 86400000 + inicio.getDay() + 1) / 7);
  return `Sem ${semana}`;
}

function renderContas(filtro = '') {
  const tbody = $('tbodyContas');
  const filtradas = filtro ? listaContas.filter(c =>
    c.descricao.toLowerCase().includes(filtro.toLowerCase()) ||
    (c.fornecedor || '').toLowerCase().includes(filtro.toLowerCase()) ||
    (c.referencia || '').toLowerCase().includes(filtro.toLowerCase())
  ) : listaContas;

  if (!filtradas.length) {
    tbody.innerHTML = '<tr><td colspan="12" class="empty-grid">Nenhuma conta cadastrada</td></tr>';
    return;
  }

  tbody.innerHTML = filtradas.map(c => {
    const statusColor = c.status === 'pago' ? 'var(--verde)' : c.status === 'atrasado' ? 'var(--vermelho)' : 'var(--amarelo)';
    const statusLabel = c.status === 'pago' ? '✓ Pago' : c.status === 'atrasado' ? '⚠ Atrasado' : c.status === 'cancelado' ? '✕ Cancelado' : '• Pendente';
    return `
    <tr>
      <td><span class="row-action" onclick="editarConta(${c.id})">Editar</span></td>
      <td>${c.referencia || c.id}</td>
      <td>${c.categoria || 'Despesa'}</td>
      <td>${c.descricao}</td>
      <td>${c.fornecedor || '-'}</td>
      <td class="num">${brl(c.valor)}</td>
      <td class="num">${c.valor_pago ? brl(c.valor_pago) : '-'}</td>
      <td>${c.vencimento ? new Date(c.vencimento + 'T00:00:00').toLocaleDateString('pt-BR') : '-'}</td>
      <td class="${c.status !== 'pago' && diasRestantes(c.vencimento).includes('atrás') ? 'neg' : ''}">${diasRestantes(c.vencimento)}</td>
      <td>${mesAno(c.vencimento)}</td>
      <td>${semanaAno(c.vencimento)}</td>
      <td><span style="color:${statusColor};font-weight:600">${statusLabel}</span></td>
    </tr>`;
  }).join('');
}

function abrirNovaConta() {
  $('contaModalTitulo').textContent = 'Nova Conta';
  $('contaId').value = '';
  ['contaNumero','contaDescricao','contaFornecedor','contaCategoria','contaValor','contaValorPago','contaVencimento','contaPagoEm','contaReferencia'].forEach(id => $(id).value = '');
  $('contaTipo').selectedIndex = 0;
  $('contaStatus').value = 'pendente';
  $('contaModal').style.display = '';
  setTimeout(() => $('contaDescricao').focus(), 50);
}

function editarConta(id) {
  const c = listaContas.find(x => x.id === id);
  if (!c) return;
  $('contaModalTitulo').textContent = 'Editar Conta';
  $('contaId').value = c.id;
  $('contaNumero').value = c.referencia || '';
  $('contaTipo').value = c.categoria || 'Despesa Fixa';
  $('contaDescricao').value = c.descricao || '';
  $('contaFornecedor').value = c.fornecedor || '';
  $('contaValor').value = c.valor || '';
  $('contaValorPago').value = c.valor_pago || '';
  $('contaVencimento').value = c.vencimento || '';
  $('contaStatus').value = c.status || 'pendente';
  $('contaPagoEm').value = c.pago_em || '';
  $('contaCategoria').value = c.categoria || '';
  $('contaReferencia').value = c.referencia || '';
  $('contaModal').style.display = '';
}

async function salvarConta() {
  const descricao = $('contaDescricao').value.trim();
  const valor = Number($('contaValor').value);
  const vencimento = $('contaVencimento').value;
  if (!descricao) { toast('Informe a descrição da conta'); return; }
  if (!valor || valor <= 0) { toast('Informe um valor válido'); return; }
  if (!vencimento) { toast('Informe a data de vencimento'); return; }

  const dados = {
    id: $('contaId').value ? Number($('contaId').value) : null,
    descricao,
    fornecedor: $('contaFornecedor').value,
    categoria: $('contaTipo').value,
    valor,
    valor_pago: Number($('contaValorPago').value) || 0,
    vencimento,
    status: $('contaStatus').value,
    pago_em: $('contaPagoEm').value || null,
    referencia: $('contaNumero').value || $('contaReferencia').value
  };

  await api.salvarConta(dados);
  fechar('contaModal');
  toast('Conta salva');
  carregarContas();
}

document.addEventListener('DOMContentLoaded', () => {
  carregarContas();
  $('buscaConta').addEventListener('input', e => renderContas(e.target.value));
});