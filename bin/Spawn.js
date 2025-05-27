import {Block} from './Block.js';

class Spawn extends Block {
	constructor() {
		super({
			left: 'spawn',
			right: 'spawn',
			top: 'spawn',
			bottom: 'spawn',
			front: 'spawn',
			back: 'spawn'
		}, {
			solid: true,
		})
	}
	playerStep(player) {
		player.spawn = vec3(this.pos.x,
			this.pos.y + 1,
			this.pos.z + 1);

		if (player.spawnBlock) {
			player.spawnBlock.unset();
		}

		this.set();
		player.spawnBlock = this;
	}
	set() {
		this.textures.top = 'spawn2';
	}
	unset() {
		this.textures.top = 'spawn';
	}
}

export {Spawn};