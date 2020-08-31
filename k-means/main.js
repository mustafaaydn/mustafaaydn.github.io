// K-means simulator!
// Mayd, 9.9.19

/**
alert("if you're going to supply a user-defined data,
each line of it ought to be in the following format:
/^\\s*(\\d+)\\s*,\\s*(\\d+)\\s*$/ where captured-groups represent x and y
*/
const COLORS = ['AliceBlue', 'AntiqueWhite', 'Aqua', 'Aquamarine', 'Azure', 'Beige', 'Bisque', 'Black', 'BlanchedAlmond',
	'Blue', 'BlueViolet', 'Brown', 'BurlyWood', 'CadetBlue', 'Chartreuse', 'Chocolate', 'Coral', 'CornflowerBlue', 'Cornsilk',
	'Crimson', 'Cyan', 'DarkBlue', 'DarkCyan', 'DarkGoldenRod', 'DarkGray', 'DarkGrey', 'DarkGreen', 'DarkKhaki', 'DarkMagenta',
	'DarkOliveGreen', 'DarkOrange', 'DarkOrchid', 'DarkRed', 'DarkSalmon', 'DarkSeaGreen', 'DarkSlateBlue', 'DarkSlateGray',
	'DarkSlateGrey', 'DarkTurquoise', 'DarkViolet', 'DeepPink', 'DeepSkyBlue', 'DimGray', 'DimGrey', 'DodgerBlue', 'FireBrick',
	'FloralWhite', 'ForestGreen', 'Fuchsia', 'Gainsboro', 'GhostWhite', 'Gold', 'GoldenRod', 'Gray', 'Grey', 'Green',
	'GreenYellow', 'HoneyDew', 'HotPink', 'IndianRed', 'Indigo', 'Ivory', 'Khaki', 'Lavender', 'LavenderBlush', 'LawnGreen',
	'LemonChiffon', 'LightBlue', 'LightCoral', 'LightCyan', 'LightGoldenRodYellow', 'LightGray', 'LightGrey', 'LightGreen',
	'LightPink', 'LightSalmon', 'LightSeaGreen', 'LightSkyBlue', 'LightSlateGray', 'LightSlateGrey', 'LightSteelBlue',
	'LightYellow', 'Lime', 'LimeGreen', 'Linen', 'Magenta', 'Maroon', 'MediumAquaMarine', 'MediumBlue', 'MediumOrchid',
	'MediumPurple', 'MediumSeaGreen', 'MediumSlateBlue', 'MediumSpringGreen', 'MediumTurquoise', 'MediumVioletRed',
	'MidnightBlue', 'MintCream', 'MistyRose', 'Moccasin', 'NavajoWhite', 'Navy', 'OldLace', 'Olive', 'OliveDrab',
	'Orange', 'OrangeRed', 'Orchid', 'PaleGoldenRod', 'PaleGreen', 'PaleTurquoise', 'PaleVioletRed', 'PapayaWhip',
	'PeachPuff', 'Peru', 'Pink', 'Plum', 'PowderBlue', 'Purple', 'RebeccaPurple', 'Red', 'RosyBrown', 'RoyalBlue',
	'SaddleBrown', 'Salmon', 'SandyBrown', 'SeaGreen', 'SeaShell', 'Sienna', 'Silver', 'SkyBlue', 'SlateBlue',
	'SlateGray', 'SlateGrey', 'Snow', 'SpringGreen', 'SteelBlue', 'Tan', 'Teal', 'Thistle', 'Tomato', 'Turquoise',
	'Violet', 'Wheat', 'White', 'WhiteSmoke', 'Yellow', 'YellowGreen'
];

//Main parameters
let K; // yay!
let points = []; // Points of interest
let numPoints;
let centroids = [];
let initMethod;

// Centroids' replacement related default dictionaries
let coords; // holds the total coordinates; x and y of points it has
let counts; // used when dividing the coord with number of points it has

// Settings related (i.e. first scene)
let inpK; // Input: K
let inpNP; // Input: Number of points   						--may be removed completely after first run (e.g. upon restart)
let radIM; // Radio: Initialisation Method						--may be removed completely after first run (e.g. upon restart)
let startButton; // Start upon satisfied with settings		--may be removed completely after first run (e.g. upon restart)
let setDiv; // Container for settings related things

