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
			-1.0,-1.0, 0.0, 1.0,
			 0.0,-1.0, 1.0, 1.0,
			-1.0, 0.0, 0.0, 0.0,
			 0.0, 0.0, 1.0, 0.0]);

	deathVbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, deathVbo);
	gl.bufferData(gl.ARRAY_BUFFER, vertData, gl.STATIC_DRAW);

	deathProgram = new esProgram(gl);
	deathProgram.addShaderId('death-fs', ES_FRAGMENT);
	deathProgram.addShaderId('death-vs', ES_VERTEX);
	deathProgram.bindAttribute(0, 'pos');
	deathProgram.link();

	deathProgram.use();
	deathUniTex = deathProgram.getUniform('tex');
	gl.uniform1i(deathUniTex, 0);
}

function deathReborn() {
	avatarInit(nodePlayerStart);
	aiRespawnWave();
	nodeUnOccupy();
}

function deathQueue(texture, text, duration, sound) {
	deathQ.push([texture, text, duration, sound]);
}

function deathFrame(ft) {

	playRender();

	if (deathDuration <= 0.0) {
		if (deathQ.length <= 0) {
			modePlay();
		} else {
			var line = deathQ.shift();
			deathTexture = line[0];
			deathText = line[1];
			deathDuration = line[2];
			var sound = line[3];

			if (sound) {
				sound.play();
			}
		}
	}

	deathProgram.use();
	gl.bindTexture(gl.TEXTURE_2D, deathTexture);
	gl.enableVertexAttribArray(0);
	gl.bindBuffer(gl.ARRAY_BUFFER, deathVbo);
	gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	gl.disableVertexAttribArray(0);

	var midX = 128 - ((deathText.length / 2) - 0.5)*16;
	spriteAddText(midX, 268, 16, deathText);

	deathDuration -= ft;
}

