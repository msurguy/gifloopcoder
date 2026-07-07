function onGLC(glc) {
    glc.loop();
    var list = glc.renderList,
        width = glc.w,
        height = glc.h;

    var emojis = ["😀", "😎", "🤩", "🥳", "🤖"],
        spacing = width / (emojis.length + 1);

    for (var i = 0; i < emojis.length; i++) {
        list.addText({
            x: spacing * (i + 1),
            y: [height / 2 + 20, height / 2 - 40],
            text: emojis[i],
            fontSize: [30, 54],
            phase: i / emojis.length
        });
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
