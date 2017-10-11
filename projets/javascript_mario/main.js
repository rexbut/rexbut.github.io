"use strict";

// Il est possible faire "renderer.stop()" dans la console à n'importe quel moment
// (Une fois le rendu initialiser)
var renderer;

var Debug = {}
Debug.log = function (s) {
    if (false) {
        console.log(s);
    }
}

var init = function () {
    // Intialisation du jeu
    let game = new Game();
    
    // Initialisation du rendu
    renderer = new Renderer(game);
    renderer.start();
};

window.addEventListener("load", init);
