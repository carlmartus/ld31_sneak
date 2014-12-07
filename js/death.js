var deathQ;
var deathTexture;
var deathText;
var deathDuration;

var deathProgram;
var deathVbo;
var deathUniTex;

function deathInit() {
	deathQ = [];
	deathDuration = 0.0;

	var vertData = new Float32Array([
			0.0, 0.0, 0.0, 1.0,
			1.0, 0.0, 1.0, 1.0,
			0.0, 1.0, 0.0, 0.0,
			1.0, 1.0, 1.0, 0.0]);

	deathVbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, deathVbo);
	gl.bufferData(gl.ARRAY_BUFFER, vertData, gl.STATIC_DRAW);

	deathProgram = new esProgram(gl);
	deathProgram.addShaderId('death-fs', ES_FRAGMENT);
	deathProgram.addShaderId('death-vs', ES_VERTEX);
	deathProgram.bindAttribute(0, 'pos');
	deathProgram.link();
	deathUniTex = deathProgram.getUniform('tex');
}

function deathReborn() {
	avatarInit(nodePlayerStart);
	aiRespawnWave();
}

function deathQueue(texture, text, duration, sound) {
	deathQ.push([texture, text, duration]);
}

function deathFrame(ft) {
	if (deathDuration <= 0.0) {
		if (deathQ.length <= 0) {
			modePlay();
		} else {
			var line = deathQ.shift();
			deathTexture = line[0];
			deathText = line[1];
			deathDuration = line[2];
			var sound = line[3];
		}
	}

	gl.bindTexture(gl.TEXTURE_2D, deathTexture);
	deathProgram.use();
	gl.enableVertexAttribArray(0);
	gl.bindBuffer(gl.ARRAY_BUFFER, deathVbo);
	gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	gl.disableVertexAttribArray(0);

	var midX = 256 - ((deathText.length / 2) - 0.5)*32;
	spriteAddText(midX, 400, 32, deathText);

	deathDuration -= ft;
}
