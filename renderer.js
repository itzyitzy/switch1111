const circle = document.getElementById("circle");

let current = 0;

circle.onclick = function () {

    current = current === 0 ? 1 : 0;

    window.electronAPI.switchPage(current);

};