let canvas = document.querySelector("canvas");

canvas.width = 1200;
canvas.height = 800;

let g = canvas.getContext("2d");


let tileSize = 30;

let grid = [];
function makeGrid() {
    for(let i = 0; i < canvas.height/tileSize; i++) {
        grid.push([]);
        for(let j = 0; j < canvas.width/tileSize; j++) {
            grid[i].push(1);
        }
    }
}

function Tile(x, y, num) {

    this.pos = {x: x, y: y}
    this.w = tileSize;
    this.h = tileSize;
    this.wall = false;
    if(num == 0) {
        this.wall = true;
    }

    this.draw = function() {
        if(this.wall == false) {
            g.fillStyle = "black";
            g.fillRect(this.pos.x, this.pos.y, this.w, this.h);
        }
    }
}

makeGrid();

function generateMaze() {

    for(let i = 1; i < grid.length-1; i++) {
        if(i%2 == 1) {
            if(i == 1) {
                for(let j = 1; j < grid[i].length-1; j++) {
                    grid[i][j] = 0;
                }
            } else {
                let reachedEnd = false; 
                let count = 1;
                while(count < grid[i].length) {
                    let corridorLength = Math.round(Math.random()*10+1)
                    let leftRightChance = Math.round(Math.random())
                    if(corridorLength+count > grid[0].length-1) {
                        corridorLength = grid[0].length-1-count
                        console.log(i+"adfasdf");
                        console.log(corridorLength);
                    }
                    for(let j = count; j < count+corridorLength; j++) {
                        if(j < grid[i].length-1) {grid[i][j] = 0;}
                        if(leftRightChance == 0) {
                            if(j == count) {
                                if(grid[i-2][j] == 0) {
                                    grid[i-1][j] = 0;
                                } else {
                                    for(let k = i-1; k > 0; k--) {
                                        if(grid[k][j] == 0) {
                                            break;
                                        } else {
                                            grid[k][j] = 0;
                                        }
                                    }
                                }
                            }
                        }
                        if(leftRightChance == 1) {
                            if(j == count+corridorLength-1) {
                                if(grid[i-2][j] == 0) {
                                    grid[i-1][j] = 0;
                                } else {
                                    for(let k = i-1; k > 0; k--) {
                                        if(grid[k][j] == 0) {
                                            break;
                                        } else {
                                            grid[k][j] = 0;
                                        }
                                    }
                                }
                            }
                        }
                        
                        // if(addedUp == false) {
                        //     if(leftRightChance == 0) {
                        //         for(let k = i-1; k > 0; k--) {
                        //             if(grid[k][count] == 0) {
                        //                 break;
                        //             } else {
                        //                 grid[k][count] = 0;
                        //             }
                        //         }
                        //     }
                        //     if(leftRightChance == 1) {
                        //         for(let k = i-1; k > 0; k--) {
                        //             if(grid[k][count+corridorLength] == 0) {
                        //                 break;
                        //             } else {
                        //                 grid[k][count+corridorLength] = 0;
                        //             }
                        //         }
                        //     }
                        // }
                        
                    }
                    count+=corridorLength;
                    count++;
                }
            }
        }
    }

    for(let i = 2; i < grid.length; i++) {
        if(i%2 == 0) {
            for(let j = 0; j < grid[i].length-1; j++) {
                if(grid[i][j] == 0 && grid[i][j+1] == 0) {
                    grid[i][j] = 1;
                }
            }
        }
    }

}

generateMaze();

console.log(grid);

function generateTiles() {
    for(let i = 0; i < grid.length; i++) {
        for(let j = 0; j < grid[i].length; j++) {
            grid[i][j] = new Tile(j*tileSize, i*tileSize, grid[i][j]);
        }
    }
}

generateTiles();



function animate() {
    requestAnimationFrame(animate);
    g.clearRect(0,0,800,600);

    for(let i = 0; i < grid.length; i++) {
        for(let j = 0; j < grid[i].length; j++) {
            grid[i][j].draw();
        }
    }
}

animate();

