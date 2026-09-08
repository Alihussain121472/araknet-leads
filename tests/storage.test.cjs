const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const Module = require('node:module');
const tables = new Map();
function matches(doc, query) { return Object.entries(query).every(([key, value]) => value && typeof value === 'object' && '$lte' in value ? doc[key] <= value.$lte : doc[key] === value); }
function collection(name) {
 if (!tables.has(name)) tables.set(name, []);
 const rows = tables.get(name);
 return {
  find: query => ({ toArray: async () => structuredClone(rows.filter(row => matches(row, query))) }),
  findOne: async query => structuredClone(rows.find(row => matches(row, query)) || null),
  updateOne: async (query, update, options = {}) => {
   let row = rows.find(row => matches(row, query)); let inserted = false;
   if (!row && options.upsert) { row = {...query, ...structuredClone(update.$setOnInsert || {})}; rows.push(row); inserted = true; }
   if (row && update.$set) Object.assign(row, structuredClone(update.$set));
   return {upsertedCount: Number(inserted)};
  },
  findOneAndUpdate: async (query, update) => {
   let row = rows.find(row => matches(row, query));
   if (!row) {
    if (rows.some(row => row._id === query._id)) throw Object.assign(new Error('duplicate'), {code:11000});
    row = {_id:query._id}; rows.push(row);
   }
   Object.assign(row, update.$set); return structuredClone(row);
  },
  deleteOne: async query => { const index = rows.findIndex(row => matches(row, query)); if(index < 0)return {deletedCount:0}; rows.splice(index,1); return {deletedCount:1}; },
  deleteMany: async query => { for(let i=rows.length-1;i>=0;i--)if(matches(rows[i],query))rows.splice(i,1); }
 };
}
const file = 'lib/storage.ts';
const mod = new Module(require('node:path').resolve(file), module); mod.paths = module.paths;
mod.require = name => name === 'server-only' ? {} : name === './mongodb' ? {database:async()=>({collection})} : name === './auth' ? {requireAccess:async()=>{}} : require(name);
mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,file);
const store = mod.exports;
test('lead deduplication preserves updates; notes and tags persist; delete cleans related records', async()=>{
 const candidate={id:'incoming',business_name:'Test Bakery',country:'Pakistan',city:'Karachi',address:'Test street',created_at:new Date().toISOString(),lead_status:'new',tags:[],opportunity_score:70};
 const [lead]=await store.addLeads([candidate]); assert.ok(lead.id);
 await store.updateLead(lead.id,{lead_status:'contacted',tags:['priority','priority'],business_name:'tampered'});
 assert.equal((await store.addLeads([candidate])).length,0);
 const saved=await store.getLeadById(lead.id); assert.equal(saved.business_name,'Test Bakery');assert.equal(saved.lead_status,'contacted');assert.deepEqual(saved.tags,['priority']);
 await store.addNote(lead.id,'Follow up'); assert.equal((await store.getNotes(lead.id)).length,1);
 await assert.rejects(()=>store.updateLead(lead.id,{tags:'invalid'}),/Invalid tags/);
 assert.equal(await store.deleteLead(lead.id),true);assert.deepEqual(await store.getNotes(lead.id),[]);assert.deepEqual(await store.getActivities(lead.id),[]);
 await assert.rejects(()=>store.addNote(lead.id,'Orphan'),/Lead not found/);
});
test('discovery lease rejects overlap and only its owner can release it',async()=>{
 const token=await store.acquireAgentLock(); assert.ok(token);assert.equal(await store.acquireAgentLock(),null);
 await store.releaseAgentLock('wrong');assert.equal(await store.acquireAgentLock(),null);
 await store.releaseAgentLock(token);assert.ok(await store.acquireAgentLock());
});
test('settings never expose API keys, retain masked keys, and allow clearing saved keys',async()=>{
 await store.updateSettings({google_places_api_key:'test-key',schedule_enabled:false});
 assert.equal(store.publicSettings(await store.getSettings()).google_places_api_key,'configured');
 await store.updateSettings({google_places_api_key:'configured'});assert.equal((await store.getSettings()).google_places_api_key,'test-key');
 await store.updateSettings({google_places_api_key:''});assert.equal((await store.getSettings()).google_places_api_key,'');
 await assert.rejects(()=>store.updateSettings({schedule_frequency:'invalid'}),/frequency/);
});
