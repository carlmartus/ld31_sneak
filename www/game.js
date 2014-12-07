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

var avatarWalker;
var avatarLastWalkerState;
var avatarState;
var avatarQueueMouse;
var avatarActionX;
var avatarActionY;
var avatarActionSprite;
var avatarAction;

var avatarNodeAt;
var avatarNodeTravelA;
var avatarNodeTravelB;

var avatarWeapon;

var AV_WAITING = 1;
var AV_WALKING = 2;

var WE_NONE = 0;
var WE_KNIFE = 1;
var WE_PIPE = 2;
var WE_MINE = 3;

var WE_TEXT = [
	'no weapon',
	'knife',
	'pipe',
	'land mine'];

function avatarInit(start) {
	avatarWalker = new NodeWalker(nodePlayerStart, 35);
	avatarLastWalkerState = -1;
	avatarWeapon = WE_NONE;
}

function avatarFrame(ft) {
	if (avatarQueueMouse) {
		avatarMouse();
	}

	avatarWalker.frame(ft);
	if (avatarLastWalkerState != avatarWalker.state) {
		avatarLastWalkerState = avatarWalker.state;
		avatarUpdateState();
	}
}

function avatarRender() {
	if (!avatarWalker.hidden) {
		if (avatarAction) {
			spriteAdd(avatarActionX, avatarActionY, 32, SP_TABLET);
			spriteAdd(avatarActionX, avatarActionY, 32,
					avatarActionSprite);

			switch (avatarAction) {
				case ACTION_HIDE_ATTACK :
					break;

				default :
				case ACTION_TELEPORT :
					spriteAdd(avatarWalker.x, avatarWalker.y,
							32, SP_PLAYER_SNEAK);
					break;

				case ACTION_PICK_KNIFE :
				case ACTION_PICK_PIPE :
				case ACTION_PICK_MINE :
				case ACTION_PUT_MINE :
					spriteAdd(avatarWalker.x, avatarWalker.y,
							32, SP_PLAYER_IDLE);
					break;
			}
		} else {
			if (avatarState == AV_WALKING) {
				spriteAdd(avatarWalker.x, avatarWalker.y,
						32, spriteFrame(SP_PLAYER, avatarWalker));
			} else if (avatarState == AV_WAITING) {
				spriteAdd(avatarWalker.x, avatarWalker.y,
						32, SP_PLAYER_IDLE);
			}
		}
	}

	spriteAddText(12, 12, 16, WE_TEXT[avatarWeapon]);
}

function avatarSetMouse(x, y) {
	avatarQueueMouse = [ x, y ];
	avatarMouse();
}

function avatarUnSetMouse() {
	avatarQueueMouse = null;
}

function avatarMouse() {
	if (avatarState == AV_WAITING) {
		var x = avatarQueueMouse[0];
		var y = avatarQueueMouse[1];
		avatarQueueMouse = null;

		if (avatarAction != ACTION_NONE && avatarOnAction(x, y)) {

			switch (avatarAction) {
				case ACTION_PICK_KNIFE :
					avatarWeapon = WE_KNIFE;
					break;

				case ACTION_PICK_PIPE :
					avatarWeapon = WE_PIPE;
					break;

				case ACTION_PICK_MINE :
					avatarWeapon = WE_MINE;
					break;

				case ACTION_PUT_MINE :
					avatarWeapon = WE_NONE;
					avatarWalker.from.mined = true;
					break;

				case ACTION_HIDE_ATTACK :
					var target = avatarWalker.from.rebase;
					var suc = aiAttack(target.x, target.y, avatarWeapon);
					if (avatarWalker.last == null) return;
					avatarWalker.goAction(avatarAction, suc);
					break;

				default :
					avatarWalker.goAction(avatarAction);
			}
		} else {
			avatarDirMove(x, y);
		}
	}
}

