//canvas setup
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
function setup_canvas() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    var scale = window.devicePixelRatio; 
    canvas.style.cursor = "crosshair"; 
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    canvas.style.backgroundColor = 'black';
    canvas.width = Math.floor(width* scale);
    canvas.height = Math.floor(height * scale);
    ctx.scale(scale, scale);
    document.body.append(canvas);
}
setup_canvas();



var canvas_width = canvas.clientWidth;
var canvas_height = canvas.clientHeight;
var particles = [];
var fireworks = [];

var maxFireRate = 5;
var fireRate = 0;

var maxAutoRate = 30;
var autoFireRate = 0;

var colors = ['red','green','blue','yellow','orange','purple','magenta','cyan','white'];
var mousedown = false;
var mouseX = 0;
var mouseY = 0;

addEventListener('resize', (event) => {
    setup_canvas();
    canvas_width = canvas.clientWidth;
    canvas_height = canvas.clientHeight;
});
canvas.addEventListener('mousemove', e => {
    mouseX = e.pageX - canvas.offsetLeft;
	mouseY = e.pageY - canvas.offsetTop;

})
canvas.addEventListener('mousedown', e => {
    mousedown = true;
})
canvas.addEventListener('mouseup', e => {
    mousedown = false;
})


canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    var touch = e.touches[0] || e.changedTouches[0];
    mouseX = touch.clientX;
    mouseY = touch.clientY;

});
canvas.addEventListener('touchstart', e => {
    mousedown = true;
});
canvas.addEventListener('touchend', e => {
    mousedown = false;
});



function rand(min,max) {
    return Math.random() * (max-min) + min;
}

function calc_distance(x1,y1,x2,y2) {
    let dx = Math.pow(x2-x1,2);
    let dy = Math.pow(y2-y1,2);
    return Math.sqrt(dx+dy);
}



class Particle {
    constructor(x,y,h,mixedHue) {
        this.sx = x;
        this.sy = y;

        this.x = x;
        this.y = y;

        this.tail = [];
        this.tail_size = 5;
        for(let i = 0; i < this.tail_size; i++) {
            this.tail.push([this.x,this.y]);
        }
        this.angle = rand(0,Math.PI*2);
        this.speed = rand(10,20);
        this.friction = .9;
        this.gravity = 2;
        this.alpha = 1;
        this.decay = rand(0.01,0.1)
        this.mixedHue = mixedHue;
        this.h = h;
    
        
    }
    update(i) {
        this.tail.pop();
        this.tail.unshift([this.x, this.y]);

        this.speed *= this.friction;
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed + this.gravity;
        
        this.alpha -= this.decay;
        if(this.alpha <= this.decay) { 
            particles.splice(i,1);
            ctx.beginPath();
            ctx.arc(this.x,this.y,2,0,Math.PI*2,false);
            ctx.fillStyle = `white`;
            ctx.fill();
            
        }
    }
    draw() {
        ctx.beginPath();
        ctx.moveTo(this.tail[this.tail_size - 1][0], this.tail[this.tail_size - 1][1]);
        ctx.quadraticCurveTo(this.tail[this.tail_size-1][0],this.tail[this.tail_size-1][1],this.x,this.y);
        if(this.mixedHue) {
            ctx.strokeStyle = `hsla(${rand(100,360)},100%,50%,${this.alpha})`;
            
        } else {
            ctx.strokeStyle = `hsla(${this.h},100%,50%,${this.alpha})`;
        }
        ctx.lineWidth = '3';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round'
        ctx.stroke();
        ctx.lineWidth = '1';
        ctx.lineCap = 'butt';
        ctx.lineJoin = 'miter';

        ctx.beginPath();
        ctx.arc(this.x,this.y,2,0,Math.PI*2,false);
        ctx.fillStyle = `hsla(0,100%,100%,${this.alpha})`;
        ctx.fill();

    }
}


class Firework {
    constructor(sx,sy,tx,ty,h,mixedHue) {
        this.x = sx;
        this.y = sy;
        this.sx = sx;
        this.sy = sy;
        this.tx = tx;
        this.ty = ty;
        this.target_distance = calc_distance(this.sx,this.sy,this.tx,this.ty);
        this.distance_tranvled = 0;

        this.tail = [];
        this.tail_size = 1;
        for(let i = 0; i < this.tail_size; i++) {
            this.tail.push([this.x,this.y]);
        }

        this.angle = Math.atan2( ty - sy, tx - sx );
        this.speed = 1;
        this.acceleration = .5;
        this.mixedHue = mixedHue;
        this.h = h;
    
        

    }
    update(i) {

        this.tail.pop();
        this.tail.unshift([this.x,this.y]);

        this.speed += this.acceleration;
        let vx = Math.cos(this.angle) * this.speed;
        let vy = Math.sin(this.angle) * this.speed;

       
        this.distance_tranvled = calc_distance(this.sx, this.sy, this.x + vx, this.y + vy);
        if(this.distance_tranvled >= this.target_distance) {
            fireworks.splice(i,1);
            create_particles(this.tx,this.ty,rand(50,200),this.h,this.mixedHue);
        } else {
            this.x += vx;
            this.y += vy;
        }
    }
    draw() {
        
        
        ctx.save();
        ctx.translate(this.tx,this.ty);
        ctx.rotate((Math.PI/180)+this.y/200)
        drawTarget(0,0,`hsl(${this.h},100%,50%)`);
        ctx.restore();


        ctx.beginPath();
        ctx.moveTo(this.tail[this.tail_size-1][0],this.tail[this.tail_size-1][1]);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle =  `hsl(${this.h},100%,50%)`;
        ctx.stroke();
        ctx.closePath();
    }
}
function create_particles(x,y,count,color,mixedHue) {
    //let random_color = colors[Math.floor(rand(0,colors.length-1))];
    let random_color = rand(50,360);
    for(let i = 0; i < count; i++) {
        particles.push(new Particle(x,y,color,mixedHue));
    }
}
function drawTarget(x,y,color) {
    ctx.beginPath();
    ctx.moveTo(x-10,y);
    ctx.lineTo(x+10,y);
    ctx.moveTo(x,y-10);
    ctx.lineTo(x,y+10);
    ctx.strokeStyle = color;
    ctx.stroke();
}


function main() {
    ctx.clearRect(0,0,canvas_width,canvas_height);
    for(let i = 0; i < fireworks.length; i++) {
        fireworks[i].draw();
        fireworks[i].update(i);
    }
    for(let i = 0; i < particles.length; i++) {
        particles[i].draw();
        particles[i].update(i);
    }
    if(mousedown) {
        if(fireRate >= maxFireRate) {
            let randMix = Math.floor(rand(0,2));
            fireworks.push(new Firework(rand(100,canvas_width-100),canvas_height,mouseX,mouseY,rand(100,360),randMix));
            fireRate = 0;
        } else {
            fireRate++;
        }
    }
        if(autoFireRate >= maxAutoRate) {
            if(!mousedown) {
                let randX = rand(100,canvas_width-100);
                let randY = rand(100,canvas_height-100);
                let randMix = Math.floor(rand(0,2));
                fireworks.push(new Firework(randX,canvas_height,randX,randY,rand(100,3),randMix));
                autoFireRate = 0;
            }
        } else {
            autoFireRate++;
        } 
    requestAnimationFrame(main);
}
main();