let paddles = []; //The population array
let ball; //the ball

let paddle1; //the somewhat "best" paddle
let paddle2; //Bottom paddle, user controlled

let paddleImage;

let brickets = [];

let gameOverCount = 0;
const POP_SIZE = 20;
let movement = 10;

let run_best = false;
let best_button; //controls trining vs run best
let width_button; //controls bottom paddle's width: full or normal

let slider;

// function preload() {
// 	paddleImage = loadImage("pimg.png")
// }

function setup() {
	createCanvas(800, 600);
	tf.setBackend("cpu");
	//Place brickets
	// for(let i = 0; i < 10; i++) {
	// 	let x = floor(random(10));
	// 	let y = floor(random(20));
	// 	brickets[i] = new Bricket(x, y);
	// }

	paddle2 = new Paddle("bottom");
	ball = new Ball();
	if(!run_best) {
		for(let i = 0; i < POP_SIZE; i++) {
			paddles[i] = new Paddle("top");
		}
	}
	else {
		paddle1 = loadBestPaddle();
	}
	//Topun hızına interaktif ayar
	slider = createSlider(1, 20, 4);
	slider.position(1000, 50);

	//Run best or not ayarı
	best_button = createButton("Run Best");
	best_button.position(width + 50, 50);
	best_button.mousePressed(toggleState);

	//Alttaki paddle'ın genişliği
	width_button = createButton("Go For Normal Width");
	width_button.position(width + 50, height - 15);
	width_button.mousePressed(toggleWidth);
}

function toggleState() {
	//Run best..
	if(this.html() == "Run Best") {
		run_best = true;
		paddle1 = loadBestPaddle();
		this.html("Continue Training");

	}
	//Continue training
	else {
		run_best = false;
		this.html("Run Best");
	}
}

function toggleWidth() {
	if(this.html() == "Go For Full Width") {
		paddle2.w = width;
		this.html("Go For Normal Width");
	}
	else {
		this.html("Go For Full Width");
		paddle2.w = width / 10;
		paddle2.x = width / 2 + randomGaussian();
	}
}

function loadBestPaddle() {
	//retrieved from console, processed via perl
	const best_weights = [
		[-1.4151020050048828, 1.9698925018310547, -0.17705650627613068, 0.43699216842651367, 0.4612160325050354, 0.8317694067955017, -1.1640124320983887, -1.1029232740402222, 1.7289667129516602, 1.3055986166000366, 0.8896532654762268, -1.0366766452789307, 0.9916676878929138, 0.301055908203125, -1.4238717555999756, -1.1909496784210205, 0.6706024408340454, -0.3529152572154999, 1.560465931892395, -0.6600738167762756, -1.1386702060699463, 0.6216232180595398, -0.2751128077507019, -3.2771031856536865, -0.5961401462554932, -0.18450713157653809, 0.3798247277736664, 1.2792093753814697, -0.6537827253341675, -0.7933601140975952, -0.059232085943222046, -0.3976612389087677],

		[-0.6071435213088989, 0.5003815293312073, -0.48028436303138733, -0.2603415250778198, -0.10365493595600128, 1.8761541843414307, -0.42759597301483154, -0.7084087133407593],

		[0.19719970226287842, -0.12251626700162888, -1.3118700981140137, 0.611936092376709, -0.11293990164995193, -0.6151600480079651, 1.844756007194519, -1.522557020187378, 1.1691858768463135, 3.283782482147217, 0.9858202338218689, -0.3567129075527191, 0.8575428128242493, -0.355827271938324, -0.5563408732414246, -0.2135596126317978],

		[-3.1379151344299316, -2.179814100265503]
	];
	//generate a new random paddle to fill
	let new_paddle = new Paddle("top");
	let new_tensors = []; //these tensors will have the above best weights data

	const old_weights = new_paddle.brain.model.getWeights(); //current weights
	for(let i = 0; i < old_weights.length; i++) {
		let shape = old_weights[i].shape;
		let newTensor = tf.tensor(best_weights[i], shape);
		new_tensors[i] = newTensor;
	}
	new_paddle.brain.model.setWeights(new_tensors);
	return new_paddle;
}

function thinkAndMove(paddle, index) {
	//Normalize the inputs and predict
	let radial = ball.getRadialVector();
	const inputs = [radial.x / width, radial.y / height,
		paddle.x / width, paddle.xchange / movement
	];
	const outputs = paddle.brain.predict(inputs);
	//Take action!
	if(outputs[0] > outputs[1]) {
		paddle.move(-movement); //To the Left!
	}
	else {
		paddle.move(movement); //To the Right!
	}
}

function draw() {
	background(241);
	movement = (10 / 3) * slider.value();
	if(!run_best) {
		for(let i = 0; i < paddles.length; i++) {
			if(!paddles[i].failed) {
				// paddles[i].score++;
				paddles[i].update();
				paddles[i].show();
				thinkAndMove(paddles[i]);
			}
		}
	}

	//Of paddle2: user-controlled via keyboard
	handlePaddleMovement(paddle2);
	paddle2.show();
	paddle2.update();
	ball.hits(paddle2);

	if(run_best) {
		thinkAndMove(paddle1);
		paddle1.show();
		paddle1.update();
		ball.hits(paddle1);
	}
	else {
		ball.hits(paddles);
	}
	ball.update();
	ball.show();

	ball.edges();
	const gameOver = ball.gameOver();

	if(!run_best) {
		paddles.forEach(p => {
			if(abs(p.x - (width - p.w)) < 5) {
				p.xchange = -movement;
			}
			else if(p.x <= 5) {
				p.xchange = movement;
			}
		});

		if(gameOver[0]) {
			gameOverCount++;
			//Üsttekiler 10 defa kaybettiğinde yeni paddle'lar geliyor
			if(gameOver[1] < 0) {
				for(let p of paddles) {
					if(!p.failed) {
						p.score *= 0.9;
					}
				}
				if(gameOverCount % 10 == 0) {
					paddles = nextGeneration();
				}
			}
		}
	}

	// brickets.forEach(b => {
	// 	b.show();
	// 	ball.hits(b)
	// });
}

function handlePaddleMovement(paddle) {
	if(paddle.name == "bottom") {
		//"leftarrow" for left
		if(keyIsDown(37)) {
			paddle2.move(-movement);
		}
		//"rightarrow" for right
		if(keyIsDown(39)) {
			paddle2.move(movement);
		}
	}
}

function keyReleased() {
	if(paddle2) {
		paddle2.move(0);
	}
	// paddles.forEach(p => p.move(0));
}