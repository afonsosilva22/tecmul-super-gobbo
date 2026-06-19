# Super Gobbo

<div align="center">
  <img src="https://github.com/afonsosilva22/tecmul-super-gobbo/blob/main/images/gobboScreen.png?raw=true" width="700">
</div>

## Grupo: 
Afonso Silva, nº 33276

Guilherme Maciel, nº 33245

## Versão do Phaser: 
3.90, esta versão do Phaser foi incluída diretamente no projeto, no ficheiro index.html, com a linha:

```<script src="https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.min.js"></script>```

## Descrição do jogo:
O Super Gobbo, é um jogo do gênero Platformer, em que o objetivo é chegar ao fim dos dois mapas.

Ao abrir o jogo somos deparados com um menu inicial, neste temos as opções de:
- iniciar o jogo, o que inicializa a cena do jogo;
- ver as opções, o que permite mudar a linguagem do jogo e alterar o volume do som e efeitos sonoros;
- ver os controlos, o que demonstra os controlos do jogo;
- sair do jogo.

<div align="center">
  <img src="https://github.com/afonsosilva22/tecmul-super-gobbo/blob/main/images/startScreen.png?raw=true" width="700">
</div>

Quando o jogo é iniciado, podemos ver um mapa com o nosso jogador (Gobbo), que podemos controlar, também inimigos roxos, que caso estejam perto o suficiente do Gobbo, o iram tentar perseguir e atacar. Os inimigos têm uma barra de vida e podem ser mortos pelo Gobbo, utilizando o seu ataque de espada, igualmente o Gobbo também pode morrer se sofrer muito dano dos inimigos.

A UI do jogo apresenta na esquerda uma barra de vida do Gobbo. No centro um timer de 3 minutos, que caso acabe é apresentado o ecrã de Game Over. Na direita temos um botão de pausa, que nos leva a um menu de pause, que tem as mesmas funcionalidades do menu inicial.

Caso o jogador morra, é lhe apresentado um ecrã de Game Over, caso chegue ao final do 1º mapa, é transportado para o 2º mapa, caso chegue ao final deste, o jogo termina e é apresentado o tempo que o jogador demorou a percorrer o jogo.

<div align="center">
  <img src="https://github.com/afonsosilva22/tecmul-super-gobbo/blob/main/images/gameOverScreen.png?raw=true" width="700">
</div>

## Jogabilidade:
- movimento lateral, através das setas;
- salto, através da seta para cima;
- escalar vinhas, através da seta para cima;
- 2 tipos de ataque com espada, através do botão esquerdo e direito do rato;
- empurrar caixas, através do botão E.

<div align="center">
  <img src="https://github.com/afonsosilva22/tecmul-super-gobbo/blob/main/images/howToScreen.png?raw=true" width="700">
</div>

## Como executar:

1. Clonar o repositório;
2. Abrir no Visual Studio Code;
3. Instalar o Plugin Live Server;
4. Clicar no botão "Go Live", no canto inferior direito;

## Github Pages

Opcionalmente, como o jogo está deployed no Github Pages, podemos simplesmente abrí-lo no seguinte link: https://afonsosilva22.github.io/tecmul-super-gobbo/

## Assets multimédia:

### Imagens - Spritesheets

**Personagem Principal (Gobbo)**
- `Gobbo_Idle_4.png` - 32x32px, 4 frames
- `Gobbo_Walk_6.png` - 32x32px, 6 frames
- `Gobbo_Run_6.png` - 32x32px, 6 frames
- `Gobbo_Jump_8.png` - 32x32px, 8 frames
- `Gobbo_Climb_4.png` - 32x32px, 4 frames
- `Gobbo_Push_6.png` - 32x32px, 6 frames
- `Gobbo_Attack1.png` - 42x42px, 6 frames
- `Gobbo_Attack2.png` - 42x42px, 6 frames

**Inimigos**
- `enemy1_idle.png` - 128x128px
- `enemy1_walk.png` - 128x128px
- `enemy1_attack1.png` - 128x128px
- `Hurt.png` - 128x128px
- `Dead.png` - 128x128px

**Tilesets e Backgrounds**
- `Tilesheet - WOODS.png` - Tileset principal da floresta
- `WOODS - Second.png` - Camada de background paralax
- `WOODS - Third.png` - Segunda camada de background paralax
- `BACKGROUND.png` - Decorações de fundo
- `BUSH - BACKGROUND.png` - Arbustos decorativos
- `vine.png`, `vine2.png`, `vine_tip.png` - Vinhas para trepar

A origem destes assets é do seguinte website: https://craftpix.net/all-game-assets/

### Áudio

- `background.mp3` - Música de fundo em loop (3.1 MB)
- `walkSound.wav` - Som de passos (408 KB)
- `runSound.flac` - Som de corrida/sprint (991 KB)
- `jumpFX.wav` - Efeito de salto (26 KB)
- `swordFX.wav` - Efeito de ataque (192 KB)

**Justificação**: MP3 para música de background e WAV e FLAC para efeitos sonoros curtos. Pois o formato .mp3 usa compressão com perdas, o que diminui o tamanho do ficheiro mas perde alguma qualidade de som. Já o .wav e .flac, como estes são áudios mais curtos não vão ocupar muito espaço, logo podemos usar estes formatos de forma a fornecer melhor qualidade de som.

### Mapas

- `Mapa1.tmj` - Mapa 1 em formato Tiled JSON (54.9 KB)
- `Mapa2BlackForest.tmj` - Mapa 2 em formato Tiled JSON (400.7 KB)
- `vine.tsx`, `vines2.tsx`, `vinetip.tsx` - Definições de tilesets
