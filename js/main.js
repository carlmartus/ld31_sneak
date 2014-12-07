var gl;

var imgBg;
var imgSprites;
var imgCsCleared;
var imgCsKnife;
var imgCsPipe;
var imgCsRedWin;
var imgCsRedFail;
var imgCsRedKill;
var imgCsMudWin;
var imgCsMudFail;
var imgCsMudKill;

var texBg;
var texSprites;
var texCsCleared;
var texCsKnife;
var texCsPipe;
var texCsRedWin;
var texCsRedFail;
var texCsRedKill;
var texCsMudWin;
var texCsMudFail;
var texCsMudKill;

var sndLaugh;
var sndSmack;
var sndWhat;
var sndAttack0;
var sndAttack1;
var sndPou;
var sndExpl;

var frameFunc;
var blockMouse;

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
	texCsCleared = makeTexture(imgCsCleared);
	texCsKnife = makeTexture(imgCsKnife);
	texCsPipe = makeTexture(imgCsPipe);
	texCsRedWin = makeTexture(imgCsRedWin);
	texCsRedFail = makeTexture(imgCsRedFail);
	texCsRedKill = makeTexture(imgCsRedKill);
	texCsMudWin = makeTexture(imgCsMudWin);
	texCsMudFail = makeTexture(imgCsMudFail);
	texCsMudKill = makeTexture(imgCsMudKill);

	bgInit();
	spriteInit();
	nodeInit();
	aiInit();
	avatarInit();
	deathInit();

	//spriteExplosion(100, 100);

	var canvas = document.getElementById('can');
	canvas.addEventListener('mousedown', mouseEvent, false);

	esNextFrame(frameExec);

	deathQueue(texCsRedWin, 'sneak', 2, null);
	deathQueue(texCsKnife, 'locate weapons', 2, null);
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
	imgCsCleared = lod.loadImage('cleared.png');
	imgCsKnife = lod.loadImage('cs_knife.png');
	imgCsPipe = lod.loadImage('cs_pipe.png');
	imgCsRedWin = lod.loadImage('cs_redwin.png');
	imgCsRedFail = lod.loadImage('cs_redfail.png');
	imgCsRedKill = lod.loadImage('cs_redkill.png');
	imgCsMudWin = lod.loadImage('cs_mudwin.png');
	imgCsMudFail = lod.loadImage('cs_mudfail.png');
	imgCsMudKill = lod.loadImage('cs_mudkill.png');

	sndLaugh = lod.loadAudio('laugh.ogg');
	sndSmack = lod.loadAudio('smack.ogg');
	sndWhat = lod.loadAudio('what.ogg');
	sndAttack0 = lod.loadAudio('attack0.ogg');
	sndAttack1 = lod.loadAudio('attack1.ogg');
	sndPou = lod.loadAudio('pou.ogg');
	sndExpl = lod.loadAudio('expl.ogg');

	lod.download(loaded);
}

function mouseEvent(event) {
	if (blockMouse) return;

	var canvas = document.getElementById('can');
	var rect = canvas.getBoundingClientRect();

	var x = event.clientX - (rect.x | rect.left);
	var y = event.clientY - (rect.y | rect.top);
	avatarSetMouse(x, y);
}

function modePlay() {
	blockMouse = false;
	frameFunc = playFrame;
}

function modeDeath() {
	blockMouse = true;
	frameFunc = deathFrame;
}

function assert(cond, msg) {
	if (!cond) {
		alert(msg);
		throw new Error(cond, msg);
	}
}

