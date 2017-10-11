class Rect {
    constructor(position, width, height) {
        this.position = position;
        this.width = width;
        this.height = height;
    }

    getPosition() {
        return this.position;
    }

    getWidth() {
        return this.width;
    }

    getHeight() {
        return this.height;
    }

    move(v) {
        this.position = this.position.add(v);
    }

    setWidth(width) {
        this.width = width;
    }

    setHeight(height) {
        this.height = height;
    }

    mDiff(cuboid) {
        let origin = new Vector (
                        cuboid.getPosition().x - this.position.x - this.width,
                        cuboid.getPosition().y - this.position.y - this.height);
        return new Rect(origin, 
                        this.width + cuboid.getWidth(), 
                        this.height + cuboid.getHeight());
    }

    hasOrigin() {
        return (this.position.x < 0 && this.position.x + this.width > 0)
                && (this.position.y < 0 && this.position.y + this.height > 0);

    }
}