function playFrame(ft) {
	gl.clear(gl.COLOR_BUFFER_BIT);
	bgRender();

	for (var i=0; i<30; i++) {
		spriteAdd(i*30, 100.0 + i*30, 16.0, SP_NODE);
	}
}

