var L=Object.defineProperty;var s=(t,a)=>L(t,"name",{value:a,configurable:!0});var u;import*as l from"../../_npm/@duckdb/duckdb-wasm@1.28.0/_esm.js";var N=Object.defineProperty,o=s((t,a)=>N(t,"name",{value:a,configurable:!0}),"s");const E=await l.selectBundle({mvp:{mainModule:import.meta.resolve("../../_npm/@duckdb/duckdb-wasm@1.28.0/dist/duckdb-mvp.wasm"),mainWorker:import.meta.resolve("../../_npm/@duckdb/duckdb-wasm@1.28.0/dist/duckdb-browser-mvp.worker.js")},eh:{mainModule:import.meta.resolve("../../_npm/@duckdb/duckdb-wasm@1.28.0/dist/duckdb-eh.wasm"),mainWorker:import.meta.resolve("../../_npm/@duckdb/duckdb-wasm@1.28.0/dist/duckdb-browser-eh.worker.js")}}),O=new l.ConsoleLogger(l.LogLevel.WARNING);let m,d=[];const p=new Map;function q(t,a){a==null?(p.delete(t),m=w.of(),d=Array.from(p,e=>m.then(n=>f(n._db,...e)))):(p.set(t,a),m??=w.of(),d.push(m.then(e=>f(e._db,t,a))))}s(q,"q"),o(q,"registerTable");async function g(t,...a){return(await b()).query(t.join("?"),a)}s(g,"k"),o(g,"sql");async function b(){return await Promise.all(d),await(m??=w.of())}s(b,"p"),o(b,"getDefaultClient");const I=(u=class{constructor(a){Object.defineProperties(this,{_db:{value:a}})}async queryStream(a,e){const n=await this._db.connect();let r,i;try{if(e?.length>0?r=await(await n.prepare(a)).send(...e):r=await n.send(a),i=await r.next(),i.done)throw new Error("missing first batch")}catch(c){throw await n.close(),c}return{schema:i.value.schema,async*readRows(){try{for(;!i.done;)yield i.value.toArray(),i=await r.next()}finally{await n.close()}}}}async query(a,e){const n=await this._db.connect();let r;try{e?.length>0?r=await(await n.prepare(a)).query(...e):r=await n.query(a)}finally{await n.close()}return r}async queryRow(a,e){const n=(await this.queryStream(a,e)).readRows();try{const{done:r,value:i}=await n.next();return r||!i.length?null:i[0]}finally{await n.return()}}async sql(a,...e){return await this.query(a.join("?"),e)}queryTag(a,...e){return[a.join("?"),e]}escape(a){return`"${a}"`}async describeTables(){return Array.from(await this.query("SHOW TABLES"),({name:a})=>({name:a}))}async describeColumns({table:a}={}){return Array.from(await this.query(`DESCRIBE ${this.escape(a)}`),({column_name:e,column_type:n,null:r})=>({name:e,type:S(n),nullable:r!=="NO",databaseType:n}))}static async of(a={},e={}){const n=await R();return e.query?.castTimestampToDate===void 0&&(e={...e,query:{...e.query,castTimestampToDate:!0}}),e.query?.castBigIntToDouble===void 0&&(e={...e,query:{...e.query,castBigIntToDouble:!0}}),await n.open(e),await Promise.all(Object.entries(a).map(([r,i])=>f(n,r,i))),new u(n)}static sql(){return this.of.apply(this,arguments).then(a=>a.sql.bind(a))}},s(u,"y"),u);o(I,"DuckDBClient");let w=I;Object.defineProperty(w.prototype,"dialect",{value:"duckdb"});async function f(t,a,e){if(e=await e,B(e))return A(t,a,e);if(h(e))return y(t,a,e);if(Array.isArray(e))return T(t,a,e);if(D(e))return C(t,a,e);if(typeof e=="string")return k(t,a,e);if(e&&typeof e=="object"){if("data"in e){const{data:n,...r}=e;return h(n)?y(t,a,n,r):T(t,a,n,r)}if("file"in e){const{file:n,...r}=e;return A(t,a,n,r)}}throw new Error(`invalid source: ${e}`)}s(f,"f"),o(f,"insertSource");async function k(t,a,e){const n=await t.connect();try{await n.query(`CREATE VIEW '${a}' AS FROM '${e}'`)}finally{await n.close()}}s(k,"R"),o(k,"insertUrl");async function A(t,a,e,n){const r=await e.url();if(r.startsWith("blob:")){const c=await e.arrayBuffer();await t.registerFileBuffer(e.name,new Uint8Array(c))}else await t.registerFileURL(e.name,new URL(r,location).href,4);const i=await t.connect();try{switch(e.mimeType){case"text/csv":case"text/tab-separated-values":return await i.insertCSVFromPath(e.name,{name:a,schema:"main",...n}).catch(async c=>{if(c.toString().includes("Could not convert"))return await v(i,e,a);throw c});case"application/json":return await i.insertJSONFromPath(e.name,{name:a,schema:"main",...n});default:if(/\.arrow$/i.test(e.name)){const c=new Uint8Array(await e.arrayBuffer());return await i.insertArrowFromIPCStream(c,{name:a,schema:"main",...n})}if(/\.parquet$/i.test(e.name))return await i.query(`CREATE VIEW '${a}' AS SELECT * FROM parquet_scan('${e.name}')`);if(/\.(db|ddb|duckdb)$/i.test(e.name))return await i.query(`ATTACH '${e.name}' AS ${a} (READ_ONLY)`);throw new Error(`unknown file type: ${e.mimeType}`)}}finally{await i.close()}}s(A,"A"),o(A,"insertFile");async function v(t,a,e){return await(await t.prepare(`CREATE TABLE '${e}' AS SELECT * FROM read_csv_auto(?, ALL_VARCHAR=TRUE)`)).send(a.name)}s(v,"S"),o(v,"insertUntypedCSV");async function y(t,a,e,n){const r=await t.connect();try{await r.insertArrowTable(e,{name:a,schema:"main",...n})}finally{await r.close()}}s(y,"l"),o(y,"insertArrowTable");async function C(t,a,e){const n=(await import("../../_npm/apache-arrow@15.0.2/_esm.js")).tableFromIPC(e.toArrowBuffer());return await y(t,a,n)}s(C,"L"),o(C,"insertArqueroTable");async function T(t,a,e,n){const r=(await import("../../_npm/apache-arrow@15.0.2/_esm.js")).tableFromJSON(e);return await y(t,a,r,n)}s(T,"h"),o(T,"insertArray");async function R(){const t=await l.createWorker(E.mainWorker),a=new l.AsyncDuckDB(O,t);return await a.instantiate(E.mainModule),a}s(R,"N"),o(R,"createDuckDB");function S(t){switch(t){case"BIGINT":case"HUGEINT":case"UBIGINT":return"bigint";case"DOUBLE":case"REAL":case"FLOAT":return"number";case"INTEGER":case"SMALLINT":case"TINYINT":case"USMALLINT":case"UINTEGER":case"UTINYINT":return"integer";case"BOOLEAN":return"boolean";case"DATE":case"TIMESTAMP":case"TIMESTAMP WITH TIME ZONE":return"date";case"VARCHAR":case"UUID":return"string";default:return/^DECIMAL\(/.test(t)?"integer":"other"}}s(S,"g"),o(S,"getDuckDBType");function B(t){return t&&typeof t.name=="string"&&typeof t.url=="function"&&typeof t.arrayBuffer=="function"}s(B,"B"),o(B,"isFileAttachment");function D(t){return t&&typeof t.toArrowBuffer=="function"}s(D,"C"),o(D,"isArqueroTable");function h(t){return t&&typeof t.getChild=="function"&&typeof t.toArray=="function"&&t.schema&&Array.isArray(t.schema.fields)}s(h,"T"),o(h,"isArrowTable");export{w as DuckDBClient,b as getDefaultClient,q as registerTable,g as sql};
