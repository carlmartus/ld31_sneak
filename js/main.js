var gl;
var imgBg;
var frameFunc;
var texBg;

function frameExec(ft) {
	if (frameFunc != null) frameFunc(ft);
}

function makeTexture(img) {
	var tex = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, tex);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	assert(tex != null, tex);
	return tex;
}

function loaded() {
	bgInit();

	texBg = makeTexture(imgBg);

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
	lod.download(loaded);
}

function assert(cond, msg) {
	if (!cond) {
		alert(msg);
		throw new Error(cond, msg);
	}
}

