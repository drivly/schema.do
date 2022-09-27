export const api = {
  icon: '⚡️',
  name: 'schema.do',
  description: 'Dynamic Schema Inference & Generation',
  url: 'https://schema.do/api',
  type: 'https://apis.do/data',
  endpoints: {
    list: 'https://schema.do/list',
    get: 'https://schema.do/:id',
  },
  site: 'https://schema.do',
  login: 'https://schema.do/login',
  signup: 'https://schema.do/signup',
  subscribe: 'https://schema.do/subscribe',
  repo: 'https://github.com/drivly/schema.do',
}

import {
  quicktype,
  InputData,
  jsonInputForTargetLanguage,
  JSONSchemaInput,
  FetchingJSONSchemaStore,
} from 'quicktype-core'

async function quicktypeJSON(targetLanguage, typeName, jsonString) {
  const jsonInput = jsonInputForTargetLanguage(targetLanguage)

  // We could add multiple samples for the same desired
  // type, or many sources for other types. Here we're
  // just making one type from one piece of sample JSON.
  await jsonInput.addSource({
    name: typeName,
    samples: [jsonString],
  })

  const inputData = new InputData();
  inputData.addInput(jsonInput);

  return await quicktype({
    inputData,
    lang: targetLanguage,
  })
}

export default {
  fetch: async (req, env) => {
    const { user, origin, requestId, method, body, time, pathname, query, search, pathSegments, pathOptions, url, query } = await env.CTX.fetch(req).then(res => res.json())
    
    const [ action, language = 'typescript', name = 'Northwind', target = 'json.fyi/northwind.json' ] = pathSegments
    const jsonString = await fetch('http://' + target).then(res => res.text())
    
    const data = await quicktypeJSON(
      language,
      name,
      jsonString
    ).catch(console.log)
    
    const codeLines = data.lines
    const code = codeLines.join('\n')
    const codeFile = 'https://schema.do/file' + pathname + search

    if (action == 'file') return new Response(code, { headers: { 'content-type': 'application/javascript; charset=utf-8' }})
    
    return new Response(JSON.stringify({ api, url, pathSegments, pathOptions, codeFile, codeLines, code, user }, null, 2), { headers: { 'content-type': 'application/json; charset=utf-8' }})
  },
}



// const {
//   quicktype,
//   InputData,
//   jsonInputForTargetLanguage,
//   JSONSchemaInput,
//   FetchingJSONSchemaStore,
// } = require("quicktype-core");

// async function quicktypeJSON(targetLanguage, typeName, jsonString) {
//   const jsonInput = jsonInputForTargetLanguage(targetLanguage);

//   // We could add multiple samples for the same desired
//   // type, or many sources for other types. Here we're
//   // just making one type from one piece of sample JSON.
//   await jsonInput.addSource({
//     name: typeName,
//     samples: [jsonString],
//   });

//   const inputData = new InputData();
//   inputData.addInput(jsonInput);

//   return await quicktype({
//     inputData,
//     lang: targetLanguage,
//   });
// }

// async function quicktypeJSONSchema(targetLanguage, typeName, jsonSchemaString) {
//   const schemaInput = new JSONSchemaInput(new FetchingJSONSchemaStore());

//   // We could add multiple schemas for multiple types,
//   // but here we're just making one type from JSON schema.
//   await schemaInput.addSource({ name: typeName, schema: jsonSchemaString });

//   const inputData = new InputData();
//   inputData.addInput(schemaInput);

//   return await quicktype({
//     inputData,
//     lang: targetLanguage,
//   });
// }

// async function main() {
//   const { lines: swiftPerson } = await quicktypeJSON(
//     "swift",
//     "Person",
//     jsonString
//   );
//   console.log(swiftPerson.join("\n"));

//   const { lines: pythonPerson } = await quicktypeJSONSchema(
//     "python",
//     "Person",
//     jsonSchemaString
//   );
//   console.log(pythonPerson.join("\n"));
// }

// main();
