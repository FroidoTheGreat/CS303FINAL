import {Block} from './Block.js';

class Glass extends Block {
	constructor() {
		super({
			left: 'glass',
			right: 'glass',
			top: 'glass',
			bottom: 'glass',
			front: 'glass',
			back: 'glass'
		}, {
			solid: 'true',
		})
	}
}

export {Glass};