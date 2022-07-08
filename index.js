//canvas setup
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
function setup_canvas() {
    
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
}
setup_canvas();




addEventListener('resize', (event) => {
    setup_canvas();
    cw = canvas.clientWidth;
    ch = canvas.clientHeight;
});

////////////////////////////////
var cw = canvas.clientWidth;
var ch = canvas.clientHeight;
var particles = [];
var fireworks = [];
var mouseDown = false;
var mX_pos = 0;
var mY_pos = 0;
var h = 0;


var colors = ['red','green','blue','yellow','orange','magenta','white'];






maxLimit = 5,
tick = 0,

autoTimerTotal = 20,
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


canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    var touch = e.touches[0] || e.changedTouches[0];
    mX_pos = touch.clientX;
    mY_pos = touch.clientY;
    
    console.log(mX_pos,mY_pos);
});
canvas.addEventListener('touchstart', e => {
    mouseDown = true;
});
canvas.addEventListener('touchend', e => {
    mouseDown = false;
});


function random(min,max) {
    return Math.random() * (max-min) + min;
}
////////////////////////////////////////////////////////////////// PARTICLE FUNCTION
function Particle(x,y,color) {  
    
    this.x = x;
    this.y = y;

    this.coords = [];
    this.coords_size = 5; 
    for(let i = 0; i < this.coords_size; i++) {
        this.coords.push([this.x,this.y]);
    }
    this.angle = random(0, Math.PI * 2);
    this.speed = random(1,10);
    this.friction = 0.95;
    this.gravity = 1;

    this.alpha = 1;
    this.decay = random( 0.015, 0.03 );
   
    
}
Particle.prototype.update = function (i) { //////////////// UPDATE PARTICLE FUNCTION
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
Particle.prototype.draw = function () { //////////////// DRAW PARTICLE FUNCTION
    ctx.beginPath();
    ctx.moveTo(this.coords[this.coords_size-1][0],
                this.coords[this.coords_size-1][1]);
    ctx.lineTo(this.x,this.y);
    ctx.strokeStyle = colors[Math.floor(random(0,colors.length-1))];
    




    
   


    ctx.lineWidth = '3';
    ctx.lineCap = 'round';
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

////////////////////////////////////////////////////////////////// FIREWORK FUNCTION
function Firework(sx,sy,tx,ty,color) {
   
    this.x = sx;
    this.y = sy;

    this.sx = sx;
    this.sy = sy;

    this.tx = tx;
    this.ty = ty;

    this.target_distance = calc_distance(this.sx, this.sy, this.tx, this.ty);
    this.distance_travled = 0;

    this.coords = [];
    this.coords_size = 3;
    for(let i = 0; i < this.coords_size; i++) {
        this.coords.push([this.x, this.y]);
    }


    this.speed = 2;
    this.acceleration = 1.05;
    this.angle = Math.atan2(ty-sy, tx-sx);
    this.hue = random(100,300);
    
    
   


}
////////////////////////////////////////////////////////////////// UPDATE FIREWORK FUNCTION
Firework.prototype.update = function (i) {
    this.coords.pop();
    this.coords.unshift([this.x, this.y]);

    this.speed *= this.acceleration;
    let vx = Math.cos(this.angle) * this.speed;
    let vy = Math.sin(this.angle) * this.speed;
    this.distance_travled = calc_distance(this.sx, this.sy, this.x + vx, this.y + vy);

    if(this.distance_travled >= this.target_distance) {
        create_particles(this.tx,this.ty,100,this.co);
        fireworks.splice(i,1);
       
    } else {
        this.x += vx;
        this.y += vy;
    }

}
////////////////////////////////////////////////////////////////// DRAW FIREWORK FUNCTION
Firework.prototype.draw = function () { 
    ctx.beginPath();
    ctx.moveTo(this.coords[this.coords_size-1][0],
                this.coords[this.coords_size-1][1]);
    ctx.lineTo(this.x, this.y);
    ctx.strokeStyle =  colors[Math.floor(random(0,colors.length-1))];
    ctx.stroke();
    
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
            let xpos = random(100,cw-100);
			fireworks.push( new Firework( xpos, ch, xpos, random( 0, ch / 2 )));
			autoTimer = 0;
		}
	} else {
        
		autoTimer++;
	}

    if( tick >= maxLimit ) {
		if( mouseDown ) {
			fireworks.push( new Firework(  mX_pos+random(-100,100), ch, mX_pos, mY_pos));
			tick = 0;
		}
	} else {
		tick++;
	}
}

main();






