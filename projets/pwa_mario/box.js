/* global Vector, Infinity */

class Box extends Rect {
    constructor(world, position, width, height, mass=Infinity, force=Vector.ZERO) {
        super(position, width, height);

        this.world = world;
        this.mass = mass;
        this.invMass = 1/this.mass;
        this.velocity = Vector.ZERO;
        this.force = force;
    }

    getWorld() {
        return this.world;
    }
}