// Progress scene related (i.e. second scene, kind of)
const EDGE_OFFSET = 5 / 100; // helps in random placement of points/centroids
let started = false;
let finished = false;
let progH; // says "Progress" and "The End.."
let assignButton; // Fired when pressed to "Assign Points"
let replaceButton; // Fired when pressed to "Replace Centroids"
let hideCheckBox; // hiding centroids upon finishing (or anytime)
let hideCentroids = false;
let iteration = 1; // Keeping track of iteration no
let iterP; // Iteration information span
let sseP; // SSE: Sum of Square Errors Span to show after each iteration

// End Scene Related
let repP; // says "Repeat with.."
let radPoi; // whether same points or randomized points, radio
let inpNP2; // input for new points' number
let radIM2; // Radio buttons somehow clash, so a brand new one
let resButton; // Restarts!

let AA = 1; // DEBUGGING-ONLY

function setup() {
	document.body.style.background = "palegreen";
	createCanvas(1050, 700);
	shuffle(COLORS, true);
	showSettings();
}

// Intro scene: step 0: set K, num_points, IM
function showSettings() {

	const setH = createElement("h2", "Settings");
	setH.position((windowWidth - width - 81) / 2, 100); // 81 is measured-width of "Settings" h2
	setH.style("color", "#191970");

	// "K = ?"
	const spanK = createSpan("K = ");
	spanK.position(setH.x - 150, setH.y + 70);
	spanK.style("color", "#008080");
	spanK.style("font-size", "18px");

	inpK = createInput(""); // get K
	inpK.position(spanK.x + spanK.width + 10, spanK.y - 2);
	inpK.size(25);
	inpK.elt.style["font-size"] = "17px";
	inpK.elt.value = " 3"; // default value

	// "Number of Points = ?"
	const spanNP = createSpan("Number of Points = ");
	spanNP.position(spanK.x, spanK.y + 35);
	spanNP.style("color", "#008080");
	spanNP.style("font-size", "18px");

	inpNP = createInput(""); // get #of points
	inpNP.position(spanNP.x + spanNP.width + 22, spanNP.y - 2);
	inpNP.size(30);
	inpNP.elt.style["font-size"] = "17px";
	inpNP.elt.value = " 24"; // default value

	// Change size dynamically to allow large numbers
	inpNP.input((e) => {
		const numLen = e.target.value.length;
		e.target.style.width = (numLen < 4) ? "30px" : 10 * numLen + "px";
	});

	// Initialisation Method selection: Lloyd's or k-means++
	const spanIM = createSpan("Initialisation Method:");
	spanIM.position(spanK.x + 250, spanK.y);
	spanIM.style("color", "#800080");
	spanIM.style("font-size", "18px");

	radIM = createRadio();
	radIM.option("Classic");
	radIM.option("k-means++");
	radIM.position(spanIM.x - 7, spanNP.y);
	select("label").html("Lloyd's &nbsp;"); // Seperate two radios
	select("#defaultradio0-0").elt.checked = "true"; // Choose a default one
	select("label").elt.title = "\"The\" k means IM"; // Give info 'bout methods
	const labels = document.getElementsByTagName("label");
	Array.from(labels).forEach((e, i) => {
		e.style["font-size"] = "18px";
		e.style["color"] = i ? "#008000" : "#2E8B57";
	}); // styling of IMs

	// Kick it off!
	startButton = createButton("Go!");
	startButton.position(spanNP.x, spanNP.y + 50);
	const rightRadio = document.getElementsByTagName("label")[1].getBoundingClientRect().right;
	startButton.size(rightRadio - spanNP.x); // till the 2nd radio option's end
	startButton.style("font-family", "Verdana");
	startButton.style("font-size", "22px");
	startButton.style("background-color", "#6A5ACD");
	startButton.style("color", "#D8BFD8");
	startButton.style("border", "none");
	startButton.mousePressed(start);

	// The container for settings
	setDiv = createDiv(""); // shall disappear after settings
	setDiv.position(width, 0);
	setDiv.size(windowWidth - width, height);
	setDiv.style("background", "lightblue");

	// Time for container to contain things
	const setElems = [setH, spanK, inpK, spanNP, inpNP, spanIM, radIM, startButton];
	setElems.forEach((v, i, a) => a[i].parent(setDiv));
}

