class Player {
	constructor(map, x, y, z) {
		this.map = map;
		this.pos = vec3(x, y, z);
		this.up = vec3(0.0, 1.0, 0.0);
		this.dir = Math.PI / 2.0;
		this.vel = 0.0;
		this.canJump = 0;
		this.look = this.dirVec(0.0);
		this.HEIGHT = 1.8;
		this.WIDTH = 0.4;
		this.GROUND = -70.0;
		this.jumpTime = 5;

		this.controls = {
			W: false,
			A: false,
			S: false,
			D: false,
			RIGHT: false,
			LEFT: false,
			SPACE: false,
		}

		this.mouse = {
			x: 240,
			y: 0
		}

		this.spawn = vec3(x, y, z);
	}
	dirVec(theta) { // gets the players direction as a vector
	    var x = Math.cos(this.dir + theta);
	    var z = Math.sin(this.dir + theta);

	    return vec3(x, 0.0, z);
	}
	eye() {
		return vec3(this.pos[0], this.pos[1] + this.HEIGHT - 0.5, this.pos[2]);
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
	handleMouseMovement(move) {
		this.mouse.x += move.x;
		this.mouse.y += move.y;
		this.mouse.y = Math.min(Math.max(this.mouse.y, -(Math.PI/2.0) * 150), (Math.PI/2.0) * 150);
	}
	move(d) {
		// this.pos = add(this.pos, d)

		var mx = this.pos[0];
		var my = this.pos[1];
		var mz = this.pos[2];

		// handle x
		var collision = false;
		var x = 0;
		var dx = d[0];
		var sign = Math.sign(dx);
		if (Math.abs(dx) > 0) {
			while ((!collision) && (x*sign < dx*sign)) {
				x += sign * Math.min(0.5, Math.abs(x - dx));
				if (this.cLeft(x)) {
					collision = true;

					this.pos[0] += x;
					this.pos[0] = Math.floor(this.pos[0]);

					x = 0;
				}
				if (this.cRight(x)) {
					collision = true;

					this.pos[0] += x;
					this.pos[0] = Math.ceil(this.pos[0]);

					x = 0;
				}
			}
			this.pos[0] += x;
		}

		// handle z
		collision = false;
		var z = 0;
		var dz = d[2];
		sign = Math.sign(dz);
		if (Math.abs(dz) > 0) {
			while ((!collision) && (z*sign < dz*sign)) {
				z += sign * Math.min(0.5, Math.abs(z - dz));
				if (this.cBack(z)) {
					collision = true;

					this.pos[2] += z - this.WIDTH;
					this.pos[2] = Math.floor(this.pos[2]) + 0.5 + this.WIDTH;

					z = 0;
				}
				if (this.cFront(z)) {
					collision = true;

					this.pos[2] += z + this.WIDTH;
					this.pos[2] = Math.ceil(this.pos[2]) - 0.5 - this.WIDTH - 0.001;

					z = 0;
				}
			}
			this.pos[2] += z;
		}

		// handle y
		collision = false;
		var y = 0;
		var dy = d[1];
		sign = Math.sign(dy);
		if (Math.abs(dy) > 0) {
			while ((!collision) && (y*sign < dy*sign)) {
				y += sign * Math.min(0.5, Math.abs(y - dy));
				if (this.cBot(y)) {
					collision = true;

					this.pos[1] += y;
					this.pos[1] = Math.ceil(this.pos[1]);

					y = 0;

					this.canJump = this.jumpTime;
					this.vel = 0.0;
				}
				if (this.cTop(y)) {
					collision = true;

					this.pos[1] += y + this.HEIGHT;
					this.pos[1] = Math.floor(this.pos[1]) - this.HEIGHT - 0.001;

					y = 0;
					if (this.vel > 0.0) {
						this.vel = this.vel / 3;
					}
				}
			}
			this.pos[1] += y;
		}
	}
	step() {
		var cx = this.pos[0];
        var cy = this.pos[1] - 0.01;
        var cz = this.pos[2];
        
		var tl = this.map.fget(cx - this.WIDTH, cy, cz - this.WIDTH);
		var br = this.map.fget(cx + this.WIDTH, cy, cz + this.WIDTH);
		var tr = this.map.fget(cx + this.WIDTH, cy, cz - this.WIDTH);
		var bl = this.map.fget(cx - this.WIDTH, cy, cz + this.WIDTH);
		if (tl.isBlock && tl.flags.solid) {
			tl.playerStep(this);
		}
		if (br.isBlock && br.flags.solid && br !== tl) {
			br.playerStep(this);
		}
		if (tr.isBlock && tr.flags.solid && tr !== tl && tr !== br) {
			tr.playerStep(this);
		}
		if (bl.isBlock && bl.flags.solid && bl !== tl && bl !== br && bl !== tr) {
			bl.playerStep(this);
		}
	}
	cLeft(x) {
		var tx = this.pos[0] + this.WIDTH + x;
		return (
			   this.map.test(tx, this.pos[1], this.pos[2] + this.WIDTH)
			|| this.map.test(tx, this.pos[1], this.pos[2] - this.WIDTH)
			|| this.map.test(tx, this.pos[1] + this.HEIGHT / 2, this.pos[2] + this.WIDTH)
			|| this.map.test(tx, this.pos[1] + this.HEIGHT / 2, this.pos[2] - this.WIDTH)
			|| this.map.test(tx, this.pos[1] + this.HEIGHT, this.pos[2] + this.WIDTH)
			|| this.map.test(tx, this.pos[1] + this.HEIGHT, this.pos[2] - this.WIDTH)
			);
	}
	cRight(x) {
		var tx = this.pos[0] - this.WIDTH + x;
		return (
			   this.map.test(tx, this.pos[1], this.pos[2] + this.WIDTH)
			|| this.map.test(tx, this.pos[1], this.pos[2] - this.WIDTH)
			|| this.map.test(tx, this.pos[1] + this.HEIGHT / 2, this.pos[2] + this.WIDTH)
			|| this.map.test(tx, this.pos[1] + this.HEIGHT / 2, this.pos[2] - this.WIDTH)
			|| this.map.test(tx, this.pos[1] + this.HEIGHT, this.pos[2] + this.WIDTH)
			|| this.map.test(tx, this.pos[1] + this.HEIGHT, this.pos[2] - this.WIDTH)
			);
	}
	cBack(z) {
		var tz = this.pos[2] - this.WIDTH + z;
		return (
			   this.map.test(this.pos[0] + this.WIDTH, this.pos[1], tz)
			|| this.map.test(this.pos[0] - this.WIDTH, this.pos[1], tz)
			|| this.map.test(this.pos[0] + this.WIDTH, this.pos[1] + this.HEIGHT / 2.0, tz)
			|| this.map.test(this.pos[0] - this.WIDTH, this.pos[1] + this.HEIGHT / 2.0, tz)
			|| this.map.test(this.pos[0] + this.WIDTH, this.pos[1] + this.HEIGHT, tz)
			|| this.map.test(this.pos[0] - this.WIDTH, this.pos[1] + this.HEIGHT, tz)
			)
	}
	cFront(z) {
		var tz = this.pos[2] + this.WIDTH + z;
		return (
			   this.map.test(this.pos[0] + this.WIDTH, this.pos[1], tz)
			|| this.map.test(this.pos[0] - this.WIDTH, this.pos[1], tz)
			|| this.map.test(this.pos[0] + this.WIDTH, this.pos[1] + this.HEIGHT / 2.0, tz)
			|| this.map.test(this.pos[0] - this.WIDTH, this.pos[1] + this.HEIGHT / 2.0, tz)
			|| this.map.test(this.pos[0] + this.WIDTH, this.pos[1] + this.HEIGHT, tz)
			|| this.map.test(this.pos[0] - this.WIDTH, this.pos[1] + this.HEIGHT, tz)
			)
	}
	cBot(y) {
		var ty = this.pos[1] + y;
		return (
			   this.map.test(this.pos[0] - this.WIDTH, ty, this.pos[2] - this.WIDTH)
			|| this.map.test(this.pos[0] + this.WIDTH, ty, this.pos[2] + this.WIDTH)
			|| this.map.test(this.pos[0] + this.WIDTH, ty, this.pos[2] - this.WIDTH)
			|| this.map.test(this.pos[0] - this.WIDTH, ty, this.pos[2] + this.WIDTH)
			)
	}
	cTop(y) {
		var ty = this.pos[1] + this.HEIGHT + y;
		return (
			   this.map.test(this.pos[0] - this.WIDTH, ty, this.pos[2] - this.WIDTH)
			|| this.map.test(this.pos[0] + this.WIDTH, ty, this.pos[2] + this.WIDTH)
			|| this.map.test(this.pos[0] + this.WIDTH, ty, this.pos[2] - this.WIDTH)
			|| this.map.test(this.pos[0] - this.WIDTH, ty, this.pos[2] + this.WIDTH)
			)
	}
	update() {
		// gravity
        this.vel -= 0.025;
        this.move(vec3(0.0, this.vel, 0.0))
        if (this.pos[1] < this.GROUND) {
            this.pos = vec3(this.spawn[0],
            	this.spawn[1],
            	this.spawn[2]);
            this.map.reset(0, 0, 0, 100, 100, 100);
        };

        // handle player input
        var speed = 0.15
        var turnSpeed = 0.05
        if (this.controls.A) {
            this.move( mult(speed, this.dirVec(-Math.PI / 2)) );
        }
        if (this.controls.D) {
            this.move(mult(speed, this.dirVec(Math.PI / 2)));
        }
        if (this.controls.W) {
            this.move(mult(speed, this.dirVec(0.0)));
        }
        if (this.controls.S) {
            this.move(mult(speed, this.dirVec(Math.PI)));
        }
        if (this.canJump > 0 && this.controls.SPACE) {
            this.vel = 0.3;
            this.canJump = 0
        }

        this.step();

        this.canJump --;

        // handle mouse movement
        this.dir = this.mouse.x / 150;
        var pitch = -this.mouse.y / 150;

        var xz = this.dirVec(0.0);
        var c = Math.cos(pitch);
        this.look = normalize(vec3(xz[0] * c, Math.sin(pitch), xz[2] * c));
        var right = normalize(cross(vec3(0.0, 1.0, 0.0), this.look));
        this.up = normalize(cross(this.look, right));
	}
}

export {Player};