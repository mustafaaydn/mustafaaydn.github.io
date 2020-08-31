/**
 * Yet another Befunge-93 PlayGround
 * @Mayd, May '19 @hk
 */

let grid;
let cols;
let rows;
let maxRowsEver; //wheeling dealing

let res = 50;
const ZOOM = 2;

let intervalerR = intervalerL = intervalerU = intervalerD = false;
let movedRight = movedLeft = false; //when user types, move to right; silerse de sola
//bef-93 related
let IP = 0; //Instruction Pointer, values as if 1D
let STACK = []; //"The" STACK of all
//enum for directions
const DIRS = Object.freeze({
	UP: 12,
	RIGHT: 3,
	DOWN: 6,
	LEFT: 9
});
let DIR = DIRS.RIGHT;
let STRING_MODE = false;

let charsOnGrid = {}; //object s.t. "x,y": 1 where x and y are coordinates

const AVAILABLE_CHARS = {
	'+': 1,
	'-': 1,
	'*': 1,
	'/': 1,
	'%': 1,
	'!': 1,
	'`': 1,
	'>': 1,
	'<': 1,
	'^': 1,
	'v': 1,
	'?': 1,
	'_': 1,
	'|': 1,
	'"': 1,
	':': 1,
	'\\': 1,
	'$': 1,
	'.': 1,
	',': 1,
	'#': 1,
	' ': 1,
	'g': 1,
	'p': 1,
	'&': 1,
	'~': 1,
	'@': 1,
};
const RUN_STRING = "Hit and Run";
const STEP_STRING = "Step Step Step!";
const STOP_STRING = "Stoooop";
let DOUBLE_PRESS = false;

//dom elements
let stepButton;
let runButton;
let resetButton; //re-setting the settings: stack, dir, running.. without clearing
let clearButton; //clear the grid area & re-set
let transferButton; //from text area to grid-visual

let pStack; //span1 dé STACK
let stackSpan; //span2 dé STACK
let outputSpan;

let codeArea;

let running = false;
let runner; //Interval object for actual run ne de olsa run === some_steps

let output = [];
let canvas;

