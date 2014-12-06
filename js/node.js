var nodeList;

var NW_IDLE = 0;
var NW_WALKING = 1;

var nodeAiStart;

function nodeInit() {
	nodeList = [];

	var nord0 = packNode(67, 49);
	var nord1 = packNode(215, 53);
	var nord2 = packNode(62, 161);
	var nord3 = packNode(218, 153);

	var alley0 = packNode(293, 148);
	var alley1 = packNode(346, 150);
	var alley2 = packNode(293, 86);

	nord0.linkWest(nord0);
	nord0.linkSouth(nord2);
	nord2.linkWest(nord3);
	nord1.linkSouth(nord3);

	nord3.linkWest(alley0);

	alley2.linkSouth(alley0);
	alley0.linkWest(alley1);

	nodeAiStart = nord0;
}

function nodeRender() {
	for (var i=0; i<nodeList.length; i++) {
		nodeList[i].render();
	}
}

function packNode(x, y) {
	var node = new Node(x, y);
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
}

NodeWalker.prototype.travel = function(target) {
	if (target == this.from.west)	this.animationBase = 2;
	if (target == this.from.east)	this.animationBase = 0;
	if (target == this.from.south)	this.animationBase = 4;
	if (target == this.from.north)	this.animationBase = 6;

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

function Node(x, y) {
	this.x = x;
	this.y = y;
	this.east = this.west = this.north = this.south = null;
}

Node.prototype.render = function() {
	spriteAdd(this.x, this.y, 16.0, SP_NODE);
}

Node.prototype.linkWest = function(target) {
	this.west = target;
	target.east = this;
}

Node.prototype.linkSouth = function(target) {
	this.south = target;
	target.north = this;
}

