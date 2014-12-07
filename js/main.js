var gl;

var imgBg;
var imgSprites;
var imgCsKnife;
var imgCsRedWin;
var imgCsRedKill;

var texBg;
var texSprites;
var texCsKnife;
var texCsRedWin;
var texCsRedKill;

var frameFunc;

function frameExec(ft) {
	if (ft > 0.3) return;

	gl.clear(gl.COLOR_BUFFER_BIT);
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
	texBg = makeTexture(imgBg);
	texSprites = makeTexture(imgSprites);
	texCsKnife = makeTexture(imgCsKnife);
	texCsRedWin = makeTexture(imgCsRedWin);
	texCsRedKill = makeTexture(imgCsRedKill);

	bgInit();
	spriteInit();
	nodeInit();
	aiInit();
	avatarInit();
	deathInit();

	var canvas = document.getElementById('can');
	canvas.addEventListener('mousedown', mouseEvent, false);

	esNextFrame(frameExec);

	deathQueue(texCsRedWin, 'sneak', 2, null);
	deathQueue(texCsKnife, 'and', 2, null);
	deathQueue(texCsRedKill, 'assasinate', 4, null);
	modeDeath();
}

function main() {
	frameFunc = null;

	gl = esInitGl('can');

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	var lod = new esLoad();
	imgBg = lod.loadImage('bg.png');
	imgSprites = lod.loadImage('sprites.png');
	imgCsKnife = lod.loadImage('cs_knife.png');
	imgCsRedWin = lod.loadImage('cs_redwin.png');
	imgCsRedKill = lod.loadImage('cs_redkill.png');
	lod.download(loaded);
}

function mouseEvent(event) {
	var canvas = document.getElementById('can');
	var rect = canvas.getBoundingClientRect();
	avatarMouse(
			event.clientX - rect.x,
			event.clientY - rect.y);
}

function modePlay() {
	frameFunc = playFrame;
}

function modeDeath() {
	frameFunc = deathFrame;
}

function assert(cond, msg) {
	if (!cond) {
		alert(msg);
		throw new Error(cond, msg);
	}
}

