/* global Constants, Promise */

class JsonDeserialize {
    constructor(file) {
        this.file = file;
        if (!(this.file.world
            && this.file.world
            && this.file.world
            && this.file.blocks
            && this.file.player
            && this.file.player.x
            && this.file.player.y
            && this.file.player.x
            && this.file.player.y
            && this.file.player.texture
            && this.file.player.textures
            && this.file.backgrounds
            && this.file.backgrounds.first
            && this.file.backgrounds.first.width
            && this.file.backgrounds.first.height
            && this.file.backgrounds.second
            && this.file.backgrounds.second.width
            && this.file.backgrounds.second.height)) {
            throw "[JsonDeserialize] Erreur : Format invalide";
        }
        
        this.world_blocks = {};
        this.player_image;
        this.backgrounds_first = new Array();
        this.backgrounds_second = new Array();
    }
    
    /**
     * Charge toutes les images
     * @returns {Promise}
     */
    load() {
        let load = [];
        load.push(this.loadWorld());
        load.push(this.loadPlayer());
        load.push(this.loadBackGround());
        return Promise.all(load);
    }
    
    loadWorld() {
        let load = [];
        
        for(let identifier in this.file.blocks) {
            let block = this.file.blocks[identifier];
            if (!block.hasOwnProperty('texture')) {
                block = {texture: block};
            }

            if (!block.hasOwnProperty('collision')) block.collision = true;
            if (!block.hasOwnProperty('damage')) block.damage = false;
            if (!block.hasOwnProperty('win')) block.win = false;
            this.world_blocks[identifier] = block;

            load.push(new Promise ((ok, error) => {
                let img = new Image();
                img.src = block.texture;
                block.texture = img;
                img.onload = () => ok(img);
            }));
        }
        
        return Promise.all(load);
    }
    
    loadPlayer() {
        return new Promise((ok, error) => {
            this.player_image = new Image();
            this.player_image.src = this.file.player.texture;
            this.player_image.onload = () => ok(this.player_image);
        });
    }
    
    loadBackGround() {	
        let load = [];
        
        for(let identifier in this.file.backgrounds.first.textures) {
            let url = this.file.backgrounds.first.textures[identifier];
            load.push(new Promise((ok, error) => {
                let img = new Image();
                img.src=url;
                
                this.backgrounds_first.push(img);
                img.onload = () => ok(img);
            }));
        }
        
        for(let identifier in this.file.backgrounds.second.textures) {
            let url = this.file.backgrounds.second.textures[identifier];
            load.push(new Promise((ok, error) => {
                let img = new Image();
                img.src=url;
                
                this.backgrounds_second.push(img);
                img.onload = () => ok(img);
            }));
        }
        
        return Promise.all(load);
    }

    createWorld() {
        let blocks = new Array();
        for(let x=0; x < this.file.world.length; x++) {
                blocks[x] = new Array();
                for(let y=0; y < this.file.world[x].length; y++) {
                        let identifier = this.file.world[x][y];
                        let type = this.world_blocks[identifier];
                        if (type) {
                            blocks[x][y] = new Block(this, new Vector(x, y), type.texture, type.collision, type.damage, type.win);
                        } else if (identifier > 0) {
                            console.log("[JsonDeserialize] Erreur : Textures introuvable '" + identifier + "'");
                        }
                }
        }

        return new World(blocks, this.createPlayer());
    }
    
