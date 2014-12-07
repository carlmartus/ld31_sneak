function playFrame(ft) {
	bgRenderPre(ft);

	nodeRender();

	avatarFrame(ft);
	aiFrame(ft);

	bgRenderPost();
}

