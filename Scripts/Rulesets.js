const DEFAULT_RULESET = {
    first_tomato: "tomato",
    item_probs: {
        tomato: 0,
        powerup: 100,
        fork: 0,
    },
    tomato_probs: {
        tomato: 60,
        orange: 25,
        egg: 15,
    },
    powerup_probs: {
        speed_up: 0,
        magnet: 0,
        slow_time: 100,
    },
    new_item_combo: 3,
    fork_cooldown: 2,
    fork_probs: {
        middle: 60,
        right: 20,
        left: 20,
    }
};

const IMPOSSIBLE_RULESET = {
    first_tomato: "tomato",
    item_probs: {
        tomato: 0,
        powerup: 100,
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
    fork_cooldown: 0.2,
    fork_probs: {
        middle: 60,
        right: 20,
        left: 20,
    }
};