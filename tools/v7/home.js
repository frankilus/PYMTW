(() => {
 'use strict';
 const $ = q => document.querySelector(q);
 const $$ = q => [...document.querySelectorAll(q)];
 const fmt = n => Number.isFinite(n) ? new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n) : '—';
 const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const C = window.PT.calc;
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
 const momentNames={all:'Helpful tools for wherever you are.',starting:'Getting started, one step at a time.',purchase:'Before you make a big purchase.',unexpected:'When something unexpected happens.',ahead:'A clearer path to what comes next.'};
 const momentDesc={all:'Explore the tools and find a useful next step.',starting:'Paychecks, recurring bills and everyday money choices.',purchase:'Understand the real cost before you commit.',unexpected:'Find your footing when your situation changes.',ahead:'Explore goals, retirement choices and long-term investing.'};
 let selected='all';
 const catalog = window.PT_CATS.flatMap(c => c.tools);
 toolData.forEach(t => { const source = catalog.find(s => s.slug === t.slug); if(source){t.title=source.name;t.live=source.live;t.kw+=' '+source.kw.join(' ');} delete t.demo; });
 function toolURL(t){const path=t.slug.split('/').map(encodeURIComponent).join('/');return './'+path+'/';}
 function markup(t){return `<article class="tool-card${t.live?'':' is-planned'}" data-moment="${t.moment}"><div class="tool-head"><span class="tool-symbol">${icon(t.icon)}</span><span class="tool-state ${t.live?'':'soon'}">${t.live?'AVAILABLE':'PLANNED'}</span></div><h4>${esc(t.title)}</h4><p>${esc(t.desc)}</p><div class="tool-preview"><span>${t.preview.startsWith('Example:')?'ILLUSTRATIVE EXAMPLE':'WHAT YOU CAN EXPLORE'}</span><strong>${esc(t.preview)}</strong><small>${esc(t.detail)}</small></div><div class="tool-footer">${t.live?`<a href="${toolURL(t)}" >Open this tool ↗</a>`:'<span class="disabled">Coming soon</span>'}</div></article>`;}
 function renderTools(){
  const shown=selected==='all'?toolData:toolData.filter(t=>t.moment===selected);
  $('#tools-grid').innerHTML=shown.map(markup).join('');
  $('#tool-list-title').textContent=momentNames[selected];
  $('#tool-list-desc').textContent=momentDesc[selected];
  $('#show-all').hidden=selected==='all';
  $$('.moment-card').forEach(b=>{const active=b.dataset.moment===selected;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
 }
 $$('.moment-card').forEach(b=>b.addEventListener('click',()=>{selected=selected===b.dataset.moment?'all':b.dataset.moment;renderTools();$('#tools').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'start'});}));
 $('#show-all').addEventListener('click',()=>{selected='all';renderTools();$('#moments').scrollIntoView({behavior:'smooth'});});
 renderTools();
 const norm=s=>String(s||'').toLowerCase().normalize('NFKD').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
 const checkup={title:'2-minute money checkup',desc:'Find a helpful starting point.',slug:'checkup',live:true,kw:'where do i start checkup beginner overwhelmed financial health not sure start my finances'};
 const jobGuide={title:'Just lost your job?',desc:'What to do this week and next month.',slug:'guides/lost-my-job',live:true,kw:'lost my job lost job laid off fired unemployed unemployment cobra severance'};
 const homeGuide={title:'Buying your first home',desc:'Understand preparation, closing costs and affordability.',slug:'guides/first-home',live:true,kw:'first home afford a home buy a home buying a home house mortgage down payment first time buyer'};
 const carGuide={title:"True cost of a car",desc:"Plan beyond the sticker price.",slug:"guides/true-cost-of-a-car",live:true,kw:"car auto vehicle insurance maintenance transport"};
 const searchPool=[carGuide,...toolData.filter(t=>t.live),checkup,jobGuide,homeGuide];
 const aliases=[
  [/where do i start|not sure|start with|overwhelmed|financial health|getting started|money mind/,['checkup']],
  [/lost my job|lost job|laid off|fired|unemployed|unemployment/,['guides/lost-my-job','severance-runway','emergency-fund-runway']],
  [/afford a home|buy a home|house|mortgage|first home/,['guides/first-home','rent-vs-buy']],
  [/pay off|debt|credit card balance/,['debt-payoff-planner']],
  [/bitcoin|btc/,['bitcoin-dca-backtester']],
  [/retirement|ira|roth/,['roth-vs-traditional']],
  [/emergency fund|savings last/,['emergency-fund-runway']],
  [/fees|investment fee/,['fee-x-ray']]
 ];
 function search(q){const n=norm(q);if(!n)return[];const words=n.split(' ').filter(w=>w.length>=3);return searchPool.map(t=>{const hay=norm(`${t.title} ${t.desc} ${t.kw||''}`);let score=words.reduce((a,w)=>a+(hay.split(' ').includes(w)?1:0),0);aliases.forEach(([re,slugs])=>{if(re.test(n)&&slugs.includes(t.slug))score+=20;});if(n.includes(norm(t.title)))score+=15;return {...t,score};}).filter(t=>t.score>0).sort((a,b)=>b.score-a.score).slice(0,4);}
 function resultMarkup(t){const url=toolURL(t);return `<a href="${esc(url)}"  class="result-item"><div><strong>${esc(t.title)}</strong><small>${esc(t.desc)}</small></div><span class="result-arrow" aria-hidden="true">↗</span></a>`;}
 function showResults(q){const matches=search(q),el=$('#finder-results');el.hidden=false;el.innerHTML=matches.length?`<div class="results-heading">HERE'S A GOOD PLACE TO BEGIN</div><div class="result-items">${matches.map(resultMarkup).join('')}</div>`:`<div class="results-heading">LET'S TRY ANOTHER WAY</div><p class="result-empty">No close match yet. Try asking a simpler question or <a href="#moments" style="text-decoration:underline;color:#aa550d">choose a life moment below</a>.</p>`;}
 $('#finder-form').addEventListener('submit',e=>{e.preventDefault();showResults($('#finder-input').value);});
 $$('.prompt').forEach(b=>b.addEventListener('click',()=>{$('#finder-input').value=b.dataset.query;showResults(b.dataset.query);$('#finder-results').scrollIntoView({behavior:'smooth',block:'nearest'});}));

 const menubtn=$('#menu-toggle');menubtn.addEventListener('click',()=>{const opened=menubtn.getAttribute('aria-expanded')==='true';menubtn.setAttribute('aria-expanded',String(!opened));menubtn.setAttribute('aria-label',opened?'Open navigation':'Close navigation');$('#main-nav').classList.toggle('open',!opened);});
 $$('#main-nav a').forEach(a=>a.addEventListener('click',()=>{$('#main-nav').classList.remove('open');menubtn.setAttribute('aria-expanded','false');menubtn.setAttribute('aria-label','Open navigation');}));
 function updateRunway(){const savings=Number($('#savings').value),expenses=Number($('#expenses').value),months=C.emergency(savings,expenses,6,0).covered;$('#savings-value').textContent=fmt(savings);$('#expenses-value').textContent=fmt(expenses);$('#runway-output').textContent=Number.isFinite(months)?months.toFixed(1).replace(/\.0$/,''):'—';['savings','expenses'].forEach(id=>{const e=$('#'+id);e.style.setProperty('--progress',((+e.value-e.min)/(e.max-e.min)*100)+'%');});}
 ['savings','expenses'].forEach(id=>$('#'+id).addEventListener('input',updateRunway));updateRunway();
 if(location.hash.startsWith('#search=')){try{const query=decodeURIComponent(location.hash.slice(8)).slice(0,200);$('#finder-input').value=query;showResults(query);}catch(_){}}
 const searchDock=$('#mobile-search-dock');
 function updateSearchDock(){const show=window.innerWidth<=590 && window.scrollY>Math.max(530,$('.opening').getBoundingClientRect().height+110);searchDock.hidden=!show;searchDock.classList.toggle('visible',show);}
 window.addEventListener('scroll',updateSearchDock,{passive:true});window.addEventListener('resize',updateSearchDock);updateSearchDock();
 searchDock.addEventListener('click',()=>{$('#finder-input').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'center'});$('#finder-input').focus({preventScroll:true});});
})();
