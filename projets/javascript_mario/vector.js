class Vector {
    constructor (x, y) {
        Object.defineProperty ( this, "x", { writable: false, value : x });
        Object.defineProperty ( this, "y", { writable: false, value : y });
    }

    add(v) {
        return new Vector(this.x + v.x, this.y + v.y );
    }

    sub(v) {
        return new Vector(this.x - v.x, this.y - v.y );
    }

    mult(k) {
        return new Vector(this.x * k, this.y * k );
    }

    dot(v) {
        return this.x * v.x + this.y * v.y;
    }

    norm() {
        return Math.sqrt(this.dot(this));
    }

    normalize() {
        return this.mult(1/this.norm ());
    }

    round() {
        return new Vector(Math.round(this.x), Math.round(this.y));
    }
 }

Vector.ZERO = new Vector (0,0);
Vector.UNIT_X = new Vector (1,0);
Vector.UNIT_Y = new Vector (0,1);
Vector.MINUS_UNIT_X = new Vector (-1, 0);
Vector.MINUS_UNIT_Y = new Vector (0, -1);