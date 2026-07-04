function onGLC(glc) {
    glc.loop();
    glc.setMode("single");
    glc.setEasing(false);
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
