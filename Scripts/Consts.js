const VERSION = "Eventful";

// Input

const CONTROLS = {
    "KeyA": "left",
    "ArrowLeft": "left",

    "KeyD": "right",
    "ArrowRight": "right",

    "KeyS": "down",
    "ArrowDown": "down",
    "ShiftLeft": "down",

    "KeyP": "pause",
    "KeyM": "mute",
}

const DOUBLE_TAP_MAX = 300;

/*
const INPUT_RIGHT = ["KeyD", "ArrowRight"];
const INPUT_LEFT = ["KeyA", "ArrowLeft"];
const INPUT_DOWN = ["KeyS", "ArrowDown", "ShiftLeft"];
const INPUT_PAUSE = ["KeyP"];
*/


// Tomato

const GRAVITY = 0.06;
// Min and max values for the boost that a tomato gets when bounced.
const MIN_BOUNCE = -4.5; 
const MAX_BOUNCE = -5;
// How much a tomato's trajectory is influenced by how it hits the player.
const CONTROL = 0.05;
const DECEL = 0.01;

// Duration of each blink and total number of blinks when a tomato spawns.

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
const TOMATO_TYPES = Object.keys(TOMATOES);

// Power-ups

const POWERUPS = {
    "speed_up": {
        "name": "Speed Up",
        "quality": 1,
    },
    "magnet": {
        "name": "Magnet",
        "quality": 1,
    },
    "slow_time": {
        "name": "Slow Time",
        "quality": 1,
    },
    "mirror": {
        "name": "Mirrored",
        "quality": -1,
    },
}
const POWERUP_TYPES = Object.keys(POWERUPS);

// Player

const WALK_SPEED = 6;
const SLIDE_SPEED = 12;
const SLIDE_DURATION = 250;
const PLAYER_SIZE = 0.9;

const WALK_ANIM_SPEED = 1 / 200;
const WALK_ANIM_SCALE = 0.03;
const MAX_GHOSTS = 3;


// Items

// Combo needed to spawn a new tomato and initial y value.
const NEW_ITEM_Y = 100;
const BLINK_DUR = 0.8; // Heh, blink ;)
const NUM_BLINKS = 3;

const POWERUP_SPEED = 2.5;
const FORK_SPEED = 5;
const SPIN_ANIM_SPEED = 16.2;
const ITEM_TYPES = ["tomato", "powerup", "fork"];
const FORK_TYPES = ["middle", "right", "left"];

const MAGNET_STR = 0.007;

const FORK_DIRS = {
    "middle": Math.PI/2,
    "left": Math.PI*2/3,
    "right": Math.PI/3,
}

// Images
let file = "";

let date = new Date();
let month = date.getMonth();
let day = date.getDate();

if(month == 3 && day == 1){
    file = "April Fools/";
}
else if(month == 11 && day <= 25 && day >= 13){
    file = "Christmas/";
}

const PLAYER_IMG = findSpecialImage(file, "critter");
const PLATE_IMG = findImage("plate");
for (type of Object.keys(TOMATOES)) {
    TOMATOES[type].img = findSpecialImage(file, type);
    TOMATOES[type].splatImg = findSpecialImage(file, type + "_splat");
}
const SPD_GHOST_IMG = findImage("speed_ghost");
const POWERUP_IMGS = POWERUP_TYPES.map(findImage);
const FORK_IMG = findImage("fork");

const SPIKE_IMG = findImage("spikes");
const WARNING = findImage("warning");

const BACKGROUND_IMG = findSpecialImage(file, "background");
const GAMEOVER_IMG = findImage("gameover");
const PAUSE_IMG = findImage("pause")

const LOGO = findImage("Menu/logo");
const START_BTN = findImage("Menu/start");
const UNPAUSE_BTN = findImage("Menu/unpause");
const PAUSE_BTN = findImage("Menu/pause");
const MUTE_BTN = findImage("Menu/mute");
const BACK_BTN = findImage("Menu/back");
const NEXT_BTN = findImage("Menu/next");
const PREV_BTN = findImage("Menu/prev");
const HELP_BTN = findImage("Menu/help");

// Help

const HELP_PAGES = []
for (let i = 0; i < 3; i++) HELP_PAGES.push(findImage("Help/page" + i));

// Audio