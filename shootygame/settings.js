const EXPLOSIONPARTICLES =  {
    speed: [1, 10], 
    size: [1, 70],
    shapes: ["circle"],
    effectWidth: 360,
    destroyTime: [5, 15],
    fadeOut: 0,
    shrink: 6,
    angle: 90,
    colors: ["yellow", "darkorange", "orange", "gray", "darkgray", "red"],
    particleAmount: 100,
    continuous: false,
    effectVel: {x: 0, y: 0},
    glowAmount: 20
}

const MUZZLEFLASHPARTICLES = {
    destroyTime: [0, 0],
    effectWidth: 360,
    continuous: false,
    speed: [0, 5],
    particleAmount: 20,
    shrink: 3,
    colors: ["yellow", "orange", "gold"],
    glowAmount: 10
}

const ACCELERATION = 0.85
const FRICTION = -0.1 //-0.05

const DASHCOST = 30;
const DASHFORCE = 27;

const TILESIZE = 125; //125