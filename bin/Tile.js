import {Block} from './Block.js';

class Tile extends Block {
	constructor() {
		super({
			left: 'tile',
			right: 'tile',
			top: 'tile',
			bottom: 'tile',
			front: 'tile',
			back: 'tile'
		}, {
			solid: true,
		})

		if (Math.random() < 0.3) {
			this.textures.top = 'tile_top';
		}
	}
	playerStep(player) {
		
	}
}

export {Tile};