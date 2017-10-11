/* global Vector, Constants, Entity, Block */

class Player extends Box {
    constructor (world, position, context, types) {
        super(world, position, 1.1, 2, 50);

        this.private_move = 0;
        this.win = false;
        
        this.death = false;
        
        this.types = types;
        this.texture_position = 0;
        this.last_type = types.front.right;
        this.context = context;
        
        this.walk = WalkDirection.FRONT;
        this.run = false;
    }
    
    /**
     * Initialisation du monde
     * @param {World} world
     */
    setWorld(world) {
        this.world = world;
    }

    /**
     * Permet d'actualisé le joueur, cette fonction est exécuté par le monde
     * @param {Double} dt
     */
    tick(dt) {
        // Actualisation de la velocité
        this.velocity = new Vector(this.getSpeed(), this.velocity.y);
        
        this.force = this.force.add(Constants.GRAVITY);
        var a = this.force.mult(this.invMass);
        this.force = Vector.ZERO;
        var delta_v = a.mult(dt);
        this.velocity = this.velocity.add(delta_v);
        this.move(this.velocity.mult(dt));
        
        // Gestion des murs invisibles
        let collision_x = 0;
        if (this.getPosition().x < 0) {
            collision_x = this.getPosition().x;
            this.move(new Vector(-this.getPosition().x, 0));
        } else if (this.getPosition().x + this.getWidth()  > this.world.getBlocks().length) {
            collision_x = this.getPosition().x;
            this.move(new Vector(this.world.getBlocks().length - (this.getPosition().x + this.getWidth()), 0));
        }

        // Vérification de bug
        this.collisionSol(dt);
        
        // Changement de velocité et position
        for (let x=Math.ceil(this.getPosition().x)+1; x >= Math.floor(this.getPosition().x);x--) {
            for (let y=Math.ceil(this.getPosition().y)+1; y >= Math.floor(this.getPosition().y)-1;y--) {
                let block = this.world.getBlock(new Vector(x, y));
                if (block != null) {
                    let collision = this.collision(block);
                    if (collision != null) {			
                        let diff_x = this.velocity.x - collision.velocity1.x;
                        if (diff_x !==0) {
                            collision_x = diff_x;
                        }
                        
                        this.move(collision.position1);
                        this.velocity = collision.velocity1;
                    }
                }
            }
        }
        
        // Gestion des animations
        if (collision_x > 0) {
            this.last_type = this.types.hurt.left;
            this.texture_position = 0;
        } else if (collision_x < 0) {
            this.last_type = this.types.hurt.right;
            this.texture_position = 0;
        } else {
            this.nextTexture();
        }
    }

    /**
     * Permet de corriger le bug de velocité. 
     * La fonction retéléporte le joueur au dessus des blocs
     */
    collisionSol() {
        let y = Math.floor(this.getPosition().y);
        let block1 = this.world.getBlock(new Vector(Math.floor(this.getPosition().x), y));
        if (block1 != null && this.world.getBlock(new Vector(Math.floor(this.getPosition().x), y+1)) === null) {
            var res = this.collision(block1);
            if (res != null) {
                this.move(new Vector(res.position1.x, 0));
            }
        }

        let block2 = this.world.getBlock(new Vector(Math.ceil(this.getPosition().x), y));
        if (block2 != null && this.world.getBlock(new Vector(Math.ceil(this.getPosition().x), y+1)) === null) {
            var res = this.collision(block2);
            if (res != null) {
                this.move(new Vector(res.position1.x, 0));
            }
        }
    }
    
    /**
     * Fonction de collision récupéré du TP2 mais 
     * réadapté pour modifier uniquement la vélocité du joueur
     * 
     * @param {type} loc
     * @returns {Vector,Vector}
     */
    collision(loc) {
        let mdiff = this.mDiff(loc);
        if (mdiff.hasOrigin()) {
            var vectors = [ 
                new Vector (0, mdiff.getPosition().y),
                new Vector (0, mdiff.getPosition().y + mdiff.getHeight()),
                new Vector (mdiff.getPosition().x, 0),
                new Vector (mdiff.getPosition().x + mdiff.getWidth(), 0) 
            ];

            let n = vectors[0];
            for (var i = 1; i < vectors.length; i++) {
                if (vectors[i].norm() < n.norm())
                n = vectors[i];
            };

            let norm_v = this.velocity.norm();
            let norm_vb = loc.velocity.norm();
            let kv = norm_v / (norm_v + norm_vb);

            if (norm_v === 0 && norm_vb === 0) {
                if (this.invMass === 0 && loc.invMass === 0)
                    return null;
                else {
                if (this.mass <= loc.mass)
                    kv = 1;
                else
                    kvb = 1;
                }

            };

            let position1 = n.mult(kv);
            n = n.normalize();

            // On calcule l'impulsion j :
            let v = this.velocity.sub(loc.velocity);
            let e = Constants.ELASTICITY;
            let j = -(1 + e) * v.dot(n) / (this.invMass + loc.invMass);

            // On calcule la nouvelle vitesse:
            let new_v = this.velocity.add(n.mult(j  * this.invMass));

            // Caractéristique des Blocs
            if (loc instanceof Block) {
                if (loc.hasDamage()) {
                    this.death = true;
                }
                if (this instanceof Player && loc.hasWin()) {
                    this.win = true;
                }
                if (!loc.hasCollision()) {
                    return null;
                }
            }
            
            return { position1 : position1,
                     velocity1 : new_v };

        } else {
            return null;
        }
    }
    
