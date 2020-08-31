class Paddle {
	//Expects the location as string: "top" or "bottom"
	constructor(location) {
		if(typeof location == "string") {
			this.w = width / 10;
			this.h = 11;
			this.gap = 5;
			this.x = randomGaussian() + width / 2;

			this.xchange = 0;

			if(/top|up/i.test(location)) {
				this.y = this.gap;
				this.name = "top";
				//Top one has a brain!
				this.brain = new Brain();
				this.score = 0;
				this.fitness = 0;
				this.failed = false;
			}
			else if(/bottom|down/i.test(location)) {
				this.y = height - this.gap - this.h;
				this.name = "bottom";
				this.w = width; //uncomment if training
			}
		}
		else if(location instanceof Paddle) { //~copy constructor
			this.w = location.w;
			this.h = location.h;
			this.gap = location.gap;
			this.x = location.x;
			this.xchange = location.xchange;
			this.y = location.y;
			this.name = location.name;
			this.brain = new Brain(location.brain);
			this.score = 0;
			this.fitness = location.fitness;
			this.failed = location.failed;
		}
	}

	update() {
		this.x += this.xchange;
		// if(this.x < 0)
		// 	this.x = width - this.w;
		// else if(this.x > width - this.w)
		// 	this.x = 0;
	}

	move(steps) {
		this.xchange = steps;
	}

	show() {
		fill(70, 83, 235);
		noStroke();
		this.x = constrain(this.x, 0, width - this.w)
		rect(this.x, this.y, this.w, this.h);
		// image(paddleImage, this.x, this.y, paddleImage.width, paddleImage.height);
	}
}