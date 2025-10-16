/// <reference path="../node_modules/phaser/types/phaser.d.ts" />

// =================================================================
// 1. EVENTBUS
// =================================================================
const EventBus = new Phaser.Events.EventEmitter();

// =================================================================
// 2. DEFINIÇÃO DAS CENAS
// =================================================================

class TitleScene extends Phaser.Scene {
    constructor() { super({ key: 'TitleScene' }); }
    create() {
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 200, 'ABYSSAL BEACON', { fontSize: '50px', fill: '#00ffff', fontFamily: 'Arial Black' }).setOrigin(0.5);

        let storyButton = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 50, 'HISTÓRIA', { fontSize: '32px', fill: '#ffffff', backgroundColor: '#4a0080', padding: { x: 20, y: 10 } }).setOrigin(0.5).setInteractive();
        storyButton.on('pointerover', () => storyButton.setBackgroundColor('#6d00ba')).on('pointerout', () => storyButton.setBackgroundColor('#4a0080'));
        storyButton.on('pointerdown', () => this.scene.launch('StoryScene'));

        let tutorialButton = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 50, 'COMO JOGAR', { fontSize: '32px', fill: '#ffffff', backgroundColor: '#006994', padding: { x: 20, y: 10 } }).setOrigin(0.5).setInteractive();
        tutorialButton.on('pointerover', () => tutorialButton.setBackgroundColor('#008cbf')).on('pointerout', () => tutorialButton.setBackgroundColor('#006994'));
        tutorialButton.on('pointerdown', () => this.scene.launch('TutorialScene'));

        let startButton = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 150, 'INICIAR MISSÃO', { fontSize: '32px', fill: '#ffffff', backgroundColor: '#005f5f', padding: { x: 20, y: 10 } }).setOrigin(0.5).setInteractive();
        startButton.on('pointerover', () => startButton.setBackgroundColor('#008f8f')).on('pointerout', () => startButton.setBackgroundColor('#005f5f'));
        startButton.on('pointerdown', () => { this.scene.start('GameScene'); this.scene.launch('UIScene'); });
    }
}

class StoryScene extends Phaser.Scene {
    constructor() { super({ key: 'StoryScene' }); }
    create() {
        this.add.rectangle(this.cameras.main.centerX, this.cameras.main.centerY, 800, 600, 0x000000, 0.9);
        const storyText = `Num futuro distante, no planeta oceânico Gliese-581g, a humanidade instalou o Farol Abissal. Este farol é, na verdade, um estabilizador geo-climático, vital para manter o delicado equilíbrio de temperatura e salinidade do ecossistema local.\n\nRecentemente, devido a flutuações energéticas, o Farol começou a falhar. O pulso de energia instável que ele agora emite está agitando a fauna nativa – criaturas bioluminescentes que são atraídas e enlouquecidas pela anomalia.\n\nVocê controla a UAR-01, uma Unidade Autônoma de Reparo. Sua missão não é destruir a vida local, mas protegê-la. Use torres de contenção sônica para dispersar as criaturas e proteger o Farol enquanto ele recarrega.\n\nEste jogo é uma alegoria sobre como a ciência e a tecnologia são nossas ferramentas para monitorar e proteger os frágeis ecossistemas oceânicos contra os efeitos de desequilíbrios – as "mudanças climáticas" em nosso território cósmico.`;
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 50, storyText, { fontSize: '18px', fill: '#ffffff', align: 'center', wordWrap: { width: 600 } }).setOrigin(0.5);
        let backButton = this.add.text(this.cameras.main.centerX, 550, 'Voltar', { fontSize: '32px', fill: '#ffffff', backgroundColor: '#8c0000', padding: { x: 20, y: 10 } }).setOrigin(0.5).setInteractive();
        backButton.on('pointerover', () => backButton.setBackgroundColor('#a80000')).on('pointerout', () => backButton.setBackgroundColor('#8c0000'));
        backButton.on('pointerdown', () => this.scene.stop());
    }
}

