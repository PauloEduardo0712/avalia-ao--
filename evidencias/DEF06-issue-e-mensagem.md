# Aula 18 — rascunho da issue DEF-06

## Título

`DELETE /api/reservas/{id} permite que instrutor cancele reserva de outro instrutor`

## Requisito relacionado

RN05 / RF07 — instrutor só pode cancelar as próprias reservas; a API deve retornar HTTP 403 quando não há permissão.

## Ambiente

LabReserva v1.4; API local em `http://localhost:4000`; execução pelo harness Node da pasta `evidencias`. Sistema operacional não registrado.

## Pré-condições

A API está iniciada. A reserva `id=1` é da conta `instrutor2@senac.br`, conforme os dados de exemplo do servidor. Autenticar como `instrutor1@senac.br`.

## Passos para reproduzir

1. Iniciar a API em `sistema` com `node server.js`.
2. Fazer login pela rota `POST /api/login` como `instrutor1@senac.br` e guardar o token retornado.
3. Enviar `DELETE /api/reservas/1` com o token de `instrutor1` no cabeçalho `Authorization: Bearer <token>`.

## Resultado esperado

HTTP 403, pois a reserva 1 pertence a outro instrutor.

## Resultado obtido

HTTP 200: `{"mensagem":"Reserva cancelada"}`. O código da API remove a reserva após responder à verificação de permissão defeituosa.

## Severidade e prioridade sugeridas

Severidade: Crítica. Prioridade: Urgente.

## Frequência

Reproduzido uma vez no caso CT18 (1 execução registrada). Repetir antes de informar uma frequência maior.

## Evidência

Anexar `evidencias/CT18-cancelamento-alheio.json`.

---

# Mensagem para a equipe de desenvolvimento

Olá, equipe. No CT18, um instrutor conseguiu cancelar uma reserva pertencente a outro instrutor. O requisito RN05 / RF07 prevê que essa ação seja bloqueada. Ao enviar `DELETE /api/reservas/1` autenticado como `instrutor1`, a API respondeu HTTP 200 (`Reserva cancelada`); o esperado era HTTP 403. Os passos e a evidência estão no registro DEF-06. Sugerimos prioridade urgente pelo risco de cancelamento não autorizado.

# Reflexão da equipe

O registro DEF-06 foi o que mais melhorou. Organizamos o requisito, as pré-condições, os passos reproduzíveis, os resultados esperado e obtido, a severidade, a prioridade e a evidência. Antes, o achado aparecia resumido no resultado do CT18; agora outra pessoa consegue repetir o teste e entender o impacto.
