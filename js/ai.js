var aiList;
var aiWave = 0;

var AI_RAND = 20;

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
	aiWave++;
}

function Ai(startNode, spriteBase) {
	this.orgSpeed = 20+Math.random()*15;
	this.walker = new NodeWalker(startNode, this.orgSpeed);
	this.offsetX = (Math.random() - 0.5)*AI_RAND;
	this.offsetY = (Math.random() - 0.5)*AI_RAND;
	this.walker.goRandom();
	this.spriteBase = spriteBase;
}

Ai.prototype.frame = function(ft) {
	if (this.walker.state == NW_IDLE) {
		this.walker.goRandom();
		this.walker.speed = this.orgSpeed;
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
}