class TutorialScene extends Phaser.Scene {
    constructor() { super({ key: 'TutorialScene' }); }
    create() {
        this.add.rectangle(this.cameras.main.centerX, this.cameras.main.centerY, 800, 600, 0x000000, 0.9);
        this.add.text(this.cameras.main.centerX, 80, 'COMO JOGAR', { fontSize: '40px', fill: '#00ffff', fontFamily: 'Arial Black' }).setOrigin(0.5);
        const tutorialText = `OBJETIVO:\nProteja o Farol azul no centro. Sobreviva a 15 ondas de criaturas para vencer.\n\nCONTROLES:\n- Mover Robô: Teclas W, A, S, D ou Setas.\n- Construir Torre: Clique Esquerdo do Mouse.\n- Pausar o Jogo: Tecla ESC.\n\nCOMO FUNCIONA:\n1. Torres atiram nas criaturas vermelhas.\n2. Criaturas destruídas deixam um SCRAP amarelo.\n3. Mova seu robô sobre o SCRAP para coletar Recursos (5 por coleta).\n4. Use os Recursos para construir mais torres (custo: 50).`;
        this.add.text(this.cameras.main.centerX, 300, tutorialText, { fontSize: '17px', fill: '#ffffff', align: 'left', lineSpacing: 10 }).setOrigin(0.5);
        let backButton = this.add.text(this.cameras.main.centerX, 550, 'Entendi!', { fontSize: '32px', fill: '#ffffff', backgroundColor: '#008000', padding: { x: 20, y: 10 } }).setOrigin(0.5).setInteractive();
        backButton.on('pointerover', () => backButton.setBackgroundColor('#00a000')).on('pointerout', () => backButton.setBackgroundColor('#008000'));
        backButton.on('pointerdown', () => this.scene.stop());
    }
}

class GameOverScene extends Phaser.Scene {
    constructor() { super({ key: 'GameOverScene' }); }
    init(data) { this.ondaFinal = data.onda; }
    create() {
        this.add.rectangle(this.cameras.main.centerX, this.cameras.main.centerY, 800, 600, 0x000000, 0.7);
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 100, 'FALHA NA MISSÃO', { fontSize: '64px', fill: '#ff0000', fontFamily: 'Arial Black' }).setOrigin(0.5);
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 20, `Você alcançou a Onda: ${this.ondaFinal}`, { fontSize: '28px', fill: '#ffffff' }).setOrigin(0.5);
        let restartButton = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 100, 'Tentar Novamente', { fontSize: '32px', fill: '#ffffff', backgroundColor: '#8c0000', padding: { x: 20, y: 10 } }).setOrigin(0.5).setInteractive();
        restartButton.on('pointerover', () => restartButton.setBackgroundColor('#a80000')).on('pointerout', () => restartButton.setBackgroundColor('#8c0000'));
        restartButton.on('pointerdown', () => this.scene.start('TitleScene'));
    }
}

class WinScene extends Phaser.Scene {
    constructor() { super({ key: 'WinScene' }); }
    create() {
        this.add.rectangle(this.cameras.main.centerX, this.cameras.main.centerY, 800, 600, 0x000000, 0.7);
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 100, 'MISSÃO CUMPRIDA!', { fontSize: '64px', fill: '#00ff00', fontFamily: 'Arial Black' }).setOrigin(0.5);
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 20, 'O Farol Abissal foi reativado. \nO ecossistema está seguro.', { fontSize: '28px', fill: '#ffffff', align: 'center' }).setOrigin(0.5);
        let menuButton = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 100, 'Voltar ao Menu Principal', { fontSize: '32px', fill: '#ffffff', backgroundColor: '#008000', padding: { x: 20, y: 10 } }).setOrigin(0.5).setInteractive();
        menuButton.on('pointerover', () => menuButton.setBackgroundColor('#00a000')).on('pointerout', () => menuButton.setBackgroundColor('#008000'));
        menuButton.on('pointerdown', () => this.scene.start('TitleScene'));
    }
}

class PauseScene extends Phaser.Scene {
    constructor() { super({ key: 'PauseScene' }); }
    create() {
        this.add.rectangle(this.cameras.main.centerX, this.cameras.main.centerY, 800, 600, 0x000000, 0.7);
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 100, 'JOGO PAUSADO', { fontSize: '48px', fill: '#ffffff', fontFamily: 'Arial Black' }).setOrigin(0.5);
        let resumeButton = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Continuar', { fontSize: '32px', fill: '#ffffff', backgroundColor: '#005f5f', padding: { x: 20, y: 10 } }).setOrigin(0.5).setInteractive();
        resumeButton.on('pointerover', () => resumeButton.setBackgroundColor('#008f8f')).on('pointerout', () => resumeButton.setBackgroundColor('#005f5f'));
        resumeButton.on('pointerdown', () => { this.scene.stop(); this.scene.resume('GameScene'); this.scene.resume('UIScene'); });
        let menuButton = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 100, 'Sair para o Menu', { fontSize: '32px', fill: '#ffffff', backgroundColor: '#8c0000', padding: { x: 20, y: 10 } }).setOrigin(0.5).setInteractive();
        menuButton.on('pointerover', () => menuButton.setBackgroundColor('#a80000')).on('pointerout', () => menuButton.setBackgroundColor('#8c0000'));
        menuButton.on('pointerdown', () => { this.scene.stop('GameScene'); this.scene.stop('UIScene'); this.scene.start('TitleScene'); });
    }
}

