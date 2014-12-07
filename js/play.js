function playFrame(ft) {
	playStep(ft);
	playRender();
}

function playStep(ft) {
	bgStep(ft);
	avatarFrame(ft);
	aiFrame(ft);
}

function playRender() {
	bgRenderPre();
	aiRender();
	nodeRender();
	avatarRender();
	bgRenderPost();
}

