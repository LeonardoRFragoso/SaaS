# 📊 Exemplos de Planilhas para Testes

Este documento mostra quais colunas suas planilhas devem ter para que o sistema detecte automaticamente e gere os dashboards corretamente.

---

## 🛒 **TEMPLATE: VENDAS (Sales)**

### ✅ Colunas Recomendadas

| Coluna | Tipo | Descrição | Exemplos de Nomes Aceitos |
|--------|------|-----------|---------------------------|
| **Data** | Data | Data da venda | `data`, `date`, `dt`, `data_venda`, `sale_date`, `created_at`, `timestamp` |
| **Valor** | Numérico | Valor da venda | `valor`, `revenue`, `receita`, `total`, `value`, `amount`, `price`, `preco` |
| **Cliente** | Texto | Nome do cliente | `cliente`, `customer`, `client`, `nome`, `name`, `comprador` |
| **Produto** | Texto | Nome do produto | `produto`, `product`, `item`, `sku`, `descricao`, `description` |
| **Quantidade** | Numérico | Quantidade vendida | `quantidade`, `qty`, `qtd`, `units`, `unidades`, `qtde` |

### 📝 Exemplo de Planilha CSV (vendas.csv)

```csv
data,valor,cliente,produto,quantidade
2024-01-15,1500.00,João Silva,Notebook Dell,1
2024-01-16,250.00,Maria Santos,Mouse Logitech,2
2024-01-16,3200.00,Pedro Costa,Monitor LG 27",1
2024-01-17,180.00,Ana Lima,Teclado Mecânico,1
2024-01-18,5400.00,Carlos Souza,Notebook Lenovo,2
2024-01-19,420.00,Juliana Rocha,Webcam HD,3
2024-01-20,890.00,Roberto Alves,Cadeira Gamer,1
2024-01-21,1200.00,Fernanda Dias,Mesa para PC,1
2024-01-22,650.00,Lucas Martins,Headset Gamer,2
2024-01-23,2100.00,Patricia Gomes,Impressora HP,1
```

### 📊 O que será gerado:

**KPIs:**
- 💰 Faturamento Total
- 👥 Total de Clientes
- 📦 Total de Produtos Vendidos
- 💵 Ticket Médio

**Gráficos:**
- 📈 Evolução de Vendas ao Longo do Tempo
- 🏆 Top 5 Produtos Mais Vendidos
- 👤 Top 5 Clientes
- 📊 Vendas por Período (diário/semanal/mensal)

---

## 💰 **TEMPLATE: FINANCEIRO (Financial)**

### ✅ Colunas Recomendadas

| Coluna | Tipo | Descrição | Exemplos de Nomes Aceitos |
|--------|------|-----------|---------------------------|
| **Data** | Data | Data da transação | `data`, `date`, `dt`, `periodo`, `month`, `mes`, `ano`, `year` |
| **Receita** | Numérico | Valor de receita | `receita`, `revenue`, `income`, `entrada`, `credito`, `credit` |
| **Despesa** | Numérico | Valor de despesa | `despesa`, `expense`, `cost`, `saida`, `gasto`, `debito`, `debit` |
| **Categoria** | Texto | Categoria da transação | `categoria`, `category`, `tipo`, `type`, `classe`, `class` |
| **Descrição** | Texto | Descrição da transação | `descricao`, `description`, `historico`, `obs`, `observacao` |

### 📝 Exemplo de Planilha CSV (financeiro.csv)

```csv
data,receita,despesa,categoria,descricao
2024-01-01,0,3500.00,Salários,Pagamento de salários - Janeiro
2024-01-05,15000.00,0,Vendas,Vendas do produto A
2024-01-08,0,850.00,Marketing,Anúncios Google Ads
2024-01-10,8500.00,0,Vendas,Vendas do produto B
2024-01-12,0,1200.00,Infraestrutura,Aluguel do escritório
2024-01-15,0,450.00,Utilities,Conta de luz e internet
2024-01-18,12000.00,0,Vendas,Vendas do produto C
2024-01-20,0,2100.00,Fornecedores,Compra de matéria-prima
2024-01-22,0,680.00,Marketing,Campanha redes sociais
2024-01-25,18500.00,0,Vendas,Vendas do produto A
2024-01-28,0,950.00,Operacional,Material de escritório
2024-01-30,0,1500.00,Impostos,Pagamento de impostos
```

### 📊 O que será gerado:

**KPIs:**
- 💵 Receita Total
- 💸 Despesa Total
- 💰 Lucro Líquido (Receita - Despesa)
- 📊 Margem de Lucro (%)

**Gráficos:**
- 📈 Receitas vs Despesas ao Longo do Tempo
- 🥧 Despesas por Categoria
- 📊 Fluxo de Caixa Mensal
- 📉 Evolução do Lucro

---

## 🎯 **FORMATO ALTERNATIVO: Excel (.xlsx)**

Você também pode usar planilhas Excel com as mesmas colunas:

