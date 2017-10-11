class BackGrounds {
    constructor (first, second) {
        this.first = first;
        this.second = second;
    }
    
    /**
     * Retourne le BackGround du premier plan
     * @returns {BackGround}
     */
    getFirst() {
        return this.first;
    }
    
    /**
     * Retourne le BackGround du second plan
     * @returns {BackGround}
     */
    getSecond() {
        return this.second;
    }
}
class BackGround {
    constructor(context, speed, width, height) {
        this.context = context;
        this.speed = speed;
        
        this.width = width;
        this.height = height;
    }
    
    /**
     * Retourne le context du canvas virtuel
     * @returns {Context}
     */
    getContext() {
        return this.context;
    }
    
    /**
     * Retourne la vitesse de déplacement
     * @returns {Double}
     */
    getSpeed() {
        return this.speed;
    }
    
    /**
     * Retourne la largeur
     * @returns {Integer}
     */
    getWidth() {
        return this.width;
    }
    
    /**
     * Retourne la hauteur
     * @returns {Integer}
     */
    getHeight() {
        return this.height;
    }
}