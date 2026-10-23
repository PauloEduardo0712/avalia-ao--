# Conclusão da Missão QA — LabReserva v1.4

**Equipe:** DESASTRE  
**Turma:** 2025.08.179  
**Integrantes informados:** Paulo, Yuri, Keven e Victor  
**Projeto:** LabReserva v1.4  
**Tecnologia principal:** JavaScript  
**Data da execução:** 21/10/2026

## Divisão das frentes (A3)

- **Regras de negócio pela tela (RN01 a RN05):** Paulo e Yuri.
- **API com Postman (RF07 e RN05):** Keven. Os testes de API registrados nesta execução foram feitos por harness Node; repetir no Postman para cumprir a ferramenta indicada no guia.
- **Usabilidade, acessibilidade e telas (RNF01 a RNF03):** Victor.
- **Desempenho com JMeter (RNF04):** Yuri e Keven. A medição anexada é exploratória via harness Node; repetir no JMeter.

## Resultado

**Recomendação: não liberar para produção neste momento.**

Foram executados 17 dos 20 casos planejados pela API/harness local: 9 passaram e 8 falharam. Três casos de interface (CT04, CT05 e CT19) ficaram bloqueados porque não foi possível executar navegador gráfico nesta sessão. Foram registrados 12 defeitos; 9 foram reproduzidos por API ou medição, e os demais são achados estáticos que precisam da verificação indicada no registro.

Os defeitos reproduzidos afetam regras centrais: a API retorna 500 para turma ausente; aceita 21 alunos em laboratório com capacidade 20; aceita sábado e horário com duração zero; permite sobreposição que envolve integralmente uma reserva; e deixa um instrutor cancelar reserva alheia. O desempenho também excedeu o p90 esperado para GET /api/reservas.

## Desempenho exploratório

Um harness Node enviou 20 chamadas concorrentes por rota. Resultado observado nesta execução:

- `GET /api/laboratorios`: p90 57,04 ms; 0 respostas HTTP de erro.
- `GET /api/reservas`: p90 756,03 ms; 0 respostas HTTP de erro.

Esta medição não substitui o relatório do JMeter pedido no guia. Repetir com JMeter e guardar o plano e o relatório antes da entrega final.

## Itens que faltam para fechar a execução

- Executar CT04, CT05 e CT19 na interface e salvar capturas de tela.
- Confirmar em navegador a rolagem horizontal a 360 px e validar contraste/nomes acessíveis.
- Repetir o teste de carga no JMeter.
- Preencher o nome de quem executou cada bloco, se a equipe desejar substituir “Codex QA” pelo nome do integrante responsável.

## Arquivos

- Casos planejados: `../modelos/casos-de-teste.csv`
- Registro de execução: `../modelos/registro-execucao.csv`
- Defeitos: `defeitos.csv`
- Respostas individuais e medições: `relatorio-execucao-api.json` e `CT*.json`
- Harness usado: `executar-missao.js`

O código do sistema não foi alterado. Os arquivos criados são planilhas, evidências e ferramentas externas de execução dentro de `evidencias/`.
