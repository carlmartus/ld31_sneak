var avatarWalker;
var avatarLastWalkerState;
var avatarState;
var avatarQueueMouse;

var AV_WAITING = 1;
var AV_WALKING = 2;

function avatarInit(start) {
	avatarWalker = new NodeWalker(nodePlayerStart, 35);
	avatarLastWalkerState = -1;
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
}

function avatarMouse(x, y) {
	if (avatarState != AV_WAITING) {
		avatarQueueMouse = [ x, y ];
	} else {
		avatarDirMove(x, y);
	}
}

function avatarUpdateState() {
	switch (avatarWalker.state) {
		case NW_IDLE :
			avatarState = AV_WAITING;
			if (avatarQueueMouse != null) {
				var qx = avatarQueueMouse[0];
				var qy = avatarQueueMouse[1];
				avatarQueueMouse = null;
				avatarMouse(qx, qy);
			}
			break;

		case NW_WALKING :
			avatarState = AV_WALKING;
			break;
	}
}

function avatarDirMove(x, y) {
	var dx = avatarWalker.x - x;
	var dy = avatarWalker.y - y;

	var abx = Math.abs(dx);
	var aby = Math.abs(dy);

	if (abx < 32 && aby < 32) return;

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

