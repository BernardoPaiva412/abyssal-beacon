/// <reference path="../node_modules/phaser/types/phaser.d.ts" />

// =================================================================
// 1. CONFIGURAÇÃO DO JOGO
// =================================================================

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#000020', // Um azul escuro abissal
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false // Mude para 'true' para ver os colisores
        }
    },
    // NOVO! Dividimos o jogo em "Cenas" para organizar o código.
    // 'GameScene' é a cena principal onde o jogo acontece.
    // 'UIScene' é uma cena que roda *por cima* da GameScene para mostrar a UI.
    scene: [TitleScene, GameScene, UIScene]
};

// =================================================================
// 2. VARIÁVEIS GLOBAIS E CONSTANTES
// =================================================================

let robo;
let teclas;
let reator;
let torres;
let inimigos;
let projeteis;

let recursos = 100; // Recurso inicial
const CUSTO_TORRE = 50;

// Variáveis para o sistema de ondas
let ondaAtual = 0;
let inimigosPorOnda = 5;
let inimigosRestantes;

// Acesso à cena da UI para podermos atualizá-la
let uiScene;

// =================================================================
// 3. CENA DO TÍTULO (Menu Principal) - Tarefa 4.2
// =================================================================
class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TitleScene' });
    }

    create() {
        this.add.text(400, 200, 'ABYSSAL BEACON', {
            fontSize: '50px',
            fill: '#00ffff',
            fontFamily: 'Arial Black'
        }).setOrigin(0.5);

        let startButton = this.add.text(400, 350, 'INICIAR MISSÃO', {
            fontSize: '32px',
            fill: '#ffffff',
            backgroundColor: '#005f5f',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();

        // Efeito de hover no botão
        startButton.on('pointerover', () => { startButton.setBackgroundColor('#008f8f'); });
        startButton.on('pointerout', () => { startButton.setBackgroundColor('#005f5f'); });

        // Ao clicar, inicia o jogo
        startButton.on('pointerdown', () => {
            // Reinicia as variáveis globais antes de começar
            recursos = 100;
            ondaAtual = 0;
            this.scene.start('GameScene');
            this.scene.start('UIScene');
        });
    }
}


// =================================================================
// 4. CENA PRINCIPAL DO JOGO (onde toda a ação acontece)
// =================================================================
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // Futuramente, carregaríamos imagens aqui.
    }

    create() {
        // --- PREPARAÇÃO DA CENA ---
        uiScene = this.scene.get('UIScene'); // Obtém a referência da cena de UI

        // --- CRIAÇÃO DOS ELEMENTOS DO JOGO ---
        reator = this.physics.add.sprite(400, 300, null)
            .setImmovable(true)
            .setVisible(false);
        reator.body.setCircle(30);
        this.add.graphics({ fillStyle: { color: 0x00ffff } }).fillCircle(reator.x, reator.y, 30);
        // NOVO! O reator agora tem vida.
        reator.setData('vida', 10);
        uiScene.updateVidaReator(reator.getData('vida'));

        robo = this.physics.add.sprite(100, 300, null);
        robo.setCollideWorldBounds(true);
        robo.setTint(0x00ff00);

        teclas = this.input.keyboard.createCursorKeys();

        // --- CRIAÇÃO DOS GRUPOS ---
        // Grupos são formas eficientes de gerenciar múltiplos objetos do mesmo tipo.
        torres = this.physics.add.group();
        inimigos = this.physics.add.group();
        projeteis = this.physics.add.group();

        // --- CONFIGURAÇÃO DAS COLISÕES ---
        this.physics.add.collider(inimigos, reator, this.danoNoReator, null, this);
        this.physics.add.overlap(projeteis, inimigos, this.acertarInimigo, null, this);

        // --- SISTEMA DE DEFESA --- - Tarefa 1.3
        // 'pointerdown' é o evento de clique do mouse.
        this.input.on('pointerdown', (pointer) => {
            if (recursos >= CUSTO_TORRE) {
                this.criarTorre(pointer.x, pointer.y);
                recursos -= CUSTO_TORRE;
                uiScene.updateRecursos(recursos);
            }
        });

        // --- INICIAR JOGO ---
        this.proximaOnda();
    }

    update(time, delta) {
        // O `time` nos dá o tempo total de jogo, `delta` é o tempo desde o último frame.

        // --- LÓGICA DO ROBÔ ---
        robo.setVelocity(0);
        const velocidadeRobo = 200;
        if (teclas.left.isDown) { robo.setVelocityX(-velocidadeRobo); }
        else if (teclas.right.isDown) { robo.setVelocityX(velocidadeRobo); }
        if (teclas.up.isDown) { robo.setVelocityY(-velocidadeRobo); }
        else if (teclas.down.isDown) { robo.setVelocityY(velocidadeRobo); }

        // --- LÓGICA DAS TORRES (ATIRAR) ---
        // Itera sobre todas as torres ativas no grupo.
        torres.getChildren().forEach(torre => {
            // As torres atiram a cada 1 segundo (1000ms).
            if (time > (torre.getData('ultimoTiro') || 0) + 1000) {
                this.torreAtira(torre, time);
            }
        });

        // Se todos os inimigos da onda foram derrotados, chama a próxima.
        if (inimigosRestantes <= 0) {
            this.proximaOnda();
        }
    }

    // --- FUNÇÕES AUXILIARES DA CENA ---

    criarTorre(x, y) {
        let torre = torres.create(x, y, null).setVisible(false);
        torre.body.setCircle(15);
        torre.setImmovable(true);
        this.add.graphics({ fillStyle: { color: 0x8080ff } }).fillCircle(x, y, 15);
        // 'ultimoTiro' guarda o tempo do último disparo para controlar a cadência.
        torre.setData('ultimoTiro', 0);
    }

    torreAtira(torre, time) {
        // Encontra o inimigo mais próximo dentro do alcance de 200 pixels.
        let inimigoProximo = this.physics.closest(torre, inimigos.getChildren());

        if (inimigoProximo && Phaser.Math.Distance.Between(torre.x, torre.y, inimigoProximo.x, inimigoProximo.y) < 200) {
            let projetil = projeteis.create(torre.x, torre.y, null).setVisible(false);
            projetil.body.setCircle(5);
            this.add.graphics({ fillStyle: { color: 0xffff00 } }).fillCircle(projetil.x, projetil.y, 5);

            this.physics.moveToObject(projetil, inimigoProximo, 300); // Projéteis são rápidos!
            torre.setData('ultimoTiro', time);
        }
    }

    // Callback: Chamada quando um projétil acerta um inimigo.
    acertarInimigo(projetil, inimigo) {
        // .destroy() remove o objeto do jogo completamente.
        projetil.destroy();
        inimigo.destroy();

        // O robô coleta o "scrap" deixado pelo inimigo
        recursos += 10;
        uiScene.updateRecursos(recursos);

        inimigosRestantes--;
    }

    // Callback: Chamada quando um inimigo atinge o reator.
    danoNoReator(reator, inimigo) {
        inimigo.destroy(); // O inimigo é destruído no impacto.

        let vidaAtual = reator.getData('vida');
        vidaAtual--;
        reator.setData('vida', vidaAtual);
        uiScene.updateVidaReator(vidaAtual);

        // Animação de dano (piscar em vermelho)
        this.cameras.main.flash(250, 255, 0, 0);

        if (vidaAtual <= 0) {
            this.gameOver();
        }
    }

    // Sistema de Ondas - Tarefa 2.2
    proximaOnda() {
        if (ondaAtual >= 5) { // CONDIÇÃO DE VITÓRIA
            this.scene.stop('UIScene');
            this.add.text(400, 300, 'VITÓRIA!', { fontSize: '64px', fill: '#00ff00' }).setOrigin(0.5);
            this.physics.pause();
            return;
        }

        ondaAtual++;
        inimigosPorOnda += 3; // A dificuldade aumenta
        inimigosRestantes = inimigosPorOnda;

        uiScene.updateOnda(ondaAtual);

        // Cria os inimigos da nova onda em posições aleatórias nas bordas.
        for (let i = 0; i < inimigosPorOnda; i++) {
            let x = Math.random() < 0.5 ? 0 : 800; // Nasce na esquerda ou direita
            let y = Phaser.Math.Between(0, 600); // Em qualquer altura

            let inimigo = inimigos.create(x, y, null).setVisible(false);
            inimigo.body.setCircle(15);
            inimigo.setData('visual', this.add.graphics({ fillStyle: { color: 0xff0000 } }).fillCircle(x, y, 15));
            this.physics.moveToObject(inimigo, reator, 40 + (ondaAtual * 5)); // Inimigos ficam mais rápidos
        }
    }

    // Tela Final - Game Over - Tarefa 4.2
    gameOver() {
        this.scene.stop('UIScene');
        this.physics.pause();
        robo.clearTint().setTint(0xff0000);
        this.add.text(400, 300, 'GAME OVER', { fontSize: '64px', fill: '#ff0000' }).setOrigin(0.5);

        // Adiciona um botão para reiniciar
        let restartButton = this.add.text(400, 400, 'Tentar Novamente', {
            fontSize: '32px',
            fill: '#ffffff'
        }).setOrigin(0.5).setInteractive();

        restartButton.on('pointerdown', () => this.scene.start('TitleScene'));
    }
}


// =================================================================
// 5. CENA DA INTERFACE DO USUÁRIO (UI) - Tarefa 2.4
// =================================================================
class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
        this.recursosText;
        this.vidaReatorText;
        this.ondaText;
    }

    create() {
        // Exibe as informações na tela
        this.recursosText = this.add.text(10, 10, `Recursos: ${recursos}`, {
            fontSize: '24px',
            fill: '#ffff00'
        });

        this.vidaReatorText = this.add.text(10, 40, 'Vida do Reator: 10', {
            fontSize: '24px',
            fill: '#00ffff'
        });

        this.ondaText = this.add.text(650, 10, 'Onda: 0', {
            fontSize: '24px',
            fill: '#ff8000'
        });
    }

    // Funções que a GameScene pode chamar para atualizar o texto
    updateRecursos(valor) {
        this.recursosText.setText(`Recursos: ${valor}`);
    }

    updateVidaReator(valor) {
        this.vidaReatorText.setText(`Vida do Reator: ${valor}`);
    }

    updateOnda(valor) {
        this.ondaText.setText(`Onda: ${valor}`);
    }
}

const game = new Phaser.Game(config);