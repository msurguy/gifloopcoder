function onGLC(glc) {
    glc.loop();
    glc.styles.backgroundColor = "black";
    var list = glc.renderList,
        width = glc.w,
        height = glc.h;


    for(var i = 0; i < 100; i++) {
        list.addCircle({
            x: function(t) {
                return 200 + Math.sin(t * Math.PI * 2) * 50;
            },
            y: Math.random() * 400,
            radius: function(t) {
                return 3 + Math.sin(t * Math.PI * 2 + Math.PI / 2) * 2;
            },
            globalAlpha: function(t) {
                return 0.6 + Math.sin(t * Math.PI * 2 + Math.PI / 2) + 0.4;
            },
            phase: Math.random(),
            fillStyle: "red"
        })
    }
    for(var i = 0; i < 100; i++) {
        list.addCircle({
            x: function(t) {
                return 200 + Math.sin(t * Math.PI * 2) * 100;
            },
            y: Math.random() * 400,
            radius: function(t) {
                return 6 + Math.sin(t * Math.PI * 2 + Math.PI / 2) * 4;
            },
            globalAlpha: function(t) {
                return 0.6 + Math.sin(t * Math.PI * 2 + Math.PI / 2) + 0.4;
            },
            phase: Math.random(),
            fillStyle: "green"
        })
    }




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
