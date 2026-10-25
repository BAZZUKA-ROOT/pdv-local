const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // janela
  fecharJanela: () => ipcRenderer.invoke('fechar-janela'),
  minimizarJanela: () => ipcRenderer.invoke('minimizar-janela'),
  maximizarJanela: () => ipcRenderer.invoke('maximizar-janela'),
  navegarPara: (tela) => ipcRenderer.invoke('navegar-para', tela),

  // produtos
  buscarProdutos: (termo) => ipcRenderer.invoke('buscar-produtos', termo),
  listarProdutos: () => ipcRenderer.invoke('listar-produtos'),
  salvarProduto: (p) => ipcRenderer.invoke('salvar-produto', p),
  excluirProduto: (id) => ipcRenderer.invoke('excluir-produto', id),

  // estoque
  listarEstoque: () => ipcRenderer.invoke('listar-estoque'),
  ajustarEstoque: (d) => ipcRenderer.invoke('ajustar-estoque', d),
  listarTransacoes: () => ipcRenderer.invoke('listar-transacoes'),

  // vendas
  adicionarVenda: (v) => ipcRenderer.invoke('adicionar-venda', v),
  listarVendas: () => ipcRenderer.invoke('listar-vendas'),
  detalhesVenda: (id) => ipcRenderer.invoke('detalhes-venda', id),

  // clientes
  listarClientes: () => ipcRenderer.invoke('listar-clientes'),
  salvarCliente: (c) => ipcRenderer.invoke('salvar-cliente', c),
  excluirCliente: (id) => ipcRenderer.invoke('excluir-cliente', id),

  // vendedores
  listarVendedores: () => ipcRenderer.invoke('listar-vendedores'),
  salvarVendedor: (v) => ipcRenderer.invoke('salvar-vendedor', v),

  // caixa
  caixaAtual: () => ipcRenderer.invoke('caixa-atual'),
  listarCaixas: () => ipcRenderer.invoke('listar-caixas'),
  abrirCaixa: (d) => ipcRenderer.invoke('abrir-caixa', d),
  fecharCaixa: (d) => ipcRenderer.invoke('fechar-caixa', d),
  movimentacaoCaixa: (d) => ipcRenderer.invoke('movimentacao-caixa', d),
  movimentacoesCaixaAtual: () => ipcRenderer.invoke('movimentacoes-caixa-atual'),

  // contas
  listarContas: () => ipcRenderer.invoke('listar-contas'),
  salvarConta: (c) => ipcRenderer.invoke('salvar-conta', c),

  // relatorios
  relatorioResumo: (dias) => ipcRenderer.invoke('relatorio-resumo', dias),
  relatorioTopProdutos: (dias) => ipcRenderer.invoke('relatorio-top-produtos', dias),

  // fornecedores (usando tabela existente)
  listarFornecedores: () => ipcRenderer.invoke('listar-fornecedores'),
  salvarFornecedor: (f) => ipcRenderer.invoke('salvar-fornecedor', f),
  excluirFornecedor: (id) => ipcRenderer.invoke('excluir-fornecedor', id),

  // categorias
  listarCategorias: () => ipcRenderer.invoke('listar-categorias')
});