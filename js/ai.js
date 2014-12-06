var aiList;
var aiWave = 0;

var AI_RAND = 32;
var CAUGHT_RAD = 10;

function aiInit() {
	aiNextWave();
}

function aiFrame(ft) {
	for (var i=0; i<aiList.length; i++) {
		aiList[i].frame(ft);
	}
}

function aiNextWave() {
	aiList = [];
	aiList.push(new Ai(nodeAiStart, SP_AI_RED));
	aiList.push(new Ai(nodeAiStart, SP_AI_RED));
	aiList.push(new Ai(nodeAiStart, SP_AI_RED));
	aiList.push(new Ai(nodeAiStart, SP_AI_RED));
	aiWave++;
}

function Ai(startNode, spriteBase) {
	this.attack = false;
	this.orgSpeed = 20+Math.random()*15;
	this.walker = new NodeWalker(startNode, this.orgSpeed);
	this.offsetX = (Math.random() - 0.5)*AI_RAND;
	this.offsetY = (Math.random() - 0.5)*AI_RAND;
	this.walker.goRandom();
	this.spriteBase = spriteBase;
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
		deathQueue(texCsKnife, 'knife attacku', 4, null);
		modeDeath();
		modeDeath();
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

