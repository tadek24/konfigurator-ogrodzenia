import { test } from 'node:test';
import assert from 'node:assert/strict';
import { estimate, initialProject, isProject, products, type Project } from '../src/lib/project';
test('empty project costs zero',()=>{const q=estimate({...initialProject,segments:[]},products[0]);assert.equal(q.total,0);assert.equal(q.posts,0);});
test('connected sections share an endpoint post',()=>{const p:Project={...initialProject,segments:[{id:'1',a:{x:0,y:0},b:{x:4,y:0},kind:'fence'},{id:'2',a:{x:4,y:0},b:{x:4,y:2},kind:'fence'}]};const q=estimate(p,products[0]);assert.equal(q.posts,4);assert.equal(q.modules,3);assert.equal(q.total,6*420+4*140);});
test('openings use fixed prices and shared endpoint posts',()=>{const p:Project={...initialProject,segments:[{id:'1',a:{x:0,y:0},b:{x:4,y:0},kind:'gate'},{id:'2',a:{x:4,y:0},b:{x:5,y:0},kind:'wicket'}]};const q=estimate(p,products[0]);assert.equal(q.meters,0);assert.equal(q.total,4200+1450+3*140);});
test('import validation rejects corrupt and oversized geometry',()=>{assert.ok(isProject(initialProject));assert.equal(isProject({...initialProject,height:NaN}),false);assert.equal(isProject({...initialProject,segments:[{id:'x',kind:'fence',a:{x:0,y:0},b:{x:Infinity,y:0}}]}),false);assert.equal(isProject({...initialProject,segments:[{id:'x',kind:'fence',a:{x:0,y:0},b:{x:0,y:0}}]}),false);});