function setup() {
	document.body.style.background = color(200);
	canvas = createCanvas(1001, 601);
	cols = floor(width / res);
	rows = floor(height / res);
	maxRowsEver = rows;

	grid = make2DArray(cols, rows);
	squarizeGrid();

	const spacing = 10;
	const buttonWidth = floor((width - 2 * spacing) / 3);

	//Stepper button
	stepButton = createButton(STEP_STRING);
	stepButton.position(canvas.elt.offsetLeft, height + spacing); //canvas ile vertically aynı hizada
	stepButton.style("width", "" + buttonWidth + "PX");
	stepButton.style("height", "60PX");
	stepButton.style("font-size", "20PX");
	stepButton.style("color", "#4592af");
	stepButton.mousePressed(step);

	//Road Runner
	runButton = createButton(RUN_STRING);
	runButton.position(stepButton.x + stepButton.width + spacing, stepButton.y);
	runButton.style("width", "" + stepButton.width + "PX");
	runButton.style("height", "" + stepButton.height + "PX");
	runButton.style("font-size", stepButton.elt.style.fontSize);
	runButton.style("font-style", "italic");
	runButton.style("color", "#40a798");
	runButton.mousePressed(run);

	//Re-set: stack felan sıfırlanıyor ama grid visually the same
	resetButton = createButton("Re-set, grid is the same");
	resetButton.position(runButton.x + runButton.width + spacing, runButton.y);
	resetButton.style("width", "" + runButton.width + "PX");
	resetButton.style("height", "" + floor((runButton.height - spacing / 4) / 2) + "PX");
	resetButton.style("color", "#8f758e");
	resetButton.mousePressed(reset);

	//Clear: reset + new brand grid
	clearButton = createButton("Clear everything"); //sil baştan
	clearButton.position(runButton.x + runButton.width + spacing, resetButton.y + resetButton.height + spacing / 4);
	clearButton.style("width", "" + resetButton.width + "PX");
	clearButton.style("height", "" + resetButton.height + "PX");
	clearButton.style("color", "#71a0a5");
	clearButton.mousePressed(clearEverything);

	//Stack Visualisation: Crude span & p görünümlü span
	spanStack = createSpan("The Stack: ");
	spanStack.position(stepButton.x, stepButton.y + stepButton.height + 3 * spacing);
	spanStack.style("font-style", "italic");
	spanStack.style("color", "blue");
	spanStack.style("font-size", "200%");

	pStack = createSpan("");
	pStack.position(spanStack.x + spanStack.width + 75, spanStack.y);
	pStack.style("font-size", "200%");
	pStack.style("background-color", "lightblue");
	pStack.style("color", "darkblue");

	//Output'u da yazdıralım dedik
	outputSpan = createSpan(""); //draw'da halloluyor
	outputSpan.position(spanStack.x, spanStack.y + spanStack.height + 3 * spacing);
	outputSpan.style("font-style", "italic");
	outputSpan.style("color", "#4592af");
	outputSpan.style("font-size", "200%");
	outputSpan.class("output");

	//Belki de kodu direk yazmak istenir
	codeArea = createElement("textarea");
	codeArea.position(width + 5 * spacing, canvas.elt.offsetTop);
	codeArea.style("width", "463PX");
	codeArea.style("height", "309PX");
	codeArea.style("font-size", "18PX");
	codeArea.elt.innerHTML = "\"!eegnufeB\">:#,_@";

	//Transfer the code from text to grid
	transferButton = createButton("See on the grid");
	transferButton.position(codeArea.x, codeArea.y + codeArea.height + spacing);
	transferButton.style("width", "" + codeArea.width + "PX");
	transferButton.style("height", "" + runButton.height + "PX");
	transferButton.style("color", "#71a0a5");
	transferButton.style("font-size", "18PX");
	transferButton.mousePressed(transfer);
}

//Run button callback
function run() {
	if(!running) { //if not already running, let it run
		runner = setInterval(step, 100);
		runButton.html("<i>Running...</i>");
		runButton.style("background-color", "darkblue");
		runButton.style("color", "magenta");
		stepButton.html(STOP_STRING); //Step-button becomes stop-button whilst running
	}
}

