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
    hazard_cooldown: 10,
    hazard_probs: {
        fork: 100,
    },
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
    hazard_cooldown: 12,
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
    DEFAULT_RULESET,
    DEFAULT_RULESET,
    DEFAULT_RULESET,
    MIRROR_RULESET,
    MIRROR_RULESET,
    SPIKES_RULESET,
]