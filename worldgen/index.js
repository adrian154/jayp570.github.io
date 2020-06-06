let canvas = document.querySelector("canvas");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let g = canvas.getContext("2d");

function Map() {

    this.map = [];

    let settings = new Settings();

    let tempX = 0;
    let x = tempX;
    let y = 0;
    for(let i = 0; i < canvas.height/settings.tileSize; i++) {
        this.map.push([]);
        for(let j = 0; j < canvas.width/settings.tileSize; j++) {
            let chance = Math.floor(Math.random()*20000/settings.tileSize);
            if(chance == 5) {
                this.map[i].push(new Grass(x, y));
            } else {
                this.map[i].push(new Water(x, y));
            }
            x+=settings.tileSize;
        }
        y+=settings.tileSize;
        x = tempX;
    }

    /*

    let directions = {
        x: [-2, -1, 0, 1, 2],
        y: [-2, -1, 0, 1, 2]
    }
    for(let count = 0; count < (47*2)/settings.tileSize; count++) {
        for(let i = 0; i < this.map.length; i++) {
            for(let j = 0; j < this.map[i].length; j++) {
                if(this.map[i][j].getName() == "grass") {
                    try {
                        let dir = {
                            x: directions.x[Math.floor(Math.random()*directions.x.length)],
                            y: directions.y[Math.floor(Math.random()*directions.y.length)]
                        }
                        if(dir.x != 0 && dir.y != 0) {
                            let num = Math.round(Math.random());
                            if(num == 0) {
                                dir.x = 0;
                            } else {
                                dir.y = 0;
                            }
                        }
                        if(this.map[i+dir.y][j+dir.x].getName() == "water") {
                            let neighborPos = this.map[i+dir.y][j+dir.x].getPos();
                            this.map[i+dir.y][j+dir.x] = new Grass(neighborPos.x, neighborPos.y);
                        }
                        
                    } catch (error) {
                        
                    }
                }
            }
        }
    }

    for(let i = 0; i < this.map.length; i++) {
        for(let j = 0; j < this.map[i].length; j++) {
            try {
                let surrounding = [this.map[i+1][j], this.map[i-1][j], this.map[i][j+1], this.map[i][j-1]];
                if(this.map[i][j].getName() == "grass") {
                    let nextToWater = false;
                    for(let k = 0; k < surrounding.length; k++) {
                        if(surrounding[k].getName() == "water") {
                            nextToWater = true;
                            break;
                        }
                    }
                    if(nextToWater) {
                        this.map[i][j] = new Sand(this.map[i][j].getPos().x, this.map[i][j].getPos().y);
                    }
                }
            } catch (error) {
                
            }
        }
    }
    for(let i = 0; i < this.map.length; i++) {
        for(let j = 0; j < this.map[i].length; j++) {

        }
    }
    
    */

    this.frame = 0;

    this.draw = function(g) {


        let directions = {
            x: [-2, -1, 0, 1, 2],
            y: [-2, -1, 0, 1, 2]
        }
        if(this.frame < (47*2)/settings.tileSize) {
            for(let i = 0; i < this.map.length; i++) {
                for(let j = 0; j < this.map[i].length; j++) {
                    if(this.map[i][j].getName() == "grass") {
                        try {
                            let dir = {
                                x: directions.x[Math.floor(Math.random()*directions.x.length)],
                                y: directions.y[Math.floor(Math.random()*directions.y.length)]
                            }
                            if(dir.x != 0 && dir.y != 0) {
                                let num = Math.round(Math.random());
                                if(num == 0) {
                                    dir.x = 0;
                                } else {
                                    dir.y = 0;
                                }
                            }
                            if(this.map[i+dir.y][j+dir.x].getName() == "water") {
                                let neighborPos = this.map[i+dir.y][j+dir.x].getPos();
                                this.map[i+dir.y][j+dir.x] = new Grass(neighborPos.x, neighborPos.y);
                            }
                            
                        } catch (error) {
                            
                        }
                    }
                }
            }
        }
        this.frame++;

        if(this.frame == (47*2)/settings.tileSize) {
            for(let i = 0; i < this.map.length; i++) {
                for(let j = 0; j < this.map[i].length; j++) {
                    try {
                        let surrounding = [this.map[i+1][j], this.map[i-1][j], this.map[i][j+1], this.map[i][j-1]];
                        if(this.map[i][j].getName() == "grass") {
                            let nextToWater = false;
                            for(let k = 0; k < surrounding.length; k++) {
                                if(surrounding[k].getName() == "water") {
                                    nextToWater = true;
                                    break;
                                }
                            }
                            if(nextToWater) {
                                this.map[i][j] = new Sand(this.map[i][j].getPos().x, this.map[i][j].getPos().y);
                            }
                        }
                    } catch (error) {
                        
                    }
                }
            }
        }

        for(let i = 0; i < this.map.length; i++) {
            for(let j = 0; j < this.map[i].length; j++) {
                this.map[i][j].draw(g);
            }
        }
    }

}

let map = new Map();

function animate() {
    requestAnimationFrame(animate);
    g.clearRect(0,0,canvas.width,canvas.height);
    map.draw(g);
}

animate();

console.log(canvas);