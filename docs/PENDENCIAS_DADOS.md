# Pendências de Dados — pdv-local

## Dados Importados (Concluído)
- ✅ Produtos: 1989 registros
- ✅ Clientes: 5 registros
- ✅ Fornecedores: 6 registros
- ✅ Vendedores: 15 registros
- ✅ Categorias: 93 registros
- ✅ Meios de pagamento normalizados: 5 tipos

## Dados Não Importados (Pendentes)

### Alta Prioridade

#### 1. Vendas / Transações (8.xls → 5001 registros)
- **Arquivo fonte:** `8.xls` (transações completas) + `Exportar.xls` (95 vendas recentes)
- **Tabelas alvo:** `vendas`, `itens_venda`
- **Complexidade:** Alta — cada transação tem múltiplos itens, cliente, funcionário, meio de pagamento, desconto
- **Dependências:** Produtos e clientes já importados; vendedores já importados
- **Desafio:** Mapear itens individuais da venda (campo "Itens" do XLS contém lista concatenada); gerar IDs relacionais entre vendas e itens_venda
- **Estimativa:** Requer script dedicado com parsing dos itens por transação

#### 2. Caixas (10.xls → 747 registros)
- **Arquivo fonte:** `10.xls`
- **Tabela alvo:** `caixas`
- **Dependências:** Vendas importadas (para calcular total_vendas e lucro_bruto)
- **Desafio:** Campos de data/hora precisam de normalização; saldo_final pode precisar recálculo

#### 3. Movimentações de Caixa (11.xls → 17249 registros)
- **Arquivo fonte:** `11.xls`
- **Tabela alvo:** `movimentacoes_caixa`
- **Dependências:** Caixas importadas (para caixa_id)
- **Desafio:** Associar cada movimentação ao caixa correto via número/data; normalizar tipos de transação

### Média Prioridade

#### 4. Transações de Estoque (23.xls → 1999 registros)
- **Arquivo fonte:** `23.xls`
- **Tabela alvo:** `transacoes_estoque`
- **Dependências:** Produtos importados (para produto_id)
- **Desafio:** Mapear nome do produto → ID no banco; determinar tipo de transação (entrada/saída/ajuste)

#### 5. Contas a Pagar
- **Arquivo fonte:** Não identificado nos XLS exportados
- **Tabela alvo:** `contas_pagar`
- **Status:** Sem dados disponíveis nos arquivos exportados; pode estar em tabelas NexusDB não exportadas

#### 6. Orçamentos Pendentes (Exportar2.xls → 66 registros)
- **Arquivo fonte:** `Exportar2.xls`
- **Tabela alvo:** Nova tabela `orcamentos` (não existe no schema atual)
- **Desafio:** Criar schema e importar; baixa prioridade pois são orçamentos antigos

### Baixa Prioridade

#### 7. Relatórios Agregados (12-19.xls, 20-24.xls)
- São relatórios pré-calculados do NEX, não dados brutos
- Podem ser usados para validação cruzada após importar vendas
- Não precisam ser importados como tabelas separadas

#### 8. Top Compradores (24.xls → 10 registros)
- Derivado de vendas; será gerado automaticamente quando vendas forem importadas

#### 9. Lucro por Fornecedor (15.xls → 26 registros)
- Relatório agregado; derivado de produtos + vendas

#### 10. Dados Fiscais (NCM, CEST)
- Presentes em 22.xls mas não mapeados para tabela específica
- Tabela `tributacoes` existe no schema mas está vazia
- Importar quando módulo fiscal for implementado

## Problemas Conhecidos

### Encoding dos Headers XLS
- Headers aparecem com mojibake (ex: "Descrio" em vez de "Descrição")
- Contornado pelo mapeamento manual dos campos no script de importação
- Não afeta os dados em si

### Campos Vazios
- Muitos produtos têm campo Fornecedor vazio
- Muitos clientes têm CPF/CNPJ, telefone e endereço vazios
- O sistema deve tolerar esses campos nulos

### Comissão dos Vendedores
- Calculada como percentual a partir de valores absolutos
- Pode haver arredondamento; verificar contra valores reais do NEX

### Meios de Pagamento
- 'DOLAR' e 'GUARANIES' sugerem operação em região de fronteira
- Verificar se o sistema precisa suportar conversão de moeda

## Próximos Passos Recomendados

1. **Importar vendas** (maior impacto — habilita histórico, relatórios, dashboard)
2. **Importar caixas e movimentações** (habilita módulo financeiro)
3. **Importar transações de estoque** (habilita rastreamento de inventário)
4. **Validar dados importados** executando o app e verificando telas de listagem
5. **Criar módulo de orçamentos** se necessário (66 orçamentos pendentes)

## Como Executar o Re-seed
```bash
# 1. Remover banco existente
rm data/database.sqlite

# 2. Iniciar app (seedData roda automaticamente)
npm start

# 3. Para regenerar seedData sem editar index.js manualmente:
node scripts/importar_dados_reais.js
# Copie o conteúdo de scripts/seedData_gerado.js para dentro de src/main/index.js
```