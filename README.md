# PDV Local — Clone do Nex (Nextar)

Sistema de Ponto de Venda (PDV) **100% local**, clone visual e funcional do Nex/Nextar, com armazenamento em SQLite local (sem nuvem).

## 📋 Funcionalidades

- ✅ **Vendas** — Nova venda (tema Padrão), carrinho, busca de produtos, descontos, cliente, vendedor, forma de pagamento
- ✅ **Clientes** — Cadastro completo (CPF/CNPJ, endereço, telefone, débito/crédito)
- ✅ **Produtos** — Cadastro com código, preço, custo, estoque, categoria, fornecedor
- ✅ **Estoque** — Controle por produto, ajuste de entrada/saída, histórico de transações, markup %
- ✅ **Caixa** — Abertura/fechamento, saldo inicial/final, movimentações (entrada/saída), lucro bruto
- ✅ **Relatórios** — Faturamento, ticket médio, vendas por hora, meios de pagamento, top 10 produtos
- ✅ **Contas a Pagar** — Cadastro com vencimento, status (pendente/pago), fornecedor

## 🛠️ Stack

- **Electron** — App desktop multiplataforma
- **SQLite** (better-sqlite3) — Banco de dados local, sem servidor
- **HTML/CSS/JS puro** — Interface fiel ao Nex (tokens reais: Inter, #0098f9, grade DevExpress)

## 🚀 Instalação

### Pré-requisitos
- Node.js 18+ instalado
- npm ou yarn

### Passos

```bash
# 1. Entrar na pasta do projeto
cd "D:\PROJETOS CLAUDE\pdv-local"

# 2. Instalar dependências
npm install

# 3. Rodar o app
npm start
```

Na primeira execução, o sistema cria automaticamente:
- Banco de dados SQLite em `%APPDATA%/pdv-local/pdv.db` (Windows) ou `~/.config/pdv-local/pdv.db` (Linux/Mac)
- Dados de exemplo: 10 produtos, 3 vendedores, 2 clientes, 3 categorias

## ⌨️ Atalhos de Teclado (Tela de Vendas)

| Tecla | Ação |
|-------|------|
| **F2** | Concluir Venda / Salvar |
| **F3** | Aplicar Desconto no item selecionado |
| **F4** | Observações |
| **F5** | Selecionar Cliente |
| **F6** | Selecionar Vendedor |
| **F10** | Editar item selecionado |
| **F12** | Alterar quantidade |
| **Delete** | Remover item selecionado |
| **Enter** | Confirmar preço no modal |
| **Escape** | Fechar modal / dropdown |

## 📁 Estrutura do Projeto

```
pdv-local/
├── package.json              # Dependências e scripts
├── README.md                 # Este arquivo
└── src/
    ├── main/
    │   ├── index.js          # Backend Electron + SQLite (IPC handlers)
    │   └── preload.js        # Bridge seguro entre main e renderer
    └── renderer/
        ├── index.html        # Redireciona para vendas.html
        ├── vendas.html       # Tela principal de Nova Venda
        ├── vendas.js         # Lógica da tela de vendas
        ├── clientes.html     # Tela de Clientes
        ├── clientes.js
        ├── produtos.html     # Tela de Produtos
        ├── produtos.js
        ├── estoque.html      # Tela de Estoque
        ├── estoque.js
        ├── caixa.html        # Tela de Caixa
        ├── caixa.js
        ├── relatorios.html   # Tela de Relatórios
        ├── relatorios.js
        ├── contas.html       # Tela de Contas a Pagar
        ├── contas.js
        ├── shell.js          # Sidebar compartilhada + utilitários
        └── styles.css        # CSS global (tokens do Nex)
```

## 🎨 Design

Tokens extraídos do CSS real do Nextar:
- Fonte: **Inter**
- Azul principal: **#0098f9**
- Borda: **#dbdbdb**
- Hover/selecionado: **#f0f9ff**
- Vermelho (cancelado/desconto): **#d8162e**
- Fundo financeiro: **rgba(247,247,176,.35)**

## 📝 Notas

- O banco de dados é **100% local** — nenhum dado sai da máquina
- Para backup, copie o arquivo `pdv.db` da pasta de dados do app
- O sistema já vem com dados de exemplo para teste imediato
- Todas as telas seguem o layout e fluxo do Nex capturado ao vivo

## 🔧 Desenvolvimento

Para modificar o código:
1. Edite os arquivos em `src/renderer/` (HTML/CSS/JS das telas)
2. Edite `src/main/index.js` para alterar o backend/banco
3. Reinicie o app com `npm start` para ver as mudanças

## 📄 Licença

Projeto privado — clone do Nex para uso interno da loja.