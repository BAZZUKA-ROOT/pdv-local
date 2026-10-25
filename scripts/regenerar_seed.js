const fs = require('fs');
const path = require('path');

const DADOS_DIR = path.join(__dirname, '..', '_dados_extraidos');
const produtos = JSON.parse(fs.readFileSync(path.join(DADOS_DIR, 'produtos.json'), 'utf-8'));
const clientes = JSON.parse(fs.readFileSync(path.join(DADOS_DIR, 'clientes.json'), 'utf-8'));
const fornecedores = JSON.parse(fs.readFileSync(path.join(DADOS_DIR, 'fornecedores.json'), 'utf-8'));
const vendedores = JSON.parse(fs.readFileSync(path.join(DADOS_DIR, 'vendedores.json'), 'utf-8'));
const categorias = JSON.parse(fs.readFileSync(path.join(DADOS_DIR, 'categorias.json'), 'utf-8'));

function esc(s) {
  return String(s || '')
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$')
    .replace(/\n/g, ' ')
    .replace(/\r/g, '')
    .trim();
}

function toNum(v) {
  if (v === '' || v == null) return 0;
  const n = parseFloat(String(v).replace(/\./g, '').replace(',', '.'));
  return isNaN(n) ? 0 : n;
}

function toInt(v) {
  if (v === '' || v == null) return 0;
  const n = parseInt(v, 10);
  return isNaN(n) ? 0 : n;
}

const lines = [];
lines.push('function seedData() {');
lines.push("  const count = get('SELECT COUNT(*) AS c FROM produtos');");
lines.push('  if (!count || count.c === 0) {');
lines.push(`    // Dados reais importados do sistema NEX (${produtos.length} produtos)`);
lines.push('    const produtos = [');

for (const p of produtos) {
  const codigo = esc(p['Código']);
  const nome = esc(p['Descrição']);
  const preco = toNum(p['Preço de Venda']).toFixed(2);
  const custo = toNum(p['Custo Unitário']).toFixed(2);
  const estoque = toInt(p['Estoque Atual']);
  const categoria = esc(p['Categoria']);
  const fornecedor = esc(p['Fornecedor']);
  const unidade = esc(p['Unidade']) || 'UN';
  lines.push(`      [\`${codigo}\`, \`${nome}\`, ${preco}, ${custo}, ${estoque}, \`${categoria}\`, \`${fornecedor}\`, \`${unidade}\`],`);
}

lines.push('    ];');
lines.push('    for (const r of produtos) {');
lines.push("      db.run('INSERT INTO produtos (codigo, nome, preco, custo, estoque, categoria, fornecedor, unidade) VALUES (?,?,?,?,?,?,?,?)', r);");
lines.push('    }');
lines.push('    salvar();');
lines.push('  }');
lines.push('');
lines.push(`  // Vendedores reais (${vendedores.length})`);
lines.push("  const vc = get('SELECT COUNT(*) AS c FROM vendedores');");
lines.push('  if (!vc || vc.c === 0) {');
lines.push('    const vendedores = [');

for (const v of vendedores) {
  const nome = esc(v['Funcionário']);
  const totalVendas = toNum(v['Total Vendas']);
  const comissaoValor = toNum(v['Comissão Vendas']);
  let comissaoPct = 5;
  if (totalVendas > 0 && comissaoValor > 0) {
    comissaoPct = Math.round((comissaoValor / totalVendas) * 100 * 100) / 100;
  }
  lines.push(`      [\`${nome}\`, ${comissaoPct}],`);
}

lines.push('    ];');
lines.push('    for (const r of vendedores) {');
lines.push("      db.run('INSERT INTO vendedores (nome, comissao) VALUES (?,?)', r);");
lines.push('    }');
lines.push('    salvar();');
lines.push('  }');
lines.push('');
lines.push(`  // Clientes reais (${clientes.length})`);
lines.push("  const cc = get('SELECT COUNT(*) AS c FROM clientes');");
lines.push('  if (!cc || cc.c === 0) {');
lines.push('    const clientes = [');

for (const c of clientes) {
  const nome = esc(c['Nome']);
  const cpf = esc(c['CPF / CNPJ']);
  const telefone = esc(c['Telefone'] || c['Celular']);
  const parts = [c['Endereço'], c['Número'], c['Complemento'], c['Bairro'], c['Cidade'], c['Estado'], c['CEP']].filter(Boolean);
  const endereco = esc(parts.join(', '));
  lines.push(`      [\`${nome}\`, \`${cpf}\`, \`${telefone}\`, \`${endereco}\`],`);
}

lines.push('    ];');
lines.push('    for (const r of clientes) {');
lines.push("      db.run('INSERT INTO clientes (nome, cpf_cnpj, telefone, endereco) VALUES (?,?,?,?)', r);");
lines.push('    }');
lines.push('    salvar();');
lines.push('  }');
lines.push('');
lines.push(`  // Categorias reais (${categorias.length})`);
lines.push("  const catc = get('SELECT COUNT(*) AS c FROM categorias');");
lines.push('  if (!catc || catc.c === 0) {');
const catsStr = categorias.map(c => '`' + esc(c) + '`').join(', ');
lines.push(`    const cats = [${catsStr}];`);
lines.push('    for (const n of cats) {');
lines.push("      db.run('INSERT INTO categorias (nome) VALUES (?)', [n]);");
lines.push('    }');
lines.push('    salvar();');
lines.push('  }');
lines.push('');
lines.push(`  // Fornecedores reais (${fornecedores.length})`);
lines.push("  const fc = get('SELECT COUNT(*) AS c FROM fornecedores');");
lines.push('  if (!fc || fc.c === 0) {');
lines.push('    const fornecedores = [');

for (const f of fornecedores) {
  const nome = esc(f['Nome']);
  const cnpj = esc(f['CPF/CNPJ']);
  const telefone = esc(f['Telefone'] || f['Celular']);
  const email = esc(f['Email']);
  const cidade = esc(f['Cidade']);
  const estado = esc(f['Estado']);
  const parts = [f['Endereço'], f['Número'], f['Complemento'], f['Bairro']].filter(Boolean);
  const endereco = esc(parts.join(', '));
  lines.push(`      [\`${nome}\`, \`${cnpj}\`, \`${telefone}\`, \`${email}\`, \`${cidade}\`, \`${estado}\`, \`${endereco}\`],`);
}

lines.push('    ];');
lines.push('    for (const r of fornecedores) {');
lines.push("      db.run('INSERT INTO fornecedores (nome, cpf_cnpj, telefone, email, cidade, estado, endereco) VALUES (?,?,?,?,?,?,?)', r);");
lines.push('    }');
lines.push('    salvar();');
lines.push('  }');
lines.push('}');

const code = lines.join('\n');
fs.writeFileSync(path.join(__dirname, 'seedData_gerado.js'), code, 'utf-8');
console.log('Gerado:', (code.length / 1024).toFixed(1), 'KB');
console.log('Linhas:', lines.length);

// Verificar sintaxe
try {
  new Function(code);
  console.log('Syntax OK');
} catch(e) {
  console.log('Syntax ERRO:', e.message);
}