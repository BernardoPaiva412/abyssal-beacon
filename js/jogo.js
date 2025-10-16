/// <reference path="../node_modules/phaser/types/phaser.d.ts" />

// =================================================================
// 1. REGISTRO DE EVENTOS GLOBAL
// =================================================================
const EventBus = new Phaser.Events.EventEmitter();


// =================================================================
// 2. CENA DO TÍTULO (Menu Principal)
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
        
        startButton.on('pointerover', () => { startButton.setBackgroundColor('#008f8f'); });
        startButton.on('pointerout', () => { startButton.setBackgroundColor('#005f5f'); });

        startButton.on('pointerdown', () => {
            this.scene.start('GameScene');
            this.scene.launch('UIScene');
        });
    }
}


// =================================================================
// 3. CENA PRINCIPAL DO JOGO
// =================================================================
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.robo;
        this.teclas;
        this.reator;
        this.torres;
        this.inimigos;
        this.projeteis;
        this.recursos = 100;
        this.ondaAtual = 0;
        this.inimigosPorOnda = 5;
        this.inimigosRestantes = 0;
        this.isGameOver = false;
    }
    
    create() {
        this.isGameOver = false;

        // --- ELEMENTOS ---
        this.reator = this.physics.add.sprite(400, 300, null).setImmovable(true).setVisible(false);
        this.reator.body.setCircle(30);
        this.add.graphics({ fillStyle: { color: 0x00ffff } }).fillCircle(this.reator.x, this.reator.y, 30);
        this.reator.setData('vida', 10);
        
        this.robo = this.physics.add.sprite(100, 300, null).setCollideWorldBounds(true).setTint(0x00ff00);
        this.teclas = this.input.keyboard.createCursorKeys();

        // --- GRUPOS ---
        this.torres = this.physics.add.group();
        this.inimigos = this.physics.add.group();
        this.projeteis = this.physics.add.group();
        
        // --- COLISÕES ---
        this.physics.add.collider(this.inimigos, this.reator, this.danoNoReator, null, this);
        this.physics.add.overlap(this.projeteis, this.inimigos, this.acertarInimigo, null, this);
        
        // --- SISTEMA DE DEFESA ---
        this.input.on('pointerdown', (pointer) => {
            if (!this.isGameOver && this.recursos >= 50) {
                this.criarTorre(pointer.x, pointer.y);
                this.recursos -= 50;
                EventBus.emit('recursosMudou', this.recursos);
            }
        });
        
        // --- INICIAR JOGO ---
        EventBus.emit('recursosMudou', this.recursos);
        EventBus.emit('vidaMudou', this.reator.getData('vida'));
        this.proximaOnda();
    }
    
    update(time, delta) {
        if (this.isGameOver) return;

        this.robo.setVelocity(0);
        const velocidadeRobo = 200;
        if (this.teclas.left.isDown) { this.robo.setVelocityX(-velocidadeRobo); }
        else if (this.teclas.right.isDown) { this.robo.setVelocityX(velocidadeRobo); }
        if (this.teclas.up.isDown) { this.robo.setVelocityY(-velocidadeRobo); }
        else if (this.teclas.down.isDown) { this.robo.setVelocityY(velocidadeRobo); }

        this.torres.getChildren().forEach(torre => {
            if (time > (torre.getData('ultimoTiro') || 0) + 1000) {
                this.torreAtira(torre, time);
            }
        });

        // ======================= CORREÇÃO PRINCIPAL AQUI =======================
        // A lógica de sincronização visual, mais segura e eficiente.
        this.inimigos.getChildren().forEach(inimigo => {
            let visual = inimigo.getData('visual');
            if (visual) {
                visual.setPosition(inimigo.x, inimigo.y);
            }
        });
        // ======================================================================
    }
    
    criarTorre(x, y) {
        let torre = this.torres.create(x, y, null).setVisible(false).setImmovable(true);
        torre.body.setCircle(15);
        this.add.graphics({ fillStyle: { color: 0x8080ff } }).fillCircle(x, y, 15);
        torre.setData('ultimoTiro', 0); 
    }
    
    torreAtira(torre, time) {
        let inimigoProximo = this.physics.closest(torre, this.inimigos.getChildren());
        if (inimigoProximo && Phaser.Math.Distance.Between(torre.x, torre.y, inimigoProximo.x, inimigoProximo.y) < 200) {
            let projetil = this.projeteis.create(torre.x, torre.y, null);
            projetil.body.setCircle(5);
            
            // Atribuir o visual diretamente ao objeto e não recriar.
            let visual = this.add.graphics({ fillStyle: { color: 0xffff00 } }).fillCircle(0, 0, 5);
            projetil.setData('visual', visual);

            // Anexar e mover. Acompanhamento automático na engine de física.
            visual.setPosition(projetil.x, projetil.y);

            this.physics.moveToObject(projetil, inimigoProximo, 300);
            torre.setData('ultimoTiro', time);
        }
    }
    
    acertarInimigo(projetil, inimigo) {
        // CORREÇÃO: Destrói o visual junto com o físico
        if (projetil.getData('visual')) projetil.getData('visual').destroy();
        projetil.destroy();

        if (inimigo.getData('visual')) inimigo.getData('visual').destroy();
        inimigo.destroy();
        
        this.recursos += 10;
        EventBus.emit('recursosMudou', this.recursos);

        if (this.inimigos.countActive(true) === 0) {
            this.proximaOnda();
        }
    }
    
    danoNoReator(reator, inimigo) {
        if (inimigo.getData('visual')) inimigo.getData('visual').destroy();
        inimigo.destroy();

        let vidaAtual = reator.getData('vida') - 1;
        reator.setData('vida', vidaAtual);
        EventBus.emit('vidaMudou', vidaAtual);

        this.cameras.main.flash(250, 255, 0, 0);

        if (vidaAtual <= 0) { this.gameOver(true); }

        if (this.inimigos.countActive(true) === 0) {
            this.proximaOnda();
        }
    }
    
    proximaOnda() {
        if (this.ondaAtual >= 5) {
            this.gameOver(false);
            return;
        }
        this.ondaAtual++;
        this.inimigosPorOnda += 3;
        
        EventBus.emit('ondaMudou', this.ondaAtual);

        for (let i = 0; i < this.inimigosPorOnda; i++) {
            let x = Math.random() < 0.5 ? -20 : 820;
            let y = Phaser.Math.Between(0, 600);
            let inimigo = this.inimigos.create(x, y, null).setVisible(false);
            inimigo.body.setCircle(15);
            let visual = this.add.graphics({ fillStyle: { color: 0xff0000 } }).fillCircle(0, 0, 15);
            visual.setPosition(x, y); // Garante a posição inicial correta
            inimigo.setData('visual', visual);
            this.physics.moveToObject(inimigo, this.reator, 40 + (this.ondaAtual * 5));
        }
    }
    
    gameOver(perdeu) {
        this.isGameOver = true;
        this.scene.stop('UIScene');
        this.physics.pause();
        this.robo.clearTint().setTint(0xff0000);

        const mensagem = perdeu ? 'GAME OVER' : 'VITÓRIA!';
        const cor = perdeu ? '#ff0000' : '#00ff00';
        this.add.text(400, 300, mensagem, { fontSize: '64px', fill: cor }).setOrigin(0.5);
        
        let restartButton = this.add.text(400, 400, 'Voltar ao Menu', { fontSize: '32px', fill: '#ffffff' }).setOrigin(0.5).setInteractive();
        restartButton.on('pointerdown', () => this.scene.start('TitleScene'));
    }
}


