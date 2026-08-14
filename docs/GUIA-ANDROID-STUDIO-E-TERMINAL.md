# Guia: Android Studio, Expo e Windows Terminal

## Como este projeto usa o Android Studio

Este é um projeto React Native com Expo managed workflow. A pasta `app/` não
tem um projeto nativo Android (`android/`). Por isso:

- o Android Studio gerencia o Android Virtual Device (AVD) e o emulador;
- o Expo inicia o Metro Bundler e instala/abre o app;
- o ADB é a ponte que permite ao Expo encontrar o emulador.

Não use o botão verde **Run** do Android Studio para iniciar este projeto.

## Preparação inicial

1. Abra o Android Studio.
2. Abra `Tools > Device Manager`.
3. Inicie o AVD `Pixel_8` pelo botão ▶.
4. Aguarde o Android terminar de inicializar e chegar à tela inicial.
5. Em um terminal, confirme a conexão:

   ```powershell
   adb devices
   ```

   O resultado deve conter:

   ```text
   emulator-5554    device
   ```

Se o comando `adb` não estiver no PATH, use o caminho instalado pelo SDK:

```powershell
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" devices
```

## Iniciar o app

Na raiz do repositório:

```powershell
npm run dev:app
```

Quando o Metro Bundler estiver pronto, pressione `a` no mesmo terminal. O Expo
deve abrir `Plano B Digital` no AVD conectado.

Para executar o backend em paralelo, abra outra aba ou painel:

```powershell
npm run dev:backend
```

O script `dev.ps1` também abre backend e app em dois painéis:

```powershell
.\dev.ps1
```

## Dividir a tela no Windows

### Opção recomendada: emulador dentro do Android Studio

1. No Android Studio, abra `File > Settings > Tools > Emulator`.
2. Marque `Launch in the Running Devices tool window`.
3. Feche e reabra o AVD pelo Device Manager.
4. Deixe o Android Studio em uma metade da tela com `Win + Right`.
5. Deixe o Windows Terminal na outra metade com `Win + Left`.

O celular aparecerá dentro do painel **Running Devices** do Android Studio.

### Opção alternativa: emulador em janela separada

Para usar o emulador como janela independente, desmarque `Launch in the Running
Devices tool window`. Depois:

1. feche a janela **Extended Controls**, se ela estiver aberta;
2. mantenha `Emulator always on top` desligado;
3. abra o emulador pelo Device Manager;
4. arraste a janela para a direita ou use `Win + Right`;
5. selecione o Windows Terminal e use `Win + Left`.

O emulador mantém uma proporção vertical de celular, então a área visível pode
ficar mais estreita que exatamente 50% da tela. Isso é normal.

## Diagnóstico rápido

### `No Android connected device found`

O Expo está funcionando, mas o ADB não encontrou o emulador. Verifique:

```powershell
adb devices
```

Se a lista estiver vazia, inicie o `Pixel_8` no Device Manager e aguarde o boot.

Se aparecer `offline`, aguarde alguns segundos e execute novamente. Se persistir:

```powershell
adb kill-server
adb start-server
adb devices
```

Se o AVD não iniciar pelo Android Studio, liste os AVDs instalados:

```powershell
& "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe" -list-avds
```

Inicie o `Pixel_8` sem bloquear o terminal:

```powershell
Start-Process `
  "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe" `
  -ArgumentList "-avd", "Pixel_8"
```

Depois repita `adb devices` e pressione `a` no terminal do Expo.

### O app abre no Expo Go, mas não atualiza

Confirme se o Metro continua rodando. No terminal do Expo:

- `r`: recarrega o app;
- `m`: abre o menu do Expo;
- `j`: abre o debugger;
- `?`: mostra todos os comandos.

### O terminal mostra `Export-Clixml Access denied`

Esse aviso vem do perfil do PowerShell ou do Terminal-Icons tentando salvar
preferências. Ele não é um erro do Expo, do ADB ou do app. O diagnóstico do
projeto deve ser feito pelos comandos do próprio projeto e pelo `adb devices`.

## Ciclo recomendado de desenvolvimento

```text
1. iniciar o AVD
2. confirmar adb devices
3. iniciar npm run dev:app
4. pressionar a
5. editar o código
6. pressionar r para recarregar
7. executar npm run check e npm test antes de encerrar
```
