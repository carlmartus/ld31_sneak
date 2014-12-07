var nodeList;

var NW_IDLE = 0;
var NW_WALKING = 1;

var ACTION_NONE = 0;
var ACTION_HIDE = 1;
var ACTION_HIDE_ATTACK = 2;
var ACTION_TELEPORT = 3;
var ACTION_PICK_KNIFE = 4;

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
	var alley1 = packNode(346, 150, ACTION_PICK_KNIFE);
	var alley2 = packNode(293, 86, ACTION_TELEPORT);

	var skurk0 = packNode(350, 207);
	var skurk1 = packNode(465, 210);
	var skurk2 = packNode(347, 324);
	var skurkBox0 = packNode(408, 330, ACTION_HIDE);
	var skurkBox1 = packNode(404, 314, ACTION_HIDE_ATTACK);
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
	skurk2.linkWest(skurkBox0);
	skurkBox0.linkHide(skurkBox1);
	skurkBox0.linkWest(skurk3);
	skurk1.linkSouth(skurk3);

	alley2.linkTeleport(nord0);

	nodeAiStart0 = alley1;
	nodePlayerStart = nord1;
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

NodeWalker.prototype.goAction = function(action) {
	switch (action) {
		case ACTION_HIDE :
			this.travel(this.from.hide);
			break;

		case ACTION_TELEPORT :
			this.hidden = true;
			this.travel(this.from.teleport, 5);
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

