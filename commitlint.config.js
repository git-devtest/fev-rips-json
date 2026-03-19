module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [2, 'always', [
      'config','db','seed','migrate','docker',
      'api','auth','middleware','models','routes','services','utils',
      'usuarios','consultas','procedimientos','medicamentos','otros-servicios',
      'urgencias','hospitalizacion','recien-nacidos','facturas','rips','validator','excel',
      'ui','forms','shared','docs','ci','release'
    ]],
    'type-enum': [2, 'always', ['build','chore','ci','docs','feat','fix','perf','refactor','revert','style','test']],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-max-length': [2, 'always', 100],
  }
};