function avatarUpdateActions(action) {
	avatarAction = action;
	avatarActionX = avatarWalker.x;
	avatarActionY = avatarWalker.y + 40;

	switch (action) {
		case ACTION_HIDE :
			avatarActionSprite = SP_ICON_HIDE;
			break;

		case ACTION_HIDE_ATTACK :
			avatarActionSprite = SP_ICON_HIDE_ATTACK;
			break;

		case ACTION_TELEPORT :
			avatarActionSprite = SP_ICON_TELEPORT;
			break;

		case ACTION_PICK_KNIFE :
			avatarActionSprite = SP_ICON_KNIFE;
			break;

		case ACTION_PICK_MINE :
		case ACTION_PUT_MINE :
			avatarActionSprite = SP_ICON_MINE;
			break;

		case ACTION_PICK_PIPE :
			avatarActionSprite = SP_ICON_PIPE;
			break;
	}
}

function avatarUpdateState() {
	switch (avatarWalker.state) {
		case NW_IDLE :
			avatarWalker.from.occupied = true;
			avatarState = AV_WAITING;
			avatarNodeAt = avatarWalker.from;
			avatarNodeTravelA = avatarNodeTravelB = null;

			if (avatarQueueMouse != null) {
				avatarMouse();
			}

			var action = avatarWalker.from.action;

			if (action == 0 && avatarWeapon == WE_MINE) {
				action = ACTION_PUT_MINE;
			}
			avatarUpdateActions(action);
			break;

		case NW_WALKING :
			avatarWalker.from.occupied = false;
			avatarState = AV_WALKING;
			avatarNodeAt = null;
			avatarNodeTravelA = avatarWalker.from;
			avatarNodeTravelB = avatarWalker.dest;
			avatarUpdateActions(0);
			break;
	}
}

function avatarDirMove(x, y) {
	var dx = avatarWalker.x - x;
	var dy = avatarWalker.y - y;

	var abx = Math.abs(dx);
	var aby = Math.abs(dy);

	if (abx < 16 && aby < 16) return;

	if (abx >= aby) {
		if (dx > 0) {
			avatarWalker.goEast();
		} else {
			avatarWalker.goWest();
		}
	} else {
		if (dy > 0) {
			avatarWalker.goNorth();
		} else {
			avatarWalker.goSouth();
		}
	}
}

function avatarOnAction(x, y) {
	var abx = Math.abs(x - avatarActionX);
	var aby = Math.abs(y - avatarActionY);

	return abx < 16 && aby < 16;
}

var aiList;
var aiWave = 0;

var AI_WAVES = 3;

var AI_RAND = 16;
var CAUGHT_RAD = 16;

var AIMSG_RED_WIN;
var AIMSG_RED_FAIL;
var AIMSG_RED_LOSE;
var AIMSG_MUD_WIN;
var AIMSG_MUD_FAIL;
var AIMSG_MUD_LOSE;

function aiInit() {
	AIMSG_RED_WIN = [texCsRedWin, 'you got caught', sndLaugh];
	AIMSG_RED_FAIL = [texCsRedFail, 'he he he', sndWhat];
	AIMSG_RED_LOSE = [texCsRedKill, 'take that', sndPou];

	AIMSG_MUD_WIN = [texCsMudWin, 'mud got you', sndLaugh];
	AIMSG_MUD_FAIL = [texCsMudFail, 'ha ha ha', sndWhat];
	AIMSG_MUD_LOSE = [texCsMudKill, 'splat', sndPou];

	aiWave = 2;
	aiRespawnWave();
}

function aiFrame(ft) {
	for (var i=0; i<aiList.length; i++) {
		if (aiList[i].frame(ft)) {
			spriteExplosion(
					aiList[i].walker.x,
					aiList[i].walker.y);
			aiList.splice(i, 1);
			aiCheckClear();
			return;
		}
	}
}

function aiRender() {
	for (var i=0; i<aiList.length; i++) {
		aiList[i].render();
	}
}

