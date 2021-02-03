var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");

class GameObject {
	constructor(x, y, width, height, img, sx, sy, sWidth, sHeight){
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.img = img;
		this.sx = sx;
		this.sy = sy;
		this.sWidth = sWidth;
		this.sHeight = sHeight;

		this.velX = 0;
		this.velY = 0;

		this.offsetX = 0;
		this.offsetY = 0;

		this.angle = 0;
	}

	main(){
		this.x += this.velX;
		this.y += this.velY
	}

	draw(){
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.rotate(this.angle * Math.PI / 180);
		ctx.translate(-this.x, -this.y);
		ctx.drawImage(this.img, this.sx, this.sy, this.sWidth, this.sHeight, this.x + this.offsetX, this.y + this.offsetY, this.width, this.height);
		ctx.restore();
	}

	drawMore(img, x, y, width, height, sx, sy, sWidth, sHeight){
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.rotate(this.angle * Math.PI / 180);
		ctx.translate(-this.x, -this.y);
		ctx.drawImage(img, sx, sy, sWidth, sHeight, x + this.x, y + this.y, width, height);
		ctx.restore();
	}
}

class Player extends GameObject{
	constructor(x, y, width, height, img, sx, sy, sWidth, sHeight, speed){
		super(x, y, width, height, img, sx, sy, sWidth, sHeight);

		this.velX = 0;
		this.velY = 0;

		this.speed = speed;
	}

	move(){
		if(rightPressed || isSliding && direction == "Right"){
			this.velX = this.speed;
		}
		else if(leftPressed || isSliding && direction == "Left"){
			this.velX = -this.speed;
		}
		else{
			this.velX = 0;
		}
	}

}

class Tomato extends GameObject{
	constructor(x, y, width, height, img, sx, sy, sWidth, sHeight){
		super(x, y, width, height, img, sx, sy, sWidth, sHeight);

		this.velX = Math.random() * 3;
		this.velY = 0;

		this.offsetX = -this.width / 2;
		this.offsetY = -this.height / 2;
	}

	gravity(){
		this.velY += 0.01;
	}
	
	spin(){
		if(this.velY > 0){
			this.angle += this.velX + this.velY;
		}
		else{
			this.angle += this.velX - this.velY;
		}
	}

	collision(){
		if(this.x + this.offsetX <= 0 || this.x + this.offsetX >= canvas.width - this.width){
			this.velX = -this.velX;
		}
		if(this.y + this.offsetY <= 0){
			this.y = 0 + this.height / 2;
			this.velY = -this.velY;
		}
		if(this.x + this.offsetX <= player.x + player.width && this.x + this.offsetX >= player.x - this.width){
			if(this.y + this.offsetY >= player.y - this.height){
				this.velY = -Math.random() * 3 - 1;
				score += 10;
			}
		}
	}
}



//Functions & Code

let rightPressed = false;
let leftPressed = false;

let direction = "Right";
let isSliding = false;

let playerImg = new Image();
playerImg.src = "Sprites/hamster.png";
let player = new Player(canvas.width/2, canvas.height - 200, 140, 196, playerImg, 134, 100, 70, 98, 5);

let tomatoImg = new Image();
tomatoImg.src = "Sprites/tomato.png";
tomatoes = [new Tomato(250, 60, 40, 40, tomatoImg, 0, 0, 200, 200)];

let score = 0;

objects = [player];

function main(){

	for(let i = 0; i < objects.length; i++){
		objects[i].main();
	}

	for(let i = 0; i < tomatoes.length; i++){
		tomatoes[i].main();
		tomatoes[i].gravity();
		tomatoes[i].collision();
	}

	player.move();

	addTomatoes();

	setTimeout(main, 10);
}

function draw(){
	
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	for(let i = 0; i < objects.length; i++){
		objects[i].draw();
	}

	for(let i = 0; i < tomatoes.length; i++){
		tomatoes[i].draw();
		tomatoes[i].spin();
	}

	player.drawMore(playerImg, 27, 30, 80, 90, 63, 203, 40, 45);

	ctx.font = "30px Arial";
	ctx.fillText(score, 10, 30);

	setTimeout(draw, 10);
}

function addTomatoes(){
	switch(tomatoes.length){
		case 1:
			if(score > 40){
				tomatoes.push(new Tomato(250, 60, 40, 40, tomatoImg, 0, 0, 200, 200))
			}
			break;
		case 2:
			if(score > 200){
				tomatoes.push(new Tomato(250, 60, 40, 40, tomatoImg, 0, 0, 200, 200))
			}
			break;
	}
}

function slide(){
	player.speed = 10;
	player.width = 196;
	player.height = 140;
	player.y = canvas.height - 140;
	isSliding = true;
}
function getUp(){
	player.speed = 5;
	player.height = 196;
	player.width = 140;
	player.y = canvas.height - 196;
	isSliding = false;
}

main();
draw();


//Inputs

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

document.addEventListener("mousemove", mouseMoveHandler, false);

function keyDownHandler(e){
if(e.key == "Right" || e.key == "ArrowRight"){
		rightPressed = true;
		direction = "Right";
    }
    else if(e.key == "Left" || e.key == "ArrowLeft"){
		leftPressed = true;
		direction = "Left";
	}
	else if(e.key == "Down" || e.key == "ArrowDown"){
		slide();
	}
}

function keyUpHandler(e){
	if(e.key == "Right" || e.key == "ArrowRight"){
		rightPressed = false;
	}
    else if(e.key == "Left" || e.key == "ArrowLeft"){
		leftPressed = false;
	}
	else if(e.key == "Down" || e.key == "ArrowDown"){
		getUp();
	}
}

function mouseMoveHandler(e){
        
}