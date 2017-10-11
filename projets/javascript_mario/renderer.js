/* global Vector, Constants, Debug, Messages */

class Renderer {
    constructor(game) {
        this.menu = Menu.START;
        
        this.game = game;
        
        // L'identifiant de l'intervale
        this.interval = -1;

        this.canvas_background_first = document.getElementById("canvas_background_first");
        this.canvas_background_second = document.getElementById("canvas_background_second");
        this.canvas_world = document.getElementById("canvas_world");
        this.canvas_player = document.getElementById("canvas_player");
        this.canvas_menu = document.getElementById("canvas_menu");
        
        this.canvas_background_first.width = Constants.WIDTH;
        this.canvas_background_second.width = Constants.WIDTH;
        this.canvas_world.width = Constants.WIDTH;
        this.canvas_player.width = Constants.WIDTH;
        this.canvas_menu.width = Constants.WIDTH;
        
        this.canvas_background_first.height = Constants.HEIGHT;
        this.canvas_background_second.height = Constants.HEIGHT;
        this.canvas_world.height = Constants.HEIGHT;
        this.canvas_player.height = Constants.HEIGHT;
        this.canvas_menu.height = Constants.HEIGHT;
       
        // La position x de la fenetre
        this.position_context = -1;
        
        // Image Heart
        this.heart_load = false;
        this.heart_img = new Image();
        this.heart_img.src = Constants.IMG_HEART;
        this.heart_img.onload = () => {
            this.heart_load = true;
            if (this.game.isStart()) {
                this.drawnHeath();
            }
        };
    }

    /**
     * Démarre le rendu
     */
    start() {		
        if (this.interval !== -1) {
            console.log("[Renderer] Erreur : Il est déjà start");
            return;
        }

        this.fps_last = Date.now();
        this.fps_nb = 0;
        
        this.init();
        
        let renderer = this;
        this.interval = setInterval(() => {
            try {
                this.tick(1000/60);
            } catch (e) {
                // Dès qu'il y a une erreur on arrête tout
                console.log("[Renderer] Erreur : " + e);
                renderer.stop();
                throw e;
            }
        }, 1000/60);
        Debug.log("[Renderer] Start");
    }
    
    /**
     * Arrete le rendu
     */
    stop() {
        clearInterval(this.interval);
        this.interval = -1;

        Debug.log("[Renderer] Stop");
    }
    
    /*
     * Fonction exécuté tout les 20 ms
     * @param Number dt
     */
    tick(dt) {
        if (this.game.isLoad()) {
            if (!this.game.isDeath() && this.game.getWorld().getPlayer().isDeath()) {
                this.sendMessage(Messages.DEATH, Date.now()+2000);
            }

            // Actualisation du jeu
            this.game.tick(dt);
        }
        
        // Actualisation du menu
        let new_menu = this.updateMenu(); 
        if (this.menu !== new_menu) {
            this.menu = new_menu;
            this.init();
        } else {
            this.drawn();
        }

        // Actualisation des fps
        this.fps_nb++;
        this.drawnFPS();
        
        // Actualisation du message
        if (this.message_time != null && this.message_time < Date.now()) {
            this.clearMessage();
        }
    }
    
    /**
     * Donne le menu à afficher
     * @returns {Menu.GAME|Menu.LOAD|Menu.DEATH|Menu.WIN}
     */
    updateMenu() {
        if (this.game.isLoad()) {
            if (this.game.isDeath()) {
                return Menu.DEATH;
            } else if (this.game.isWin()) {
                return Menu.WIN;
            } else {
                return Menu.GAME;
            }
        } else if (!this.game.isStart()) {
            return Menu.START;
        } else {
            return Menu.LOAD;
        }
    }
    
    /**
     * Initialise le menu
     */
    init() {
        if (this.menu === Menu.GAME) {
            Debug.log("Initialisation : Menu.GAME");
            
            this.initWorld();
            this.drawnBackground();
            this.drawnHeath();
            this.drawnGame(true);
            
            this.sendMessage(Messages.LEVEL.replace("<level>", this.game.getLevel()), Date.now()+2000);
        } else if (this.menu === Menu.START) {
            Debug.log("[Renderer] Initialisation : Menu.START");
            
            this.sendMessage(Messages.START);
            let context = this.canvas_background_second.getContext("2d");
            context.fillStyle = "#FFFFFF";
            context.fillRect(0,0,Constants.WIDTH,Constants.HEIGHT);
        } else if (this.menu === Menu.LOAD) {
            Debug.log("[Renderer] Initialisation : Menu.LOAD");
            
            this.sendMessage(Messages.LOAD);
        } else if (this.menu === Menu.DEATH) {
            Debug.log("[Renderer] Initialisation : Menu.DEATH");
            
            this.drawnGame();
            this.drawnHeath();
            
            this.clearMessage();
            this.sendMessage(Messages.GAMEOVER);
        } else if (this.menu === Menu.WIN) {
            Debug.log("[Renderer] Initialisation : Menu.WIN");
            
            this.clearMessage();
            this.sendMessage(Messages.WIN);
        }
    }
    
    /**
     * Dessine le jeu
     */
    drawn() {
        if (this.menu === Menu.GAME) {
            this.drawnGame();
        } else if (this.menu === Menu.DEATH) {
        }
    }

    /*
     * Intialisation du monde
     */
    initWorld() {
        Debug.log("[Renderer] Initialisation du World...");
        let blocks = this.game.getWorld().getBlocks();
        
        let canvas = document.createElement("canvas");
        canvas.width = blocks.length * Constants.PIXEL;
        canvas.height = Constants.HEIGHT;
        
        this.context_world = canvas.getContext("2d");
        let renderer = this;

        blocks.forEach((line) => {
            line.forEach((block) => {
                renderer.context_world.drawImage(block.getTexture(), 
                    block.getPosition().x * Constants.PIXEL, 
                    Constants.HEIGHT - ((block.getPosition().y + block.getHeight()) * Constants.PIXEL), 
                    block.getWidth() * Constants.PIXEL, 
                    block.getHeight() * Constants.PIXEL);
            });
        });
        
        this.position_context = 0;
    }
    