function aiRespawnWave() {
	aiList = [];

	switch (aiWave) {
		case 0 :
			spawnRed();
			spawnRed();
			break;

		case 1 :
			spawnMud();
			spawnMud();
			spawnMud();
			break;

		case 2 :
			spawnRed();
			spawnMud();
			spawnRed();
			break;
	}
}

function spawnRed() {
	aiList.push(
			new Ai(
				nodeAiStart0, SP_AI_RED,
				AIMSG_RED_WIN, AIMSG_RED_FAIL,
				AIMSG_RED_LOSE, WE_KNIFE));
}

function spawnMud() {
	aiList.push(
			new Ai(
				nodeAiStart0, SP_AI_MUD,
				AIMSG_MUD_WIN, AIMSG_MUD_FAIL,
				AIMSG_MUD_LOSE, WE_PIPE));
}

function aiAttack(x, y, weapon) {
	for (var i=0; i<aiList.length; i++) {

		if (aiList[i].caught(x, y)) {
			switch (weapon) {
				default :
				case WE_NONE :
					break;

				case WE_KNIFE :
					deathQueue(texCsKnife, 'thrust', 2, sndAttack0);
					break;

				case WE_PIPE :
					deathQueue(texCsPipe, 'swing', 2, sndAttack1);
					break;
			}

			if (aiList[i].voln == weapon) {
				deathQueue(
						aiList[i].killMsg[0],
						aiList[i].killMsg[1],
						1,
						aiList[i].killMsg[2]);
				aiList.splice(i, 1);

				aiCheckClear();
				modeDeath();
				return true;
			} else if (weapon != WE_NONE || weapon != WE_MINE) {
				deathQueue(
						aiList[i].failMsg[0],
						aiList[i].failMsg[1],
						2,
						aiList[i].failMsg[2]);
				modeDeath();
				aiList[i].killPlayer();
				return false;
			} else {
				aiList[i].killPlayer();
			}
		}
	}
	return false;
}

function aiCheckClear() {
	if (aiList.length > 0) return;

	aiWave += 1;
	deathReborn();

	if (aiWave >= AI_WAVES) {
		deathQueue(texCsCleared, 'game completed', 30, null);
	} else {
		deathQueue(texCsCleared, 'next level', 2, null);
	}
	modeDeath();
}

function Ai(startNode, spriteBase, winMsg, failMsg, killMsg, voln) {
	this.attack = false;
	this.voln = voln;
	this.orgSpeed = 20+Math.random()*15;
	this.walker = new NodeWalker(startNode, this.orgSpeed);
	this.offsetX = (Math.random() - 0.5)*AI_RAND;
	this.offsetY = (Math.random() - 0.5)*AI_RAND;
	this.walker.goRandom();
	this.spriteBase = spriteBase;
	this.winMsg = winMsg;
	this.failMsg = failMsg;
	this.killMsg = killMsg;
}

Ai.prototype.frame = function(ft) {
	if (this.walker.state == NW_IDLE) {
		if (this.walker.from.mined) {
			this.walker.from.mined = false;
			return true;
		}
		this.planTravel();
	}
	this.walker.frame(ft);

	if (this.attack && this.caughtPlayer()) {
		this.killPlayer();
	}
	return false;
}

Ai.prototype.render = function() {
	var aniSelect =
		this.walker.animation + this.walker.animationBase;
	var ani = [
		this.spriteBase[0] + aniSelect,
		this.spriteBase[1] ];

	var yOffset = this.walker.animation;
	spriteAdd(
			Math.floor(this.walker.x + this.offsetX),
			Math.floor(this.walker.y + this.offsetY) + yOffset,
			24.0, ani);
}

Ai.prototype.killPlayer = function() {
	deathQueue(this.winMsg[0], this.winMsg[1],
			3, this.winMsg[2]);
	modeDeath();
	deathReborn();
}

Ai.prototype.planTravel = function() {
	if (this.isSeePlayer()) {
		this.walker.speed = this.orgSpeed*1.4;
		this.attack = true;

		var playerDest = avatarNodeAt;
		if (playerDest == null) playerDest = avatarNodeTravelB;

		this.walker.travel(playerDest);
	} else {
		this.walker.speed = this.orgSpeed;
		this.attack = false;
		this.walker.goRandom();
	}

}

