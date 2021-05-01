function findImage(name) {
	let img = new Image();
	img.src = "Sprites/" + name + ".png";
	return img;
}

function findSpecialImage(file, name){
	try{
		let img = new Image();
		img.src = "Sprites/" + file + name + ".png";
		ctx.draw(img);
		return img;
	}
	catch(err){
		return findImage(name);
	}
}

function findAudio(name) {
	return new Audio("Sounds/" + name + ".wav");
}