    /*
     * Affiche un message pendant certains temps
     * @param String Le message
     * @param DateTime time
     */
    sendMessage(message, time) {
        if(this.message_time != null) return;
        
        this.clearMessage();
        
        let context = this.canvas_menu.getContext("2d");
        context.textAlign = "center";
        context.font = "bold 35px Arial";
        context.fillStyle = "#000000";
        
        let messages = message.split("\n");
        for (let cpt=0; cpt<messages.length; cpt++) {
            context.fillText(messages[cpt], (Constants.WIDTH/2), (Constants.HEIGHT/2) + (cpt*45));
        }
        
        this.message_time = time;
    }
    
    clearMessage() {
        this.message_time = null;
        
        let context = this.canvas_menu.getContext("2d");
        context.clearRect(0, (Constants.HEIGHT/2)-100, Constants.WIDTH, (Constants.HEIGHT/2)+100);
    }
    
    /**
     * Affiche les FPS
     */
    drawnFPS() {
        if (this.fps_nb >= 60) {
            let fps = Math.round(this.fps_nb/((Date.now()-this.fps_last)/1000));
            this.fps_last = Date.now();
            this.fps_nb = 0;
            
            let context = this.canvas_menu.getContext("2d");
            context.clearRect(Constants.WIDTH-150, 0, 150, 150);
            context.textAlign = "left";
            context.font = "bold 35px Arial";
            context.fillStyle = "#EFD807";
            context.fillText("FPS : " + fps, Constants.WIDTH-150, 40);
        }
    }
    
    /**
     * Affiche la vie
     */
    drawnHeath() {
        let context = this.canvas_menu.getContext("2d");
        context.clearRect(0, 0, 150, 150);
        context.textAlign = "left";
        context.font = "bold 40px Arial";
        context.fillStyle = "#FF0000";
        context.fillText(this.game.getHeart(), 55, 43);
        if (this.heart_load) {
            context.drawImage(this.heart_img, 10, 10, 35, 35);
        }
    }
    
    /**
     * Calcule la position de fenetre
     * @returns La position
     */
    getPositionWindow() {
        let windows_width_pixel = (Constants.WIDTH/Constants.PIXEL);
        let player_position_x = this.game.getWorld().getPlayer().getPosition().x;
        let player_position_windows = player_position_x - this.position_context;
        let formule = player_position_windows / windows_width_pixel;
        if (formule > 1-Constants.WINDOWS) {
            // Droite
            return Math.min(
                this.game.getWorld().getLength()-windows_width_pixel,
                player_position_x - (windows_width_pixel*(1-Constants.WINDOWS)));
        } else if (formule < Constants.WINDOWS) {
            // Gauche
            return Math.max(0,
                player_position_x - (windows_width_pixel*(Constants.WINDOWS)));
        }
        return this.position_context;
    }
    
    /**
     * Dessine le jeu
     * @param force
     */
    drawnGame(force) {
        let new_position = this.getPositionWindow();
        if (force || this.position_context !== new_position) {
            let imageData = this.context_world.getImageData(this.position_context * Constants.PIXEL, 0, Constants.WIDTH, Constants.HEIGHT);
            this.canvas_world.getContext("2d").putImageData(imageData, 0,0);
            
            this.position_context = new_position;
            this.drawnBackground();
        }

        this.drawnPlayer();
    }

    /**
     * Dessine le joueur
     */
    drawnPlayer() {
        let context = this.canvas_player.getContext("2d");
        context.clearRect(0, 0, Constants.WIDTH, Constants.HEIGHT);
        
        let player = this.game.getWorld().getPlayer();
        let type = player.getTexture();
        let imageData = player.getContext().getImageData(type.x, type.y, type.width * Constants.PIXEL, type.height * Constants.PIXEL);
        this.canvas_player.getContext("2d").putImageData(imageData, 
            (player.getPosition().x- this.position_context) * Constants.PIXEL, 
            Constants.HEIGHT - ((player.getPosition().y + type.height) * Constants.PIXEL));
    }
    
    /**
     * Dessine le background
     */
    drawnBackground() {
        let backgrounds = this.game.getBackground();
        
        let context_first = this.canvas_background_first.getContext("2d");
        let background_first = backgrounds.getFirst();
        let position = this.position_context * background_first.getSpeed() * Constants.PIXEL;
        let modulo = -(position % background_first.getWidth());
        
        let imageData = background_first.getContext().getImageData(0, 0, background_first.getWidth(), background_first.getHeight());
        context_first.putImageData(imageData, modulo, 0);
        context_first.putImageData(imageData, modulo + background_first.getWidth(), 0);
        
        let context_second = this.canvas_background_second.getContext("2d");
        let background_second = backgrounds.getSecond();
        position = this.position_context * background_second.getSpeed() * Constants.PIXEL;
        modulo = -(position % background_second.getWidth());
        
        imageData = background_second.getContext().getImageData(0, 0, background_second.getWidth(), background_second.getHeight());
        context_second.putImageData(imageData, modulo, 0);
        context_second.putImageData(imageData, modulo + background_second.getWidth(), 0);
    }
}

/**
 * Liste des différents menu
 * @type type
 */
var Menu = {
    START : "start",
    LOAD : "load",
    WIN : "win",
    DEATH : "death",
    GAME : "game"
};