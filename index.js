//canvas setup
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
var width = window.innerWidth;
var height = window.innerHeight;
var scale = window.devicePixelRatio; 
canvas.style.cursor = "crosshair"; 
canvas.style.border = '1px solid black';
canvas.style.width = width + "px";
canvas.style.height = height + "px";
canvas.width = Math.floor(width* scale);
canvas.height = Math.floor(height * scale);
ctx.scale(scale, scale);
document.body.append(canvas);
////////////////////////////////
let cw = canvas.clientWidth;
let ch = canvas.clientHeight;
let particles = [];
let fireworks = [];
let mouseDown = false;
let mX_pos = 0;
let mY_pos = 0;

maxLimit = 5,
tick = 0,

autoTimerTotal = 10,
autoTimer = 0,


canvas.addEventListener('mousemove', e => {
    mX_pos = e.offsetX;
    mY_pos = e.offsetY;
    //console.log(mX_pos,mY_pos);
});
canvas.addEventListener('mousedown', e => {
    mouseDown = true;
});
canvas.addEventListener('mouseup', e => {
    mouseDown = false;
});


function random(min,max) {
    return Math.random() * (max-min) + min;
}
////////////////////////////////////////////////////////////////// PARTICLE FUNCTION
function Particle(x,y) {  
    this.x = x;
    this.y = y;

    this.coords = [];
    this.coords_size = 5; 
    for(let i = 0; i < this.coords_size; i++) {
        this.coords.push([this.x,this.y]);
    }
    this.angle = random(0, Math.PI * 2);
    this.speed = random(1,9);
    this.friction = 0.95;
    this.gravity = 1;

    this.alpha = 1;
    this.decay = random(0.015,0.03);

    this.hue = random(0,300);

}
Particle.prototype.update = function (i) { //////////////// UPDATE PARTICLE
    this.coords.pop();
    this.coords.unshift([this.x,this.y]);

    this.speed *= this.friction;
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed + this.gravity;

    this.alpha -= this.decay;
    if(this.alpha <= this.decay) {
        particles.splice(i,1);
    }

}
Particle.prototype.draw = function () { //////////////// DRAW PARTICLE
    ctx.beginPath();
    ctx.moveTo(this.coords[this.coords_size-1][0],
                this.coords[this.coords_size-1][1]);
    ctx.lineTo(this.x,this.y);
    ctx.strokeStyle = `hsla(${this.hue},100%,50%,${this.alpha})`;
    ctx.stroke();
}

function create_particles(x,y,count) {
    for(let i = 0; i < count; i++) {
        particles.push(new Particle(x,y));
    }
}
//////////////////////////////////////////////////////////////////

function calc_distance(x1,y1,x2,y2) {
    let d1 = Math.pow(x2-x1,2);
    let d2 = Math.pow(y2-y1,2);
    return Math.sqrt(d1+d2);
}


function Firework(sx,sy,tx,ty) {

    this.x = sx;
    this.y = sy;

    this.sx = sx;
    this.sy = sy;

    this.tx = tx;
    this.ty = ty;

    this.target_distance = calc_distance(this.sx, this.sy, this.tx, this.ty);
    this.distance_travled = 0;

    this.coords = [];
    this.coords_size = 1;
    for(let i = 0; i < this.coords_size; i++) {
        this.coords.push([this.x, this.y]);
    }


    this.speed = 2;
    this.acceleration = 1.05;
    this.angle = Math.atan2(ty-sy, tx-sx);
    this.hue = random(100,300);


}
Firework.prototype.update = function (i) {
    this.coords.pop();
    this.coords.unshift([this.x, this.y]);

    this.speed *= this.acceleration;
    let vx = Math.cos(this.angle) * this.speed;
    let vy = Math.sin(this.angle) * this.speed;
    this.distance_travled = calc_distance(this.sx, this.sy, this.x + vx, this.y + vy);

    if(this.distance_travled >= this.target_distance) {
        create_particles(this.tx,this.ty,100);
        fireworks.splice(i,1);
       
    } else {
        this.x += vx;
        this.y += vy;
    }

}
Firework.prototype.draw = function () { 
    ctx.beginPath();
    ctx.moveTo(this.coords[this.coords_size-1][0],
                this.coords[this.coords_size-1][1]);
    ctx.lineTo(this.x, this.y);
    ctx.strokeStyle =  ctx.strokeStyle = `hsl(${this.hue},100%,50%)`;
    ctx.stroke();
    
}

function create_firework(sx,sy,tx,ty,count) {
    for(let i = 0; i < count; i++) {
        fireworks.push(new Firework(sx,sy,tx,ty));
       
    }
}


function main() {
    requestAnimationFrame(main);
    ctx.clearRect(0,0,cw,ch);
    



    
    for(let i = 0; i < fireworks.length; i++) {
        fireworks[i].draw();
        fireworks[i].update(i);
    }
    for(let i = 0; i < particles.length; i++) {
        particles[i].draw();
        particles[i].update(i);
    }


    if( autoTimer >= autoTimerTotal ) {
		if( !mouseDown ) {
			// start the firework at the bottom middle of the screen, then set the random target coordinates, the random y coordinates will be set within the range of the top half of the screen
			fireworks.push( new Firework( cw / 2, ch, random( 0, cw ), random( 0, ch / 2 ) ) );
			autoTimer = 0;
		}
	} else {
		autoTimer++;
	}

    if( tick >= maxLimit ) {
		if( mouseDown ) {
			// start the firework at the bottom middle of the screen, then set the current mouse coordinates as the target
			fireworks.push( new Firework( cw / 2, ch, mX_pos, mY_pos ) );
			tick = 0;
		}
	} else {
		tick++;
	}
}

main();






