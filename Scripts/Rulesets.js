const DEFAULT_RULESET = {
    first_tomato: "tomato",
    new_item_combo: 3,
    item_probs: {
        tomato: 50,
        powerup: 50,
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
    mystery_prob: 0,
    hazard_cooldown: 12,
    hazard_probs: {
        fork: 100,
    },
    fork_probs: {
        middle: 60,
        right: 20,
        left: 20,
    }
};

const START_RULESET = {
    tomato_probs: {
        tomato: 70,
        orange: 30,
    },
    hazard_cooldown: 10,
};

const MIRROR_RULESET = {
    powerup_probs: {
        speed_up: 20,
        magnet: 20,
        slow_time: 20,
        mirror: 40,
    },
};

const BANANA_RULESET = {
    tomato_probs: {
        tomato: 60,
        orange: 25,
        banana: 15
    },
    powerup_probs: {
        speed_up: 20,
        magnet: 20,
        slow_time: 20,
        mirror: 40,
    },
};

const SPIKES_RULESET = {
    powerup_probs: {
        speed_up: 30,
        magnet: 30,
        slow_time: 20,
        mirror: 20,
    },
    hazard_cooldown: 10,
    hazard_probs: {
        fork: 70,
        spikes: 30,
    },
    mystery_prob: 20,
};

const IMPOSSIBLE_RULESET = {
    item_probs: {
        powerup: 100,
    },
    hazard_cooldown: 0.5,
    fork_probs: {
        middle: 100,
    },
};

const LEVELS = [
    START_RULESET,
    START_RULESET,
    START_RULESET,
    MIRROR_RULESET,
    MIRROR_RULESET,
    //BANANA_RULESET,
    SPIKES_RULESET,
]