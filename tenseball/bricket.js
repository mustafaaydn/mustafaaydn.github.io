const xoff = 0.1;
const cols = 20;
class Bricket {
	constructor(i, j) {
		this.i = i;
		this.j = j
		this.w = width * (1 - 2 * xoff) / cols;
		this.h = this.w / 2;
		this.hit = false;

		this.x = this.j * this.w + width * xoff;
		this.y = this.i * this.h + 50;
		//console.log(this.i, this.j, " => ", "(",this.x,", ", this.y, " )");
	}

	show() {
		if(!this.hit) {
			push();
			fill("purple");
			stroke(255);
			rect(this.x, this.y, this.w, this.h)
			pop();
		}
	}
}