// Scene 2.1: Initialise centroids & points (callback of startButton)
// Centroids are placed as what the IM says
function start(mEvent, fromKeyboard) {
	K = inpK.value(); // regardless of start or re-start
	// The very first start if mEvent aint null
	if(mEvent || fromKeyboard) {
		numPoints = inpNP.value();
		initMethod = radIM.value();

		// Randomly place points of interest (todo: allow user-defined point data)
		placePoints();
	}

	// ********************************
	// Re-start!
	// ********************************
	else {
		// Restart requires that...
		finished = false;
		iteration = 1;
		centroids = [];
		initMethod = radIM2.value(); // mind the "2"

		// If the points stay
		if(radPoi.value() === "Same Points") {
			// If we are going with the same points, reset their some props
			points.forEach(p => {
				p.oldCentroid = null;
				p.centroid = null;
				p.colour = color(0, 0, 255);
			});
			// no new placement of points here
		}
		// If a new config is requested
		else {
			points = [];
			numPoints = inpNP2.value();
			placePoints();
		}
	}

	// Placement of centroids according to IM
	placeCentroids();

	// Generate centroid related "defaultdict"s
	coords = centroids.reduce(
		(acc, cur) => Object.assign(acc, {
			[cur]: [0, 0]
		}), {}
	);
	counts = centroids.reduce(
		(acc, cur) => Object.assign(acc, {
			[cur]: 0
		}), {}
	);
	showProgress();
}

// Scene 2.2: Show progress on the right side where settings were sitting
function showProgress() {
	started = true;
	// Disappear Settings
	while(s = setDiv.elt.lastChild) {
		setDiv.elt.removeChild(s);
	}
	// "Progress"
	progH = createElement("h2", "<i>Progress</i>");
	progH.position((windowWidth - width - 81) / 2, 25); // 81 is measured-width of "Progress" h2
	progH.style("color", "#006400");

	// K = `${K}`
	const spanK = createSpan("&nbsp;K = " + K + "&nbsp;");
	spanK.position(progH.x - 150, progH.y + 50);
	spanK.style("background-color", "#1E90FF");
	spanK.style("font-size", "18px");

	// Number of Points = `${#points}`
	const spanNP = createSpan("&nbsp;Number of Points = " + numPoints + "&nbsp;");
	spanNP.position(spanK.x, spanK.y + 35);
	spanNP.style("background-color", "#D2B48C");
	spanNP.style("font-size", "18px");

	// Initialisation Method = ..
	const spanIM = createSpan("&nbsp;Initialisation Method: <br>" +
		"&nbsp;".repeat(initMethod == "Classic" ? 12 : 10) + initMethod + "&nbsp;");
	spanIM.position(spanK.x + 250, (spanK.y + spanNP.y) / 2);
	spanIM.style("background-color", "#DCDCDC");
	spanIM.style("font-size", "18px");

	// Iteration span config
	iterP = createSpan("Iteration: 1");
	iterP.position(spanNP.x, spanNP.y + 70);
	iterP.style("color", "DarkOrchid");
	iterP.style("font-size", "26px");

	// Assign button config
	const btnSize = 155;
	assignButton = createButton("Assign Points");
	assignButton.position(iterP.x, iterP.y + 50);
	assignButton.mousePressed(step);
	assignButton.size(btnSize);
	assignButton.style("font-family", "Courier");
	assignButton.style("font-size", "24px");

	// Replace button config
	replaceButton = createButton("Re-place Centroids");
	replaceButton.position(assignButton.x + 200, assignButton.y);
	replaceButton.mousePressed(step);
	replaceButton.size(btnSize);
	replaceButton.style("font-family", "Courier");
	replaceButton.style("font-size", "24px");
	deactivateButton(replaceButton); // inactive to begin with

	// Button's shortcut info, spacebar
	assignButton.elt.title = replaceButton.elt.title = "You may also press spacebar for the next step";
	// SSE span
	sseP = createSpan(""); // empty to begin with, appears after iteration 1's replace centroid's
	sseP.position(assignButton.x, assignButton.y + assignButton.height + 60);
	sseP.style("font-size", "18px");
	sseP.style("background-color", "#ABF052");
	sseP.elt.title = "Sum of Squares Error: Computed from normalized coordinates.";

	// CheckBox config
	hideCheckBox = createCheckbox("Hide Centroids");
	hideCheckBox.changed(e => hideCentroids = e.target.checked);
	hideCheckBox.position(0, 0);
	select("input").elt.title = select("label").elt.title = "You may also press \"h\"";

	const progElems = [progH, spanK, spanNP, spanIM, iterP, assignButton, replaceButton, sseP, hideCheckBox];
	progElems.forEach((v, i, a) => a[i].parent(setDiv));
}

