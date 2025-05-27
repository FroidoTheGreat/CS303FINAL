const draw = {
	NAMES: [
		'box',
		'box2',
		'tile',
		'tile_top',
		'glass',
		'sand',
		'sand1',
		'sand2',
		'sand3',
		'sand4',
		'sand5',
		'sand6',
		'sand7',
		'spawn',
		'spawn2'
		],
	cube(viewMatrix, x, y, z) {
	    var transMatrix = translate(x, y, z);
	    var modelViewMatrix = mult(viewMatrix, transMatrix);

	    this.gl.uniformMatrix4fv(this.mvMatrixLoc, false, flatten(modelViewMatrix));

	    this.gl.drawArrays(this.gl.TRIANGLES, 0, 36);
	},
	block(b, viewMatrix, x, y, z) {
		var transMatrix = translate(x, y, z);
	    var modelViewMatrix = mult(viewMatrix, transMatrix);
	    this.gl.uniformMatrix4fv(this.mvMatrixLoc, false, flatten(modelViewMatrix));

	    let t = b.textures;

	    this.setTexture(t.front);
	    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
	    this.setTexture(t.left);
	    this.gl.drawArrays(this.gl.TRIANGLES, 6, 6);
	    this.setTexture(t.bottom);
	    this.gl.drawArrays(this.gl.TRIANGLES, 12, 6);
	    this.setTexture(t.top);
	    this.gl.drawArrays(this.gl.TRIANGLES, 18, 6);
	    this.setTexture(t.back);
	    this.gl.drawArrays(this.gl.TRIANGLES, 24, 6);
	    this.setTexture(t.right);
	    this.gl.drawArrays(this.gl.TRIANGLES, 30, 6);
	},
	init(gl, program, mvMatrixLoc) {
		this.gl = gl;
		this.program = program;
		this.mvMatrixLoc = mvMatrixLoc;

		this.textures = new Map();
		this.loadTextures();
	},
	isLoaded() {

	},
	loadTextures: async function() {
		console.log("loading textures:");
		for (var i = 0; i < this.NAMES.length; i++) {
			const name = this.NAMES[i];
			console.log("loading: " + name);
			const tex = await this.configureTexture(name);
			this.textures.set(name, tex);
		}
	},
	setTexture(name) {
		let texture = this.textures.get(name);
		this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
	},
	configureTexture: async function(name) {
		var image = await this.loadImage(name);
	    var texture = this.gl.createTexture();

	    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
	    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGB,
	         this.gl.RGB, this.gl.UNSIGNED_BYTE, image);
	    this.gl.generateMipmap(this.gl.TEXTURE_2D);
	    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER,
	                      this.gl.NEAREST_MIPMAP_LINEAR);
	    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);

	    this.gl.uniform1i(this.gl.getUniformLocation(this.program, "uTexMap"), 0);
	    return texture;
	},
	loadImage: async function(name) {
		console.log(name)
		return new Promise(r => {
			let i = new Image();
			i.onload = (() => r(i));
			i.src = '../sprites/'+name+'.png';
		})
	}
}

export {draw};