# Correções de Dados Aplicadas no pdv-local

## Resumo
Substituição completa do seed data fictício do `src/main/index.js` pelos dados reais extraídos do sistema NEX (DADOS GERAIS.zip).

## Correções Aplicadas

### 1. Seed Data de Produtos
- **Antes:** 10 produtos fictícios (Camiseta Básica, Calça Jeans, Tênis Casual, etc.)
- **Depois:** 1989 produtos reais do NEX com código, descrição, preço de venda, custo unitário, estoque atual, categoria, fornecedor e unidade
- **Arquivo fonte:** 22.xls → produtos.json
- **Correção aplicada:** Mapeamento correto dos campos com acentos e espaços (`Descrição`, `Preço de Venda`, `Custo Unitário`, `Estoque Atual`)

### 2. Seed Data de Vendedores
- **Antes:** 3 vendedores fictícios (João Silva, Maria Santos, Carlos Oliveira) com comissão fixa de 5%
- **Depois:** 15 vendedores reais com comissão percentual calculada a partir dos dados de vendas
- **Arquivo fonte:** 18.xls → vendedores.json
- **Correção aplicada:** Campo `Funcionário` mapeado para `nome`; comissão calculada como `(Comissão Vendas / Total Vendas) * 100`

### 3. Seed Data de Clientes
- **Antes:** 2 clientes fictícios (Ana Paula Souza, Roberto Lima) com CPFs inventados
- **Depois:** 5 clientes reais com nome, CPF/CNPJ, telefone e endereço completo concatenado
- **Arquivo fonte:** Exportar3.xls → clientes.json
- **Correção aplicada:** Endereço montado a partir de 7 campos separados (Endereço, Número, Complemento, Bairro, Cidade, Estado, CEP)

### 4. Seed Data de Categorias
- **Antes:** 3 categorias fictícias (Vestuário, Calçados, Acessórios)
- **Depois:** 93 categorias reais extraídas dos produtos
- **Arquivo fonte:** Valores únicos de `Categoria` em produtos.json
- **Correção aplicada:** Normalização de caracteres especiais e remoção de duplicatas

### 5. Seed Data de Fornecedores
- **Antes:** Nenhum fornecedor no seed original
- **Depois:** 6 fornecedores reais com nome, CPF/CNPJ, telefone, email, cidade, estado e endereço
- **Arquivo fonte:** 5.xls → fornecedores.json
- **Correção aplicada:** Coluna `cnpj_cpf` corrigida para `cpf_cnpj` (schema real da tabela); endereço concatenado de múltiplos campos

### 6. Meios de Pagamento Normalizados
- **Problema:** 'PIX' e 'Pix' apareciam como meios separados nos dados exportados
- **Correção:** Unificados para 'PIX' via `.toUpperCase()` no script de importação
- **Resultado final:** CARTAO, DINHEIRO REAL, DOLAR, GUARANIES, PIX

## Arquivos Modificados

| Arquivo | Alteração | Tamanho |
|---------|-----------|---------|
| `src/main/index.js` | Função `seedData()` substituída por versão com dados reais | 209.9 KB (era ~15 KB) |
| `scripts/importar_dados_reais.js` | Script de importação criado (gerador do seedData) | Novo |
| `scripts/seedData_gerado.js` | Código gerado do seedData (artefato intermediário) | 194.6 KB |

## Como Reaplicar
Se o banco precisar ser re-seeded:
1. Delete `data/database.sqlite`
2. Execute `npm start` — o seedData() será executado automaticamente na primeira inicialização com banco vazio
3. Para regenerar o seedData: `node scripts/importar_dados_reais.js` e copie o conteúdo de `scripts/seedData_gerado.js` para dentro do `index.js`