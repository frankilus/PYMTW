const assert=require('node:assert/strict'),P=require('../tools/paycheck-decoder/import-parser.js');let n=0;function test(name,fn){fn();n++;console.log('PASS',name);}
test('Current/YTD amounts never auto-selected',()=>{const r=P.parse('Description Current YTD\nGross pay 3,000.00 6,000.00\nFITW 280.00 560.00\nNet pay 2090.50 4181.00');assert.equal(r.rows.length,3);assert.equal(r.rows[0].type,'gross');assert.equal(r.rows[1].type,'federal');assert.equal(r.rows[2].type,'net');r.rows.forEach(x=>assert.equal(x.selected,''));assert.equal(r.hasColumns,true);});
test('Known single current amount suggested',()=>{const r=P.parse('Current\nOASDI 186.00');assert.equal(r.rows[0].selected,'0');assert.equal(r.rows[0].amounts[0].value,'186.00');});
test('YTD-only header blocks default amounts',()=>assert.equal(P.parse('YTD\nFederal tax 560.00').rows[0].selected,''));
test('Employer-paid taxes are not employee deductions',()=>assert.equal(P.classify('ER Social Security'),'employer'));
test('Ambiguous MED code requires classification',()=>assert.equal(P.classify('MED'),'unknown'));
test('Subtotals and earnings details excluded',()=>{for(const label of ['Total deductions','Taxable gross','Regular pay','Overtime','Gross YTD'])assert.equal(P.parse(label+' 100.00').rows[0].include,false,label);});
test('Unknown labels stay excluded',()=>{const r=P.parse('UNKNOWN CODE 13.00').rows[0];assert.equal(r.type,'unknown');assert.equal(r.include,false);});
test('Negative and reversed amounts cannot be imported as positive',()=>{for(const a of ['-42.00','(42.00)','42.00-'])assert.equal(P.parse('State tax '+a).rows[0].amounts[0].value,'');});
test('Side-by-side labels are not classified automatically',()=>{const r=P.parse('Federal tax 100.00 Medicare 20.00').rows[0];assert.equal(r.type,'unknown');assert.equal(r.include,false);});
test('Identifiers are not suggested',()=>assert.equal(P.parse('Account number 12345.00\nEmployee ID 1234.00\nSSN 123.00').rows.length,0));
test('Both traditional and Roth recognized distinctly',()=>{assert.equal(P.classify('401(k) pre-tax'),'traditional');assert.equal(P.classify('Roth 401(k)'),'roth');});
test('Reimbursement and employer match recognized',()=>{assert.equal(P.classify('Expense reimbursement'),'addition');assert.equal(P.classify('Employer match'),'employer');});
test('No decimals are not invented',()=>assert.equal(P.parse('FITW 280').rows.length,0));
test('Very long input bounded',()=>{assert.equal(P.parse(('FITW 100.00\n').repeat(1000)).rows.length,60);assert.equal(P.parse(('FITW 100.00\n').repeat(1000)).truncated,true);});
console.log(n+' parser scenarios passed');
