var bgVbo;
var bgProgram;

var BG_SIZE = 512.0;

function bgInit() {
	var vertData = new Float32Array([
		0.0, 0.0, 0.0, 1.0,
		BG_SIZE, 0.0, 1.0, 1.0,
		0.0, BG_SIZE, 0.0, 0.0,
		BG_SIZE, BG_SIZE, 1.0, 0.0,
		]);

	bgVbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, bgVbo);
	gl.bufferData(gl.ARRAY_BUFFER, vertData, gl.STATIC_DRAW);

	bgProgram = new esProgram(gl);
	bgProgram.addShaderId('bg-fs', ES_FRAGMENT);
	bgProgram.addShaderId('bg-vs', ES_VERTEX);
	bgProgram.link();
	bgProgram.use();

	var uniMvp = bgProgram.getUniform('mvp');
	var uniTex = bgProgram.getUniform('tex');

	var mvp = esMat4_create();
	esMat4_ortho(mvp, 0.0, 0.0, 640.0, 512.0);
	gl.uniformMatrix4fv(uniMvp, false, mvp);
	gl.uniform1i(uniTex, 0);
}

function bgRender() {
	bgProgram.use();
	gl.enableVertexAttribArray(0);
	gl.bindBuffer(gl.ARRAY_BUFFER, bgVbo);
	gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	gl.disableVertexAttribArray(0);
}

