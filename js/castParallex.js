function castParallax() {
    window.addEventListener("scroll", function () {
        var top = this.pageYOffset;
        var secondSection = document.querySelector("#about-soft-intro");
        var secondSectionTop = secondSection.offsetTop;

        // 當滾動到第二個 section 後，啟用視差
        if (top >= secondSectionTop) {
            var layers = document.getElementsByClassName("parallax");
            for (var i = 0; i < layers.length; i++) {
                var layer = layers[i];
                var speed = layer.getAttribute("data-speed");
                var yPos = -((top - secondSectionTop) * speed / 100);
                layer.style.transform = `translate3d(0px, ${yPos}px, 0px)`;
            }
        }
    });
}

document.body.onload = castParallax();
