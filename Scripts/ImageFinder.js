function findImage(name) {
	let img = new Image();
	img.src = "Sprites/" + name + ".png";
	return img;
}

function findAudio(name) {
	return new Audio("Sounds/" + name + ".wav");
}