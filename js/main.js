var gl;

function main() {
	gl = esInitGl('can');

	gl.clearColor(0.2, 0.2, 0.2, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);
}

