class Ball {
	constructor(other) {
		this.r = width / 50;
		this.speed = 3;
		this.placeBall(this.speed);
	}

	placeBall(speed) {
		this.pos = createVector(width / 2 + randomGaussian(), height / 2 + randomGaussian());
		const angle = radians(random(30, 150) + ((random() > 0.5) ? 180 : 0));
		this.vel = p5.Vector.fromAngle(angle);
		this.vel.setMag(this.speed);
	}

	show() {
		fill(170, 83, 35)
		noStroke()
		ellipse(this.pos.x, this.pos.y, this.r, this.r)
	}

	update() {
		this.pos.add(this.vel);
		ball.vel.setMag(slider.value());
	}

	hits(other) {
		let radial = this.getRadialVector();

		if(other instanceof Array && other[0] instanceof Paddle) {
			for(let i = 0; i < other.length; i++) {
				if(!other[i].failed) {
					let paddle = other[i]; //burası uzun bi süre let paddle = paddles[i]; şeklindeymiş
					// https://github.com/bmoren/p5.collide2D/blob/master/p5.collide2d.js
					// temporary variables to set edges for testing
					let testX = this.pos.x;
					let testY = this.pos.y;
					// which edge is closest?
					if(this.pos.x < paddle.x) {
						testX = paddle.x // left edge
					}
					else if(this.pos.x > paddle.x + paddle.w) { // right edge
						testX = paddle.x + paddle.w
					}
					if(this.pos.y < paddle.y) {
						testY = paddle.y // top edge
					}
					else if(this.pos.y > paddle.y + paddle.h) {
						testY = paddle.y + paddle.h // bottom edge
					}

					// get distance from closest edges
					let distance = (this.pos.x - testX) * (this.pos.x - testX) + (this.pos.y - testY) * (this.pos.y - testY);

					// if the distance is less than the radius, collision!
					if(distance <= this.r * this.r) {
						//other[i].score++; //asıl çarpanın skoru artırılıyor
						// console.log("HIT!");
						for(let j = 0; j < other.length; j++) {
							if(!other[j].failed) {
								if(testX < other[j].x || testX > other[j].x + other[j].w) {
									// console.log(j, " is failed!");
									other[j].failed = true;
								}
								else {
									other[j].score++; //diğer karşılayası olanların da skoru artırılıyor (may include the original)
								}
							}
						}
						let angle = map(this.pos.x, paddle.x, paddle.x + paddle.w, 135, 45);
						this.vel = p5.Vector.fromAngle(radians(angle));
						this.vel.setMag(this.speed);
					}
				}
			}
		}
		//bottom user-controlled paddle (or a paddle, for that matter)
		else if(other instanceof Paddle) {
			// https://github.com/bmoren/p5.collide2D/blob/master/p5.collide2d.js
			// temporary variables to set edges for testing
			let testX = this.pos.x;
			let testY = this.pos.y;
			// which edge is closest?
			if(this.pos.x < other.x) {
				testX = other.x // left edge
			}
			else if(this.pos.x > other.x + other.w) { // right edge
				testX = other.x + other.w
			}
			if(this.pos.y < other.y) {
				testY = other.y // top edge
			}
			else if(this.pos.y > other.y + other.h) {
				testY = other.y + other.h // bottom edge
			}

			// get distance from closest edges
			let distance = (this.pos.x - testX) * (this.pos.x - testX) + (this.pos.y - testY) * (this.pos.y - testY);

			// if the distance is less than the radius, collision!
			if(distance <= this.r * this.r) {
				// console.log("HIT!");
				let angle = map(this.pos.x, other.x, other.x + other.w, 225, 315);
				if(other.name == "top")
					angle *= -1;
				this.vel = p5.Vector.fromAngle(radians(angle));
				this.vel.setMag(this.speed);
			}
		}
		else if(other instanceof Bricket) {
			if(radial.x >= other.x &&
				radial.x <= other.x + other.w &&
				radial.y >= other.y &&
				radial.y <= other.y + other.h) {
				//console.log("hitting:", other.i, other.j);
				// other.hit = true;
				this.vel.mult(-1);
			}
		}
	}

	gameOver() {
		let radial = this.getRadialVector();

		//offset for aesthetic:
		const off = this.r / 1.5;
		if(radial.y <= 0 - off || radial.y >= height + off) {
			//console.log("Game Over");
			push();
			stroke("magenta");
			strokeWeight(4);
			line(40, height / 2, width - 40, height / 2);
			//console.log("oyun bitti çaktırma")
			pop();
			this.placeBall(this.speed); //replace the ball
			return [true, radial.y];
		}
		return [false, Infinity];
	}

	edges() {
		let radial = this.getRadialVector();
		//sağ taraf
		if(radial.x >= width) {
			this.vel.x *= -1;
		}
		//sol taraf
		else if(radial.x <= 0) {
			this.vel.x *= -1;
		}
		// //alt taraf
		// else if(radial.y >= height) {
		// 	this.vel.y *= -1;
		// }
	}
	getRadialVector() {
		let pos = this.pos.copy();
		let vel = this.vel.copy();
		vel.setMag(this.r);
		return pos.add(vel);
	}
}