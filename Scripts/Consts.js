// Input

const INPUT_RIGHT = ["d", "D", "Right", "ArrowRight"];
const INPUT_LEFT = ["a", "A", "Left", "ArrowLeft"];
const INPUT_DOWN = ["s", "S", "Down", "ArrowDown", "Shift"];
const DOUBLE_TAP_MAX = 300;


// Tomato

const GRAVITY = 0.06;
// Min and max values for the boost that a tomato gets when bounced.
const MIN_BOUNCE = -4.5; 
const MAX_BOUNCE = -5;
// How much a tomato's trajectory is influenced by how it hits the player.
const CONTROL = 0.05;
const DECEL = 0.01;

// Duration of each blink and total number of blinks when a tomato spawns.
const BLINK_DUR = 6500; // Heh, blink ;)
const NUM_BLINKS = 3;

const TOMATOES = {
    "tomato": {
        "prob": 60,
        "bounce_pts": 1,
    },
    "orange": {
        "prob": 25,
        "hp": 5,
        "bounce_pts": 2,
    },
    "egg": {
        "prob": 15,
        "hp": 5,
        "pinata_pts": 15,
    },
};

// Player

const WALK_SPEED = 6;
const SLIDE_SPEED = 12;
const SLIDE_DURATION = 250;
const PLAYER_SIZE = 0.9;

const WALK_ANIM_SPEED = 1 / 200;
const WALK_ANIM_SCALE = 0.03;


// Items

// Combo needed to spawn a new tomato and initial y value.
const NEW_ITEM_COMBO = 3;
const NEW_ITEM_Y = 100;

const POWERUP_SPEED = 2.5;
const SPIN_ANIM_SPEED = 1 / 500;
const POWERUP_TYPES = ["speed_up", "magnet", "slow_time"];
const POWERUP_PROBS = {
    "speed_up": 35,
    "magnet": 35,
    "slow_time": 30,
};

const MAGNET_STR = 0.005;


// Images
let file = "";

let date = new Date();
let month = date.getMonth();
let day = date.getDate();

if(month == 3 && day == 1){
    file = "April Fools/";
}
else if(month == 11 && day == 25){
    file = "Christmas/";
}

const PLAYER_IMG = findImage(file + "critter");
const PLATE_IMG = findImage("plate");
for (type of Object.keys(TOMATOES)) {
    TOMATOES[type].img = findImage(file + type);
    TOMATOES[type].splatImg = findImage(file + type + "_splat");
}
const POWERUP_IMGS = POWERUP_TYPES.map(findImage);
const BACKGROUND_IMG = findImage("background");
const GAMEOVER_IMG = findImage("gameover");

// Audio