//Step button callback
function step(mouseEvent) {
	//Eğer stop amaçlı basıldıysa
	if(mouseEvent && stepButton.html() === STOP_STRING) {
		clearInterval(runner);
		running = false;
		stepButton.html(STEP_STRING);
		runButton.html(RUN_STRING);
		runButton.style("background-color", "");
		runButton.style("color", "#40a798");
	}
	//Runner'ın interval call'ları veya "step step step!"den geldiyse
	else {
		//A compiler(!) error: number of "s must be even
		let numberOfQuotes = 0;
		grid.forEach(col => col.forEach(g => numberOfQuotes += g.character === "\""));
		if(numberOfQuotes & 1) {
			alert("Number of quotes (\") is not even, program shall not forward.");
			clearInterval(runner);
			return;
		}

		detectEdgeChars(); //rm, lm, um, dm

		// IP.COL ve IP.ROW
		const ip_i = IP % cols;
		const ip_j = floor(IP / cols);

		//Get the current character and act befungingly!
		const char = grid[ip_i][ip_j].character;
		if(!STRING_MODE) {
			let value = value1 = value2 = x = y = input = undefined;
			switch (char) {
				case "+":
					value2 = STACK.pop() || 0;
					value1 = STACK.pop() || 0;
					STACK.push(value1 + value2);
					break;
				case "-":
					value2 = STACK.pop() || 0;
					value1 = STACK.pop() || 0;
					STACK.push(value1 - value2);
					break;
				case "*":
					value2 = STACK.pop() || 0;
					value1 = STACK.pop() || 0;
					STACK.push(value1 * value2);
					break;
				case "/":
					value2 = STACK.pop() || 0;
					value1 = STACK.pop() || 0;
					if(value2 === 0) {
						alert("Zero Division Detected, division result will be ignored");
						break;
					}
					STACK.push(floor(value1 / value2));
					break;
				case "%":
					value2 = STACK.pop() || 0;
					value1 = STACK.pop() || 0;
					if(value2 === 0) {
						alert("Zero division (for %) detected, division result will be ignored");
						break;
					}
					STACK.push(value1 % value2);
					break;
				case "!":
					value = STACK.pop();
					STACK.push(!value ? 1 : 0);
					break;
				case "`":
					value2 = STACK.pop() || 0;
					value1 = STACK.pop() || 0;
					STACK.push(value1 > value2 ? 1 : 0);
					break;
				case ">":
					DIR = DIRS.RIGHT;
					break;
				case "<":
					DIR = DIRS.LEFT;
					break;
				case "^":
					DIR = DIRS.UP;
					break;
				case "v":
					DIR = DIRS.DOWN;
					break;
				case "?":
					const r = random();
					if(r < 0.25) DIR = DIRS.RIGHT;
					else if(r < 0.5) DIR = DIRS.LEFT;
					else if(r < 0.75) DIR = DIRS.UP;
					else DIR = DIRS.DOWN;
					break;
				case "_":
					value = STACK.pop();
					DIR = !value ? DIRS.RIGHT : DIRS.LEFT; // !value implies value being undefined or 0
					break;
				case "|":
					value = STACK.pop();
					DIR = !value ? DIRS.DOWN : DIRS.UP;
					break;
				case "\"":
					STRING_MODE = !STRING_MODE;
					break;
				case ":":
					value = STACK.pop();
					value === undefined ? STACK.push.apply(STACK, [0, 0]) : STACK.push.apply(STACK, [value, value]);
					break;
				case "\\":
					value2 = STACK.pop() || 0;
					value1 = STACK.pop() || 0;
					STACK.push(value2);
					STACK.push(value1);
					break;
				case "$":
					STACK.pop();
					break;
				case ".":
					value = STACK.pop() || 0;
					console.log(Number(value));
					output.push(Number(value));
					break;
				case ",":
					value = STACK.pop() || 0;
					console.log(String.fromCharCode(value)); //ascii to char : 65 => "A"
					output.push(String.fromCharCode(value));
					break;
				case "#":
					if(DIR == DIRS.UP) goUp();
					else if(DIR == DIRS.RIGHT) goRight();
					else if(DIR == DIRS.DOWN) goDown();
					else if(DIR == DIRS.LEFT) goLeft();
					break;
				case "g":
					//if not stringmode!! en başa koymak gerekebilir
					y = STACK.pop() || 0;
					x = STACK.pop() || 0;
					if(grid[x][y].manipulated) {
						STACK.push(grid[x][y].character.charCodeAt()); //char to ascii: "a" => 97
					}
					else {
						alert("Attempt to \"g\"et a non-manipulated value detected, nothing will be pushed onto the stack.");
					}
					break;
				case "p":
					//if not stringmode!! en başa koymak gerekebilir
					y = STACK.pop() || 0;
					x = STACK.pop() || 0;
					value = STACK.pop();
					grid[x][y].character = String.fromCharCode(value); //ascii to char : 65 => "A"
					charsOnGrid["" + x + "," + y] = String.fromCharCode(value);
					break;
				case "&":
					input = Number(prompt("please supply an Integer:"));
					while(isNaN(input)) {
						alert("Uups.. That was not a number, was it?");
						input = Number(prompt("please supply an Integer:"));
					}
					STACK.push(input);
					break;
				case "~":
					input = prompt("please supply a Character:");
					STACK.push(input.charCodeAt());
					break;
				case "@": //Finished!
					running = false;
					clearInterval(runner);
					runButton.html(RUN_STRING);
					runButton.style("background-color", "");
					runButton.style("color", "#40a798");
					stepButton.html(STEP_STRING); //btton goes back to step'ping
					break;
				case " ":
					IP = IP; //HUEHUEHUE
					break;
				case "0":
				case "1":
				case "2":
				case "3":
				case "4":
				case "5":
				case "6":
				case "7":
				case "8":
				case "9":
					STACK.push(Number(char)); //push it if digit
					break;
				default:
					alert("Unexpected Command Encountered: " + char);
					console.error("Unexpected Command Encountered: ", char);
			}
		}
		else {
			//In string mode, every single ASCII character -except for " itself- is okay
			if(char == "\"") {
				STRING_MODE = !STRING_MODE;
			}
			else {
				STACK.push(char.charCodeAt());
			}
		}

		//lastly, move the IP if program is not finished
		if(char != "@") {
			switch (DIR) {
				case DIRS.UP:
					// setInterval(goUp, 1000);
					goUp();
					break;
				case DIRS.RIGHT:
					goRight();
					break;
				case DIRS.DOWN:
					goDown();
					break;
				case DIRS.LEFT:
					goLeft();
					break;
				default:
					console.error("UUPS, Direction not good");
			}
		}
	}
}

