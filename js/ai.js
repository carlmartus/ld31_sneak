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

	aiWave = 0;
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

