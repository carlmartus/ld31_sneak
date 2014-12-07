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
var WE_MINE = 3;

var WE_TEXT = [
	'no weapon',
	'knife',
	'pipe',
	'land mine'];

function avatarInit(start) {
	avatarWalker = new NodeWalker(nodePlayerStart, 35);
	avatarLastWalkerState = -1;
	avatarWeapon = WE_NONE;
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
}

function avatarRender() {
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
				case ACTION_PICK_PIPE :
				case ACTION_PICK_MINE :
				case ACTION_PUT_MINE :
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

	spriteAddText(12, 12, 16, WE_TEXT[avatarWeapon]);
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

				case ACTION_PICK_PIPE :
					avatarWeapon = WE_PIPE;
					break;

				case ACTION_PICK_MINE :
					avatarWeapon = WE_MINE;
					break;

				case ACTION_PUT_MINE :
					avatarWeapon = WE_NONE;
					avatarWalker.from.mined = true;
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

		case ACTION_PICK_MINE :
		case ACTION_PUT_MINE :
			avatarActionSprite = SP_ICON_MINE;
			break;

		case ACTION_PICK_PIPE :
			avatarActionSprite = SP_ICON_PIPE;
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

			var action = avatarWalker.from.action;

			if (action == 0 && avatarWeapon == WE_MINE) {
				action = ACTION_PUT_MINE;
			}
			avatarUpdateActions(action);
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

