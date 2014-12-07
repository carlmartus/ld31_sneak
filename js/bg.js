var bgVbo;
var bgProgram;
var bgMvp;

var bgTimer;
var bgUniTimer;

var BG_SIZE = 512.0;

function bgInit() {
	bgTimer = 0.0;

	var vertData = new Float32Array([
		0.0, 0.0, 0.0, 0.0,
		BG_SIZE, 0.0, 1.0, 0.0,
		0.0, BG_SIZE, 0.0, 1.0,
		BG_SIZE, BG_SIZE, 1.0, 1.0,
		]);

	bgVbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, bgVbo);
	gl.bufferData(gl.ARRAY_BUFFER, vertData, gl.STATIC_DRAW);

	bgProgram = new esProgram(gl);
	bgProgram.addShaderId('bg-fs', ES_FRAGMENT);
	bgProgram.addShaderId('bg-vs', ES_VERTEX);
	bgProgram.bindAttribute(0, 'pos');
	bgProgram.link();
	bgProgram.use();

	var uniMvp = bgProgram.getUniform('mvp');
	var uniTex = bgProgram.getUniform('tex');
	bgUniTimer = bgProgram.getUniform('timer');

	bgMvp = esMat4_create();
	esMat4_ortho(bgMvp, 0.0, 512.0, 512.0, 0.0);
	gl.uniformMatrix4fv(uniMvp, false, bgMvp);
	gl.uniform1i(uniTex, 0);
}

function bgStep(ft) {
	bgTimer += ft*0.2;
	if (bgTimer > 1.6) {
		bgTimer = 0.0;
	}
}

function bgRenderPre() {

	bgProgram.use();
	gl.uniform1f(bgUniTimer, bgTimer);
	gl.bindTexture(gl.TEXTURE_2D, texBg);
	gl.enableVertexAttribArray(0);
	gl.bindBuffer(gl.ARRAY_BUFFER, bgVbo);
	gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	gl.disableVertexAttribArray(0);
}

function bgRenderPost() {
	spriteAdd(95, 63, 32, SP_BRUSH0);
	spriteAdd(118, 68, 32, SP_BRUSH0);
	spriteAdd(185, 85, 32, SP_BRUSH0);
	spriteAdd(95, 130, 32, SP_BRUSH0);
	spriteAdd(175, 122, 32, SP_BRUSH0);

	spriteAdd(117, 176, 32, SP_BRUSH0);
	spriteAdd(18, 127, 32, SP_BRUSH0);
	spriteAdd(70, 190, 32, SP_BRUSH0);
}