// Finds sum of square error
function sse() {
	let summa = 0;
	for(const p of points) {
		summa += p.normalizedDist(p.centroid);
	}
	return summa;
}

function draw() {
	background(0, 250, 125);
	if(started) {
		if(!hideCentroids) {
			for(const centroid of centroids) {
				centroid.show();
			}
		}
		for(const point of points) {
			point.show();
		}
	}
}

// Go back and forth between assigning points and replacing centroids
function deactivateButton(thisButton) {
	const other = thisButton.html() == "Assign Points" ? replaceButton : assignButton;
	// Deactivate this button
	thisButton.elt.disabled = "true";
	thisButton.elt.style["font-style"] = "italic";

	// Activate the other
	other.elt.disabled = "";
	other.elt.style["font-weight"] = "bold";
	other.elt.style["font-style"] = "normal";

}

// Step-buttons' event callback
function step(mEvent, fromKeyboard) {
	// Appointing a color foreach point
	if(fromKeyboard === "Assign Points" || (mEvent && this.html() === "Assign Points")) {
		deactivateButton(assignButton); // It's pressed, it's deactivated
		let noChange = true;
		for(const point of points) {
			let prevCentroid = point.centroid;
			let minDist = Infinity;
			for(const centroid of centroids) {
				const dist = point.dist(centroid);
				if(dist < minDist) {
					point.assign(centroid);
					minDist = dist;
				}
			}
			point.oldCentroid = prevCentroid;
			if(iteration > 1 &&
				point.oldCentroid.id !== point.centroid.id) {
				noChange = false;
			}
		}
		// Finished!
		if(iteration > 1 && noChange) {
			theEnd();
		}
	}
	// Re-placing the centroids
	else {
		deactivateButton(replaceButton); // It's pressed, it's deactivated
		++iteration;
		iterP.html("Iteration: " + iteration);
		sseP.html("SSE = " + sse()); // Update sse

		// Reset centroids-related dicts
		Object.keys(coords).forEach(k => coords[k] = [0, 0]);
		Object.keys(counts).forEach(k => counts[k] = 0);

		// Find new means
		for(const point of points) {
			const centroid = point.centroid;
			counts[centroid]++;
			coords[centroid][0] += point.x;
			coords[centroid][1] += point.y;
		}
		for(const centroid of centroids) {
			const num_pnts = counts[centroid];
			if(num_pnts != 0) {
				centroid.x = coords[centroid][0] / num_pnts;
				centroid.y = coords[centroid][1] / num_pnts;
			}
		}
	}
}

