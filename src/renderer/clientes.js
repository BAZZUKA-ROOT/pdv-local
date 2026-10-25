/* clientes.js — tela de Clientes completa (clone Nex) */
let listaClientes = [];
const $ = id => document.getElementById(id);

function corAvatar(nome) {
  const cores = ['#0098f9','#e74c3c','#2ecc71','#f39c12','#9b59b6','#1abc9c','#e67e22','#3498db'];
  let hash = 0;
  for (let i = 0; i < nome.length; i++) hash = nome.charCodeAt(i) + ((hash << 5) - hash);
  return cores[Math.abs(hash) % cores.length];
}

async function carregarClientes() {
  listaClientes = await api.listarClientes();
  renderClientes();
}

function renderClientes(filtro = '') {
  const tbody = $('tbodyClientes');
  const filtrados = filtro ? listaClientes.filter(c =>
    c.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    (c.cpf_cnpj || '').includes(filtro) ||
    (c.codigo || '').includes(filtro)
  ) : listaClientes;

  if (!filtrados.length) {
    tbody.innerHTML = '<tr><td colspan="10" class="empty-grid">Nenhum cliente cadastrado</td></tr>';
    return;
  }

  tbody.innerHTML = filtrados.map(c => `
    <tr>
      <td><span class="row-action" onclick="editarCliente(${c.id})">Editar</span></td>
      <td>${c.id}</td>
      <td><span class="avatar" style="background:${corAvatar(c.nome)}">${c.nome[0]}</span> ${c.nome}</td>
      <td>${c.cpf_cnpj || '-'}</td>
      <td>${c.rg_ie || '-'}</td>
      <td>${c.telefone || '-'}</td>
      <td>${c.data_nascimento ? new Date(c.data_nascimento).toLocaleDateString('pt-BR') : '-'}</td>
      <td class="num ${c.debito > 0 ? 'neg' : ''}">${brl(c.debito)}</td>
      <td class="num">${brl(c.credito)}</td>
      <td class="text-sec" style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${(c.observacoes || '').replace(/"/g, '&quot;')}">${c.observacoes || '-'}</td>
    </tr>`).join('');
}

function abrirNovoCliente() {
  $('clienteModalTitulo').textContent = 'Novo Cliente';
  $('clienteId').value = '';
  ['cliNome','cliCpfCnpj','cliRgIe','cliTelefone','cliEmail','cliEndereco','cliNumero','cliComplemento','cliBairro','cliCidade','cliEstado','cliCep','cliDataNasc','cliObs'].forEach(id => $(id).value = '');
  $('clienteModal').style.display = '';
  setTimeout(() => $('cliNome').focus(), 50);
}

function editarCliente(id) {
  const c = listaClientes.find(x => x.id === id);
  if (!c) return;
  $('clienteModalTitulo').textContent = 'Editar Cliente';
  $('clienteId').value = c.id;
  $('cliNome').value = c.nome || '';
  $('cliCpfCnpj').value = c.cpf_cnpj || '';
  $('cliRgIe').value = c.rg_ie || '';
  $('cliTelefone').value = c.telefone || '';
  $('cliEmail').value = c.email || '';
  $('cliEndereco').value = c.endereco || '';
  $('cliNumero').value = c.numero || '';
  $('cliComplemento').value = c.complemento || '';
  $('cliBairro').value = c.bairro || '';
  $('cliCidade').value = c.cidade || '';
  $('cliEstado').value = c.estado || '';
  $('cliCep').value = c.cep || '';
  $('cliDataNasc').value = c.data_nascimento || '';
  $('cliObs').value = c.observacoes || '';
  $('clienteModal').style.display = '';
}

async function salvarCliente() {
  const nome = $('cliNome').value.trim();
  if (!nome) { toast('Informe o nome do cliente'); return; }
  const dados = {
    id: $('clienteId').value ? Number($('clienteId').value) : null,
    nome,
    cpf_cnpj: $('cliCpfCnpj').value,
    rg_ie: $('cliRgIe').value,
    telefone: $('cliTelefone').value,
    email: $('cliEmail').value,
    endereco: $('cliEndereco').value,
    numero: $('cliNumero').value,
    complemento: $('cliComplemento').value,
    bairro: $('cliBairro').value,
    cidade: $('cliCidade').value,
    estado: $('cliEstado').value,
    cep: $('cliCep').value,
    data_nascimento: $('cliDataNasc').value,
    observacoes: $('cliObs').value
  };
  await api.salvarCliente(dados);
  fechar('clienteModal');
  toast('Cliente salvo');
  carregarClientes();
}

document.addEventListener('DOMContentLoaded', () => {
  carregarClientes();
  $('buscaCliente').addEventListener('input', e => renderClientes(e.target.value));
});