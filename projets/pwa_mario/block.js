class Block extends Box {
    constructor (world, position, texture, collision, damage, win) {
        super(world, position, 1, 1);
        this.texture = texture;
        this.collision = collision;
        this.damage = damage;
        this.win = win;
    }
    
    /**
     * Retourne la texture du bloc
     * @returns {unresolved}
     */
    getTexture() {
        return this.texture;
    }
    
    /**
     * Permet de savoir si le joueur peut rentrer en collision avec le bloc
     * Exemple : Désactiver pour les panneaux et buissons
     * @returns {unresolved}
     */
    hasCollision() {
        return this.collision;
    }
    
    /**
     * Permet de savoir si le bloc permet de tuer le joueur
     * Exemple : Lave, Eau ..
     * @returns {unresolved}
     */
    hasDamage() {
        return this.damage;
    }
    
    /**
     * Permet de savoir si le bloc permet de gagner le niveau
     * (Utilisé pour la porte)
     * @returns {Boolean}
     */
    hasWin() {
        return this.win;
    }
}