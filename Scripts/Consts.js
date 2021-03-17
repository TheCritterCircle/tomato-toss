// Input

const INPUT_RIGHT = ["d", "D", "Right", "ArrowRight"];
const INPUT_LEFT = ["a", "A", "Left", "ArrowLeft"];
const INPUT_DOWN = ["s", "S", "Down", "ArrowDown", "Shift"];
const DOUBLE_TAP_MAX = 300;


// Tomato

const GRAVITY = 0.06;
// Min and max values for the boost that a tomato gets when bounced.
const MIN_BOUNCE = -4; 
const MAX_BOUNCE = -5;
// How much a tomato's trajectory is influenced by how it hits the player.
const CONTROL = 0.05;

const TOMATO_TYPES = ["tomato", "orange", "egg"];
// Duration of each blink and total number of blinks when a tomato spawns.
const BLINK_DUR = 6000; // Heh, blink ;)
const NUM_BLINKS = 2;


// Player

const WALK_SPEED = 6;
const SLIDE_SPEED = 12;
const SLIDE_DURATION = 250;
const PLAYER_SIZE = 0.9;

const WALK_ANIM_SPEED = 1 / 200;
const WALK_ANIM_SCALE = 0.03;


// Items

// Combo needed to spawn a new tomato and initial y value.
const NEW_ITEM_COMBO = 5;
const NEW_ITEM_Y = 60;

const POWERUP_SPEED = 2.5;
const SPIN_ANIM_SPEED = 1 / 500;
const POWERUP_TYPES = ["speed_up"];
const ITEM_PROBS = {
    "tomato": 50,
    "orange": 10,
    "egg": 5,
    "speed_up": 25,
};


// Images

const PLAYER_IMG = findImage("critter");
const PLATE_IMG = findImage("plate");
const TOMATO_IMGS = TOMATO_TYPES.map(findImage);
const POWERUP_IMGS = POWERUP_TYPES.map(findImage);
const SPLAT_IMGS = TOMATO_TYPES.map(x => findImage(x + "_splat"));
const BACKGROUND_IMG = findImage("background");
const GAMEOVER_IMG = findImage("gameover");

// Audio