// Scene 2.3: The End => Report the results and offer options for re-launch
function theEnd() {
	finished = true;
	progH.html("..The End..");
	progH.style("font-family", "Lucida Sans");
	assignButton.elt.style.visibility = "hidden";
	replaceButton.elt.style.visibility = "hidden";
	iterP.html("It took " + iteration + " iterations.");
	sseP.html("Final " + sseP.html());

	const fin = createSpan("<i>Finished!</i>");
	fin.position(progH.x, (iterP.y + sseP.y) / 2);
	fin.style("font-size", "32px");
	fin.style("font-family", "Serif");
	fin.style("color", color(COLORS.pop()));
	fin.parent(setDiv);

	// Toggle "Finished!"
	setInterval(fin => fin.elt.style.visibility = fin.elt.style.visibility == "" ? "hidden" : "", 500, fin);

	// Asking for re-start
	repP = createSpan("<br>&nbsp;<em>Repeat with..</em>");
	repP.position(sseP.x, sseP.y + 50);
	repP.style("font-size", "23px");
	repP.style("color", "#0000FF");

	// Point selection radio
	radPoi = createRadio();
	radPoi.option("Same Points");
	radPoi.option("Randomize Points");
	radPoi.position(repP.x, repP.y + 75);
	const imLabels = document.getElementsByTagName("label");
	imLabels[1].innerHTML += "&nbsp;".repeat(4); // Seperate two radios by appending spaces to left rad
	imLabels[2].innerHTML = imLabels[2].innerHTML.replace(" ", "&nbsp;".repeat(18));
	select("#defaultradio0-0").elt.checked = "true"; // Choose a default one

	// LET ME TRY SMTH
	inpNP2 = createInput("");
	inpNP2.position(radPoi.x + 240, radPoi.y - 2);
	inpNP2.size(60);
	inpNP2.elt.style["font-size"] = "17px";
	inpNP2.elt.value = numPoints; // default value

	// K = `${K}`
	const spacing = 42; // that between radios and spanK
	const spanK = createSpan("K = ");
	spanK.position(radPoi.x + 65, radPoi.y + spacing);
	spanK.style("font-size", "18px");
	spanK.style("color", "#800080");
	// good ol' inpK
	inpK.position(spanK.x + spanK.width + 10, spanK.y - 2);
	inpK.size(25);
	inpK.elt.value = K; // default value from the previous run
	inpK.elt.style["font-size"] = "17px";
	inpK.elt.style["color"] = "#800080";
	inpK.elt.style["background-color"] = "#7FFF7F";
	inpK.elt.style["border-style"] = "double";

	// brand new radio for IM selection
	radIM2 = createRadio();
	radIM2.option("Classic");
	radIM2.option("k-means++");
	radIM2.position(radPoi.x, spanK.y + spacing);
	const toSelect = initMethod === "Classic" ? 0 : 1; // find out previous run's IM
	document.getElementsByTagName("label")[3].innerHTML += "&nbsp;".repeat(12); // Seperate two radios
	select("#defaultradio1-" + toSelect).elt.checked = "true"; // Choose a default one

	// stylin' radios
	const labels = document.getElementsByTagName("label");
	for(let i = 1; i < 5; i++) { // ignore "hide-centroids" checkbox
		labels[i].style["font-size"] = "18px";
		labels[i].style["color"] = i < 3 ? "#bb20af" : "#aa05ab";
	}

	// Re-start Button!
	resButton = createButton("Go Go Go!");
	resButton.position(radIM2.x + spacing, radIM2.y + spacing);
	resButton.size(200);
	resButton.style("font-family", "Verdana");
	resButton.style("font-size", "26px");
	resButton.style("color", "Purple");
	resButton.style("background-color", "YellowGreen");
	resButton.style("border-style", "hidden");
	resButton.mousePressed(restart);

	const endElems = [repP, radPoi, spanK, inpK, radIM2, resButton, inpNP2];
	endElems.forEach((v, i, a) => a[i].parent(setDiv));
}

function restart(mEvent) {
	start();
}


// Random placement of points in the canvas
function placePoints() {
	for(let i = 0; i < numPoints; ++i) {
		const x = random(EDGE_OFFSET * width, (1 - EDGE_OFFSET) * width);
		const y = random(EDGE_OFFSET * height, (1 - EDGE_OFFSET) * height);
		const point = new Point(x, y, i);
		points.push(point);
	}
}

