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

