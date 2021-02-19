var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");

class GameObject {
	constructor(x, y, width, height, img, sx, sy, sWidth, sHeight){
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;

		this.offsetX = 0;
		this.offsetY = 0;
		this.angle = 0;

		this.img = img;
		this.sx = sx;
		this.sy = sy;
		this.sWidth = sWidth;
		this.sHeight = sHeight;

		this.velX = 0;
		this.velY = 0;
		this.velAng = 0;
	}

	main(){
		this.x += this.velX;
		this.y += this.velY;
		this.angle += this.velAng;
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
	constructor(x, y, width, height, img, sx, sy, sWidth, sHeight, speed, hitX, hitY, hitWidth, hitHeight){
		super(x, y, width, height, img, sx, sy, sWidth, sHeight);

		this.velX = 0;
		this.velY = 0;

		this.speed = speed;

		this.hitX = hitX;
		this.hitY = hitY;
		this.hitWidth = hitWidth;
		this.hitHeight = hitHeight;
	}

	main(){
		this.x += this.velX;
		this.y += this.velY
		this.hitX += this.velX;
		this.hitY += this.velY
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

	collision(){
		// Left Wall
		if(this.hitX < 0){
			if(isSliding && direction == "Left")
				this.endSlide();
			}
			this.x = 0 + this.x - this.hitX;
			this.hitX = 0;
		}

		// Right Wall
		if(this.hitX + this.hitWidth > canvas.width){
			if(isSliding && direction == "Right") {
					this.endSlide();
			}
			this.x = canvas.width - this.hitWidth + this.x - this.hitX;
			this.hitX = canvas.width - this.hitWidth;
		}
	}

	startSlide(){
		if (this.hitX > 0 && this.hitX + this.hitWidth < canvas.width) {
			this.speed = 10;

			this.hitWidth = this.height;
			this.hitHeight = this.width;
			this.hitY = canvas.height - this.width;

			if(direction == "Left"){
				this.angle = 90;
				this.hitX += 0;
				this.y += this.height - this.width;
				this.x += this.height;
			}
			else{
				this.angle = 270;
				this.hitX += this.width - this.height;
				this.y += this.height;
				this.x += this.width - this.height;
			}
			
			isSliding = true;
		}
	}
	endSlide(){
		this.speed = 5;
		this.angle = 0;

		this.y = canvas.height - this.height;
		if(direction == "Left")
			this.x -= this.height;
		else
			this.x += this.height - this.width;

		this.hitX = this.x;
		this.hitY = this.y;
		this.hitWidth = this.width;
		this.hitHeight = this.height;
		
		isSliding = false;
	}
}

class Tomato extends GameObject{
	constructor(x, y, width, height, img, sx, sy, sWidth, sHeight){
		super(x, y, width, height, img, sx, sy, sWidth, sHeight);

		this.velX = Math.random() * 3;
		this.velY = 0;

		this.offsetX = -this.width / 2;
		this.offsetY = -this.height / 2;

		this.hasScored = false;
	}

	gravity(){
		this.velY += 0.01;
	}
	
	spin(){
		this.velAng *= 0.995;
	}

	collision(){
		//Wall & Ceiling
		if(this.x + this.offsetX <= 0){
			this.x = 0 + this.width / 2;
			this.velX = -this.velX;
			this.velAng -= this.velX;
		}
		if(this.x + this.offsetX >= canvas.width - this.width){
			this.x = canvas.width - this.width / 2;
			this.velX = -this.velX;
			this.velAng += this.velY;
		}
		if(this.y + this.offsetY <= 0){
			this.y = 0 + this.height / 2;
			this.velY = -this.velY;
			this.velAng -= this.velY;
		}
		//Player
		if(this.x + this.offsetX <= player.hitX + player.hitWidth && this.x + this.offsetX >= player.hitX - this.width){
			if(this.y + this.offsetY >= player.hitY - this.height){
				this.velY = -Math.random() * 3 - 1;
				if(this.hasScored == false){
					score += 10;
					this.velAng -= player.velX - this.velX;
				}
				this.hasScored = true;
			}
		}
		if(this.velY > 0){
			this.hasScored = false;
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
let player = new Player(canvas.width/2, canvas.height - 200, 140, 196, playerImg, 134, 100, 70, 98, 5, canvas.width/2, canvas.height - 200, 140, 196);

let tomatoImg = new Image();
tomatoImg.src = "Sprites/tomato.png";
let orangeImg = new Image();
orangeImg.src = "Sprites/orange.png";
tomatoes = [new Tomato(250, 60, 50, 50, tomatoImg, 0, 0, 200, 200)];

let backgroundImg = new Image();
backgroundImg.src = "Sprites/background.png";
background = new GameObject(0, 0, canvas.width, canvas.height, backgroundImg, 0, 0, 855, 480);

let score = 0;

objects = [player];

function main(){

	for(let i = 0; i < objects.length; i++){
		objects[i].main();
		
	}
	player.collision();

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
	
	background.draw();

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

	ctx.beginPath();
	ctx.rect(player.hitX, player.hitY, player.hitWidth, player.hitHeight);
	ctx.stroke();

	setTimeout(draw, 10);
}

function addTomatoes(){
	switch(tomatoes.length){
		case 1:
			if(score > 40){
				tomatoes.push(new Tomato(250, 60, 50, 50, tomatoImg, 0, 0, 200, 200))
			}
			break;
		case 2:
			if(score > 200){
				tomatoes.push(new Tomato(250, 60, 50, 50, orangeImg, 0, 0, 200, 200))
			}
			break;
	}
}

main();
draw();

//Keyboard Controls

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e){
	if(e.key == "Right" || e.key == "ArrowRight"){
		if(!isSliding){
			rightPressed = true;
			direction = "Right";
		}
    }
    else if(e.key == "Left" || e.key == "ArrowLeft"){
		if(!isSliding){
			leftPressed = true;
			direction = "Left";
		}
	}
	else if(e.key == "Down" || e.key == "ArrowDown"){
		if(isSliding == false){
			player.startSlide();
		}
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
		if(isSliding == true){
			player.endSlide();
		}
	}
}

//Touch & Mouse Controls

document.addEventListener("mousedown", mouseDown, false);
document.addEventListener("mouseup", mouseUp, false);

canvas.addEventListener("touchstart", TouchDown, false);
canvas.addEventListener("touchend", TouchUp, false);

function mouseDown(e){
	let rect = canvas.getBoundingClientRect();
    if(e.clientX > rect.left + canvas.width / 2){
		rightPressed = true;
	}
	else if(e.clientX < rect.left + canvas.width / 2){
		leftPressed = true;
	}
}
function mouseUp(e){
	rightPressed = false;
	leftPressed = false;
}

function TouchDown(e){
	let rect = canvas.getBoundingClientRect();
    if(e.touches[0].clientX > rect.left + canvas.width / 2){
		rightPressed = true;
	}
	else if(e.touches[0].clientX < rect.left + canvas.width / 2){
		leftPressed = true;
	}
}
function TouchUp(e){
	rightPressed = false;
	leftPressed = false;
}