Ai.prototype.caught = function(x, y) {
	var abx = Math.abs(this.walker.x - x);
	var aby = Math.abs(this.walker.y - y);
	return abx < CAUGHT_RAD && aby < CAUGHT_RAD;
}

Ai.prototype.caughtPlayer = function() {
	if (avatarWalker.hidden) return false;
	return this.caught(avatarWalker.x, avatarWalker.y);
}

Ai.prototype.isSeePlayer = function() {
	if (this.walker.from.equals(avatarNodeAt)) return true;

	if (isAvatarTravel(this.walker.from, this.walker.from.west)) return true;
	if (isAvatarTravel(this.walker.from, this.walker.from.east)) return true;
	if (isAvatarTravel(this.walker.from, this.walker.from.north)) return true;
	if (isAvatarTravel(this.walker.from, this.walker.from.south)) return true;
	return false;
}

function isAvatarTravel(a, b) {
	if (b == null) return false;
	if (a.equals(avatarNodeTravelA) && b.equals(avatarNodeTravelB)) return true;
	if (a.equals(avatarNodeTravelB) && b.equals(avatarNodeTravelA)) return true;

	if (avatarNodeAt != null && avatarNodeAt.equals(b)) return true;
	return false;
}

var spriteList;
var spriteCount;
var spriteVbo;
var spriteProgram;
var spriteExplTime;
var spriteExplX;
var spriteExplY;

var SPRITE_MAX = 100;
var SPRITE_COMPS = 5;
var SPRITE_COMPS_SIZE = SPRITE_COMPS*4;

var SPRITE_DIM = 16;

var SP_NODE = [0, 0];
var SP_CROSS = [1, 0];
var SP_BOX_FREE = [1, 0];
var SP_BOX_TAKEN = [2, 0];
var SP_MINED = [12, 0];
var SP_EXPL = [13, 0];
var SP_PLAYER_IDLE = [8, 1];
var SP_PLAYER_SNEAK = [9, 1];
var SP_TABLET = [3, 0];
var SP_ICON_HIDE = [4, 0];
var SP_ICON_HIDE_ATTACK = [5, 0];
var SP_ICON_TELEPORT = [6, 0];
var SP_ICON_KNIFE = [7, 0];
var SP_ICON_PIPE = [8, 0];
var SP_ICON_MINE = [9, 0];

var SP_BRUSH0 = [0, 11];

var SP_PLAYER = [0, 1];
var SP_AI_RED = [0, 2];
var SP_AI_MUD = [0, 3];

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

