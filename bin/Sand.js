import {Block} from './Block.js';

class Sand extends Block {
	constructor() {
		super({
			left: 'sand',
			right: 'sand',
			top: 'sand',
			bottom: 'sand',
			front: 'sand',
			back: 'sand'
		}, {
			solid: true,
		})

		this.timer = 0;
		this.primed = false;
		this.status = 7;
		this.timeStep = 2;
	}
	update() {
		if (this.primed) {
			this.timer --;
			if (this.timer < 0) {
				this.status --;
				this.timer = this.timeStep;
				if (this.status < 1) {
					this.draw = false;
					this.flags.solid = false;
				} else {
					this.textures.top = 'sand' + (8-this.status);
				}
			}
		}

		this.stepped = false;
	}
	playerStep() {
		if (!this.primed) {
			this.primed = true;
			this.timer = this.timeStep;
			this.textures.top = 'sand1';
		}
	}
	reset() {
		this.draw = true;
		this.flags.solid = true;
		this.status = 7;
		this.primed = false;
		this.timer = 0;
		this.textures.top = 'sand';
	}
}

export {Sand};