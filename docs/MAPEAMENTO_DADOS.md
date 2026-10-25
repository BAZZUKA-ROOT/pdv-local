# Mapeamento de Dados — NEX → pdv-local

## Entidades Principais

### Produtos (22.xls → produtos.json → tabela `produtos`)
| Campo NEX | Campo pdv-local | Tipo | Observação |
|-----------|-----------------|------|------------|
| Descrição | nome | TEXT | Nome completo do produto |
| Código | codigo | TEXT | Código interno (ex: 000001) |
| Preço de Venda | preco | REAL | Preço de venda ao consumidor |
| Custo Unitário | custo | REAL | Custo de aquisição |
| Estoque Atual | estoque | INTEGER | Quantidade em estoque |
| Categoria | categoria | TEXT | Categoria do produto |
| Fornecedor | fornecedor | TEXT | Nome do fornecedor |
| Unidade | unidade | TEXT | Unidade de medida (Peça, UN, etc.) |
| NCM | — | — | Não mapeado (tabela tributacoes futura) |
| CEST | — | — | Não mapeado (tabela tributacoes futura) |

**Total:** 1989 produtos importados

### Clientes (Exportar3.xls → clientes.json → tabela `clientes`)
| Campo NEX | Campo pdv-local | Tipo | Observação |
|-----------|-----------------|------|------------|
| Nome | nome | TEXT | Nome do cliente |
| CPF / CNPJ | cpf_cnpj | TEXT | Documento |
| Telefone + Celular | telefone | TEXT | Prioriza Telefone, fallback Celular |
| Endereço + Número + Complemento + Bairro + Cidade + Estado + CEP | endereco | TEXT | Concatenados com vírgula |

**Total:** 5 clientes importados

### Fornecedores (5.xls → fornecedores.json → tabela `fornecedores`)
| Campo NEX | Campo pdv-local | Tipo | Observação |
|-----------|-----------------|------|------------|
| Nome | nome | TEXT | Razão social ou nome |
| CPF/CNPJ | cpf_cnpj | TEXT | Documento |
| Telefone + Celular | telefone | TEXT | Prioriza Telefone, fallback Celular |
| Email | email | TEXT | Email de contato |
| Cidade | cidade | TEXT | Cidade |
| Estado | estado | TEXT | UF |
| Endereço + Número + Complemento + Bairro | endereco | TEXT | Concatenados |

**Total:** 6 fornecedores importados

### Vendedores (18.xls → vendedores.json → tabela `vendedores`)
| Campo NEX | Campo pdv-local | Tipo | Observação |
|-----------|-----------------|------|------------|
| Funcionário | nome | TEXT | Nome do vendedor |
| Comissão Vendas / Total Vendas | comissao | REAL | Percentual calculado |

**Total:** 15 vendedores importados

### Categorias (extraídas de produtos → categorias.json → tabela `categorias`)
| Campo | Tipo | Observação |
|-------|------|------------|
| nome | TEXT UNIQUE | Extraído dos valores únicos de Categoria nos produtos |

**Total:** 93 categorias únicas

## Dados Não Importados (Fase Futura)

| Entidade | Arquivo XLS | Registros | Motivo |
|----------|-------------|-----------|--------|
| Vendas/Transações | 8.xls | 5001 | Requer mapeamento complexo de itens_venda e relacionamentos |
| Caixas | 10.xls | 747 | Depende de vendas importadas |
| Movimentações de Caixa | 11.xls | 17249 | Depende de caixas e vendas |
| Contas a Pagar | — | — | Sem arquivo XLS correspondente identificado |
| Transações de Estoque | 23.xls | 1999 | Depende de produtos já importados |

## Meios de Pagamento Normalizados
- CARTAO
- DINHEIRO REAL
- DOLAR
- GUARANIES
- PIX (unificado de PIX + Pix)