function spriteExplosion(x, y) {
	spriteExplTime = 1.0;
	spriteExplX = x;
	spriteExplY = y;
	sndExpl.play();
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

	if (spriteExplTime > 0.0) {
		spriteExplTime -= 0.03;
		var size = (0.5 - Math.abs(spriteExplTime - 0.5))*80.0;
		spriteAdd(spriteExplX, spriteExplY, size, SP_EXPL);
	}

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

var nodeList;

var NW_IDLE = 0;
var NW_WALKING = 1;

var ACTION_NONE = 0;
var ACTION_HIDE = 1;
var ACTION_HIDE_ATTACK = 2;
var ACTION_TELEPORT = 3;
var ACTION_PICK_KNIFE = 4;
var ACTION_PICK_PIPE = 5;
var ACTION_PICK_MINE = 6;
var ACTION_PUT_MINE = 10;

var nodeAiStart0;
var nodePlayerStart;

function nodeInit() {
	nodeList = [];

	var nord0 = packNode(67, 49, ACTION_TELEPORT);
	var nord1 = packNode(215, 53);
	var nord2 = packNode(62, 161);
	var nord3 = packNode(218, 153);
	var nordBox0 = packNode(153, 48, ACTION_HIDE);
	var nordBox1 = packNode(153, 31, ACTION_HIDE_ATTACK);

	var alley0 = packNode(293, 148);
	var alley1 = packNode(346, 150, ACTION_PICK_KNIFE);
	var alley2 = packNode(293, 86, ACTION_TELEPORT);

	var skurk0 = packNode(350, 207);
	var skurk1 = packNode(465, 210);
	var skurk2 = packNode(347, 324);
	var skurkBox0 = packNode(408, 330, ACTION_HIDE);
	var skurkBox1 = packNode(404, 314, ACTION_HIDE_ATTACK);
	var skurk3 = packNode(462, 331);

	var junk0 = packNode(299, 325, ACTION_TELEPORT);
	var junk2 = packNode(299, 434);
	var junk3 = packNode(431, 432);
	var junkPipe = packNode(473, 433, ACTION_PICK_PIPE);

	var mine0 = packNode(221, 216, ACTION_TELEPORT);
	var mine1 = packNode(260, 218, ACTION_PICK_MINE);

	nord0.linkWest(nordBox0);
	nordBox0.linkWest(nord1);
	nordBox0.linkHide(nordBox1);
	nord0.linkSouth(nord2);
	nord2.linkWest(nord3);
	nord1.linkSouth(nord3);

	nord3.linkWest(alley0);

	alley2.linkSouth(alley0);
	alley0.linkWest(alley1);

	alley1.linkSouth(skurk0);

	skurk0.linkWest(skurk1);
	skurk0.linkSouth(skurk2);
	skurk2.linkWest(skurkBox0);
	skurkBox0.linkHide(skurkBox1);
	skurkBox0.linkWest(skurk3);
	skurk1.linkSouth(skurk3);

	alley2.linkTeleport(nord0);
	nord0.linkTeleport(alley2);

	junk0.linkWest(skurk2);
	junk0.linkSouth(junk2);
	junk2.linkWest(junk3);
	junk3.linkWest(junkPipe);
	skurk3.linkSouth(junk3);

	mine0.linkWest(mine1);
	junk0.linkTeleport(mine1);
	mine0.linkTeleport(nord1);

	nodeAiStart0 = nord1;
	nodePlayerStart = skurk1;
}

function nodeRender() {
	for (var i=0; i<nodeList.length; i++) {
		nodeList[i].render();
	}
}

function packNode(x, y, action) {
	var node = new Node(x, y, !action ? 0 : action);
	nodeList.push(node);
	return node;
}

function nodeUnOccupy() {
	for (var i=0; i<nodeList.length; i++) {
		nodeList[i].occupied = false;
		nodeList[i].mined = false;
	}
}

function NodeWalker(start, speed) {
	this.speed = speed;
	this.x = start.x;
	this.y = start.y;
	this.from = start;
	this.dest = null;
	this.last = null;
	this.state = NW_IDLE;
	this.travelDist = 0.0;
	this.travelDirX = 0.0;
	this.travelDirY = 0.0;
	this.travelSpeed = 0.0;
	this.hidden = false;
	this.animationBase = 0;
	this.animation = 0;
}

NodeWalker.prototype.frame = function(ft) {
	switch (this.state) {

		case NW_WALKING :
			this.travelDist -= ft*this.travelSpeed;
			this.x += this.travelDirX*ft*this.travelSpeed;
			this.y += this.travelDirY*ft*this.travelSpeed;
			this.animation = ((Math.floor(this.travelDist) >> 4) & 1);

			if (this.travelDist <= 0.0) {
				this.x = this.dest.x;
				this.y = this.dest.y;
				this.state = NW_IDLE;
				this.travelDist = 0.0;
				this.from = this.dest;
				this.dest = null;
				this.hidden = false;
			}
			break;
	}
}

NodeWalker.prototype.travel = function(target, optSpeed) {

	var dx = this.from.x - target.x;
	var dy = this.from.y - target.y;
	var abx = Math.abs(dx);
	var aby = Math.abs(dy);

	if (abx > aby) {
		if (dx > 0) {
			this.animationBase = 0;
		} else {
			this.animationBase = 2;
		}
	} else {
		if (dy > 0) {
			this.animationBase = 6;
		} else {
			this.animationBase = 4;
		}
	}

	this.dest = target;
	this.state = NW_WALKING;
	this.last = this.from;

	var dx = target.x - this.from.x;
	var dy = target.y - this.from.y;
	this.travelDist = Math.sqrt(dx*dx + dy*dy);
	this.travelDirX = dx / this.travelDist;
	this.travelDirY = dy / this.travelDist;
	this.travelSpeed = this.speed;

	if (optSpeed > 0) {
		this.travelSpeed *= optSpeed;
	}
}

function shouldGo(walker, dir, list) {
	if (dir != null && (walker.last == null || !dir.equals(walker.last))) {
		list.push(dir);
	}
}

Node.prototype.equals = function(other) {
	if (other == null || this == null) return false;
	return this.x == other.x && this.y == other.y;
}

NodeWalker.prototype.goRandom = function() {
	var poss = [];
	shouldGo(this, this.from.west, poss);
	shouldGo(this, this.from.east, poss);
	shouldGo(this, this.from.south, poss);
	shouldGo(this, this.from.north, poss);

	if (poss.length <= 0) {
		if (this.from.west != null)		poss.push(this.from.west);
		if (this.from.east != null)		poss.push(this.from.east);
		if (this.from.south != null)	poss.push(this.from.south);
		if (this.from.north != null)	poss.push(this.from.north);
	}

	this.travel(poss[Math.floor(Math.random()*poss.length)]);
}

function goConditional(walker, target) {
	if (target != null) {
		walker.travel(target);
	} else if (walker.from.rebase != null) {
		walker.travel(walker.from.rebase);
	}
}

NodeWalker.prototype.goWest		= function() { goConditional(this, this.from.west); }
NodeWalker.prototype.goEast		= function() { goConditional(this, this.from.east); }
NodeWalker.prototype.goSouth	= function() { goConditional(this, this.from.south); }
NodeWalker.prototype.goNorth	= function() { goConditional(this, this.from.north); }

NodeWalker.prototype.goAction = function(action, forceHidden) {
	switch (action) {
		case ACTION_HIDE :
			this.hidden = forceHidden == true;
			this.travel(this.from.hide,
					this.hidden ? 5:1);
			break;

		case ACTION_TELEPORT :
			this.hidden = true;
			this.travel(this.from.teleport, 5);
			break;

		default :
			this.hidden = false || forceHidden == true;
			this.travel(this.from.rebase);
			break;
	}
}

function Node(x, y, action) {
	this.x = x;
	this.y = y;
	this.action = action;
	this.occupied = false;
	this.mined = false;
	this.east = this.west = this.north = this.south = null;
	this.rebase = this.hide = this.teleport = null;
}

Node.prototype.renderSprite = function(id) {
	spriteAdd(this.x, this.y, 32, id);
}

Node.prototype.render = function() {
	switch (this.action) {
		case ACTION_HIDE_ATTACK :
			this.renderSprite(this.occupied ?
					SP_BOX_TAKEN : SP_BOX_FREE);
			break;

		default :
			if (this.mined) {
				this.renderSprite(SP_MINED);
			}
			//this.renderSprite(SP_NODE);
	}
}

Node.prototype.linkWest = function(target) {
	this.west = target;
	target.east = this;
}

Node.prototype.linkSouth = function(target) {
	this.south = target;
	target.north = this;
}

Node.prototype.linkHide = function(target) {
	this.hide = target;
	target.rebase = this;
}

Node.prototype.linkTeleport = function(target) {
	this.teleport = target;
}

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

function playFrame(ft) {
	playStep(ft);
	playRender();
}

function playStep(ft) {
	bgStep(ft);
	avatarFrame(ft);
	aiFrame(ft);
}

function playRender() {
	bgRenderPre();
	aiRender();
	nodeRender();
	avatarRender();
	bgRenderPost();
}

