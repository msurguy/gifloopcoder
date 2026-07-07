function onGLC(glc) {
    glc.loop();
    var list = glc.renderList,
        width = glc.w,
        height = glc.h,
        centerX = width / 2,
        centerY = height / 2,
        radius = 110;

    var emojis = ["⭐", "🌙", "🪐", "🔥"];

    for (var i = 0; i < emojis.length; i++) {
        list.addText({
            text: emojis[i],
            fontSize: 36,
            angleOffset: (i / emojis.length) * Math.PI * 2,
            x: function(t) {
                return centerX + Math.cos(t * Math.PI * 2 + this.angleOffset) * radius;
            },
            y: function(t) {
                return centerY + Math.sin(t * Math.PI * 2 + this.angleOffset) * radius;
            }
        });
    }

    list.addText({
        x: centerX,
        y: centerY,
        text: "🌍",
        fontSize: 44
    });
}

// ─ Settings & effects: managed by the panels ─
// (edits below are overwritten by the panels)
function onGLCPanel(glc) {
  glc.size(400, 400);
  glc.setFPS(30);
  glc.setDuration(2);
  glc.setMode("single");
  glc.setEasing(false);
  glc.setMaxColors(256);
}
// ─ end managed block ─
