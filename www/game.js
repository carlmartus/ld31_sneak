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
	bgProgram.bindAttribute(0, 'pos');
	bgProgram.link();
	bgProgram.use();

	var uniMvp = bgProgram.getUniform('mvp');
	var uniTex = bgProgram.getUniform('tex');

	bgMvp = esMat4_create();
	esMat4_ortho(bgMvp, 0.0, 512.0, 512.0, 0.0);
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
	bgInit();
	spriteInit();
	nodeInit();
	aiInit();
	avatarInit();
	deathInit();

	texBg = makeTexture(imgBg);
	texSprites = makeTexture(imgSprites);
	texCsKnife = makeTexture(imgCsKnife);
	texCsRedWin = makeTexture(imgCsRedWin);
	texCsRedKill = makeTexture(imgCsRedKill);

	var canvas = document.getElementById('can');
	canvas.addEventListener('mousedown', mouseEvent, false);

	esNextFrame(frameExec);

	/*
	deathQueue(texCsRedWin, 'sneak', 2, null);
	deathQueue(texCsKnife, 'and', 2, null);
	deathQueue(texCsRedKill, 'assasinate', 4, null);
	modeDeath();*/
	modePlay();
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

function avatarInit(start) {
	avatarWalker = new NodeWalker(nodePlayerStart, 35);
	avatarLastWalkerState = -1;
	avatarWeapon = WE_NONE;
}

function avatarFrame(ft) {
	avatarWalker.frame(ft);
	if (avatarLastWalkerState != avatarWalker.state) {
		avatarLastWalkerState = avatarWalker.state;
		avatarUpdateState();
	}

	if (avatarState == AV_WALKING) {
		spriteAdd(avatarWalker.x, avatarWalker.y,
				32, spriteFrame(SP_PLAYER, avatarWalker));
	} else if (avatarState == AV_WAITING) {
		spriteAdd(avatarWalker.x, avatarWalker.y,
				32, SP_PLAYER_IDLE);
	}

	if (avatarAction) {
		spriteAdd(avatarActionX, avatarActionY, 32, SP_TABLET);
		spriteAdd(avatarActionX, avatarActionY, 32,
				avatarActionSprite);
	}
}

