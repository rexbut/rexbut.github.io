/* global Constants, Promise, WalkDirection, Debug */

class Game {
    constructor () {
        this.start = false;
        this.reset();
        
        // Listener
        this.keys = {};
        this.listener();
    }
    
    /**
     * Réinitisalise le jeu
     */
    reset() {
        this.load = false;
        
        this.heart = Constants.HEART;
        this.level = 1;
        this.win = false;
    }
    
    /**
     * Actualisé par le renderer
     * @param dt intervale
     */
    tick(dt) {
        if (this.world.getPlayer().isDeath()) {
            this.heart--;
            if (!this.isDeath()) {
                this.loadLevel();
            }
        } else if (this.world.getPlayer().isWin()) {
            if (this.level < Constants.LEVEL) {
                this.level++;
            this.loadLevel();
            } else {
                this.win = true;
            }
        }
        
        this.world.tick(dt);
    }

    /**
     * Téléchargement et chargement du monde
     */
    loadLevel() {
        this.load = false;
        let level = this.level;
        
        let load = Promise.resolve();
        Debug.log("[Game] Début du téléchargement du level '" + level  + "' ...");
        load.then(() => this.downloadLevel(level))
            .then (jsonDeserialize => new Promise((ok, error) => {
                Debug.log("[Game] Fin du téléchargement du fichier json '" + level  + "'");
                Promise.resolve()
                    .then(() => jsonDeserialize.load())
                    .then(() => Debug.log("[Game] Fin du chargement des images '" + level  + "'"))
                    .then(() => ok(jsonDeserialize));
            }))
            .then (jsonDeserialize => {
                this.world = jsonDeserialize.createWorld();
                this.background = jsonDeserialize.createBackGround();
                
                this.updateKey();
                
                this.load = true;
            }).catch(e => {
                console.log("[Game] Erreur : Lors du téléchargement du level '" + level  + "'");
                console.log(e);
                this.win = true;
            });
    }

    /**
     * Téléchargement du niveau
     * @param level Le numero du niveau à télécharger
     * @returns {Promise}
     */
    downloadLevel(level) {
        return  new Promise((ok, error) => {
            let url = "levels/level_" + level + ".json";

            let xhr = new XMLHttpRequest();
            xhr.addEventListener("readystatechange",  function () {
                if (this.readyState === 4) {
                    if (this.status === 200) {
                        var obj = JSON.parse(this.responseText);
                        ok(new JsonDeserialize(obj));
                    } else {
                        error(this.responseText);
                    }
                }
            });
            xhr.open("POST", url);
            xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
            xhr.send();
        });
    };
    
    /**
     * Permet de savoir si le jeu est start
     * @returns {Boolean}
     */
    isStart() {
        return this.start;
    }
    
    /**
     * Permet de savoir si il y a un monde de charger
     * @returns {Boolean}
     */
    isLoad() {
        return this.load;
    }
    
    /**
     * Permet de savoir si le joueur à fini tous les niveaux
     * @returns {Boolean}
     */
    isWin() {
        return this.win;
    }
    
    /**
     * Permet de savoir si le joueur a utilisé toutes ces vie
     * @returns {Boolean}
     */
    isDeath() {
        return this.heart <= 0;
    }
    
    /**
     * Retourne le numéro du level actuelle
     * @returns {Number}
     */
    getLevel() {
        return this.level;
    }
    
    /**
     * Retourne le nombre de vie restant
     * @returns {Number}
     */
    getHeart() {
        return this.heart;
    }

    /**
     * Retroune le monde
     * @returns {World}
     */
    getWorld() {
        return this.world;
    }

    /**
     * Retourne le background
     * @returns {Game.background}
     */
    getBackground() {
        return this.background;
    }
    
    /**
     * Réapplique les touches à chaque niveau
     */
    updateKey() {
        if (this.keys[Keys.RIGHT]) {
            this.world.getPlayer().setWalk(WalkDirection.RIGHT);
        }
        if (this.keys[Keys.LEFT]) {
            this.world.getPlayer().setWalk(WalkDirection.LEFT);
        }
        if (this.keys[Keys.JUMP]) {
            this.world.getPlayer().jump();
        }
        if (this.keys[Keys.RUN]) {
            this.world.getPlayer().setRun(true);
        }
    }
    
    /**
     * Initialise le listener
     */
    listener() {
        document.addEventListener("keydown", (e) => {
			// Permet de start le jeu
            if (!this.isStart() && e.keyCode === Keys.START) {
                this.start = true;
                this.loadLevel();
                return;
            }
            
            if (this.keys[e.keyCode]) return;
            this.keys[e.keyCode] = true;
			
			// Si le jeu n'est pas encore chargé
            if (!this.load) return;
            
            if (e.keyCode === Keys.START) {
                if(this.isDeath() || this.isWin()) {
                    this.reset();
                    this.loadLevel();
                }
            } else if (e.keyCode === Keys.RIGHT) {
                this.world.getPlayer().setWalk(WalkDirection.RIGHT);
            } else if (e.keyCode === Keys.LEFT) {
                this.world.getPlayer().setWalk(WalkDirection.LEFT);
            } else if (e.keyCode === Keys.JUMP) {
                this.world.getPlayer().jump();
            } else if (e.keyCode === Keys.RUN) {
                this.world.getPlayer().setRun(true);
            }
        });

        document.addEventListener("keyup", (e) => {
            if (!this.keys[e.keyCode]) return;
            this.keys[e.keyCode] = false;
			
			// Si le jeu n'est pas encore chargé
			if (!this.load) return;

            if (e.keyCode === Keys.RIGHT) {
                if (this.keys[Keys.LEFT]) {
                    this.world.getPlayer().setWalk(WalkDirection.LEFT);
                } else {
                    this.world.getPlayer().setWalk(WalkDirection.FRONT);
                }
            } else if (e.keyCode === Keys.LEFT) {
                if (this.keys[Keys.RIGHT]) {
                    this.world.getPlayer().setWalk(WalkDirection.RIGHT);
                } else {
                    this.world.getPlayer().setWalk(WalkDirection.FRONT);
                }
            } else if (e.keyCode === Keys.RUN) {
                this.world.getPlayer().setRun(false);
            }
        });
    }
}