    /**
     * Permet de savoir si le joueur touche le sol ou pas
     * @returns {Boolean}
     */
    isFly() {
        let y = Math.floor(this.getPosition().y-0.1);
        let block1 = this.world.getBlock(new Vector(Math.floor(this.getPosition().x), y));
        
        if (block1 != null && block1.hasCollision()) {
            return false;
        }

        let block2 = this.world.getBlock(new Vector(Math.ceil(this.getPosition().x), y));
        if (block2 != null && block2.hasCollision()) {
            return false;
        }
        return true;
    }
    
    /**
     * Permet d'actualiser texture du joueur
     * @returns {TypeTexture}
     */
    updateType() {
        let type;
        if (this.isDeath()) {
            if (this.velocity.x > 0) {
                type = this.types.hurt.left;
            } else {
                type = this.types.hurt.right;
            }
        } else if (this.velocity.x > 0 && this.velocity.y <= 0) {
            type = this.types.walk.left;
        } else if (this.velocity.x < 0 && this.velocity.y <= 0) {
            type = this.types.walk.right;
        } else if (this.velocity.x > 0 && this.velocity.y > 0) {
            type = this.types.jump.left;
        } else if (this.velocity.x < 0 && this.velocity.y > 0) {
            type = this.types.jump.right;
        } else if (this.velocity.x === 0 && this.last_type === this.types.hurt.left && this.getWalk() !== WalkDirection.FRONT) {
            type = this.types.hurt.left;
        } else if (this.velocity.x === 0 && this.last_type === this.types.hurt.right && this.getWalk() !== WalkDirection.FRONT) {
            type = this.types.hurt.right;
        } else {
            type = this.types.front.right;
        }
        
        if (type !== this.last_type) {
            this.last_type = type;
            this.texture_position = 0;
        }
        return this.last_type;
    }
    
    /**
     * Permet de faire défiler les textures
     */
    nextTexture() {
        this.updateType();
        
        // Défilement plus lent si il marche
        if (this.run) {
            this.texture_position+= 1;
        } else {
            this.texture_position+= 0.5;
        }
        
        if (this.texture_position >= this.last_type.length) {
            this.texture_position = 0;
        }
    }
    
    /**
     * Retourne la texture actuelle
     * @returns {TypeTexture}
     */
    getTexture() {
        return this.last_type[Math.floor(this.texture_position)];
    }
    
    /**
     * Retourne le context du canvas virtuelle avec tous les textures du joueur
     * @returns {Context}
     */
    getContext() {
        return this.context;
    }
    
    /**
     * Retourne la largueur du joueur selon ca position
     * @returns {Double}
     */
    getWidth() {
        return this.getTexture().width;
    }

    /**
     * Retourne la hauteur du joueur selon ca position
     * @returns {Double}
     */
    getHeight() {
        return this.getTexture().height;
    }

    /**
     * Permet de savoir si le joueur a fini le niveau
     * @returns {Boolean}
     */
    isWin() {
        return this.win;
    }

    /**
     * Permet de faire sauter le joueur
     */
    jump() {
        // Uniquement si il touche le sol
        if (!this.isFly()) {
            this.force = this.force.add(new Vector(0,0.05));
        }
    }
    
    /**
     * Permet de savoir si le joueur court
     * @returns {Boolean}
     */
    isRun() {
        return this.run;
    }
    
    /**
     * Permet de définir si le joueur marche ou court :
     * True si le joueur court
     * False si le joueur marche
     * 
     * @param {type} run
     * @returns {undefined}
     */
    setRun(run) {
        this.run = run;
    }
    
    /**
     * Permet de savoir dans quelle direction va le joueur
     * @returns {WalkDirection}
     */
    getWalk() {
        return this.walk;
    }
    
    /**
     * Permet de définir la direction de marche du joueur
     * @param {WalkDirection} walk
     */
    setWalk(walk) {
        this.walk = walk;
    }
    
    /**
     * Permet de connaitre la vitesse de déplacement latéral :
     * Positif si il va à droite
     * Negatif si il va à gauche
     * 
     * @returns {Number}
     */
    getSpeed() {
        if (this.isRun()) {
            if (this.walk === WalkDirection.LEFT) {
                return -Constants.SPEED_RUN;
            } else if (this.walk === WalkDirection.RIGHT) {
                return Constants.SPEED_RUN;
            }
        } else {
            if (this.walk === WalkDirection.LEFT) {
                return -Constants.SPEED_WALK;
            } else if (this.walk === WalkDirection.RIGHT) {
                return Constants.SPEED_WALK;
            }
        }
        return 0;
    }
    
    /**
     * Permet de savoir si le joueur est mort
     * @returns {Boolean}
     */
    isDeath() {
        return this.death;
    }
}

/*
 * Liste des directions
 * @type type
 */
var WalkDirection = {
    LEFT : "left",
    RIGHT : "right",
    FRONT : "front"
};

/**
 * Liste des différents position
 * @param {Array} types
 * @returns {Types}
 */
var Types = function (types) {
    this.front = types["front"];
    
    this.stand = types["stand"];
    this.hurt = types["hurt"];
    this.duck = types["duck"];
    this.jump = types["jump"];
    this.walk = types["walk"];
};

/**
 * Un couple de texture gauche et droite
 * @param {type} left Liste de textures gauche
 * @param {type} right Liste de textures droite
 * @returns {TypeDirection}
 */
var TypeDirection = function (left, right) {
    this.left = left;
    this.right = right;
};

/**
 * Liste d'un information sur la texture
 * @param {type} x Les coordonnées X du canvas
 * @param {type} y Les coordonnées Y du canvas
 * @param {type} width La hauteur de la texture
 * @param {type} height La largueur de la texture
 * @returns {TypeTexture}
 */
var TypeTexture = function (x, y, width, height) {
    this.width = width;
    this.height = height;

    this.x = x;
    this.y = y;
};