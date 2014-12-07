var aiList;
var aiWave = 0;

var AI_RAND = 16;
var CAUGHT_RAD = 16;

var AIMSG_RED_WIN;
var AIMSG_RED_LOSE;

function aiInit() {
	AIMSG_RED_WIN = [texCsRedWin, 'you got caught', null];
	AIMSG_RED_LOSE = [texCsRedKill, 'take that', null];

	aiWave = 0;
	aiRespawnWave();
}

function aiFrame(ft) {
	for (var i=0; i<aiList.length; i++) {
		aiList[i].frame(ft);
	}
}

function aiAttack(x, y, weapon) {
	var killed = false;
	for (var i=0; i<aiList.length; i++) {

		if (aiList[i].caught(x, y)) {
			switch (weapon) {
				default :
				case WE_NONE :
					break;

				case WE_KNIFE :
					deathQueue(texCsKnife, 'thrust', 1, null);
					break;
			}

			if (aiList[i].voln == weapon) {
				deathQueue(
						aiList[i].killMsg[0],
						aiList[i].killMsg[1],
						1,
						aiList[i].killMsg[2]);
				aiList.splice(i, 1);
				killed = true;
			} else {
				aiList[i].attack = true;
				aiList[i].speed = aiList[i].orgSpeed*3;
			}

			modeDeath();

			return killed;
		}
	}
	return false;
}

function aiRespawnWave() {
	aiList = [];

	switch (aiWave) {
		case 0 :
			spawnRed();
			spawnRed();
			spawnRed();
			spawnRed();
			spawnRed();
			spawnRed();
			spawnRed();
			spawnRed();
			break;
	}
}

function spawnRed() {
	aiList.push(
			new Ai(
				nodeAiStart0, SP_AI_RED, AIMSG_RED_WIN,
				AIMSG_RED_LOSE, WE_KNIFE));
}

function Ai(startNode, spriteBase, winMsg, killMsg, voln) {
	this.attack = false;
	this.voln = voln;
	this.orgSpeed = 20+Math.random()*15;
	this.walker = new NodeWalker(startNode, this.orgSpeed);
	this.offsetX = (Math.random() - 0.5)*AI_RAND;
	this.offsetY = (Math.random() - 0.5)*AI_RAND;
	this.walker.goRandom();
	this.spriteBase = spriteBase;
	this.winMsg = winMsg;
	this.killMsg = killMsg;
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

	if (this.attack && this.caughtPlayer()) {
		deathQueue(this.winMsg[0], this.winMsg[1],
				3, this.winMsg[2]);
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

