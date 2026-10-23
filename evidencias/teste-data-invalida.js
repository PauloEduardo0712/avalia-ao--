// Reproduz CT11: data impossível (dia 33) para conferir validação do calendário.
const fs = require('fs');
const path = require('path');
(async () => {
  const base = 'http://localhost:4000';
  const loginResponse = await fetch(base + '/api/login', {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({email:'instrutor1@senac.br',senha:'123456'})
  });
  const login = await loginResponse.json();
  const response = await fetch(base + '/api/reservas', {
    method: 'POST',
    headers: {'Content-Type':'application/json',Authorization:`Bearer ${login.token}`},
    body: JSON.stringify({labId:1,data:'2026-10-33',inicio:'08:00',fim:'09:00',turma:'QA-DATA-INEXISTENTE',alunos:10})
  });
  const raw = await response.text();
  let body; try { body = JSON.parse(raw); } catch { body = raw; }
  const evidence = {
    caso:'CT11 - Data de calendário inexistente',
    executadoEm:new Date().toISOString(),
    metodo:'POST',
    endpoint:'/api/reservas',
    requisicao:{labId:1,data:'2026-10-33',inicio:'08:00',fim:'09:00',turma:'QA-DATA-INEXISTENTE',alunos:10},
    esperado:{status:400,descricao:'Rejeitar data inexistente.'},
    obtido:{status:response.status,body},
    resultado:response.status===400?'Passou':'Falhou',
    observacao:'Evidência de resposta HTTP capturada diretamente da API local.'
  };
  fs.writeFileSync(path.join(__dirname,'CT11-data-invalida.json'),JSON.stringify(evidence,null,2),'utf8');
  console.log(JSON.stringify(evidence,null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
