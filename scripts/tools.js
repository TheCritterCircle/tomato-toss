"use strict";

/**
 * makes Image with src
 * @param {string} src
 */
function makeImg(src) {
	let i = new Image();
	i.src = src;
	return i;
}

/**
 * runs a function on every time in a list and lists in the list and such
 * @param {Array} list
 * @param {Function} func
 */
function nestedForEach(list, func) {
	for (let item of list)
		if (Array.isArray(item))
			nestedForEach(item, func);
		else
			func(item);
}