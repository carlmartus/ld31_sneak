var gl;
var imgBg;
var imgSprites;
var frameFunc;
var texBg;
var texSprites;

function frameExec(ft) {
	if (ft > 0.3) return;

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
	nodeInit();
	aiInit();

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

