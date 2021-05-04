const DEFAULT_RULESET = {
    first_tomato: "tomato",
    item_probs: {
        tomato: 50,
        powerup: 50,
        fork: 0,
    },
    tomato_probs: {
        tomato: 60,
        orange: 25,
        egg: 15,
    },
    powerup_probs: {
        speed_up: 35,
        magnet: 35,
        slow_time: 30,
    },
    new_item_combo: 3,
    fork_cooldown: 5,
    fork_probs: {
        middle: 60,
        right: 20,
        left: 20,
    }
};

const MIRROR_RULESET = {
    powerup_probs: {
        speed_up: 20,
        magnet: 20,
        slow_time: 20,
        mirror: 40,
    },
    fork_cooldown: 6,
};

const IMPOSSIBLE_RULESET = {
    item_probs: {
        tomato: 0,
        powerup: 100,
        fork: 0,
    },
    fork_cooldown: 0.2,
    fork_probs: {
        middle: 100,
        right: 0,
        left: 0,
    }
};