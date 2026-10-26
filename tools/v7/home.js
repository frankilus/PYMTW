(() => {
 'use strict';
 const $ = q => document.querySelector(q);
 const $$ = q => [...document.querySelectorAll(q)];
 const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const paths={
  wallet:'<rect x="3" y="6" width="18" height="14" rx="3"/><path d="M3 9V6a3 3 0 0 1 3-3h12M16 14h5"/>',
  card:'<rect x="2" y="5" width="20" height="15" rx="3"/><path d="M2 10h20M6 16h5"/>',
  file:'<path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h5M8 12h8M8 16h7"/>',
  down:'<path d="M4 5v14h16M7 8l5 5 4-3 3 5"/>',
  check:'<path d="M5 3h10l4 4v14H5zM15 3v5h5M8 14l3 3 5-6"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 2v6M16 2v6M3 10h18M7 14h4"/>',
  route:'<circle cx="12" cy="12" r="9"/><path d="m15.8 8.2-2.7 5-5 2.7 2.7-5z"/>',
  home:'<path d="M3 11 12 4l9 7M5 10v11h14V10M10 21v-6h4v6"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
  bars:'<path d="M4 21v-7M9 21V6M14 21v-11M19 21V3M2 21h20"/>',
  search:'<circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/>',
  scale:'<path d="M12 4v17M4 8h16M5 8l-3 6a3 3 0 0 0 6 0L5 8ZM19 8l-3 6a3 3 0 0 0 6 0l-3-6ZM6 21h12"/>',
  book:'<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21a2 2 0 0 1 2-2h13v2H6M8 7h7"/>',
  car:'<path d="M5 16V11l2-5h10l2 5v5M3 16h18v3H3zM5 11h14"/><circle cx="7.5" cy="19" r="1.5"/><circle cx="16.5" cy="19" r="1.5"/>',
  heart:'<path d="M12 20s-8-4.6-8-10.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 8 2.8C20 15.4 12 20 12 20z"/>',
  bitcoin:'<path d="M9 3v18M13 3v18M7 5h7a4 4 0 0 1 0 8H7h8a4 4 0 0 1 0 7H7"/>',
 };
 const icon = type => `<svg aria-hidden="true" viewBox="0 0 24 24">${paths[type]||paths.wallet}</svg>`;
 const toolData=[
  {slug:'subscription-leak-finder',title:'Subscription leak finder',desc:'Find recurring charges in a bank statement.',moment:'starting',live:true,icon:'wallet',kw:'subscription recurring streaming cancel bank statement bills spending budget',preview:'See what you pay each month',detail:'Review recurring charges in your statement, privately in your browser.'},
  {slug:'credit-card-optimizer',title:'Credit card optimizer',desc:'Understand which type of rewards card fits your spending.',moment:'starting',live:true,icon:'card',kw:'credit card rewards points cashback cash back groceries miles',preview:'Compare possible rewards',detail:'Actual recommendations depend on spending and current card terms.'},
  {slug:'paycheck-decoder',title:'Paycheck decoder',desc:'Understand your pay stub with private photo/PDF import or manual entry.',moment:'starting',live:true,icon:'file',kw:'paycheck salary taxes withholding paystub deductions',preview:'See where your pay goes',detail:'Review your pay-stub amounts and see how gross pay becomes take-home pay.'},
  {slug:'rent-vs-buy',title:'Rent vs. buy reality check',desc:'Look beyond rent or a mortgage payment.',moment:'purchase',live:true,icon:'home',kw:'home house buy rent mortgage first home afford down payment',preview:'Example: $300k mortgage ≈ $1,799/mo',detail:'6% fixed rate, 30 years, principal and interest only. Not a rent-versus-buy verdict.',demo:'loan'},
  {slug:'before-you-sign',title:'Before you sign',desc:'Spot hidden costs before agreeing to a loan or lease.',moment:'purchase',live:true,icon:'check',kw:'contract car loan lease sign fees financing offer purchase',preview:'Check the true cost first',detail:'Includes finance offers, leases and other commitments.'},
  {slug:'severance-runway',title:'Severance & job-loss runway',desc:'Explore your financial runway after a job change.',moment:'unexpected',live:true,icon:'route',kw:'lost my job fired laid off severance job loss unemployment benefits',preview:'Estimate your months of runway',detail:'Factors like benefits and job-search duration can change the answer.',demo:'runway'},
  {slug:'emergency-fund-runway',title:'Emergency fund runway',desc:'See how long available savings might cover essentials.',moment:'unexpected',live:true,icon:'clock',kw:'emergency savings cash runway income loss how long money last',preview:'Example: $12,000 ÷ $3,000 = 4 months',detail:'Assumes no income or unexpected expenses.',demo:'runway'},
  {slug:'debt-payoff-planner',title:'Debt payoff planner',desc:'Explore a realistic path to paying down a balance.',moment:'unexpected',live:true,icon:'down',kw:'debt pay off credit card debt balance loan interest avalanche snowball',preview:'See your estimated payoff date',detail:'Payment amount and APR affect the timeline.',demo:'debt'},
  {slug:'money-timeline',title:'Money timeline',desc:'Put your goals and big dates on one timeline.',moment:'ahead',live:true,icon:'calendar',kw:'future goals savings timeline plan retirement milestones',preview:'See when a goal could happen',detail:'See how changing your savings could move your goals closer.'},
  {slug:'explain-my-401k',title:'Explain my 401(k)',desc:'Understand your plan with private photo/PDF import or manual entry.',moment:'ahead',live:true,icon:'bars',kw:'401k retirement plan work employer investments',preview:'Understand what you own',detail:'Review contributions, employer matching, investment balances and estimated fees.'},
  {slug:'fee-x-ray',title:'Fee x-ray',desc:'See how investment costs may affect future value.',moment:'ahead',live:true,icon:'search',kw:'fee costs expenses investing advisor management',preview:'Reveal long-term fee impact',detail:'Uses your fee and investment assumptions.'},
  {slug:'roth-vs-traditional',title:'Roth vs. traditional',desc:'Compare different retirement tax treatments.',moment:'ahead',live:true,icon:'scale',kw:'roth traditional ira retirement taxes tax',preview:'Explore the tradeoffs',detail:'Actual taxes depend on personal circumstances and applicable law.'},
  {slug:'bitcoin-tax-lot-cleanup',title:'Bitcoin tax-lot cleanup',desc:'Review Bitcoin records privately and find missing costs.',moment:'ahead',live:true,icon:'bitcoin',kw:'bitcoin tax lot basis crypto',preview:'Organize your records',detail:'Import CSV records, resolve gaps and review account-specific FIFO lots.'},
  {slug:'bitcoin-dca-backtester',title:'Bitcoin DCA backtester',desc:'Compare historical regular-purchase scenarios.',moment:'ahead',live:true,icon:'bitcoin',kw:'bitcoin btc dca investing regular buying historical',preview:'Explore past outcomes',detail:'Historical results do not predict future returns.'}
 ];
 /* "Find the right tool." directory: topics, items and keywords come from tools/catalog.js
    (PT_CATS calculators, PT_GUIDES guides + checkup, PT_TOPICS). Add new tools and guides there,
    not here; toolData above only adds V7 icons and wording for existing calculators. */
 const categories=[...(window.PT_TOPICS||[]),{id:'all',name:'All tools & guides',desc:'Browse every tool and guide, organized by topic.'}];
 let selected='everyday',query='';
 const catalog = window.PT_CATS.flatMap(c => c.tools);
 catalog.forEach(s=>{if(!toolData.some(t=>t.slug===s.slug))toolData.push({slug:s.slug,title:s.name,desc:s.desc,live:s.live,icon:s.v7icon||'wallet',kw:''});});
 toolData.forEach(t => { const source = catalog.find(s => s.slug === t.slug); if(source){t.title=source.name;t.live=source.live;t.kw+=' '+source.kw.join(' ');} delete t.demo; });
 const guideData=(window.PT_GUIDES||[]).map(g=>({slug:g.slug,title:g.name,desc:g.desc,live:true,kind:g.kind||'guide',icon:g.v7icon||'book',kw:(g.kw||[]).join(' ')}));
 const dirData=[...toolData.map(t=>({...t,kind:'tool'})),...guideData.filter(g=>!toolData.some(t=>t.slug===g.slug))];
 const kindLabel={guide:'Guide',start:'Start here'};
 function toolURL(t){const path=t.slug.split('/').map(encodeURIComponent).join('/');return './'+path+'/';}
 function markup(t){const tag=kindLabel[t.kind]?`<span class="directory-tag">${kindLabel[t.kind]}</span>`:'';const inside=`<span class="directory-tool-icon">${icon(t.icon)}</span><div>${tag}<h4>${esc(t.title)}</h4><p>${esc(t.desc)}</p>${t.live?'':'<span class="planned-label">Coming soon</span>'}</div><span class="directory-tool-arrow" aria-hidden="true">${t.live?'↗':''}</span>`;return t.live?`<a class="directory-tool" href="${toolURL(t)}">${inside}</a>`:`<article class="directory-tool is-planned">${inside}</article>`;}
 const categoryTools=category=>(category.slugs||[]).map(slug=>dirData.find(t=>t.slug===slug)).filter(Boolean);
 const topics=categories.filter(c=>c.id!=='all');
 // "All" view: each page once. Calculators in their first topic, guides and the checkup in "guides"; anything unlisted under "More".
 const homeTopic=t=>{const lists=topics.filter(c=>(c.slugs||[]).includes(t.slug));return (t.kind!=='tool'&&lists.find(c=>c.id==='guides'))||lists[0];};
 const unlisted={id:'more',name:'More',slugs:dirData.filter(t=>!homeTopic(t)).map(t=>t.slug)};
 const allGroups=[...topics,...(unlisted.slugs.length?[unlisted]:[])].map(c=>({...c,items:c.id==='more'?categoryTools(c):categoryTools(c).filter(t=>homeTopic(t)===c)})).filter(c=>c.items.length);
 $('#tool-categories').innerHTML=categories.map(c=>`<button type="button" class="category-button" data-category="${c.id}" aria-controls="tools-grid" aria-pressed="${c.id===selected}"><span>${esc(c.name)}</span><span class="category-count">${c.id==='all'?dirData.length:categoryTools(c).length}</span></button>`).join('');
 // Directory search: accent- and case-insensitive, 401(k) = 401k, word prefixes, every word must match (falls back to any word).
 const fold=s=>String(s||'').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/\b(401|403|457)\s*\(?\s*([kb])\s*\)?/g,'$1$2').replace(/&/g,' and ').replace(/[^a-z0-9]+/g,' ').trim();
 const stop=new Set('a an and are at be can do for how i if in is it me my of on or should the to what when where which with you your'.split(' '));
 dirData.forEach(t=>{t.titleWords=fold(t.title).split(' ');t.words=fold(`${t.title} ${t.desc} ${t.kw} ${kindLabel[t.kind]||'tool calculator'} ${topics.filter(c=>(c.slugs||[]).includes(t.slug)).map(c=>c.name).join(' ')}`).split(' ');});
 const hit=(words,w)=>words.some(x=>x.startsWith(w)||(w.length>3&&/s$/.test(w)&&x.startsWith(w.slice(0,-1))));
 const rank=(words,w)=>words.some(x=>x===w||x===w.replace(/s$/,'')||x===w+'s')?2:hit(words,w)?1:0; // whole words beat prefixes
 function filterItems(q){const f=fold(q),words=f.split(' ').filter(w=>w&&!stop.has(w));if(!words.length)return {items:[],close:false};
  const scored=dirData.filter(t=>t.live).map((t,i)=>({t,i,n:words.filter(w=>hit(t.words,w)).length,s:words.reduce((a,w)=>a+Math.max(rank(t.titleWords,w)*2,rank(t.words,w)),0)+(f.length>2&&fold(t.title).includes(f)?5:0)+(f.length>2&&fold(t.kw).includes(f)?2:0)}));
  const all=scored.filter(x=>x.n===words.length),any=scored.filter(x=>x.n>0),list=all.length?all:any;
  return {items:list.sort((a,b)=>b.n-a.n||b.s-a.s||a.i-b.i).map(x=>x.t),close:!all.length&&any.length>0};}
 function renderTools(){
  const grid=$('#tools-grid');
  if(query.trim()){
   const {items,close}=filterItems(query),q=query.trim();
   grid.innerHTML=items.length?`<section class="directory-group" aria-label="Search results"><div class="directory-tool-list">${items.map(markup).join('')}</div></section>`:`<div class="directory-empty"><p>Nothing matches “${esc(q)}” yet. Try a simpler word such as <em>debt</em>, <em>rent</em> or <em>401k</em>, choose a topic, or <a href="/tools/checkup/">take the 2-minute money checkup</a>.</p></div>`;
   $('#tool-list-title').textContent=close?'Closest matches':'Search results';
   $('#tool-list-desc').textContent=close?`No page matches every word in “${q}”. These match some of them.`:`Tools and guides matching “${q}”, across all topics.`;
   $('#tool-count').textContent=items.length?`${items.length} ${items.length===1?'match':'matches'} for “${q}”`:`No matches for “${q}”`;
   $$('.category-button').forEach(b=>b.setAttribute('aria-pressed','false'));
   return;
  }
  const category=categories.find(c=>c.id===selected);
  const groups=selected==='all'?allGroups:[{...category,items:categoryTools(category)}];
  grid.innerHTML=groups.map(c=>`<section class="directory-group" aria-label="${esc(c.name)}">${selected==='all'?`<h4 class="directory-group-title">${esc(c.name)}</h4>`:''}<div class="directory-tool-list">${c.items.map(markup).join('')}</div></section>`).join('');
  $('#tool-list-title').textContent=category.name;
  $('#tool-list-desc').textContent=category.desc;
  const items=groups.flatMap(c=>c.items),tools=items.filter(t=>t.kind==='tool').length,guides=items.length-tools;
  const label=[tools?`${tools} ${tools===1?'tool':'tools'}`:'',guides?`${guides} ${guides===1?'guide':'guides'}`:''].filter(Boolean).join(' & ');
  $('#tool-count').textContent=`${label}${selected==='all'?' in all topics':' in '+category.name.toLowerCase()}`;
  $$('.category-button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.category===selected)));
 }
 const searchBox=$('#directory-search'),searchInput=$('#directory-search-input'),searchClear=$('#directory-search-clear');
 function setQuery(q){query=q;searchInput.value=q;searchClear.hidden=!q;renderTools();}
 if(searchBox){
  searchBox.hidden=false;
  searchBox.addEventListener('submit',e=>{e.preventDefault();const first=$('#tools-grid a.directory-tool');if(first&&query.trim())first.focus();});
  searchInput.addEventListener('input',()=>{query=searchInput.value;searchClear.hidden=!query;renderTools();});
  searchInput.addEventListener('keydown',e=>{if(e.key==='Escape'&&searchInput.value){e.preventDefault();setQuery('');}});
  searchClear.addEventListener('click',()=>{setQuery('');searchInput.focus();});
 }
 $$('.category-button').forEach(b=>b.addEventListener('click',()=>{selected=b.dataset.category;if(searchBox&&query)setQuery('');else renderTools();}));
 renderTools();
 const norm=s=>String(s||'').toLowerCase().normalize('NFKD').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
 const checkup={title:'2-minute money checkup',desc:'Find a helpful starting point.',slug:'checkup',live:true,kw:'where do i start checkup beginner overwhelmed financial health not sure start my finances'};
 const jobGuide={title:'Just lost your job?',desc:'What to do this week and next month.',slug:'guides/lost-my-job',live:true,kw:'lost my job lost job laid off fired unemployed unemployment cobra severance'};
 const oldPlanGuide={title:'Your old 401(k) after leaving a job',desc:'Roll it over, leave it or cash out: rules and costs.',slug:'guides/old-401k',live:true,kw:'old 401k rollover roll over cash out rule of 55 leaving a job left my job new job changing jobs switching jobs'};
 const homeGuide={title:'Buying your first home',desc:'Understand preparation, closing costs and affordability.',slug:'guides/first-home',live:true,kw:'first home afford a home buy a home buying a home house mortgage down payment first time buyer'};
 const carGuide={title:"True cost of a car",desc:"Plan beyond the sticker price.",slug:"guides/true-cost-of-a-car",live:true,kw:"car auto vehicle insurance maintenance transport"};
 const babyGuide={"title": "The true cost of having a baby", "desc": "Plan child care, birth costs and benefits.", "slug": "guides/true-cost-of-a-baby", "live": true, "kw": "baby pregnant newborn child care daycare day care parental leave maternity paternity"};
 const homeCostGuide={"title": "The true cost of owning a home", "desc": "Budget for the bills beyond the mortgage.", "slug": "guides/true-cost-of-owning-a-home", "live": true, "kw": "cost of owning homeowner property tax home insurance hoa maintenance closing cost pmi"};
 const weddingGuide={"title": "The true cost of a wedding", "desc": "Build a budget around your guest list.", "slug": "guides/true-cost-of-a-wedding", "live": true, "kw": "wedding engaged engagement marry married honeymoon wedding budget"};
 const searchPool=[carGuide,babyGuide,homeCostGuide,weddingGuide,...toolData.filter(t=>t.live),checkup,jobGuide,oldPlanGuide,homeGuide];
 guideData.forEach(g=>{if(!searchPool.some(t=>t.slug===g.slug))searchPool.push(g);}); // new catalog guides join the hero search too
 const aliases=[
  [/baby|pregnan|newborn|child care|daycare|day care|parental leave|maternity|paternity/,['guides/true-cost-of-a-baby','emergency-fund-runway']],
  [/cost of owning|homeowner|property tax|home insurance|\bhoa\b|home maintenance|house maintenance|home repair|closing cost|pmi/,['guides/true-cost-of-owning-a-home','rent-vs-buy','guides/first-home']],
  [/wedding|engaged|engagement|marry|married|honeymoon/,['guides/true-cost-of-a-wedding','money-timeline']],
  [/where do i start|not sure|start with|overwhelmed|financial health|getting started|money mind/,['checkup']],
  [/lost my job|lost job|laid off|fired|unemployed|unemployment/,['guides/lost-my-job','severance-runway','emergency-fund-runway']],
  [/afford a home|buy a home|house(?! maintenance| repair)|mortgage|first home/,['guides/first-home','rent-vs-buy']],
  [/rollover|roll over|rolling over|old 401|cash out (my )?401|cashing out|rule of 55|left my job|leaving (a |my )?job|changing jobs|switching jobs|new job/,['guides/old-401k','explain-my-401k']],
  [/pay off|debt|credit card balance/,['debt-payoff-planner']],
  [/bitcoin|btc/,['bitcoin-dca-backtester']],
  [/retirement|ira|roth/,['roth-vs-traditional']],
  [/emergency fund|savings last/,['emergency-fund-runway']],
  [/fees|investment fee/,['fee-x-ray']]
 ];
 function search(q){const n=norm(q);if(!n)return[];const words=n.split(' ').filter(w=>w.length>=3);return searchPool.map(t=>{const hay=norm(`${t.title} ${t.desc} ${t.kw||''}`);let score=words.reduce((a,w)=>a+(hay.split(' ').includes(w)?1:0),0);aliases.forEach(([re,slugs])=>{if(re.test(n)&&slugs.includes(t.slug))score+=20-slugs.indexOf(t.slug)*3;});if(n.includes(norm(t.title)))score+=15;return {...t,score};}).filter(t=>t.score>0).sort((a,b)=>b.score-a.score).slice(0,4);}
 function resultMarkup(t){const url=toolURL(t);return `<a href="${esc(url)}"  class="result-item"><div><strong>${esc(t.title)}</strong><small>${esc(t.desc)}</small></div><span class="result-arrow" aria-hidden="true">↗</span></a>`;}
 function showResults(q){const matches=search(q),el=$('#finder-results');el.hidden=false;el.innerHTML=matches.length?`<div class="results-heading">HERE'S A GOOD PLACE TO BEGIN</div><div class="result-items">${matches.map(resultMarkup).join('')}</div>`:`<div class="results-heading">LET'S TRY ANOTHER WAY</div><p class="result-empty">No close match yet. Try asking a simpler question or <a href="#moments" style="text-decoration:underline;color:var(--accent)">browse tools by topic</a>.</p>`;}
 $('#finder-form').addEventListener('submit',e=>{e.preventDefault();showResults($('#finder-input').value);});
 $$('.prompt').forEach(b=>b.addEventListener('click',()=>{$('#finder-input').value=b.dataset.query;showResults(b.dataset.query);$('#finder-results').scrollIntoView({behavior:'smooth',block:'nearest'});}));

 const menubtn=$('#menu-toggle');menubtn.addEventListener('click',()=>{const opened=menubtn.getAttribute('aria-expanded')==='true';menubtn.setAttribute('aria-expanded',String(!opened));menubtn.setAttribute('aria-label',opened?'Open navigation':'Close navigation');$('#main-nav').classList.toggle('open',!opened);});
 $$('#main-nav a').forEach(a=>a.addEventListener('click',()=>{$('#main-nav').classList.remove('open');menubtn.setAttribute('aria-expanded','false');menubtn.setAttribute('aria-label','Open navigation');}));
 if(location.hash.startsWith('#search=')){try{const query=decodeURIComponent(location.hash.slice(8)).slice(0,200);$('#finder-input').value=query;showResults(query);}catch(_){}}
})();
