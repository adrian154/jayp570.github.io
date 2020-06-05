function Grass(x, y) {
    
    this.pos = {
        "x": x, 
        "y": y
    }
    this.dimensions = {
        "w": 2,
        "h": 2
    }

    this.name = "grass"

    this.draw = function(g) {
        g.fillStyle = "green";
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