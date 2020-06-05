function Water(x, y) {
    
    this.pos = {
        "x": x, 
        "y": y
    }
    this.dimensions = {
        "w": 2,
        "h": 2
    }

    this.name = "water"

    this.draw = function(g) {
        g.fillStyle = "blue";
        g.fillRect(this.pos.x, this.pos.y, this.dimensions.w, this.dimensions.h);
    }    

    this.getPos = function() {
        return this.pos;
    }

    this.getDimensions = function() {
        return this.dimensions;
    }

    this.getName = function() {
        return this.name;
    }

}