// Input

const INPUT_RIGHT = ["d", "D", "Right", "ArrowRight"];
const INPUT_LEFT = ["a", "A", "Left", "ArrowLeft"];
const INPUT_DOWN = ["s", "S", "Down", "ArrowDown"];
const DOUBLE_TAP_MAX = 300;


// Tomato

const GRAVITY = 0.06;
// Min and max values for the boost that a tomato gets when bounced.
const MIN_BOUNCE = -4; 
const MAX_BOUNCE = -5;
// How much a tomato's trajectory is influenced by how it hits the player.
const CONTROL = 0.05;
const TOMATO_TYPES = ["tomato", "orange"];


// Player

const WALK_SPEED = 5.5;
const SLIDE_SPEED = 11;
const SLIDE_DURATION = 250;


// Images

const PLAYER_IMG = findImage("hamster");
const TOMATO_IMGS = TOMATO_TYPES.map(findImage);
const SPLAT_IMGS = TOMATO_TYPES.map(x => findImage(x + "_splat"));
const BACKGROUND_IMG = findImage("background");
const GAMEOVER_IMG = findImage("gameover");