function detectEdgeChars() {
	//foreach row, detect rightmost&leftmost-non-space character
	//foreach col, detect upmost&downmost-non-space character
	let ufound_percol = lfound_perrow = false;
	for(let i = 0; i < cols; ++i) {
		for(let j = 0; j < rows; ++j) {
			if(!ufound_percol && grid[i][j].character !== " ") {
				grid[i].um = j;
				ufound_percol = true;
			}
			if(grid[i][j].character !== " ") {
				grid[i].dm = j;
			}
		}
		ufound_percol = false;
	}
	for(let j = 0; j < rows; ++j) {
		for(let i = 0; i < cols; ++i) {
			if(!lfound_perrow && grid[i][j].character !== " ") {
				grid[0][j].lm = i;
				lfound_perrow = true;
			}
			if(grid[i][j].character !== " ") {
				grid[0][j].rm = i;
			}
		}
		lfound_perrow = false;
	}
}

function draw() {
	const ip_i = IP % cols;
	const ip_j = floor(IP / cols);

	grid.forEach(col => col.forEach(g => g.show()));
	grid.forEach(col => col.forEach(g => g.isCurrent = (g.i == ip_i && g.j == ip_j)));

	// squares are "i,j" pairs that have some character typed on
	let squares = Object.keys(charsOnGrid);

	//Write the code onto grid visually
	fill("pink");
	textSize(res / 1.5);
	textAlign(CENTER, CENTER);
	for(let k of squares) {
		const indexes = k.split(",");
		const x = Number(indexes[0]) * res + res / 2;
		const y = Number(indexes[1]) * res + res / 2;
		text(charsOnGrid[k], x, y);
	}

	//Manual movement of IP via arrow keys
	handleManuelMovement();

	//Stack writing
	let str = "";
	STACK.forEach(n => str += n + "  &nbsp;");
	pStack.html(str);

	//Output writing
	str = "&nbsp;Output: <em>"; //variable tasarrufu
	output.forEach(o => str += o == " " ? "&nbsp; " : o + "");
	outputSpan.html(str + "</em>");

	//Dynamic as the text area grows/shrinks
	transferButton.position(codeArea.x, codeArea.y + codeArea.elt.clientHeight + 10); //10 = spacing
	transferButton.style("width", "" + codeArea.elt.clientWidth + "PX");
}

function handleManuelMovement() {
	if(!(codeArea.elt === document.activeElement)) { // denktir: şayet text area'ya yazmıyorsa
		//up
		if(keyIsDown(38)) {
			if(!intervalerU) {
				goUp();
				intervalerU = true;
			}
		}
		//right
		if(keyIsDown(39)) {
			if(!intervalerR) {
				goRight();
				intervalerR = true;
			}
		}
		//down
		if(keyIsDown(40)) {
			if(!intervalerD) {
				goDown();
				intervalerD = true;
			}
		}
		// left
		if(keyIsDown(37)) {
			if(!intervalerL) {
				goLeft();
				intervalerL = true;
			}
		}
	}
}