// =================================================================
// 4. CENA DA INTERFACE DO USUÁRIO (UI)
// =================================================================
class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
    }

    create() {
        this.recursosText = this.add.text(10, 10, 'Recursos: 100', { fontSize: '24px', fill: '#ffff00' });
        this.vidaReatorText = this.add.text(10, 40, 'Vida do Reator: 10', { fontSize: '24px', fill: '#00ffff' });
        this.ondaText = this.add.text(650, 10, 'Onda: 1', { fontSize: '24px', fill: '#ff8000' });
        
        EventBus.on('recursosMudou', (valor) => this.recursosText.setText(`Recursos: ${valor}`), this);
        EventBus.on('vidaMudou', (valor) => this.vidaReatorText.setText(`Vida do Reator: ${valor}`), this);
        EventBus.on('ondaMudou', (valor) => this.ondaText.setText(`Onda: ${valor}`), this);
        
        // Limpar eventos quando a cena é desligada para evitar vazamento de memória
        this.events.on('shutdown', () => {
            EventBus.off('recursosMudou');
            EventBus.off('vidaMudou');
            EventBus.off('ondaMudou');
        });
    }
}


// =================================================================
// 5. CONFIGURAÇÃO FINAL E INICIALIZAÇÃO DO JOGO
// =================================================================
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#000020',
    physics: {
        default: 'arcade',
        arcade: { gravity: { x: 0, y: 0 }, debug: false }
    },
    scene: [TitleScene, GameScene, UIScene]
};

const game = new Phaser.Game(config);