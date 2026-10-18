const assert=require('node:assert/strict');const D=require('../tools/paycheck-decoder/core.js');let checks=0;function test(name,fn){fn();checks++;console.log('PASS',name);}
const line=(type,amount,label)=>({type,amount,label});
test('Fictional paycheck reconciles, employer match excluded',()=>{const r=D.calculate({gross:'3000',net:'2090.50',lines:[line('federal','280'),line('state','100'),line('ss','186'),line('medicare','43.50'),line('traditional','150'),line('roth','75'),line('benefit','100'),line('addition','25'),line('employer','90')]});assert.equal(r.totals.tax,60950);assert.equal(r.totals.deduction,32500);assert.equal(r.expected,209050);assert.equal(r.difference,0);assert.equal(r.totals.info,9000);});
test('Cents arithmetic avoids floating point accumulation',()=>assert.equal(D.calculate({gross:'0.30',net:'0',lines:[line('otherDeduction','0.10'),line('otherDeduction','0.20')]}).expected,0));

test('Leading decimal accepted',()=>assert.equal(D.cents('.50'),50));
test('Dollar signs and correctly grouped amounts',()=>assert.equal(D.cents('$ 1,234.56'),123456));
test('Blank optional net is distinct from zero',()=>{assert.equal(D.calculate({gross:'0',net:'',lines:[]}).difference,null);assert.equal(D.calculate({gross:'0',net:'0',lines:[]}).difference,0);});
test('Difference direction is explicit',()=>{assert.equal(D.calculate({gross:'100',net:'90',lines:[]}).difference,1000);assert.equal(D.calculate({gross:'100',net:'110',lines:[]}).difference,-1000);});
test('Negative calculated net preserved for warning',()=>assert.equal(D.calculate({gross:'100',lines:[line('federal','120')]}).expected,-2000));
test('Zero gross with cash addition',()=>assert.equal(D.calculate({gross:'0',lines:[line('addition','25')]}).expected,2500));
test('Combined FICA cannot double count separate tax lines',()=>{for(const type of ['ss','medicare'])assert.throws(()=>D.calculate({gross:'1000',lines:[line('fica','76.50'),line(type,'10')]}),/either combined FICA/);});
test('Combined FICA alone works',()=>assert.equal(D.calculate({gross:'1000',lines:[line('fica','76.50')]}).expected,92350));
test('Zero unused Social Security line does not double count',()=>assert.equal(D.calculate({gross:'1000',lines:[line('fica','76.50'),line('ss','0')]}).expected,92350));
test('Info/memo lines never alter take-home',()=>assert.equal(D.calculate({gross:'100',lines:[line('employer','500'),line('memo','2000')]}).expected,10000));
test('Missing amounts are not silently treated as zero',()=>{assert.throws(()=>D.calculate({gross:'',lines:[]}),/Enter an amount/);assert.throws(()=>D.calculate({gross:'100',lines:[line('federal','')]}),/Enter an amount/);});
test('Malformed, negative, nonfinite and overprecise amounts rejected',()=>{for(const s of ['-1','1.001','1e3','Infinity','NaN','1,23','1,2345','1.2.3','abc','<script>','10000000.01'])assert.throws(()=>D.cents(s),s);});
test('Maximum amount accepted without overflow',()=>assert.equal(D.cents('10000000'),1000000000));
test('Invalid types and too many entries rejected',()=>{assert.throws(()=>D.calculate({gross:'1',lines:[line('__proto__','0')]}));assert.throws(()=>D.calculate({gross:'1',lines:Array(31).fill(line('memo','0'))}));});
test('No rows leaves cash gross unchanged',()=>assert.equal(D.calculate({gross:'123.45',lines:[]}).expected,12345));
console.log(checks+' paycheck calculation scenarios passed');
