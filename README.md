# repo-template

Template de repositorio com a politica padrao de dependencias, CI e auto-merge
da conta `mvnulman`.

## Como usar

1. Crie o repositorio a partir deste template (botao **Use this template**).
2. O workflow `CI` roda em pull requests e executa install/build/test.
3. O sweep diario de `mvnulman/repo-policy` detecta o stack e atualiza o
   `.github/dependabot.yml` com os ecossistemas corretos.

## O que vem incluído

- `.github/dependabot.yml` com updates de GitHub Actions.
- `.github/workflows/ci.yml` com CI universal (Node/Python/monorepo) e
  auto-merge de patch, minor e major do Dependabot apos o CI.
- `.gitignore` basico.

## Observações

- O auto-merge cobre patch, minor e major; todos passam por install/build.
- Testes sao advisory por padrao; defina `ENFORCE_TESTS=true` no repo para
  bloquear o merge quando os testes falharem.
- Configuracoes do repositorio (alerts, security updates, allow_auto_merge) nao
  sao copiadas pelo template; o sweep do `repo-policy` aplica via API.