    createPlayer() {
        let width = this.file.player.width;
        let height = this.file.player.height; 
        let max_width = 0;
        let max_height = 0;
        let cpt = 0;
        for(let identifier in this.file.player.textures) {
            let type = this.file.player.textures[identifier];
            if (!Array.isArray(type[0])) {
                max_width = Math.max(max_width, type[2]);
                max_height = Math.max(max_height, type[3]);
                cpt++;
            } else {
                for(let sub_identifier in type) {
                    let sub_type = type[sub_identifier];
                    max_width = Math.max(max_width, sub_type[2]);
                    max_height = Math.max(max_height, sub_type[3]);
                    cpt++;
                }
            }
        }

        cpt = cpt * 2;
        let canvas = document.createElement("canvas");
        canvas.width = width * cpt * Constants.PIXEL;
        canvas.height = height * Constants.PIXEL;
        let context = canvas.getContext("2d");
        
        cpt = 0;
        let type_textures = {};
        for(let identifier in this.file.player.textures) {
            let type = this.file.player.textures[identifier];
            if (!Array.isArray(type[0])) {
                let texture_left = new TypeTexture(
                    width * cpt * Constants.PIXEL,
                    0,
                    width * (type[2] / max_width),
                    height * (type[3] / max_height));
                let texture_right = new TypeTexture(
                    width * (cpt + 1) * Constants.PIXEL,
                    0,
                    width * (type[2] / max_width),
                    height * (type[3] / max_height));

                type_textures[identifier] = new TypeDirection([texture_left], [texture_right]);

                context.drawImage(this.player_image, 
                    type[0], type[1], type[2], type[3],
                    texture_left.x, texture_left.y, texture_left.width * Constants.PIXEL, texture_left.height * Constants.PIXEL);
                context.save();
                context.scale(-1, 1);
                context.drawImage(this.player_image, 
                    type[0], type[1], type[2], type[3],
                    -texture_right.x, -texture_right.y, -texture_right.width * Constants.PIXEL, texture_right.height * Constants.PIXEL);
                context.restore();
                cpt = cpt + 2;
            } else {
                let textures_left = [];
                let textures_right = [];
                for(let sub_identifier in type) {
                    let sub_type = type[sub_identifier];
                    let texture_left = new TypeTexture(
                        width * cpt * Constants.PIXEL,
                        0,
                        width * (sub_type[2] / max_width),
                        height * (sub_type[3] / max_height));
                    let texture_right = new TypeTexture(
                        width * (cpt + 1) * Constants.PIXEL,
                        0,
                        width * (sub_type[2] / max_width),
                        height * (sub_type[3] / max_height));
                    textures_left.push(texture_left);
                    textures_right.push(texture_right);

                    context.drawImage(this.player_image, 
                        sub_type[0], sub_type[1], sub_type[2], sub_type[3],
                        texture_left.x, texture_left.y, texture_left.width * Constants.PIXEL, texture_left.height * Constants.PIXEL);
                    context.save();
                    context.scale(-1, 1);
                    context.drawImage(this.player_image, 
                        sub_type[0], sub_type[1], sub_type[2], sub_type[3],
                        -texture_right.x, -texture_right.y, -texture_right.width * Constants.PIXEL, texture_right.height * Constants.PIXEL);
                    context.restore();
                    cpt = cpt + 2;
                }
                type_textures[identifier] = new TypeDirection(textures_left, textures_right);
            }
        }

        let position = new Vector(this.file.player.x, this.file.player.y);
        return new Player(undefined, position, context, new Types(type_textures));
    }
    
    createBackGround() {
        let canvas_first = document.createElement("canvas");
        canvas_first.width = this.file.backgrounds.first.width;
        canvas_first.height = this.file.backgrounds.first.height;
        let context_first = canvas_first.getContext("2d");
        let first = new BackGround(context_first, this.file.backgrounds.first.speed, this.file.backgrounds.first.width, this.file.backgrounds.first.height);
        
        for (let identifier in this.backgrounds_first) {
            let texture = this.backgrounds_first[identifier];
            context_first.drawImage(texture, 0, 0, this.file.backgrounds.first.width, this.file.backgrounds.first.height);
        }
        
        let canvas_second = document.createElement("canvas");
        canvas_second.width = this.file.backgrounds.second.width;
        canvas_second.height = this.file.backgrounds.second.height;
        let context_second = canvas_second.getContext("2d");
        let second = new BackGround(context_second, this.file.backgrounds.second.speed, this.file.backgrounds.second.width, this.file.backgrounds.second.height);
        
        for (let identifier in this.backgrounds_second) {
            let texture = this.backgrounds_second[identifier];
            context_second.drawImage(texture, 0, 0, this.file.backgrounds.second.width, this.file.backgrounds.second.height);
        }
        return new BackGrounds(first, second);
    }
}