### Vendas (vendas.xlsx)
```
| data       | valor    | cliente        | produto           | quantidade |
|------------|----------|----------------|-------------------|------------|
| 15/01/2024 | 1500,00  | João Silva     | Notebook Dell     | 1          |
| 16/01/2024 | 250,00   | Maria Santos   | Mouse Logitech    | 2          |
```

### Financeiro (financeiro.xlsx)
```
| data       | receita  | despesa  | categoria      | descricao                    |
|------------|----------|----------|----------------|------------------------------|
| 01/01/2024 | 0        | 3500,00  | Salários       | Pagamento de salários        |
| 05/01/2024 | 15000,00 | 0        | Vendas         | Vendas do produto A          |
```

---

## 🤖 **COMO O SISTEMA DETECTA AS COLUNAS**

### **Plano FREE (Python Heurístico):**
1. ✅ Busca por padrões de nomes (case-insensitive)
2. ✅ Remove espaços e underscores
3. ✅ Detecta tipos de dados automaticamente
4. ✅ Confiança: Média

**Exemplo:**
- `Data_Venda` → detecta como **data**
- `Valor Total` → detecta como **valor/receita**
- `Nome_Cliente` → detecta como **cliente**

### **Planos PAGOS (GPT-4 Inteligente):**
1. ✅ Analisa contexto e semântica
2. ✅ Entende variações complexas
3. ✅ Sugere mapeamentos alternativos
4. ✅ Explica o raciocínio (reasoning)
5. ✅ Confiança: Alta

**Exemplo:**
- `Faturamento Bruto` → GPT entende como **receita**
- `Investimento em Ads` → GPT entende como **despesa de marketing**
- `Razão Social` → GPT entende como **cliente**

---

## 📋 **DICAS IMPORTANTES**

### ✅ **Boas Práticas:**

1. **Use nomes descritivos** nas colunas
   - ✅ `data_venda`, `valor_total`, `nome_cliente`
   - ❌ `col1`, `col2`, `x`, `y`

2. **Mantenha consistência** nos tipos de dados
   - ✅ Datas no formato: `DD/MM/YYYY` ou `YYYY-MM-DD`
   - ✅ Valores numéricos sem símbolos: `1500.00` (não `R$ 1.500,00`)
   - ✅ Textos sem caracteres especiais problemáticos

3. **Evite células vazias** nas colunas principais
   - Use `0` para valores zerados
   - Use `-` ou `N/A` para dados não aplicáveis

4. **Primeira linha = Cabeçalho**
   - A primeira linha deve conter os nomes das colunas
   - Dados começam na segunda linha

### ⚠️ **Problemas Comuns:**

❌ **Colunas sem nome** → Sistema não consegue detectar
❌ **Tipos misturados** (texto e número na mesma coluna) → Erros de processamento
❌ **Datas em formato texto** → Não será detectado como data
❌ **Valores com símbolos** (`R$`, `%`) → Não será detectado como numérico

---

## 🧪 **TESTANDO SUA PLANILHA**

### **Checklist Rápido:**

- [ ] Primeira linha tem nomes de colunas?
- [ ] Colunas de data estão em formato de data?
- [ ] Colunas de valores são numéricas (sem R$, %, etc)?
- [ ] Não há células completamente vazias nas colunas principais?
- [ ] Os nomes das colunas são descritivos?
- [ ] Tem pelo menos 10 linhas de dados para análise?

### **Quantidade Mínima de Dados:**

- **Free Plan:** Mínimo 10 linhas, máximo 5.000 linhas
- **Starter Plan:** Mínimo 10 linhas, máximo 50.000 linhas
- **Pro Plan:** Mínimo 10 linhas, máximo 500.000 linhas
- **Enterprise:** Sem limite

---

## 📥 **DOWNLOAD DE EXEMPLOS**

Você pode criar essas planilhas de exemplo para testar:

### **1. Criar vendas.csv:**
```bash
# Cole este conteúdo em um arquivo vendas.csv
data,valor,cliente,produto,quantidade
2024-01-15,1500.00,João Silva,Notebook Dell,1
2024-01-16,250.00,Maria Santos,Mouse Logitech,2
2024-01-16,3200.00,Pedro Costa,Monitor LG 27",1
```

### **2. Criar financeiro.csv:**
```bash
# Cole este conteúdo em um arquivo financeiro.csv
data,receita,despesa,categoria,descricao
2024-01-01,0,3500.00,Salários,Pagamento de salários
2024-01-05,15000.00,0,Vendas,Vendas do produto A
2024-01-08,0,850.00,Marketing,Anúncios Google Ads
```

---

## 🎯 **PRÓXIMOS PASSOS**

1. ✅ Prepare sua planilha seguindo os exemplos acima
2. ✅ Faça upload em `/datasources`
3. ✅ Escolha o template correspondente em `/dashboards`
4. ✅ Revise o mapeamento automático no modal
5. ✅ Ajuste se necessário
6. ✅ Visualize seu dashboard!

---

**Sistema pronto para processar suas planilhas!** 🚀📊
