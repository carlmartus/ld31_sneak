function playFrame(ft) {
	bgRenderPre();

	nodeRender();

	avatarFrame(ft);
	aiFrame(ft);

	bgRenderPost();
}

