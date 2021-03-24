function todegrees(rads) {
    return rads * 180 / Math.PI;
}

function torads(degrees) {
    return degrees * Math.PI / 180;
}

function lcaangle(lcalength, balljointheight, attachheight) {
    // Determine angle of the lower control arm. Positive values are when the
    // ball joint is lower than the chassis attachment.
    return todegrees(Math.asin((attachheight - balljointheight) / lcalength));
}

function struthorizontaldist(struttopdist, lcadist) {
    // Determine horizontal distance between the strut top and the lower
    // control arm chassis attachment.
    return (struttopdist - lcadist) / 2;
}

function strutangle(strutlength, struthorizontaldist, lcalength, lcaangle) {
    // Determine the angle of the strut from vertical. This requires lower control arm
    // information.

    // get horizontal distance between ball joint and strut
    balljoint_hz = (Math.cos(torads(lcaangle)) * lcalength) - struthorizontaldist;

    return 90 - todegrees(Math.acos(balljoint_hz / strutlength));
}

function strutverticaldist(lcaangle, strutangle, strutlength, lcalength, struthorizontaldist) {
    // Determine vertical distance between the strut top and the lower control
    // arm attachment.

    // first, determine the distance between control arm attachment and
    // top of strut via the Cosine rule
    cosangle = 90 - strutangle - lcaangle;
    strutchassis = (Math.pow(strutlength, 2) + Math.pow(lcalength, 2)
        - (2 * strutlength * lcalength * Math.cos(torads(cosangle))));
    strutchassis = Math.sqrt(strutchassis);

    // then get the vertical distance with strut-LCA horizontal and hypoteneuse
    return Math.sqrt(Math.pow(strutchassis, 2) - Math.pow(struthorizontaldist, 2));
}

function instantcenter(strutangle, lcaangle, struttopdist, strutverticaldist, lcadist, lcaheight) {
    // Determine the instant center x and y, relative to the centerline and
    // the ground.

    /*
      Strut equation: y = m(x-a) + b
        a: x offset (struttopdist/2)
        b: strut top height + LCA height
        m: -sin(strutangle)
        y = -sin(strutangle)*(x + (struttopdist / 2)) + strut top + LCA height

      LCA equation: y = m(x-a) + b
        a: x offset (lcadist/2)
        b: LCA height
        m: sin(lcaangle)
        y = sin(lcaangle)*(x + (lcadist / 2)) + LCA height

      instant center is where these equations intercept, so...
        x_intercept = -sin(strutangle)*(struttopdist / 2) - sin(lcaangle)*(lcadist / 2) + strut top height
                      ------------------------------------------------------------------------------------
                                                sin(lcaangle) + sin(strutangle)

        y intercept can be either of these equations with x_intercept inserted.
     */
    x_intercept = ((-(Math.sin(torads(strutangle)) * struttopdist / 2)
            - (Math.sin(torads(lcaangle)) * lcadist / 2) + strutverticaldist)
        / (Math.sin(torads(lcaangle)) + Math.sin(torads(strutangle))));

    y_intercept = Math.sin(torads(lcaangle)) * (x_intercept + (lcadist / 2)) + lcaheight;
    return [x_intercept, y_intercept];
}

function rollcenter(instantcenter_x, instantcenter_y, trackwidth) {
    // Determine roll center height from the instant center coordinates
    // (relative to centerline and the ground) and trackwidth.

    // first, get slope
    slope = instantcenter_y / (instantcenter_x + (trackwidth / 2));
    // then substitute all values for y = mx + b to determine b
    //      b = y - mx
    return instantcenter_y - (slope * instantcenter_x);
    // note: return the offset immediately because this is y=b when x=0
}

function weightdistribution(side1, side2) {
    total = side1 + side2;
    return [Math.round((side1 / total) * 100), Math.round((side2 / total) * 100)];
}

function wheelrate(springk, motionratio) {
    if(isNaN(springk)) return 0;
    return springk * Math.pow(motionratio, 2);
}

function barrate(perpendicular, barlength, armlength, diameter) {
    // Fred Puhn's formula
    return ((500000 * Math.pow(diameter, 4)) /
        ((0.4244 * Math.pow(perpendicular, 2) * barlength) +
        (0.2264 * Math.pow(armlength, 3))));
}

function naturalfrequency(wheelrate, weight) {
    /* Natural frequency equation:
        f = (1 / 2pi) * sqrt(K/M)
        converting K (spring rate in N/m) to lbs/in, and M (mass) to lbs equals
        f = (1 / 2pi) * sqrt(385 * wheelrate / weight)
     */
    return (0.5 / Math.PI) * Math.sqrt(385 * wheelrate / weight);
}

function lateralloadtransfer(g, cgheight, trackwidth) {
    return (g * cgheight) / trackwidth;
}

function rollstiffness(wheelrate, trackwidth) {
    /* Stiffness equation (metric):
        Kc = (trackwidth^2 * totalwheelrate) / (2 * (180/Pi))

        For english units, the radians conversion plus units equals 1375 for the constant
        Note that this returns stiffness in Lb-ft/degree, not Lb-in/degree!
     */
    return (Math.pow(trackwidth, 2) * wheelrate / 1375);
}
