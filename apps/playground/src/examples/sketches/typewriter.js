function onGLC(glc) {
    glc.loop();
    glc.setDuration(3);
    glc.setMode("single");
    glc.setEasing(false);
    var list = glc.renderList,
        width = glc.w,
        height = glc.h;

    var message = "hello, gifloopcoder!";

    list.addText({
        x: 30,
        y: height / 2,
        textAlign: "left",
        fontSize: 28,
        fontFamily: "monospace",
        text: function(t) {
            // Reveal one more character as t goes from 0 to 1, holding the
            // full string briefly before the loop resets.
            var charCount = Math.min(message.length, Math.round(t * message.length * 1.2));
            return message.slice(0, charCount);
        }
    });

    list.addText({
        x: 30,
        y: height / 2 + 40,
        textAlign: "left",
        fontSize: 16,
        fillStyle: "#888",
        text: "single mode: type, hold, reset"
    });
}
