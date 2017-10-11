class World {
    constructor (blocks, player) {
        this.blocks = blocks;
        this.player = player;

        this.player.setWorld(this);
    }
    
    /**
     * Actualisé par le game
     * @param dt intervale
     */
    tick(dt) {
        this.player.tick(dt);
    }
    
    /**
     * Retourne le block d'une position
     * 
     * @param position La position du block
     * @return Block ou null
     */
    getBlock(position) {
        if (position.x >= 0 && position.x < this.blocks.length) {
                if (position.y >= 0 && position.y < this.blocks[position.x].length) {
                        return this.blocks[position.x][position.y];
                }
        }
        return null;
    }

    /**
     * Retourne la liste de tous les blocs
     * @returns {Block[][]}
     */
    getBlocks() {
        return this.blocks;
    }
    
    /**
     * Retourne le joueur
     * @returns {Player}
     */
    getPlayer() {
        return this.player;
    }

    /**
     * Retourne la longueur du monde
     * @returns {Integer}
     */
    getLength() {
        return this.blocks.length;
    }
}