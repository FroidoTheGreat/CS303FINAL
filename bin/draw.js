const draw = {
	cube(viewMatrix, x, y, z) {
	    var transMatrix = translate(x, y, z);
	    var modelViewMatrix = mult(viewMatrix, transMatrix);

	    this.gl.uniformMatrix4fv(this.mvMatrixLoc, false, flatten(modelViewMatrix));

	    this.gl.drawArrays(this.gl.TRIANGLES, 0, 36);
	},
	init(gl, mvMatrixLoc) {
		this.gl = gl;
		this.mvMatrixLoc = mvMatrixLoc;
	}
}

export {draw};