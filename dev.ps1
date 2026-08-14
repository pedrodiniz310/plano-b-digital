# Abre uma aba nova no Windows Terminal já dividida em 2 panes lado a lado:
# esquerda = backend (npm run dev), direita = app (npm run android).
# Uso: .\dev.ps1  (funciona de qualquer diretório, usa o caminho do próprio repo)

$root = $PSScriptRoot

wt -w 0 new-tab --title "PlanoB Backend" -d "$root\backend" pwsh -NoExit -Command "npm run dev" `; split-pane -V --title "PlanoB App" -d "$root\app" pwsh -NoExit -Command "npm run android"
