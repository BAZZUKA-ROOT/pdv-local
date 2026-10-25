/**
 * Script de importação dos dados reais do NEX para o seed do pdv-local
 *
 * Uso: node scripts/importar_dados_reais.js
 *
 * Lê os JSONs extraídos dos XLS do NEX e gera o código da função
 * seedData() atualizada com os dados reais, usando os nomes de
 * campos corretos identificados na inspeção.
 */

const fs = require('fs');
const path = require('path');

const DADOS_DIR = path.join(__dirname, '..', '_dados_extraidos');

// Carregar dados
const produtos = JSON.parse(fs.readFileSync(path.join(DADOS_DIR, 'produtos.json'), 'utf-8'));
const clientes = JSON.parse(fs.readFileSync(path.join(DADOS_DIR, 'clientes.json'), 'utf-8'));
const fornecedores = JSON.parse(fs.readFileSync(path.join(DADOS_DIR, 'fornecedores.json'), 'utf-8'));
const vendedores = JSON.parse(fs.readFileSync(path.join(DADOS_DIR, 'vendedores.json'), 'utf-8'));
const categorias = JSON.parse(fs.readFileSync(path.join(DADOS_DIR, 'categorias.json'), 'utf-8'));
const meiosPagamento = JSON.parse(fs.readFileSync(path.join(DADOS_DIR, 'meios_pagamento.json'), 'utf-8'));

console.log(`Produtos: ${produtos.length}`);
console.log(`Clientes: ${clientes.length}`);
console.log(`Fornecedores: ${fornecedores.length}`);
console.log(`Vendedores: ${vendedores.length}`);
console.log(`Categorias: ${categorias.length}`);
console.log(`Meios de pagamento: ${meiosPagamento.length}`);

// Normalizar meios de pagamento (unificar PIX/Pix)
const meiosNormalizados = [...new Set(meiosPagamento.map(m => m.toUpperCase()))];
console.log(`Meios normalizados: ${meiosNormalizados.join(', ')}`);

