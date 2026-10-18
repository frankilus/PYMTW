(function(){
'use strict';
const C=window.TaxLots,$=id=>document.getElementById(id);
let records=[],pending=null,editing=null,analysis=null,page=0,generation=0;
const labels={timestamp:'UTC timestamp',type:'Activity type',account:'Wallet / account',destination:'Destination account',btc:'BTC quantity',amount_usd:'USD total cost / net proceeds',btc_fee:'BTC fee',reference:'Reference'};
const money=n=>{const s=C.fixed(n<0n?-n:n,2),[whole,cents]=s.split('.');return (n<0n?'-':'')+'$'+whole.replace(/\B(?=(\d{3})+(?!\d))/g,',')+'.'+cents;};
function el(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;}
function table(headers,rows){const t=el('table'),head=el('thead'),tr=el('tr');for(const h of headers){const th=el('th',h);th.scope='col';tr.append(th);}head.append(tr);t.append(head);const body=el('tbody');for(const row of rows){const tr=el('tr');for(const [index,cell] of row.entries()){const td=el('td');td.dataset.label=headers[index];if(cell instanceof Node)td.append(cell);else td.textContent=cell;tr.append(td);}body.append(tr);}t.append(body);return t;}
function scrollTo(id){$(id).scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});}
function render(){
 $('record-count').textContent=records.length?`${records.length} records · ${records.filter(r=>r.included!==false).length} included · ${records.filter(r=>r.included===false).length} excluded`:'No records yet. Start above, or add one below.';
 $('export-records').disabled=!records.length;
 const list=$('record-list');list.replaceChildren();
 if(!records.length)return;
 page=Math.min(page,Math.max(0,Math.ceil(records.length/25)-1));
 const rows=records.slice(page*25,page*25+25).map((r,k)=>{
  const i=page*25+k,detail=el('div',String(i+1)+' · '+(r.type||'Unknown'));
  detail.append(el('small',r.timestamp||'Date missing'),el('small',r.source||'Manual entry'));
  const where=el('div',r.account||'Account missing');if(r.destination)where.append(el('small','→ '+r.destination));if(r.reference)where.append(el('small','Ref: '+r.reference));
  const issueList=analysis?analysis.issues.filter(x=>x.row===i+1):[];
  const status=el('div');status.append(el('span',r.included===false?'Excluded':issueList.length?'Needs attention':analysis?'Checked':'Not checked',r.included===false?'tag off':issueList.length?'tag warn':'tag'));
  issueList.forEach(issue=>status.append(el('p',issue.message,'issue')));
  const edit=el('button','Edit','text-button');edit.type='button';edit.setAttribute('aria-label','Edit record '+(i+1));edit.addEventListener('click',()=>openEditor(i));
  const toggle=el('button',r.included===false?'Include':'Exclude','text-button');toggle.type='button';toggle.setAttribute('aria-label',(r.included===false?'Include':'Exclude')+' record '+(i+1));toggle.addEventListener('click',()=>{records[i].included=records[i].included===false;invalidate();});
  const actions=el('div');actions.append(edit,toggle);status.append(actions);
  return [detail,where,r.btc||'Unknown',r.amount_usd||((r.type||'').toLowerCase()==='transfer'?'—':'Unknown'),status];
 });
 const wrap=el('div',undefined,'table-wrap');wrap.tabIndex=0;wrap.setAttribute('role','region');wrap.setAttribute('aria-label','Editable transaction records');wrap.append(table(['Record & source','Account','BTC','USD amount','Review & actions'],rows));list.append(wrap);
 $('pager').hidden=records.length<=25;$('prev').disabled=page===0;$('next').disabled=(page+1)*25>=records.length;$('page-label').textContent=`Page ${page+1} of ${Math.ceil(records.length/25)}`;
}
function invalidate(){const had=analysis!==null;analysis=null;$('results').hidden=true;$('results').replaceChildren();$('export-lots').hidden=true;$('review-status').textContent='';$('stale').hidden=!(had||!$('stale').hidden);$('fifo-confirm').checked=false;render();}
function openEditor(i){if(i===null&&records.length>=C.MAX_ROWS){$('review-status').textContent='The tool supports up to 500 records. Clear entries to begin another set.';return;}editing=i;$('editor').hidden=false;$('editor-title').textContent=i===null?'Add a record':'Edit record '+(i+1);for(const f of C.fields)$('f-'+f).value=i===null?(f==='type'?'buy':''):(records[i][f]||'');if(!$('f-type').value)$('f-type').value='other';scrollTo('editor');$('f-timestamp').focus({preventScroll:true});}
function closeEditor(){editing=null;$('editor').hidden=true;$('editor').reset();}
function cancelImport(){generation++;pending=null;$('mapping').hidden=true;$('mapping-fields').replaceChildren();$('csv-sample').replaceChildren();$('file').value='';$('map-confirm').checked=false;}
function clear(){records=[];analysis=null;page=0;cancelImport();closeEditor();$('results').replaceChildren();$('results').hidden=true;$('export-lots').hidden=true;$('review-status').textContent='';$('import-status').textContent='';$('import-error').hidden=true;$('import-error').textContent='';$('fifo-confirm').checked=false;$('stale').hidden=true;$('example-note').hidden=true;$('pager').hidden=true;render();}
function importError(message){$('import-error').textContent=message;$('import-error').hidden=false;}
$('file').addEventListener('change',async()=>{
 const file=$('file').files[0];cancelImport();const token=generation;if(!file)return;
 $('import-error').hidden=true;$('import-status').textContent='Reading locally…';
 try{
  if(file.size>2*1024*1024)throw Error('Choose a CSV under 2 MB.');
  if(!/\.csv$/i.test(file.name))throw Error('Choose a .csv file. Photos, PDFs and spreadsheets are not supported in this tool.');
  const text=await file.text();if(token!==generation)return;
  const data=C.parseCSV(text);if(data.rows.length+records.length>C.MAX_ROWS)throw Error('This would exceed 500 total records. Use a smaller set.');
  pending={...data,name:file.name.slice(0,150)};
  for(const f of C.fields){const label=el('label',labels[f],'field'),select=el('select');select.id='map-'+f;select.append(new Option('Choose a column…','-1'));data.headers.forEach((h,i)=>select.append(new Option(h,String(i))));const found=data.headers.findIndex(h=>h.toLowerCase()===f);select.value=String(found);label.append(select);if(['destination','reference'].includes(f))label.append(el('small','Optional when not needed.'));$('mapping-fields').append(label);}
  const sample=table(data.headers,data.rows.slice(0,3));$('csv-sample').replaceChildren(...sample.childNodes);
  $('mapping').hidden=false;$('import-status').textContent=`${file.name} · ${data.rows.length} records read locally. Review the column mapping before adding.`;
 }catch(e){if(token===generation){importError(e.message);$('import-status').textContent='No records were added.';}}
});
$('import-use').addEventListener('click',()=>{
 if(!pending)return;
 try{
  if(!$('map-confirm').checked)throw Error('Confirm the column meanings before adding these records.');
  const mapping=Object.fromEntries(C.fields.map(f=>[f,Number($('map-'+f).value)]));
  const items=C.mapped(pending,mapping,pending.name);
  if(items.length+records.length>C.MAX_ROWS)throw Error('Use at most 500 records.');
  items.forEach((r,i)=>r.original=JSON.stringify(Object.fromEntries(pending.headers.map((h,k)=>[h,pending.rows[i][k]]))));
  records.push(...items);const n=items.length;cancelImport();invalidate();$('import-error').hidden=true;$('import-status').textContent=`Added ${n} records. Original values are retained in the records export. Check the details below.`;page=Math.floor((records.length-n)/25);render();scrollTo('records');
 }catch(e){importError(e.message);}
});
$('import-cancel').addEventListener('click',()=>{cancelImport();$('import-status').textContent='Import canceled. Existing records are unchanged.';});
$('editor').addEventListener('submit',e=>{
 e.preventDefault();const values=Object.fromEntries(C.fields.map(f=>[f,$('f-'+f).value.trim()]));
 if(editing===null){if(records.length>=C.MAX_ROWS)return;records.push({...values,included:true,source:'Manual entry',original:JSON.stringify(values)});page=Math.floor((records.length-1)/25);}
 else records[editing]={...records[editing],...values};closeEditor();invalidate();scrollTo('records');
});
$('add').addEventListener('click',()=>openEditor(null));$('cancel-edit').addEventListener('click',closeEditor);$('clear').addEventListener('click',clear);
$('prev').addEventListener('click',()=>{page--;render();});$('next').addEventListener('click',()=>{page++;render();});
$('example').addEventListener('click',()=>{
 if(records.length){$('import-status').textContent='Clear your current entries first to load the fictional example.';return;}
 cancelImport();closeEditor();$('import-error').hidden=true;
 const sample=[
 ['2025-02-01T12:00:00Z','buy','Exchange A','','0.1','4000','0','buy-1'],
 ['2025-03-01T12:00:00Z','buy','Exchange A','','0.1','6000','0','buy-2'],
 ['2025-04-01T12:00:00Z','transfer','Exchange A','Hardware wallet','0.05','','0','move-1'],
 ['2026-02-01T12:00:00Z','sell','Hardware wallet','','0.02','1800','0','sale-1'],
 ['2026-02-01T12:00:00Z','sell','Hardware wallet','','0.02','1800','0','sale-1'],
 ['2026-03-01T12:00:00Z','buy','Exchange B','','0.04','','0','buy-3']
 ];records=sample.map(a=>({...Object.fromEntries(C.fields.map((f,i)=>[f,a[i]])),source:'Fictional example',included:true,original:JSON.stringify(a)}));invalidate();$('example-note').hidden=false;check();scrollTo('records');
});
function resultTable(title,headers,rows){$('results').append(el('h3',title));const wrap=el('div',undefined,'table-wrap');wrap.tabIndex=0;wrap.setAttribute('role','region');wrap.setAttribute('aria-label',title);wrap.append(table(headers,rows));$('results').append(wrap);}
function check(){
 if(!$('editor').hidden){$('review-status').textContent='Save or cancel your open record before checking the worksheet.';return;}
 analysis=C.analyze(records);$('results').replaceChildren();$('results').hidden=true;$('export-lots').hidden=true;$('stale').hidden=true;render();
 if(!analysis.active){$('review-status').textContent='Add and include at least one record to begin.';return;}
 if(analysis.issues.length){const n=new Set(analysis.issues.map(i=>i.row)).size;$('review-status').textContent=`${n} record${n===1?'':'s'} need attention. Review the notes beside each record. Gains are withheld until these issues are resolved.`;page=Math.floor((analysis.issues[0].row-1)/25);render();return;}
 if(!$('fifo-confirm').checked){$('review-status').textContent='No structural issues found in the included records. Confirm the FIFO illustration above to see the worksheet; this does not verify that your history is complete.';return;}
 $('review-status').textContent='No structural issues found. Reconcile the included history, balances and lot method with your original records before using the worksheet.';
 $('results').hidden=false;const metrics=el('div',undefined,'summary-grid');for(const [name,value] of [['Net proceeds',analysis.proceeds],['Matched cost basis',analysis.basis],['Illustrated gain / loss',analysis.gain]]){const card=el('div',undefined,'metric');card.append(el('small',name),el('strong',money(value)));metrics.append(card);}$('results').append(metrics,el('p','All included sales · Account-specific FIFO illustration · Not tax owed','help'));
 if(records.some(r=>r.included===false))$('results').append(el('p','Excluded records are omitted from these figures. Exclude only confirmed duplicate or irrelevant records, never missing or unsupported genuine activity.','notice'));
 resultTable('What remains in each account',['Account','BTC remaining','Remaining basis'],analysis.wallets.map(w=>[w.account,C.fixed(w.qty,8),money(w.basis)]));
 if(analysis.sales.length)resultTable('How sales used your lots',['Sale / source lot','Account','Acquired → sold (UTC)','BTC','Basis','Net proceeds','Gain / loss'],analysis.sales.map(s=>['Record '+s.record+' / lot '+s.origin,s.account,s.acquired+' → '+s.sold,C.fixed(s.qty,8),money(s.basis),money(s.proceeds),money(s.gain)]));
 else $('results').append(el('p','No sales were included. Remaining lots are available in the worksheet.','notice'));
 $('export-lots').hidden=false;
}
$('analyze').addEventListener('click',check);
$('fifo-confirm').addEventListener('change',()=>{$('results').hidden=true;$('export-lots').hidden=true;$('review-status').textContent='Select “Check my records” to update the worksheet.';});
function download(name,rows){const url=URL.createObjectURL(new Blob([C.csv(rows)],{type:'text/csv;charset=utf-8'}));const a=el('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('export-records').addEventListener('click',()=>{const audit=C.analyze(records);download('bitcoin-records-review.csv',[
 ['record','included',...C.fields,'source','issues','original_values','worksheet_scope'],
 ...records.map((r,i)=>[i+1,r.included!==false?'yes':'no',...C.fields.map(f=>r[f]),r.source,audit.issues.filter(x=>x.row===i+1).map(x=>x.message).join(' | '),r.original,'Review only; complete history and supported activity required; excluded records not modeled'])]);});
$('export-lots').addEventListener('click',()=>{
 if(!analysis||analysis.issues.length||!$('fifo-confirm').checked)return;
 const notes='Account FIFO illustration; all entered sales; not Form 8949 or tax owed; history/completeness/fees/method require review; USD cents allocated half-up; excluded records: '+records.filter(r=>r.included===false).length;
 download('bitcoin-fifo-review-worksheet.csv',[
 ['kind','account','source_buy_record','sale_record','acquired_utc','sold_utc','btc','basis_usd','proceeds_usd','gain_loss_usd','notes'],
 ...analysis.sales.map(s=>['sale',s.account,s.origin,s.record,s.acquired,s.sold,C.fixed(s.qty,8),C.fixed(s.basis,2),C.fixed(s.proceeds,2),C.fixed(s.gain,2),notes]),
 ...analysis.lots.map(l=>['remaining',l.account,l.origin,'',l.acquired,'',C.fixed(l.qty,8),C.fixed(l.basis,2),'','',notes])]);
});
window.addEventListener('pagehide',clear);window.addEventListener('pageshow',e=>{if(e.persisted)clear();});
clear();
})();
