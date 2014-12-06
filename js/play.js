function playFrame(ft) {
	gl.clear(gl.COLOR_BUFFER_BIT);
	bgRender();

	nodeRender();

	avatarFrame(ft);
	aiFrame(ft);
}

