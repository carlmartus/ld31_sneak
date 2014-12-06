var bgVbo;
var bgProgram;
var bgMvp;

var BG_SIZE = 512.0;

function bgInit() {
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
	bgProgram.link();
	bgProgram.use();

	var uniMvp = bgProgram.getUniform('mvp');
	var uniTex = bgProgram.getUniform('tex');

	bgMvp = esMat4_create();
	esMat4_ortho(bgMvp, 0.0, 512.0, 640.0, 0.0);
	gl.uniformMatrix4fv(uniMvp, false, bgMvp);
	gl.uniform1i(uniTex, 0);
}

function bgRender() {
	bgProgram.use();
	gl.bindTexture(gl.TEXTURE_2D, texBg);
	gl.enableVertexAttribArray(0);
	gl.bindBuffer(gl.ARRAY_BUFFER, bgVbo);
	gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	gl.disableVertexAttribArray(0);
}

var spriteList;
var spriteCount;
var spriteVbo;
var spriteProgram;

var SPRITE_MAX = 100;
var SPRITE_COMPS = 5;
var SPRITE_COMPS_SIZE = SPRITE_COMPS*4;

var SPRITE_DIM = 16;
var SP_NODE = [0, 0];

// Comp 0 - x
// Comp 1 - y
// Comp 2 - u
// Comp 3 - v
// Comp 4 - size

function spriteInit() {
	spriteCount = 0;
	spriteList = new Float32Array(SPRITE_MAX*SPRITE_COMPS);
	spriteList[0] = 0.5;

	spriteVbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, spriteVbo);
	gl.bufferData(gl.ARRAY_BUFFER, spriteList, gl.DYNAMIC_DRAW);

	spriteProgram = new esProgram(gl);
	spriteProgram.addShaderId('sprite-fs', ES_FRAGMENT);
	spriteProgram.addShaderId('sprite-vs', ES_VERTEX);
	spriteProgram.bindAttribute(0, 'pos');
	spriteProgram.bindAttribute(1, 'uv');
	spriteProgram.bindAttribute(2, 'size');
	spriteProgram.link();
	spriteProgram.use();

	var uniTex = spriteProgram.getUniform('tex');
	var uniMvp = spriteProgram.getUniform('mvp');
	gl.uniform1i(uniTex, 0);
	gl.uniformMatrix4fv(uniMvp, false, bgMvp);
}

function spriteAdd(x, y, size, uvId) {
	if (spriteCount >= SPRITE_MAX) return;

	var offset = SPRITE_COMPS*spriteCount;
	spriteList[offset+0] = x;
	spriteList[offset+1] = y;
	spriteList[offset+2] = uvId[0];
	spriteList[offset+3] = uvId[1];
	spriteList[offset+4] = size;
	spriteCount++;
}

function spriteFlush() {
	if (spriteCount <= 0) return;

	gl.bindBuffer(gl.ARRAY_BUFFER, spriteVbo);
	gl.bufferSubData(gl.ARRAY_BUFFER, 0,
			spriteList.subarray(0, spriteCount*SPRITE_COMPS));

	spriteProgram.use();
	gl.bindTexture(gl.TEXTURE_2D, texSprites);

	gl.enableVertexAttribArray(0);
	gl.enableVertexAttribArray(1);
	gl.enableVertexAttribArray(2);

	gl.vertexAttribPointer(0, 2, gl.FLOAT, false, SPRITE_COMPS_SIZE, 0);
	gl.vertexAttribPointer(1, 2, gl.FLOAT, false, SPRITE_COMPS_SIZE, 8);
	gl.vertexAttribPointer(2, 1, gl.FLOAT, false, SPRITE_COMPS_SIZE, 16);

	gl.drawArrays(gl.POINTS, 0, spriteCount);

	gl.disableVertexAttribArray(0);
	gl.disableVertexAttribArray(1);
	gl.disableVertexAttribArray(2);

	spriteCount = 0;
}

var gl;
var imgBg;
var imgSprites;
var frameFunc;
var texBg;
var texSprites;

function frameExec(ft) {
	if (frameFunc != null) frameFunc(ft);
	spriteFlush();
}

function makeTexture(img) {
	var tex = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, tex);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	assert(tex != null, tex);
	return tex;
}

function loaded() {
	bgInit();
	spriteInit();

	texBg = makeTexture(imgBg);
	texSprites = makeTexture(imgSprites);

	frameFunc = playFrame;
	esNextFrame(frameExec);
}

function main() {
	frameFunc = null;

	gl = esInitGl('can');

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	var lod = new esLoad();
	imgBg = lod.loadImage('bg.png');
	imgSprites = lod.loadImage('sprites.png');
	lod.download(loaded);
}

function assert(cond, msg) {
	if (!cond) {
		alert(msg);
		throw new Error(cond, msg);
	}
}

function playFrame(ft) {
	gl.clear(gl.COLOR_BUFFER_BIT);
	bgRender();

	for (var i=0; i<30; i++) {
		spriteAdd(i*30, 100.0 + i*30, 16.0, SP_NODE);
	}
}