function escapeStr(s) {
  return String(s || '').replace(/'/g, "''").replace(/\n/g, ' ').replace(/\r/g, '').trim();
}

function toNum(v) {
  if (v === '' || v === null || v === undefined) return 0;
  const n = parseFloat(String(v).replace(/\./g, '').replace(',', '.'));
  return isNaN(n) ? 0 : n;
}

function toInt(v) {
  if (v === '' || v === null || v === undefined) return 0;
  const n = parseInt(v, 10);
  return isNaN(n) ? 0 : n;
}

// Gerar código seedData atualizado
let seedCode = `function seedData() {
  const count = get('SELECT COUNT(*) AS c FROM produtos');
  if (!count || count.c === 0) {
    // Dados reais importados do sistema NEX (${produtos.length} produtos)
    const produtos = [\n`;

for (const p of produtos) {
  const codigo = escapeStr(p['Código']);
  const nome = escapeStr(p['Descrição']);
  const preco = toNum(p['Preço de Venda']).toFixed(2);
  const custo = toNum(p['Custo Unitário']).toFixed(2);
  const estoque = toInt(p['Estoque Atual']);
  const categoria = escapeStr(p['Categoria']);
  const fornecedor = escapeStr(p['Fornecedor']);
  const unidade = escapeStr(p['Unidade']) || 'UN';

  seedCode += `      ['${codigo}', '${nome}', ${preco}, ${custo}, ${estoque}, '${categoria}', '${fornecedor}', '${unidade}'],\n`;
}

seedCode += `    ];
    for (const r of produtos) {
      db.run('INSERT INTO produtos (codigo, nome, preco, custo, estoque, categoria, fornecedor, unidade) VALUES (?,?,?,?,?,?,?,?)', r);
    }
    salvar();
  }

  // Vendedores reais (${vendedores.length})
  const vc = get('SELECT COUNT(*) AS c FROM vendedores');
  if (!vc || vc.c === 0) {
    const vendedores = [\n`;

for (const v of vendedores) {
  const nome = escapeStr(v['Funcionário']);
  // Comissão como percentual: calcular a partir dos dados se possível
  const totalVendas = toNum(v['Total Vendas']);
  const comissaoValor = toNum(v['Comissão Vendas']);
  // Se temos total e comissão, calcular percentual; senão default 5%
  let comissaoPct = 5;
  if (totalVendas > 0 && comissaoValor > 0) {
    comissaoPct = Math.round((comissaoValor / totalVendas) * 100 * 100) / 100;
  }
  seedCode += `      ['${nome}', ${comissaoPct}],\n`;
}

seedCode += `    ];
    for (const r of vendedores) {
      db.run('INSERT INTO vendedores (nome, comissao) VALUES (?,?)', r);
    }
    salvar();
  }

  // Clientes reais (${clientes.length})
  const cc = get('SELECT COUNT(*) AS c FROM clientes');
  if (!cc || cc.c === 0) {
    const clientes = [\n`;

for (const c of clientes) {
  const nome = escapeStr(c['Nome']);
  const cpf = escapeStr(c['CPF / CNPJ']);
  const telefone = escapeStr(c['Telefone'] || c['Celular']);
  // Montar endereço completo
  const parts = [c['Endereço'], c['Número'], c['Complemento'], c['Bairro'], c['Cidade'], c['Estado'], c['CEP']].filter(Boolean);
  const endereco = escapeStr(parts.join(', '));
  seedCode += `      ['${nome}', '${cpf}', '${telefone}', '${endereco}'],\n`;
}

seedCode += `    ];
    for (const r of clientes) {
      db.run('INSERT INTO clientes (nome, cpf_cnpj, telefone, endereco) VALUES (?,?,?,?)', r);
    }
    salvar();
  }

  // Categorias reais (${categorias.length})
  const catc = get('SELECT COUNT(*) AS c FROM categorias');
  if (!catc || catc.c === 0) {
    const cats = [${categorias.map(c => `'${escapeStr(c)}'`).join(', ')}];
    for (const n of cats) {
      db.run('INSERT INTO categorias (nome) VALUES (?)', [n]);
    }
    salvar();
  }

  // Fornecedores reais (${fornecedores.length})
  const fc = get('SELECT COUNT(*) AS c FROM fornecedores');
  if (!fc || fc.c === 0) {
    const fornecedores = [\n`;

for (const f of fornecedores) {
  const nome = escapeStr(f['Nome']);
  const cnpj = escapeStr(f['CPF/CNPJ']);
  const telefone = escapeStr(f['Telefone'] || f['Celular']);
  const email = escapeStr(f['Email']);
  const cidade = escapeStr(f['Cidade']);
  const estado = escapeStr(f['Estado']);
  const parts = [f['Endereço'], f['Número'], f['Complemento'], f['Bairro']].filter(Boolean);
  const endereco = escapeStr(parts.join(', '));
  seedCode += `      ['${nome}', '${cnpj}', '${telefone}', '${email}', '${cidade}', '${estado}', '${endereco}'],\n`;
}

seedCode += `    ];
    for (const r of fornecedores) {
      db.run('INSERT INTO fornecedores (nome, cnpj_cpf, telefone, email, cidade, estado, endereco) VALUES (?,?,?,?,?,?,?)', r);
    }
    salvar();
  }
}`;

// Escrever arquivo de saída
const outputPath = path.join(__dirname, 'seedData_gerado.js');
fs.writeFileSync(outputPath, seedCode, 'utf-8');
console.log(`\nCódigo gerado em: ${outputPath}`);
console.log(`Tamanho: ${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB`);

// Validação rápida: verificar se há dados não-vazios
const sampleLines = seedCode.split('\n').slice(5, 10);
console.log('\nAmostra das primeiras linhas de produtos:');
sampleLines.forEach(l => console.log(l));

console.log('\n--- INSTRUÇÕES ---');
console.log('1. Abra src/main/index.js');
console.log('2. Substitua a função seedData() inteira pelo conteúdo de seedData_gerado.js');
console.log('3. Delete o banco existente (data/database.sqlite) para forçar re-seed');
console.log('4. Reinicie o app: npm start');