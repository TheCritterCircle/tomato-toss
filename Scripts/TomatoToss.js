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
	}

	main(){
		this.x += this.velX;
		this.y += this.velY
		ctx.drawImage(this.img, this.sx, this.sy, this.sWidth, this.sHeight, this.x, this.y, this.width, this.height);
	}

	drawMore(img, x, y, width, height, sx, sy, sWidth, sHeight){
		ctx.drawImage(img, sx, sy, sWidth, sHeight, x + this.x, y + this.y, width, height);
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
		if(rightPressed){
			this.velX = this.speed;
		}
		else if(leftPressed){
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

		this.velX = Math.random() * 3 - 1;
		this.velY = 0;

	}

	gravity(){
		this.velY += 0.01;
	}

	collision(){
		if(this.x <= 0 || this.x >= canvas.width - this.width){
			this.velX = -this.velX;
		}
		if(this.y <= 0){
			this.y = 0;
			this.velY = -this.velY;
		}
		if(this.x <= player.x + player.width && this.x >= player.x - this.width){
			if(this.y >= player.y - this.height){
				this.velY = -Math.random() * 3 - 1;
				score += 10;
			}
		}
	}
}



//Functions & Code

var rightPressed = false;
var leftPressed = false;

var playerImg = new Image();
playerImg.src = "Sprites/hamster.png";
var player = new Player(canvas.width/2, canvas.height - 200, 140, 196, playerImg, 134, 100, 70, 98, 5);

var tomatoImg = new Image();
tomatoImg.src = "Sprites/tomato.png";
tomatoes = [new Tomato(250, 10, 40, 40, tomatoImg, 0, 0, 200, 200)];

var score = 0;

objects = [player];

function main(){

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	for(let i = 0; i < objects.length; i++){
		objects[i].main();
	}

	player.drawMore(playerImg, 27, 30, 80, 90, 63, 203, 40, 45);

	for(let i = 0; i < tomatoes.length; i++){
		tomatoes[i].main();
		tomatoes[i].gravity();
		tomatoes[i].collision();
	}

	ctx.font = "30px Arial";
	ctx.fillText(score, 10, 30);

	player.move();

	addTomatoes();
}

function addTomatoes(){
	switch(tomatoes.length){
		case 1:
			if(score > 40){
				tomatoes.push(new Tomato(250, 10, 40, 40, tomatoImg, 0, 0, 200, 200))
			}
			break;
		case 2:
			if(score > 200){
				tomatoes.push(new Tomato(250, 10, 40, 40, tomatoImg, 0, 0, 200, 200))
			}
			break;
	}
}

function slide(){
	player.speed = 10;
	player.width = 196;
	player.height = 140;
	player.y = canvas.height - 140;
}
function getUp(){
	player.speed = 5;
	player.height = 196;
	player.width = 140;
	player.y = canvas.height - 196;
}

setInterval(main, 10);



//Inputs

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

document.addEventListener("mousemove", mouseMoveHandler, false);

function keyDownHandler(e){
if(e.key == "Right" || e.key == "ArrowRight"){
		rightPressed = true;
    }
    else if(e.key == "Left" || e.key == "ArrowLeft"){
		leftPressed = true;
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