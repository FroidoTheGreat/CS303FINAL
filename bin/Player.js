class Player {
	constructor(x, y, z) {
		this.pos = vec3(x, y, z);
		this.up = vec3(0.0, 1.0, 0.0);
		this.dir = Math.PI / 2.0;
		this.vel = 0.0;
		this.canJump = true;

		this.controls = {
			W: false,
			A: false,
			S: false,
			D: false,
			RIGHT: false,
			LEFT: false,
			SPACE: false
		}
	}
	dirVec(theta) { // gets the players direction as a vector
	    var x = Math.cos(this.dir + theta);
	    var z = Math.sin(this.dir + theta);

	    return vec3(x, 0.0, z);
	}
	keyDown(key) {
		if (key == 65) {
            this.controls.A = true;
        } else if (key == 68) {
            this.controls.D = true;
        } else if (key == 87) {
            this.controls.W = true;
        } else if (key == 83) {
            this.controls.S = true;
        } else if (key == 37) {
            this.controls.LEFT = true;
        } else if (key == 39) {
            this.controls.RIGHT = true;
        } else if (key == 32) {
            this.controls.SPACE = true;
        };
	}
	keyUp(key) {
		if (key == 65) {
            this.controls.A = false;
        } else if (key == 68) {
            this.controls.D = false;
        } else if (key == 87) {
            this.controls.W = false;
        } else if (key == 83) {
            this.controls.S = false;
        } else if (key == 37) {
            this.controls.LEFT = false;
        } else if (key == 39) {
            this.controls.RIGHT = false;
        } else if (key == 32) {
            this.controls.SPACE = false;
        };
	}
	update() {
		// gravity
        this.vel -= 0.05;
        this.pos[1] += this.vel;
        if (this.pos[1] < 2.0) {
            this.pos[1] = 2.0;
            this.vel = 0;
            this.canJump = true
        };

        // handle player input
        var speed = 0.15
        var turnSpeed = 0.05
        if (this.controls.A) {
            this.pos = add(this.pos, mult(speed, this.dirVec(-Math.PI / 2)));
        }
        if (this.controls.D) {
            this.pos = add(this.pos, mult(speed, this.dirVec(Math.PI / 2)));
        }
        if (this.controls.W) {
            this.pos = add(this.pos, mult(speed, this.dirVec(0.0)));
        }
        if (this.controls.S) {
            this.pos = add(this.pos, mult(speed, this.dirVec(Math.PI)));
        }
        if (this.controls.LEFT) {
            this.dir = this.dir - turnSpeed;
        }
        if (this.controls.RIGHT) {
            this.dir = this.dir + turnSpeed;
        }
        if (this.canJump && this.controls.SPACE) {
            this.vel = 0.7;
            this.canJump = false;
        }
	}
}

export {Player};