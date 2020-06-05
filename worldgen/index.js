let canvas = document.querySelector("canvas");

canvas.width = 1000;
canvas.height = 600;

let g = canvas.getContext("2d");


function Map() {

    this.map = [];


    let tempX = 0;
    let x = tempX;
    let y = 0;
    for(let i = 0; i < canvas.height/2; i++) {
        this.map.push([]);
        for(let j = 0; j < canvas.width/2; j++) {
            let chance = Math.floor(Math.random()*10000);
            if(chance == 5) {
                this.map[i].push(new Grass(x, y));
            } else {
                this.map[i].push(new Water(x, y));
            }
            x+=this.map[i][j].getDimensions().w;
        }
        y+=this.map[i][this.map[i].length-1].getDimensions().w;
        x = tempX;
    }

    for(let count = 0; count < 75; count++) {
        for(let i = 0; i < this.map.length; i++) {
            for(let j = 0; j < this.map[i].length; j++) {
                if(this.map[i][j].getName() == "grass") {
                    try {
                        let chance = Math.floor(Math.random()*5)
                        if(chance == 0) {
                            let neighborPos = this.map[i+1][j].getPos();
                            this.map[i+1][j] = new Grass(neighborPos.x, neighborPos.y);
                        }
                        if(chance == 1) {
                            let neighborPos = this.map[i][j+1].getPos();
                            this.map[i][j+1] = new Grass(neighborPos.x, neighborPos.y);
                        }
                        if(chance == 2) {
                            let neighborPos = this.map[i-1][j].getPos();
                            this.map[i-1][j] = new Grass(neighborPos.x, neighborPos.y);
                        }
                        if(chance == 3) {
                            let neighborPos = this.map[i][j-1].getPos();
                            this.map[i][j-1] = new Grass(neighborPos.x, neighborPos.y);
                        }
                    } catch (error) {
                        
                    }
                }
            }
        }
    }
    

    this.draw = function(g) {
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