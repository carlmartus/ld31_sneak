var nodeList;

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

