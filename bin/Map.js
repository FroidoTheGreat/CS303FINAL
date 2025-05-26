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
        this.grid[x][y][z] = val;
	}
	get(x, y, z) {
        if (x < 0 || y < 0 || z < 0
            || this.grid[x] == null
            || this.grid[x][y] == null
            || this.grid[x][y][z] == null) {
            return 0;
        }
        return this.grid[x][y][z]
    }
    test(x, y, z) {
        var cx = Math.floor(x + 0.5);
        var cy = Math.floor(y);
        var cz = Math.floor(z - 0.5);

        var val = this.get(cx, cy, cz);

        return (val === 1);
    }
    draw(VM, cx, cy, cz, w, h, d) {
        for (var x = cx; x < cx + w; x++) {
            for (var y = cy; y < cy + h; y++) {
                for (var z = cz; z < cz + d; z++) {
                    var val = this.get(x, y, z)
                    if (val != null && val != 0) {
                        draw.cube(VM, x, y + 0.5, z);
                    }
                }
            }
        }
    }
}
export {Map};