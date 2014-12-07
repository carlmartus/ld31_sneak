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
var WE_PIPE = 2;

var WE_TEXT = [
	'no weapon',
	'knife',
	'pipe'];

function avatarInit(start) {
	avatarWalker = new NodeWalker(nodePlayerStart, 35);
	avatarLastWalkerState = -1;
	avatarWeapon = WE_PIPE;
}

function avatarFrame(ft) {
	if (avatarQueueMouse) {
		avatarMouse();
	}

	avatarWalker.frame(ft);
	if (avatarLastWalkerState != avatarWalker.state) {
		avatarLastWalkerState = avatarWalker.state;
		avatarUpdateState();
	}

	if (!avatarWalker.hidden) {
		if (avatarAction) {
			spriteAdd(avatarActionX, avatarActionY, 32, SP_TABLET);
			spriteAdd(avatarActionX, avatarActionY, 32,
					avatarActionSprite);

			switch (avatarAction) {
				case ACTION_HIDE_ATTACK :
					break;

				default :
				case ACTION_TELEPORT :
					spriteAdd(avatarWalker.x, avatarWalker.y,
							32, SP_PLAYER_SNEAK);
					break;

				case ACTION_PICK_KNIFE :
					spriteAdd(avatarWalker.x, avatarWalker.y,
							32, SP_PLAYER_IDLE);
					break;
			}
		} else {
			if (avatarState == AV_WALKING) {
				spriteAdd(avatarWalker.x, avatarWalker.y,
						32, spriteFrame(SP_PLAYER, avatarWalker));
			} else if (avatarState == AV_WAITING) {
				spriteAdd(avatarWalker.x, avatarWalker.y,
						32, SP_PLAYER_IDLE);
			}
		}
	}

	spriteAddText(12, 500, 16, WE_TEXT[avatarWeapon]);
}

function avatarSetMouse(x, y) {
	avatarQueueMouse = [ x, y ];
	avatarMouse();
}

function avatarUnSetMouse() {
	avatarQueueMouse = null;
}

function avatarMouse() {
	if (avatarState == AV_WAITING) {
		var x = avatarQueueMouse[0];
		var y = avatarQueueMouse[1];
		avatarQueueMouse = null;

		if (avatarAction != ACTION_NONE && avatarOnAction(x, y)) {

			switch (avatarAction) {
				case ACTION_PICK_KNIFE :
					avatarWeapon = WE_KNIFE;
					break;

				case ACTION_HIDE_ATTACK :
					var target = avatarWalker.from.rebase;
					var suc = aiAttack(target.x, target.y, avatarWeapon);
					if (avatarWalker.last == null) return;
					avatarWalker.goAction(avatarAction, suc);
					break;

				default :
					avatarWalker.goAction(avatarAction);
			}
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

		case ACTION_TELEPORT :
			avatarActionSprite = SP_ICON_TELEPORT;
			break;

		case ACTION_PICK_KNIFE :
			avatarActionSprite = SP_ICON_KNIFE;
			break;
	}
}

function avatarUpdateState() {
	switch (avatarWalker.state) {
		case NW_IDLE :
			avatarWalker.from.occupied = true;
			avatarState = AV_WAITING;
			avatarNodeAt = avatarWalker.from;
			avatarNodeTravelA = avatarNodeTravelB = null;

			if (avatarQueueMouse != null) {
				avatarMouse();
			}
			avatarUpdateActions(avatarWalker.from.action);
			break;

		case NW_WALKING :
			avatarWalker.from.occupied = false;
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

