var spriteList;
var spriteCount;
var spriteVbo;
var spriteProgram;

var SPRITE_MAX = 100;
var SPRITE_COMPS = 5;
var SPRITE_COMPS_SIZE = SPRITE_COMPS*4;

var SPRITE_DIM = 16;

var SP_NODE = [0, 0];
var SP_CROSS = [1, 0];
var SP_BOX_FREE = [1, 0];
var SP_BOX_TAKEN = [2, 0];
var SP_PLAYER_IDLE = [8, 1];
var SP_TABLET = [3, 0];
var SP_ICON_HIDE = [4, 0];
var SP_ICON_HIDE_ATTACK = [5, 0];

var SP_PLAYER = [0, 1];
var SP_AI_RED = [0, 2];

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

function spriteAddText(x, y, size, text) {
	var aStart = 'a'.charCodeAt(0);
	var qStart = 'q'.charCodeAt(0);

	for (var i=0; i<text.length; i++) {
		var code = text.charCodeAt(i);

		var id = code - aStart;
		if (id >= 0 && id < 16) {
			spriteAdd(x, y, size, [id, 14]);
		}

		var id = code - qStart;
		if (id >= 0 && id < 16) {
			spriteAdd(x, y, size, [id, 15]);
		}

		x += size;
	}
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

function spriteFrame(base, walker) {
	var x = base[0] + walker.animationBase + walker.animation;
	return [ x, base[1] ];
}