class UIScene extends Phaser.Scene {
    constructor() { super({ key: 'UIScene' }); }
    create() {
        this.recursosText = this.add.text(10, 10, 'Recursos: 100', { fontSize: '24px', fill: '#ffff00' });
        this.vidaReatorText = this.add.text(10, 40, 'Vida do Reator: 10', { fontSize: '24px', fill: '#00ffff' });
        this.ondaText = this.add.text(650, 10, 'Onda: 1', { fontSize: '24px', fill: '#ff8000' });
        EventBus.on('recursosMudou', (valor) => this.recursosText.setText(`Recursos: ${valor}`), this);
        EventBus.on('vidaMudou', (valor) => this.vidaReatorText.setText(`Vida do Reator: ${valor}`), this);
        EventBus.on('ondaMudou', (valor) => this.ondaText.setText(`Onda: ${valor}`), this);
        this.events.on('shutdown', () => { EventBus.removeAllListeners(); });
    }
}

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        // ...declarações de variáveis...
    }

    // ----------- NOVO: FUNÇÃO PRELOAD PARA CARREGAR AS IMAGENS -----------
    preload() {
        console.log("Carregando assets...");
        this.load.image('robo', 'images/robo.png');
        this.load.image('reator', 'images/reator.png');
        this.load.image('criatura', 'images/criatura.png');
        this.load.image('torre', 'images/torre.png');
        this.load.image('scrap', 'images/scrap.png');
        // Para o projétil, vamos reutilizar a imagem do scrap e pintá-la
    }

    create() {
        this.isGameOver = false; this.recursos = 100; this.ondaAtual = 0; this.inimigosPorOnda = 5;

        // --- CRIAÇÃO DOS ELEMENTOS COM SPRITES ---
        // O reator agora é um sprite. Usamos setOrigin(0.5) para garantir que seu centro físico
        // seja o centro da imagem. Ajustamos o raio do círculo de colisão.
        this.reator = this.physics.add.sprite(400, 300, 'reator').setOrigin(0.5).setImmovable(true);
        this.reator.body.setCircle(40); // Raio de colisão ajustado para o tamanho do sprite
        this.reator.setData('vida', 10);

        // O robô agora usa a imagem 'robo'.
        this.robo = this.physics.add.sprite(100, 300, 'robo').setCollideWorldBounds(true);
        // Não precisamos mais do setTint verde, pois a imagem já tem cor.
        
        this.teclas = this.input.keyboard.addKeys({ up: 'W', down: 'S', left: 'A', right: 'D', arrowUp: 'UP', arrowDown: 'DOWN', arrowLeft: 'LEFT', arrowRight: 'RIGHT' });
        
        // Grupos permanecem os mesmos
        this.torres = this.physics.add.group();
        this.inimigos = this.physics.add.group();
        this.projeteis = this.physics.add.group();
        this.scraps = this.physics.add.group();
        
        this.physics.add.collider(this.inimigos, this.reator, this.danoNoReator, null, this);
        this.physics.add.overlap(this.projeteis, this.inimigos, this.acertarInimigo, null, this);
        this.physics.add.overlap(this.robo, this.scraps, this.coletarRecurso, null, this);

        this.input.on('pointerdown', (pointer) => {
            if (!this.isGameOver && this.recursos >= 50) {
                // Lógica de não sobrepor permanece a mesma, mas agora com corpos de sprites
                let podeConstruir = true;
                if (Phaser.Geom.Intersects.CircleToCircle(new Phaser.Geom.Circle(pointer.x, pointer.y, 25), this.reator.body)) {
                    podeConstruir = false;
                }
                this.torres.getChildren().forEach(torre => {
                    if (Phaser.Geom.Intersects.CircleToCircle(new Phaser.Geom.Circle(pointer.x, pointer.y, 25), torre.body)) {
                        podeConstruir = false;
                    }
                });

                if (podeConstruir) {
                    this.criarTorre(pointer.x, pointer.y);
                    this.recursos -= 50;
                    EventBus.emit('recursosMudou', this.recursos);
                }
            }
        });
        
        this.input.keyboard.on('keydown-ESC', () => { this.scene.pause(); this.scene.pause('UIScene'); this.scene.launch('PauseScene'); });
        EventBus.emit('recursosMudou', this.recursos); EventBus.emit('vidaMudou', this.reator.getData('vida'));
        this.proximaOnda();
    }

    update(time, delta) {
        if (this.isGameOver) return;
        
        this.robo.setVelocity(0);
        const velocidadeRobo = 200;
        if (this.teclas.left.isDown || this.teclas.arrowLeft.isDown) { this.robo.setVelocityX(-velocidadeRobo); }
        else if (this.teclas.right.isDown || this.teclas.arrowRight.isDown) { this.robo.setVelocityX(velocidadeRobo); }
        if (this.teclas.up.isDown || this.teclas.arrowUp.isDown) { this.robo.setVelocityY(-velocidadeRobo); }
        else if (this.teclas.down.isDown || this.teclas.arrowDown.isDown) { this.robo.setVelocityY(velocidadeRobo); }

        this.torres.getChildren().forEach(torre => { if (time > (torre.getData('ultimoTiro') || 0) + 1000) { this.torreAtira(torre, time); } });
        
        // O loop de sincronização visual foi REMOVIDO! O código está mais limpo.
        
        if (this.inimigos.countActive(true) === 0) {
            this.proximaOnda();
        }
    }

    // ----------- FUNÇÕES DE CRIAÇÃO E DESTRUIÇÃO ATUALIZADAS -----------

    criarTorre(x, y) {
        let torre = this.torres.create(x, y, 'torre').setImmovable(true);
        torre.body.setCircle(25); // Raio de colisão ajustado
        torre.setData('ultimoTiro', 0);
    }
    
    torreAtira(torre, time) {
        let inimigoProximo = this.physics.closest(torre, this.inimigos.getChildren());
        if (inimigoProximo && Phaser.Math.Distance.Between(torre.x, torre.y, inimigoProximo.x, inimigoProximo.y) < 200) {
            // O projétil usa o sprite do scrap, mas menor e pintado de amarelo
            let projetil = this.projeteis.create(torre.x, torre.y, 'scrap');
            projetil.setScale(0.5).setTint(0xffff00); // Metade do tamanho e amarelo
            projetil.body.setCircle(8); // Colisor pequeno
            this.physics.moveToObject(projetil, inimigoProximo, 300);
            torre.setData('ultimoTiro', time);
        }
    }

    acertarInimigo(projetil, inimigo) {
        if (!projetil.active || !inimigo.active) return;
        
        projetil.destroy(); // Simplesmente destruímos o sprite

        let vidaAtual = inimigo.getData('vida') - 1;
        inimigo.setData('vida', vidaAtual);
        
        inimigo.setTint(0xffffff);
        this.time.delayedCall(100, () => {
            if (inimigo.active) { inimigo.clearTint(); }
        });

        if (vidaAtual <= 0) {
            this.criarScrap(inimigo.x, inimigo.y);
            inimigo.destroy(); // Destruímos o inimigo
        }
    }
    
    criarScrap(x, y) {
        let scrap = this.scraps.create(x, y, 'scrap');
        scrap.body.setCircle(10);
    }

    coletarRecurso(robo, scrap) {
        scrap.destroy(); // Simples
        this.recursos += 5;
        EventBus.emit('recursosMudou', this.recursos);
    }
    
    danoNoReator(reator, inimigo) {
        if (!inimigo.active) return;
        inimigo.destroy(); // Simples
        let vidaAtual = reator.getData('vida') - 1;
        reator.setData('vida', vidaAtual);
        EventBus.emit('vidaMudou', vidaAtual);
        this.cameras.main.flash(250, 255, 0, 0);
        if (vidaAtual <= 0) { this.gameOver(true); }
    }
    
    proximaOnda() {
        if (this.isGameOver) return;
        if (this.ondaAtual >= 15) { this.gameOver(false); return; }
        
        this.ondaAtual++;
        if (this.ondaAtual > 1 && this.ondaAtual % 2 === 0) { this.inimigosPorOnda += 5; }
        EventBus.emit('ondaMudou', this.ondaAtual);
        
        const vidaDosInimigosDaOnda = 1 + Math.floor((this.ondaAtual - 1) / 3);

        for (let i = 0; i < this.inimigosPorOnda; i++) {
            let x = Phaser.Math.Between(0, 1) === 0 ? Phaser.Math.Between(-20, -10) : Phaser.Math.Between(810, 820);
            let y = Phaser.Math.Between(-20, 620);
            let inimigo = this.inimigos.create(x, y, 'criatura'); // Cria com o sprite 'criatura'
            
            inimigo.setData('vida', vidaDosInimigosDaOnda);
            inimigo.body.setCircle(15); // Colisor circular para a criatura
            this.physics.moveToObject(inimigo, this.reator, 40 + (this.ondaAtual * 5));
        }
    }

    gameOver(perdeu) {
        this.isGameOver = true;
        this.scene.stop('UIScene');
        if (perdeu) { this.scene.start('GameOverScene', { onda: this.ondaAtual }); }
        else { this.scene.start('WinScene'); }
    }
}

// =================================================================
// 4. CONFIGURAÇÃO FINAL E INICIALIZAÇÃO DO JOGO
// =================================================================
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#000020',
    physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 0 }, debug: false } },
    scene: [TitleScene, GameScene, UIScene, GameOverScene, WinScene, PauseScene, StoryScene, TutorialScene]
};

const game = new Phaser.Game(config);