function placeCentroids() {
	// Place centroids according to IM
	// Classic method is the Lloyd's pseudo-random positioning of the centroids
	if(initMethod === "Classic") {
		for(let i = 0; i < K; ++i) {
			const x = random(EDGE_OFFSET * width, (1 - EDGE_OFFSET) * width);
			const y = random(EDGE_OFFSET * height, (1 - EDGE_OFFSET) * height);
			const centroid = new Centroid(x, y, i);
			centroids.push(centroid);
		}
	}
	// k-means++
	else {
		// First centroid is chosen randomly among data points
		const rand_point = random(points);
		const first_centroid = new Centroid(rand_point.x, rand_point.y, 0); // 0 designates it's the first
		centroids.push(first_centroid);

		// The others are chosen from data points with a probability proportional
		// to a data point's distance to the closest centroid to it
		const distances = []; // The k-means++ D(x) keeper

		// Go for every other centroid-to-be-placed
		for(let i = 1; i < K; ++i) {
			// Find each point's distance closest to a centroid
			for(const point of points) {
				let minSoFar = Infinity;
				for(const centroid of centroids) {
					const d = point.normalizedDist(centroid);
					if(d < minSoFar) {
						distances[point.id] = d;
					}
				}
			}
			// Turn those distances into a probability distribution
			const summa = distances.reduce((acc, cur) => acc += cur)
			distances.forEach((v, i, a) => a[i] /= summa)

			// Choose a point with probability proportional to its "distance" value
			let r = random();
			let idx = 0; // For traversal of distances
			while(r > 0) {
				r -= distances[idx];
				++idx;
			}

			// Point found: [idx-1]th point of points
			const poi = points[idx - 1];
			const new_centroid = new Centroid(poi.x, poi.y, i);
			centroids.push(new_centroid);
		}
	}
}


// Serves for a couple of key actions
function keyPressed() {
	// Step automatically
	if(started) {
		if(!finished && key === " ") {
			const msg = assignButton.elt.disabled ? "Re-place Centroids" : "Assign Points";
			step(null, msg);
		}
		// Hide/unhide centroids
		else if(keyCode == 72) { //  "h"
			const checkbox = select("input");
			const checked = checkbox.elt.checked;
			hideCentroids = checkbox.elt.checked = checked ? "" : "true"; // toggle checkness
		}
	}
	else {
		if(keyCode == 13) { //  Enter
			start(null, true); // true for fromKeyboard
		}
	}
}

class Point {
	constructor(x, y, i) {
		this.x = x;
		this.y = y;
		this.id = i; // useful in k-means++
		this.oldCentroid = null;
		this.centroid = null; // centroid that it "belongs" to
		this.colour = color(0, 0, 255); // will be that of centroid
		this.size = 16;
	}

	show() {
		push();
		stroke(this.colour);
		strokeWeight(this.size);
		point(this.x, this.y);
		pop();
	}

	// Returns the Euclidean distance squared to other (e.g.centroid)
	dist(other) {
		return (other.x - this.x) * (other.x - this.x) + (other.y - this.y) * (other.y - this.y);
	}

	// Squeezes the points within the range of [0, 1]
	normalizedDist(other) {
		const x1 = this.x / width;
		const y1 = this.y / height;
		const x2 = other.x / width;
		const y2 = other.y / height;
		return (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
	}

	assign(newCentroid) {
		this.centroid = newCentroid;
		this.colour = newCentroid.colour;
	}

	toString() {
		return "Point_" + this.id;
	}
}

class Centroid {
	constructor(x, y, id) {
		this.x = x;
		this.y = y;
		this.id = id; // useful in comparing centroids
		this.size = 25;

		this.colour = color(COLORS.pop());
	}

	show() {
		// Draw an X
		const s = this.size / 2;
		const ang = PI / 4;

		const x_offset = s * cos(ang);
		const y_offset = s * sin(ang);

		const right_x = this.x + x_offset;
		const left_x = this.x - x_offset;

		const upper_y = this.y - y_offset;
		const lower_y = this.y + y_offset;

		push();
		stroke(this.colour);
		strokeWeight(s);
		line(right_x, upper_y, left_x, lower_y);
		line(left_x, upper_y, right_x, lower_y);
		pop();
	}
	toString() {
		return "Centroid_" + this.id;
	}
}