import {draw} from './draw.js';

class Map {
	constructor() {
		this.grid = [];
	}
	set(x, y, z, val) {
		if (x < 0 || y < 0 || z < 0) {
            return;
        }

        if (this.grid[x] == null) {
            this.grid[x] = [];
        }
        if (this.grid[x][y] == null) {
            this.grid[x][y] = [];
        }

        if (val.isBlock) {
            val.pos = {
                x: x,
                y: y,
                z: z
            };
        }

        this.grid[x][y][z] = val;
	}
	get(cx, cy, cz) {
        if (cx < 0 || cy < 0 || cz < 0
            || this.grid[cx] == null
            || this.grid[cx][cy] == null
            || this.grid[cx][cy][cz] == null) {
            return 0;
        }
        return this.grid[cx][cy][cz]
    }
    fget(x, y, z) {
        var cx = Math.floor(x + 0.5);
        var cy = Math.floor(y);
        var cz = Math.floor(z - 0.5);

        return this.get(cx, cy, cz);
    }
    test(x, y, z) {
        var cx = Math.floor(x + 0.5);
        var cy = Math.floor(y);
        var cz = Math.floor(z - 0.5);

        var val = this.get(cx, cy, cz);
        if (val === 0 || val === undefined || val === null) {
            return false;
        }
        return (val.flags.solid);
    }
    draw(VM, cx, cy, cz, w, h, d) {
        for (var x = cx; x < cx + w; x++) {
            for (var y = cy; y < cy + h; y++) {
                for (var z = cz; z < cz + d; z++) {
                    var block = this.get(x, y, z)
                    if (block != null && block != 0 && block.draw) {
                        draw.block(block, VM, x, y + 0.5, z);
                    }
                }
            }
        }
    }
    update(cx, cy, cz, w, h, d) {
       for (var x = cx; x < cx + w; x++) {
            for (var y = cy; y < cy + h; y++) {
                for (var z = cz; z < cz + d; z++) {
                    var block = this.get(x, y, z)
                    if (block != null && block != 0) {
                        block.update();
                    }
                }
            }
        } 
    }
    reset(cx, cy, cz, w, h, d) {
       for (var x = cx; x < cx + w; x++) {
            for (var y = cy; y < cy + h; y++) {
                for (var z = cz; z < cz + d; z++) {
                    var block = this.get(x, y, z)
                    if (block != null && block != 0) {
                        block.reset();
                    }
                }
            }
        } 
    }
}
export {Map};