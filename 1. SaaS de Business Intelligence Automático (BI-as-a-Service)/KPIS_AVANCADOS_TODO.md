# 🎯 KPIs Avançados a Implementar

## Problema Identificado
Com 19 colunas ricas no CSV (valor_bruto, desconto_valor, juros_valor, taxa_maquina_valor, valor_liquido, forma_pagamento, regiao, vendedor, etc), o sistema ainda mostra apenas 3 KPIs básicos.

## Dados Disponíveis no CSV Expandido
- `valor_bruto` - Preço original
- `desconto_percentual` - % desconto
- `desconto_valor` - R$ desconto
- `valor_com_desconto` - Após desconto
- `valor_final` - Valor pago
- `juros_percentual` - % juros
- `juros_valor` - R$ juros
- `taxa_maquina_percentual` - % taxa
- `taxa_maquina_valor` - R$ taxa
- `valor_liquido` - Valor líquido final
- `forma_pagamento` - Pix, Débito, Crédito
- `status_pagamento` - Aprovado, Pendente
- `vendedor` - Nome do vendedor
- `regiao` - Sul, Sudeste, etc.

---

## 💰 KPIs Avançados Que Devem Ser Calculados

### Financeiros:
1. **Margem Líquida** = (valor_liquido / valor_bruto) * 100
2. **Total de Descontos Concedidos** = sum(desconto_valor)
3. **Taxa Média de Desconto** = avg(desconto_percentual)
4. **Custo Total de Taxas** = sum(taxa_maquina_valor)
5. **Receita de Juros** = sum(juros_valor)
6. **Valor Bruto vs Líquido** = valor_bruto - valor_liquido

### Pagamentos:
7. **Taxa de Aprovação** = (Aprovados / Total) * 100
8. **% Vendas à Vista** = (Pix + Débito + Crédito à vista) / Total
9. **% Vendas Parceladas** = Crédito parcelado / Total
10. **Ticket Médio por Forma de Pagamento**

### Performance:
11. **Melhor Vendedor** = Top vendedor por valor_liquido
12. **Região Mais Lucrativa** = Top região por valor_liquido
13. **Desconto Médio por Região**
14. **Performance por Vendedor** (tabela)

---

## 🔧 Implementação Necessária

### 1. Criar método `_calculate_advanced_kpis(df)`

```python
def _calculate_advanced_kpis(self, df):
    """Calcula KPIs avançados baseado nas colunas disponíveis"""
    kpis = {}
    
    # Detectar colunas financeiras
    if 'valor_bruto' in df.columns and 'valor_liquido' in df.columns:
        valor_bruto = df['valor_bruto'].sum()
        valor_liquido = df['valor_liquido'].sum()
        kpis['margem_liquida'] = ((valor_liquido / valor_bruto) * 100) if valor_bruto > 0 else 0
        kpis['valor_bruto_total'] = valor_bruto
        kpis['valor_liquido_total'] = valor_liquido
    
    # Detectar descontos
    if 'desconto_valor' in df.columns:
        kpis['total_descontos'] = df['desconto_valor'].sum()
        kpis['desconto_medio'] = df['desconto_percentual'].mean() if 'desconto_percentual' in df.columns else 0
    
    # Detectar taxas
    if 'taxa_maquina_valor' in df.columns:
        kpis['custo_taxas'] = df['taxa_maquina_valor'].sum()
    
    # Detectar juros
    if 'juros_valor' in df.columns:
        kpis['receita_juros'] = df['juros_valor'].sum()
    
    # Análise de pagamentos
    if 'status_pagamento' in df.columns:
        aprovados = (df['status_pagamento'] == 'Aprovado').sum()
        total = len(df)
        kpis['taxa_aprovacao'] = (aprovados / total * 100) if total > 0 else 0
    
    # Análise por forma de pagamento
    if 'forma_pagamento' in df.columns and 'valor_final' in df.columns:
        pagamentos = df.groupby('forma_pagamento')['valor_final'].sum()
        kpis['vendas_por_pagamento'] = pagamentos.to_dict()
    
    # Performance por vendedor
    if 'vendedor' in df.columns and 'valor_liquido' in df.columns:
        vendedores = df.groupby('vendedor')['valor_liquido'].sum().sort_values(ascending=False)
        kpis['melhor_vendedor'] = vendedores.index[0] if len(vendedores) > 0 else None
        kpis['vendas_melhor_vendedor'] = float(vendedores.iloc[0]) if len(vendedores) > 0 else 0
    
    # Performance por região
    if 'regiao' in df.columns and 'valor_liquido' in df.columns:
        regioes = df.groupby('regiao')['valor_liquido'].sum().sort_values(ascending=False)
        kpis['melhor_regiao'] = regioes.index[0] if len(regioes) > 0 else None
        kpis['vendas_melhor_regiao'] = float(regioes.iloc[0]) if len(regioes) > 0 else 0
    
    return kpis
```

### 2. Integrar no retorno de `_process_sales_simple`

```python
return {
    'kpis': {
        # KPIs básicos
        'total_revenue': total_revenue,
        'total_customers': total_transactions,
        'avg_ticket': avg_ticket,
        'total_quantity': total_quantity,
        'growth_rate': 0,
        
        # KPIs avançados (adicionar)
        **advanced_kpis
    },
    # resto do código...
}
```

### 3. Atualizar Frontend para Exibir Novos KPIs

Atualmente mostra apenas 3 KPIs:
- Faturamento
- Clientes  
- Ticket Médio

Deveria mostrar 6-8 KPIs em grade:
- Faturamento Bruto
- Valor Líquido
- Margem Líquida %
- Total Descontos
- Custo Taxas
- Taxa Aprovação
- Melhor Região
- Melhor Vendedor

---

## 📊 Exemplo de Resultado Esperado

```json
{
  "kpis": {
    "total_revenue": 15790,
    "total_customers": 10,
    "avg_ticket": 1579,
    "total_quantity": 15,
    
    "valor_bruto_total": 18450,
    "valor_liquido_total": 17120,
    "margem_liquida": 92.8,
    "total_descontos": 2660,
    "desconto_medio": 12.5,
    "custo_taxas": 485.5,
    "receita_juros": 1450,
    "taxa_aprovacao": 96.7,
    "melhor_vendedor": "Maria Costa",
    "vendas_melhor_vendedor": 5240,
    "melhor_regiao": "Sudeste",
    "vendas_melhor_regiao": 7850
  }
}
```

---

## ⚠️ Próximos Passos

1. Corrigir o arquivo `services.py` que está com erros de sintaxe
2. Implementar o método `_calculate_advanced_kpis()`
3. Adicionar KPIs avançados ao retorno
4. Atualizar frontend para exibir novos KPIs em cards
5. Testar com o CSV expandido de 30 registros
