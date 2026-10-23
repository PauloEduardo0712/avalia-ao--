// Harness externo de QA. Não altera os arquivos do sistema.
const fs = require('fs');
const base = 'http://localhost:4000';
const out = [];
async function req(method, path, body, token) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  const t0 = performance.now();
  const r = await fetch(base + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  const elapsed = performance.now() - t0;
  const raw = await r.text();
  let data; try { data = JSON.parse(raw); } catch { data = raw; }
  return { status: r.status, data, elapsedMs: +elapsed.toFixed(2) };
}
function log(id, title, expected, actual, status, evidence) {
  out.push({ id, title, expected, actual, status, evidence });
}
function isoOffset(days) { const d = new Date(); d.setDate(d.getDate() + days); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function nextWeekday(daysAhead) { let d = new Date(); d.setDate(d.getDate()+daysAhead); while ([0,6].includes(d.getDay())) d.setDate(d.getDate()+1); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function csv(v) { return `"${String(v ?? '').replaceAll('"','""')}"`; }
(async () => {
  const login = await req('POST','/api/login',{email:'instrutor1@senac.br',senha:'123456'});
  const token = login.data.token;
  log('CT01','Login válido','200 e Ana Instrutora',`HTTP ${login.status}; ${JSON.stringify(login.data)}`,login.status===200?'Passou':'Falhou','CT01-login-api.json');
  const blank = await req('POST','/api/login',{email:'',senha:''});
  log('CT02','Campos de login vazios','400 com mensagem de campos obrigatórios',`HTTP ${blank.status}; ${JSON.stringify(blank.data)}`,blank.status===400?'Passou':'Falhou','CT02-login-vazio.json');
  const bad = await req('POST','/api/login',{email:'instrutor1@senac.br',senha:'errada'});
  log('CT03','Senha incorreta','401 e mensagem de credenciais incorretas',`HTTP ${bad.status}; ${JSON.stringify(bad.data)}`,bad.status===401?'Passou':'Falhou','CT03-login-incorreto.json');
  const noAuth = await req('GET','/api/laboratorios');
  log('CT16','API sem autenticação','401',`HTTP ${noAuth.status}; ${JSON.stringify(noAuth.data)}`,noAuth.status===401?'Passou':'Falhou','CT16-sem-token.json');
  const missing = await req('POST','/api/reservas',{labId:1,data:nextWeekday(5),inicio:'08:00',fim:'09:00',alunos:10},token);
  log('CT06','Reserva sem turma','400, nunca 500',`HTTP ${missing.status}; ${JSON.stringify(missing.data)}`,missing.status===400?'Passou':'Falhou','CT06-turma-ausente.json');
  const full = await req('POST','/api/reservas',{labId:1,data:nextWeekday(5),inicio:'08:00',fim:'09:00',turma:'QA-CAP-21',alunos:21},token);
  log('CT07','Capacidade acima do limite','400 para 21 alunos no laboratório 1',`HTTP ${full.status}; ${JSON.stringify(full.data)}`,full.status===400?'Passou':'Falhou','CT07-capacidade-21.json');
  if (full.status===201) await req('DELETE',`/api/reservas/${full.data.id}`,undefined,token);
  const target = nextWeekday(5);
  const valid = await req('POST','/api/reservas',{labId:1,data:target,inicio:'08:00',fim:'12:00',turma:'QA-4H',alunos:20},token);
  log('CT08','Duração de quatro horas','201',`HTTP ${valid.status}; ${JSON.stringify(valid.data)}`,valid.status===201?'Passou':'Falhou','CT08-duracao-4h.json');
  const sat = new Date(); while(new Date(sat.setDate(sat.getDate()+1)).getDay()!==6){}; const saturday=`${sat.getFullYear()}-${String(sat.getMonth()+1).padStart(2,'0')}-${String(sat.getDate()).padStart(2,'0')}`;
  const weekend = await req('POST','/api/reservas',{labId:1,data:saturday,inicio:'08:00',fim:'09:00',turma:'QA-SAB',alunos:10},token);
  log('CT09','Reserva no sábado','400, apenas segunda a sexta',`HTTP ${weekend.status}; ${JSON.stringify(weekend.data)}`,weekend.status===400?'Passou':'Falhou','CT09-sabado.json');
  const sunday = new Date(saturday+'T12:00:00'); sunday.setDate(sunday.getDate()+1); const sundayIso=`${sunday.getFullYear()}-${String(sunday.getMonth()+1).padStart(2,'0')}-${String(sunday.getDate()).padStart(2,'0')}`;
  const sun = await req('POST','/api/reservas',{labId:1,data:sundayIso,inicio:'08:00',fim:'09:00',turma:'QA-DOM',alunos:10},token);
  log('CT10','Reserva no domingo','400',`HTTP ${sun.status}; ${JSON.stringify(sun.data)}`,sun.status===400?'Passou':'Falhou','CT10-domingo.json');
  const past = await req('POST','/api/reservas',{labId:1,data:isoOffset(-1),inicio:'08:00',fim:'09:00',turma:'QA-PASSADO',alunos:10},token);
  log('CT11','Data passada','400',`HTTP ${past.status}; ${JSON.stringify(past.data)}`,past.status===400?'Passou':'Falhou','CT11-data-passada.json');
  const zero = await req('POST','/api/reservas',{labId:1,data:nextWeekday(6),inicio:'08:00',fim:'08:00',turma:'QA-ZERO',alunos:10},token);
  log('CT12','Horário de duração zero','400',`HTTP ${zero.status}; ${JSON.stringify(zero.data)}`,zero.status===400?'Passou':'Falhou','CT12-fim-igual-inicio.json');
  if (zero.status===201) await req('DELETE',`/api/reservas/${zero.data.id}`,undefined,token);
  const labs = await req('GET','/api/laboratorios',undefined,token);
  const seedDay = labs.status===200 ? (await req('GET','/api/reservas?lab=1',undefined,token)).data[0]?.data : undefined;
  const overlap = await req('POST','/api/reservas',{labId:1,data:seedDay,inicio:'09:00',fim:'11:00',turma:'QA-SOBREPOE',alunos:10},token);
  log('CT13','Sobreposição parcial','409',`HTTP ${overlap.status}; ${JSON.stringify(overlap.data)}`,overlap.status===409?'Passou':'Falhou','CT13-sobreposicao.json');
  const envelope = await req('POST','/api/reservas',{labId:1,data:seedDay,inicio:'07:00',fim:'11:00',turma:'QA-ENVOLVE',alunos:10},token);
  log('CT14','Novo horário envolve reservas existentes','409',`HTTP ${envelope.status}; ${JSON.stringify(envelope.data)}`,envelope.status===409?'Passou':'Falhou','CT14-envolve-reservas.json');
  if (envelope.status===201) await req('DELETE',`/api/reservas/${envelope.data.id}`,undefined,token);
  const adjacent = await req('POST','/api/reservas',{labId:1,data:seedDay,inicio:'10:00',fim:'12:00',turma:'QA-ADJACENTE',alunos:10},token);
  log('CT15','Horários adjacentes','201',`HTTP ${adjacent.status}; ${JSON.stringify(adjacent.data)}`,adjacent.status===201?'Passou':'Falhou','CT15-adjacente.json');
  const owner2 = await req('POST','/api/login',{email:'instrutor2@senac.br',senha:'123456'});
  const foreignDelete = await req('DELETE','/api/reservas/1',undefined,token);
  log('CT18','Instrutor cancela reserva alheia','403',`HTTP ${foreignDelete.status}; ${JSON.stringify(foreignDelete.data)}`,foreignDelete.status===403?'Passou':'Falhou','CT18-cancelamento-alheio.json');
  const ownCreated = await req('POST','/api/reservas',{labId:1,data:nextWeekday(7),inicio:'08:00',fim:'09:00',turma:'QA-CANCELA-PRÓPRIA',alunos:10},token);
  const ownDelete = ownCreated.status===201 ? await req('DELETE',`/api/reservas/${ownCreated.data.id}`,undefined,token) : ownCreated;
  log('CT17','Instrutor cancela reserva própria','200',`HTTP ${ownDelete.status}; ${JSON.stringify(ownDelete.data)}`,ownDelete.status===200?'Passou':'Falhou','CT17-cancelamento-proprio.json');
  async function load(path) {
    const samples=await Promise.all(Array.from({length:20},()=>req('GET',path,undefined,token)));
    const sorted=samples.map(x=>x.elapsedMs).sort((a,b)=>a-b);
    return {p90Ms:sorted[Math.ceil(.9*sorted.length)-1], errors:samples.filter(x=>x.status!==200).length, samplesMs:sorted};
  }
  const loadLabs = await load('/api/laboratorios');
  const loadReservations = await load('/api/reservas?lab=1');
  const concurrency = {users:20, labs:loadLabs, reservations:loadReservations, note:'Amostra única de 20 requisições concorrentes pelo harness Node; não substitui relatório JMeter'};
  const report = {date:new Date().toISOString(), login, records:out, load:concurrency, manualPending:['CT04 logout pela interface','CT05 fluxo de reserva pela interface','CT19 atualização visual de Minhas reservas após cancelar','Verificar viewport 360px, contraste e nomes acessíveis','Repetir medição de carga no JMeter']};
  for (const x of out) fs.writeFileSync(__dirname+'\\'+x.evidence,JSON.stringify(x,null,2),'utf8');
  fs.writeFileSync(__dirname+'\\relatorio-execucao-api.json',JSON.stringify(report,null,2),'utf8');
  fs.writeFileSync(__dirname+'\\resultados-casos.json',JSON.stringify(out,null,2),'utf8');
  console.log(JSON.stringify(report,null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
