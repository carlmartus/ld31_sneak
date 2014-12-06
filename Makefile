SRC=$(wildcard js/*.js)
OUT=www/game.min.js
MID=www/game.js
MINI=yui-compressor

all: $(OUT)

$(MID): $(SRC)
	cat $^ > $@

$(OUT): $(MID)
	$(MINI) $(MID) -o $@

clean:
	$(RM) $(OUT) $(MID)

