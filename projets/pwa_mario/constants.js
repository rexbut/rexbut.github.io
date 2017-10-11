var Constants = {
    WIDTH: 800,
    HEIGHT: 600,
    GRAVITY : new Vector(0, -0.0015),
    MASS : 1,
    ELASTICITY : 0.0,
    PIXEL : 40,  // La taille d'un bloc
    WINDOWS : 0.4, // Pourcentage pour pour le décalage de la fenetre
    SPEED_RUN: 0.006, // Vitesse pour courir
    SPEED_WALK: 0.004, // Vitesse de marche
    HEART: 3, // Nombre de vie
    LEVEL: 3, // Nombre de niveau
    IMG_HEART: "textures/heart.png"
};

var Messages = {
    START: "Bienvenue !\nAppuyer sur ENTRER pour lancer une partie",
    LOAD: "Chargement ...",
    LEVEL: "Level <level>",
    DEATH: "Vous avez perdu une vie !",
    GAMEOVER: "Vous avez perdu !\nAppuyer sur ENTRER pour relancer une partie",
    WIN: "Vous avez gagné !\nAppuyer sur ENTRER pour relancer une partie"
};

var Keys = {
    START : 13,
    RIGHT : 39,
    LEFT : 37,
    JUMP : 38,
    RUN: 17
};