function keyPressed(e) {
	if(!(codeArea.elt === document.activeElement)) {
		const ip_i = IP % cols;
		const ip_j = floor(IP / cols);
		DOUBLE_PRESS = e.shiftKey || e.altKey || e.ctrlKey;
		if(!(!DOUBLE_PRESS && (e.keyCode == 38 || e.keyCode == 37))) { // % ve &, sol ve yukarı ile karışıyordu
			//Silmek mevzuu
			if(e.keyCode == 8) { //BACKSPACE
				if(!movedLeft) {
					delete charsOnGrid["" + ip_i + "," + ip_j];
					grid[ip_i][ip_j].character = " ";
					grid[ip_i][ip_j].manipulated = false;
					if(!(ip_i == 0 && ip_j == 0)) {
						--IP;
						movedLeft = true;
					}
				}
			}
			//Befunge-93 command'leri + alphanumeric'ler'den ise kaydediyoruz
			else if(isValidChar(e.key)) { //0-9
				//Write what user typed and move IP to right if possible
				// console.log("IF 2: key = ", e.key, " and keycode = ", e.keyCode);
				if(!movedRight) {
					charsOnGrid["" + ip_i + "," + ip_j] = e.key; //further visualite için
					grid[ip_i][ip_j].character = e.key;
					grid[ip_i][ip_j].manipulated = true;
					if(!(ip_i == cols - 1 && ip_j == rows - 1)) {
						++IP;
						movedRight = true;
					}
				}
			}
		}
	}
}

//up, right, down, left
function goUp() {
	const ip_i = IP % cols;
	const ip_j = floor(IP / cols);

	if(running && !(grid[ip_i].um === undefined) && ip_j === grid[ip_i].um) {
		IP = ip_i + grid[ip_i].dm * cols;
	}
	else if(ip_j === 0) {
		IP = (rows - 1) * cols;
	}
	else {
		IP -= cols;
	}
}

function goRight() {
	const ip_i = IP % cols;
	const ip_j = floor(IP / cols);

	if(running && !(grid[0][ip_j].rm === undefined) && ip_i === grid[0][ip_j].rm) {
		IP = grid[0][ip_j].lm + ip_j * cols;
	}
	else if(ip_i == cols - 1) {
		IP = ip_j * cols;
	}
	else {
		++IP;
	}
}

function goDown() {
	const ip_i = IP % cols;
	const ip_j = floor(IP / cols);

	if(running && !(grid[ip_i].dm === undefined) && ip_j === grid[ip_i].dm) {
		IP = ip_i + grid[ip_i].um * cols;
	}
	else if(ip_j === rows - 1) {
		IP = ip_i;
	}
	else {
		IP += cols;
	}
}

function goLeft() {
	const ip_i = IP % cols;
	const ip_j = floor(IP / cols);

	if(running && !(grid[0][ip_j].lm === undefined) && ip_i === grid[0][ip_j].lm) {
		IP = grid[0][ip_j].rm + ip_j * cols;
	}
	else if(ip_i == 0) {
		IP = (cols - 1) + ip_j * cols;
	}
	else {
		--IP;
	}
}

function make2DArray(n_cols, n_rows) {
	let two_d = new Array(n_cols);
	for(let i = 0; i < n_cols; ++i) {
		two_d[i] = new Array(n_rows);
	}
	return two_d;
}

function squarizeGrid() {
	for(let i = 0; i < cols; ++i) {
		for(let j = 0; j < rows; ++j) {
			grid[i][j] = new Square(i, j);
		}
	}
}

