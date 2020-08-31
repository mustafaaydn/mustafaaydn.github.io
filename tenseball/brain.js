let ys;
class Brain {
	constructor(other) {
		if(other) { //~copy constructor
			const weights = other.model.getWeights();
			let new_weights = [];
			for(let i = 0; i < weights.length; i++) {
				new_weights[i] = weights[i].clone();
			}
			this.model = this.generateModel();
			this.model.setWeights(new_weights);
		}
		else {
			this.model = this.generateModel(); //tf model!
		}
	}

	generateModel() {
		const model = tf.sequential();

		const hidden = tf.layers.dense({
			units: 8,
			inputShape: [4], //(2)ball.radial, paddle.x, paddle.xchange
			activation: "relu"
		});

		const output = tf.layers.dense({
			units: 2, //move left, move right
			activation: "softmax"
		});

		model.add(hidden);
		model.add(output);

		return model;
	}

	predict(inputs) {
		return tf.tidy(() => {
			const xs = tf.tensor2d([inputs]);
			ys = this.model.predict(xs);
			const outputs = ys.dataSync(); //sync might be harmful
			return outputs; //Float32Array of length 2
		});
	}




}