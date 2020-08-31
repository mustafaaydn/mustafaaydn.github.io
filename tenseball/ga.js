const CROSSOVER_RATE = 0;
const MUTATION_RATE = 0.1;

function nextGeneration() {
	//Calculate & normalize fitness for all
	normalizeFitness();
	//Sort them by fitness (or score, doesn't matter here) in descending order
	paddles.sort((a, b) => b.score - a.score);
	let best_of_generation = new Paddle(paddles[0]);

	paddles.forEach(p => console.log(p.fitness));
	//Perform the selection
	let new_paddles = [];
	for(let i = 0; i < paddles.length; i++) {
		new_paddles[i] = performSelection();
	}
	//Reproduce the generation via crossover & mutation
	// let new_population = reproducePopulation(mating_pool);
	console.log("Generation: ", gameOverCount / 10 + 1);
	new_paddles.forEach(p => {
		mutate(p);
		p.failed = false;
		p.x = randomGaussian() + width / 2;
		p.score = 0;
	}); //mutate and ~reset the game
	new_paddles[0] = best_of_generation;
	return new_paddles;
}

function mutate(paddle) {
	tf.tidy(() => {
		const weights = paddle.brain.model.getWeights();
		const mutatedWeights = [];
		for(let i = 0; i < weights.length; i++) {
			let tensor = weights[i];
			let shape = weights[i].shape;
			let values = tensor.dataSync().slice();
			for(let j = 0; j < values.length; j++) {
				if(random() < MUTATION_RATE) {
					values[j] += randomGaussian() / 2;
				}
			}
			let newTensor = tf.tensor(values, shape);
			mutatedWeights[i] = newTensor;
		}
		paddle.brain.model.setWeights(mutatedWeights);
	});
}

function performSelection() {
	let r = random();
	let index = 0;
	while(r > 0) {
		r -= paddles[index].fitness;
		index++;
	}
	return new Paddle(paddles[--index]);
}


function normalizeFitness() {
	let total_score = 0;
	for(let paddle of paddles) {
		// paddle.score = pow(paddle.score, 2);
		total_score += paddle.score;
	}
	for(let paddle of paddles) {
		paddle.fitness = paddle.score / total_score;
	}
}