function mouseWheel(event) {
	if(mouseX < width && mouseY < height) { //sınırlar dahilindeki wheel'lere hitap ederiz
		if(event.delta < 0) { //Wheel up demektir, resolution artıyor, grid yine aynı kalır görüntü değişir
			res *= ZOOM;
			if(res > 400)
				res /= ZOOM;
		}
		else { //res azalır, grid extend edilir eğer hiç o kadar az res görmediyse
			res /= ZOOM;
			if(res < 20) {
				res *= ZOOM;
				return;
			}
			let new_cols = floor(width / res);
			let new_rows = floor(height / res);
			// console.log("extending grid with:", new_cols, new_rows, " res = ", res);
			if(new_rows > maxRowsEver) {
				//Only if we've never seen such size, will grid be extended
				grid = extendGrid(new_cols, new_rows); //grid enlarges
				cols = new_cols;
				rows = new_rows;
				maxRowsEver = new_rows;
			}
		}
	}
}

function extendGrid(new_cols, new_rows) {
	let new_grid = make2DArray(new_cols, new_rows);
	for(let i = 0; i < new_cols; ++i) {
		for(let j = 0; j < new_rows; ++j) {
			if(i >= cols || j >= rows) {
				new_grid[i][j] = new Square(i, j);
			}
			else {
				new_grid[i][j] = grid[i][j];
			}
		}
	}
	return new_grid;
}

function keyReleased() {
	intervalerR = intervalerL = intervalerU = intervalerD = false;
	movedRight = movedLeft = false;
}

//IP Selection on grid
function mousePressed() {
	if(mouseX < width && mouseY < height) {
		let ip_i = floor(mouseX / res);
		let ip_j = floor(mouseY / res);
		IP = ip_i + ip_j * cols;
		grid.forEach(col => col.forEach(g => g.isCurrent = (g.i == ip_i && g.j == ip_j)));
	}
}

//Re-set button callback
function reset() {
	STACK = [];
	DIR = DIRS.RIGHT;
	IP = 0;
	STRING_MODE = false;
	output = [];
	running = false;
	runButton.html(RUN_STRING);
	runButton.style("background-color", "");
	runButton.style("color", "#40a798");
	stepButton.html(STEP_STRING);
	clearInterval(runner);
}

//Clear button callback
function clearEverything() {
	reset();
	//	grid = make2DArray(cols, rows);
	squarizeGrid();
	charsOnGrid = {};
	codeArea.elt.value = ""
}

function transfer(e) {
	grid = make2DArray(cols, rows);
	squarizeGrid();
	charsOnGrid = {};

	const str = codeArea.elt.value;
	const cleavers = str.split("\n");
	let r = 0; //indicator of which row we are in
	for(let cleaver of cleavers) {
		let i = 0;
		while(cleaver[i]) {
			const char = cleaver[i];
			if(isValidChar(char)) {
				grid[i][r].character = char;
				grid[i][r].manipulated = true;
				charsOnGrid["" + i + "," + r] = char;
			}
			else {
				alert("Invalid character detected for Befunge-93:\n<" + char + ">\nIt shall be neglected.");
			}
			++i;
		}
		++r;
	}
	reset(); //because why not?
}

function isValidChar(char) {
	//Checks if char suits for Befunge-93
	return STRING_MODE || (AVAILABLE_CHARS.hasOwnProperty(char) ||
		(char.length == 1 && (
			("a" <= char && char <= "z") || // a-z
			("A" <= char && char <= "Z") || //A-Z
			(0 <= char && char <= 9))));
}
//Representative for the grid
class Square {
	constructor(i, j) {
		this.i = i;
		this.j = j;
		this.w = this.h = res;
		this.x = this.i * res;
		this.y = this.j * res;

		this.isCurrent = i == 0 && j == 0;
		this.character = " "; //everything is space by default
		this.manipulated = false; //for the sake of "g"etting interesthing values
	}

	show() {
		fill("#8f71ff");
		stroke("lightblue");
		if(this.isCurrent) {
			fill("white");
		}
		rect(this.i * res, this.j * res, res, res);
	}
}