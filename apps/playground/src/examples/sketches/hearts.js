function onGLC(glc) {
    glc.loop();
    var list = glc.renderList,
        width = glc.w,
        height = glc.h;

    function randomPink() {
        var red = (Math.floor(Math.random() * 56) + 200).toString(16),
            greenBlue = (Math.floor(Math.random() * 56) + 130).toString(16);
        return "#" + red + greenBlue + greenBlue;
    }


    for(var x = 0; x <= width; x += 40) {
        list.addHeart({
            x: x,
            w: Math.random() * 50 + 20,
            h: Math.random() * 50 + 20,
            y: [height / 2 + 50, height / 2 - 50],
            fillStyle: randomPink(),
            phase: x / width
        })
    }

}

// ─ Settings & effects: managed by the panels ─
// (edits below are overwritten by the panels)
function onGLCPanel(glc) {
  glc.size(400, 400);
  glc.setFPS(30);
  glc.setDuration(2);
  glc.setMode("bounce");
  glc.setEasing(true);
  glc.setMaxColors(256);
}
// ─ end managed block ─
