var _scale = 0;
var canvaswidth = 750;
var canvasheight = 400;
var xcenter = canvaswidth / 2;
var ycenter = 150; // move up a little bit to see below ground level

function getcontext() {
    // get the canvas context
    canvas = document.getElementById("simCanvas");
    if(canvas.getContext)
        return canvas.getContext('2d');
    else
        throw "missing context";
}

function setscale(tw) {
    // set the diagram scale based on track width
    _scale = 500 / tw;
}

function scale(num) {
    return num * _scale;
}

function csXL(num) {
    // scale & center an x-axis value to the left of center
    return xcenter - scale(num/2);
}

function csXR(num) {
    // scale & center an x-axis value to the right of center
    return xcenter + scale(num/2);
}

function csYA(num) {
    // scale & center a y-axis value above center
    return ycenter - scale(num/2);
}

function csYB(num) {
    // scale & center a y-axis value below center
    return ycenter + scale(num/2);
}

function clear() {
    context = getcontext();
    context.clearRect(0, 0, canvas.width, canvas.height);
}

function draw_line(x1, y1, x2, y2, color="#000", width=2) {
    console.log(x1 + ', ' + y1 + ' -> ' + x2 + ', ' + y2);
    context = getcontext();
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.strokeStyle = color;
    context.lineWidth = width;
    context.lineCap = 'round';
    context.stroke();
}

function draw_dimension(x1, y1, x2, y2) {
    draw_line(x1, y1, x2, y2, color="#888");
}

function draw_imaginary(x1, y1, x2, y2) {
    draw_line(x1, y1, x2, y2, color="#ddf");
}

function draw_strut(x1, y1, x2, y2) {
    draw_line(x1, y1, x2, y2, color="#6f6", width=4);
}

function draw_lca(x1, y1, x2, y2) {
    draw_line(x1, y1, x2, y2, color="#000", width=4);
}

function draw_point(x, y, color='#000') {
    context = getcontext();
    context.beginPath();
    context.arc(x, y, 8, 0, 2 * Math.PI, false);
    context.fillStyle = color;
    context.fill();
}

function draw_cg(y) {
    draw_point(xcenter, y, color='#ff0');
}

function draw_rc(y) {
    draw_point(xcenter, y, color='#0ff');
}

function draw_tire(x, ground, left=false) {
    context = getcontext();
    context.beginPath();
    /*if(left)
        x -= scale(tirewidth/2);
    else
        x += scale(tirewidth/2);
    */
    context.moveTo(x, ground);
    context.lineTo(x, ground - scale(tirediameter));
    context.lineWidth = scale(tirewidth); // 245mm = 9.65
    context.strokeStyle = 'rgba(44, 44, 44, 0.5)';
    context.lineCap = 'butt'
    context.stroke();
}

function draw_suspension(car, end='front') {
    // x=0: centerline, y=0: halfway between strut tops and LCA attachments
    clear(); // clear canvas

    // draw the suspension set up with accurate line lengths

    // draw imaginary lines
    ground_y = csYB(car[end].computed.strut_vertical) + scale(car[end].dimension.lcaheight);
    draw_imaginary(0, ground_y, canvaswidth, ground_y); // ground line
    draw_imaginary(csXL(car[end].dimension.trackwidth), ground_y + 4, csXR(car[end].dimension.trackwidth), ground_y + 4); // track width
    draw_imaginary(xcenter, 0, xcenter, 500); // vehicle centerline

    // draw body (strut and LCA attachment points)
    strut_top_y = csYA(car[end].computed.strut_vertical);
    lca_attach_y = csYB(car[end].computed.strut_vertical);
    left_strut_top_x = csXL(car[end].dimension.struttopdistance);
    right_strut_top_x = csXR(car[end].dimension.struttopdistance);
    left_lca_attach_x = csXL(car[end].dimension.lcadistance);
    right_lca_attach_x = csXR(car[end].dimension.lcadistance);
    draw_dimension(left_strut_top_x, strut_top_y, right_strut_top_x, strut_top_y); // strut top distance
    draw_dimension(left_lca_attach_x, lca_attach_y, right_lca_attach_x, lca_attach_y); // LCA attachment distance

    // draw struts
    full_strut_y = Math.sqrt(Math.pow(car[end].dimension.strutlength, 2) - Math.pow(car[end].computed.strut_x, 2));
    draw_strut(left_strut_top_x, strut_top_y, left_strut_top_x - scale(car[end].computed.strut_x), strut_top_y + scale(full_strut_y)); // left
    draw_strut(right_strut_top_x, strut_top_y, right_strut_top_x + scale(car[end].computed.strut_x), strut_top_y + scale(full_strut_y)); // right

    // draw LCAs
    lca_y = car[end].dimension.lcaheight - car[end].dimension.bjheight;
    lca_x = Math.sqrt(Math.pow(car[end].dimension.lcalength, 2) - Math.pow(lca_y, 2));
    draw_lca(left_lca_attach_x, lca_attach_y, left_lca_attach_x - scale(lca_x), lca_attach_y + scale(lca_y)); // left
    draw_lca(right_lca_attach_x, lca_attach_y, right_lca_attach_x + scale(lca_x), lca_attach_y + scale(lca_y)); // right

    // draw tires
    draw_tire(csXL(car[end].dimension.trackwidth), ground_y, left=true); // left
    draw_tire(csXR(car[end].dimension.trackwidth), ground_y); // right

    // draw points of interest
    draw_cg(ground_y - scale(car.cgheight)); // center of gravity
    draw_rc(ground_y - scale(car[end].computed.roll_center));
}
