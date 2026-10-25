# Análise dos Dados Gerais — DADOS GERAIS.zip

## Origem
Arquivo `DADOS GERAIS.zip` (3.1 MB) exportado do sistema NEX original, contendo 24 arquivos `.xls` (Excel 97-2003 binário) na pasta `DADOS GERAIS/`. Total descompactado: ~14.3 MB.

## Conteúdo Extraído

| Arquivo | Registros | Entidade | Descrição |
|---------|-----------|----------|-----------|
| 5.xls | 7 | Fornecedores | Nome, tipo, telefone, CPF/CNPJ, endereço |
| 6.xls | 1989 | Produtos (simplificado) | Nome, código, preço, estoque, categoria |
| 7.xls | 1989 | Produtos (markup/custo) | Produto, estoque, custo, markup%, categoria, preço |
| 8.xls | 5001 | Transações completas | Tipo, número, data, itens, cliente, funcionário, subtotal, desconto, meio pagto |
| 9.xls | 4 | Fechamentos de caixa | Resumo de fechamentos |
| 10.xls | 747 | Caixas | Número, abertura, fechamento, saldo inicial/final, usuário |
| 11.xls | 17249 | Movimentações de caixa | Data, hora, meio pagamento, valor, tipo transação, caixa |
| 12.xls | 14 | Vendas por hora | Hora, vendas, ticket médio, lucro, faturamento |
| 13.xls | 17 | Receitas por meio de pagamento | Receita agrupada por forma de pagamento |
| 14.xls | 2522 | Produtos mais vendidos | Código, nome, qtd, custo, total, lucro% |
| 15.xls | 26 | Lucro por fornecedor | Lucro agrupado por fornecedor |
| 16.xls | 7 | Compras por fornecedor | Compras agrupadas por fornecedor |
| 17.xls | 8 | Resumo financeiro | Resumo por meio de pagamento |
| 18.xls | 16 | Vendedores/funcionários | Nome, qtd vendas, total, comissão |
| 19.xls | 25 | Vendas por hora | Detalhamento horário |
| 20.xls | 5720 | Relatório por fornecedor | Relatório complexo |
| 21.xls | 26736 | Detalhes vendas por vendedor | Maior arquivo de dados |
| **22.xls** | **1990** | **Produtos completos** | **Descrição, código, fornecedor, categoria, unidade, estoque, preço venda, custo unitário, NCM, CEST** ← PRINCIPAL |
| 23.xls | 1999 | Movimentação de estoque | Histórico por produto |
| 24.xls | 10 | Top compradores | Clientes que mais compraram |
| Exportar.xls | 95 | Vendas recentes | Vendas detalhadas recentes |
| Exportar2.xls | 66 | Orçamentos pendentes | Orçamentos em aberto |
| **Exportar3.xls** | **6** | **Clientes** | **Nome, débito/crédito, código, sexo, status, limite débito** ← PRINCIPAL |
| Exportar4.xls | 1989 | Produtos (cópia) | Cópia de 6.xls |

## Dados Convertidos para JSON

Todos os dados relevantes foram convertidos para JSON em `_dados_extraidos/`:

- `produtos.json` — 1989 produtos (de 22.xls)
- `clientes.json` — 5 clientes (de Exportar3.xls)
- `fornecedores.json` — 6 fornecedores (de 5.xls)
- `vendedores.json` — 15 vendedores (de 18.xls)
- `vendas.json` — 5000 transações (de 8.xls)
- `caixas.json` — 746 caixas (de 10.xls)
- `movimentacoes.json` — 17248 movimentações (de 11.xls)
- `categorias.json` — 93 categorias únicas
- `meios_pagamento.json` — 6 meios de pagamento

## Observações sobre Encoding

Os headers dos arquivos XLS apresentam caracteres corrompidos (mojibake) quando lidos em UTF-8, devido ao encoding ANSI/Latin-1 original. Os dados numéricos e a estrutura das tabelas estão corretos. A normalização dos nomes de campos foi feita no script de importação.

## Meios de Pagamento Identificados

Originais: CARTAO, DINHEIRO REAL, DOLAR, GUARANIES, PIX, Pix
Normalizados: CARTAO, DINHEIRO REAL, DOLAR, GUARANIES, PIX (PIX e Pix unificados)