function avatarMouse(x, y) {
	if (avatarState != AV_WAITING) {
		avatarQueueMouse = [ x, y ];
	} else {
		if (avatarAction != ACTION_NONE && avatarOnAction(x, y)) {
			avatarWalker.goAction(avatarAction);
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
	}
}

function avatarUpdateState() {
	switch (avatarWalker.state) {
		case NW_IDLE :
			avatarState = AV_WAITING;
			avatarNodeAt = avatarWalker.from;
			avatarNodeTravelA = avatarNodeTravelB = null;

			if (avatarQueueMouse != null) {
				var qx = avatarQueueMouse[0];
				var qy = avatarQueueMouse[1];
				avatarQueueMouse = null;
				avatarMouse(qx, qy);
			}
			avatarUpdateActions(avatarWalker.from.action);
			break;

		case NW_WALKING :
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

var AI_RAND = 32;
var CAUGHT_RAD = 10;

function aiInit() {
	aiWave = 0;
	aiRespawnWave();
}

function aiFrame(ft) {
	for (var i=0; i<aiList.length; i++) {
		aiList[i].frame(ft);
	}
}

function aiRespawnWave() {
	aiList = [];
	var deathMsg = [texCsKnife, 'you got caught'];

	switch (aiWave) {
		case 0 :
			aiList.push(new Ai(nodeAiStart0, SP_AI_RED, deathMsg));
			aiList.push(new Ai(nodeAiStart0, SP_AI_RED, deathMsg));
			aiList.push(new Ai(nodeAiStart0, SP_AI_RED, deathMsg));
			aiList.push(new Ai(nodeAiStart0, SP_AI_RED, deathMsg));
			break;
	}
}

function Ai(startNode, spriteBase, deathMsg) {
	this.attack = false;
	this.orgSpeed = 20+Math.random()*15;
	this.walker = new NodeWalker(startNode, this.orgSpeed);
	this.offsetX = (Math.random() - 0.5)*AI_RAND;
	this.offsetY = (Math.random() - 0.5)*AI_RAND;
	this.walker.goRandom();
	this.spriteBase = spriteBase;
	this.deathMsg = deathMsg;
}

Ai.prototype.frame = function(ft) {
	if (this.walker.state == NW_IDLE) {
		this.planTravel();
	}
	this.walker.frame(ft);

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

	if (this.caughtPlayer()) {
		deathQueue(this.deathMsg[0], this.deathMsg[1],
				3, this.deathMsg[2]);
		modeDeath();
		deathReborn();
	}
}

Ai.prototype.planTravel = function() {
	if (this.isSeePlayer()) {
		this.walker.speed = this.orgSpeed*2;
		this.attack = true;

		var playerDest = avatarNodeAt;
		if (playerDest == null) playerDest = avatarNodeTravelB;

		this.walker.travel(playerDest);
	} else {
		this.walker.speed = this.orgSpeed;
		this.walker.goRandom();
	}

}

Ai.prototype.caughtPlayer = function() {
	var abx = Math.abs(this.walker.x - avatarWalker.x);
	var aby = Math.abs(this.walker.y - avatarWalker.y);
	return abx < CAUGHT_RAD && aby < CAUGHT_RAD;
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

var nodeList;

var NW_IDLE = 0;
var NW_WALKING = 1;

var ACTION_NONE = 0;
var ACTION_HIDE = 1;
var ACTION_HIDE_ATTACK = 2;

var nodeAiStart0;
var nodePlayerStart;

function nodeInit() {
	nodeList = [];

	var nord0 = packNode(67, 49);
	var nord1 = packNode(215, 53);
	var nord2 = packNode(62, 161);
	var nord3 = packNode(218, 153);
	var nordBox0 = packNode(153, 48, ACTION_HIDE);
	var nordBox1 = packNode(153, 31, ACTION_HIDE_ATTACK);

	var alley0 = packNode(293, 148);
	var alley1 = packNode(346, 150);
	var alley2 = packNode(293, 86);

	var skurk0 = packNode(350, 207);
	var skurk1 = packNode(465, 210);
	var skurk2 = packNode(347, 324);
	var skurk3 = packNode(462, 331);

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
	skurk2.linkWest(skurk3);
	skurk1.linkSouth(skurk3);

	nodeAiStart0 = skurk0;
	nodePlayerStart = nord0;
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
	this.animationBase = 0;
	this.animation = 0;
}

NodeWalker.prototype.frame = function(ft) {
	switch (this.state) {

		case NW_WALKING :
			this.travelDist -= ft*this.speed;
			this.x += this.travelDirX*ft*this.speed;
			this.y += this.travelDirY*ft*this.speed;
			this.animation = ((Math.floor(this.travelDist) >> 4) & 1);

			if (this.travelDist <= 0.0) {
				this.x = this.dest.x;
				this.y = this.dest.y;
				this.state = NW_IDLE;
				this.travelDist = 0.0;
				this.from = this.dest;
				this.dest = null;
			}
			break;
	}
}

NodeWalker.prototype.travel = function(target) {

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

NodeWalker.prototype.goAction = function(action) {
	switch (action) {
		case ACTION_HIDE :
			this.travel(this.from.hide);
			break;

		default :
			this.travel(this.from.rebase);
			break;
	}
}

function Node(x, y, action) {
	this.x = x;
	this.y = y;
	this.action = action;
	this.occupied = false;
	this.east = this.west = this.north = this.south = null;
	this.rebase = this.hide = null;
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
			this.renderSprite(SP_NODE);
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

function playFrame(ft) {
	bgRender();

	nodeRender();

	avatarFrame(ft);
	aiFrame(ft);
}

