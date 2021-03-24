// global variable dictionary - also include computed values that
// may be used elsewhere
var s = {
    "front": {
        "springrate": 0,
        "motionratio": 0,
        "dimension": {
            "trackwidth": 0,
            "struttopdistance": 0,
            "strutlength": 0,
            "lcadistance": 0,
            "lcalength": 0,
            "lcaheight": 0,
            "bjheight": 0,
        },
        "weight": {
            "leftcorner": 0,
            "rightcorner": 0,
            "unsprung": 0,
        },
        "swaybar": {
            "barlength": 0,
            "diameter": 0,
            "perpendicular": 0,
            "armlength": 0,
            "motionratio": 0,
        },
        "computed": {
            "strut_x": 0,
            "strut_vertical": 0,
            "lca_angle": 0,
            "strut_angle": 0,
            "instant_center": [0, 0],
            "roll_center": 0,
            "spring_wr": 0,
            "bar_springrate": 0,
            "natural_freq": 0,
            "roll_stiffness": 0,
        }
    },
    "rear": {
        "springrate": 0,
        "motionratio": 0,
        "dimension": {
            "trackwidth": 0,
            "struttopdistance": 0,
            "strutlength": 0,
            "lcadistance": 0,
            "lcalength": 0,
            "lcaheight": 0,
            "bjheight": 0,
        },
        "weight": {
            "leftcorner": 0,
            "rightcorner": 0,
            "unsprung": 0,
        },
        "swaybar": {
            "barlength": 0,
            "diameter": 0,
            "perpendicular": 0,
            "armlength": 0,
            "motionratio": 0,
        },
        "computed": {
            "strut_x": 0,
            "strut_vertical": 0,
            "lca_angle": 0,
            "strut_angle": 0,
            "instant_center": [0, 0],
            "roll_center": 0,
            "spring_wr": 0,
            "bar_springrate": 0,
            "natural_freq": 0,
            "roll_stiffness": 0,
        }
    },
    "cgheight": 0,
    "computed": {
        "weight": {
            "total": 0,
            "frdist": "0/0",
            "lrdist": "0/0"
        }
    }
};

// constants (to be turned into editable values later)
//tirewidth = 9.65; // 245-tires
tirewidth = 8.85; // 225-tires
tirediameter = 25.5;
axleoffset = 5;

function get(elem) {
    return parseFloat($(elem).val());
}

function set(elem, value) {
    $(elem).val(value);
}

function trunc(elem, value) {
    set(elem, value.toFixed(3));
}

function prefill_fields() {
    // fill fields out from stored data.
    set("#fronttrackwidth", s.front.dimension.trackwidth);
    set("#frontstrutspacing", s.front.dimension.struttopdistance);
    set("#frontlcaspacing", s.front.dimension.lcadistance);
    set("#frontstrutlength", s.front.dimension.strutlength);
    set("#frontlcalength", s.front.dimension.lcalength);
    set("#frontballjointheight", s.front.dimension.bjheight);
    set("#frontlcaheight", s.front.dimension.lcaheight);

    set("#reartrackwidth", s.rear.dimension.trackwidth);
    set("#rearstrutspacing", s.rear.dimension.struttopdistance);
    set("#rearlcaspacing", s.rear.dimension.lcadistance);
    set("#rearstrutlength", s.rear.dimension.strutlength);
    set("#rearlcalength", s.rear.dimension.lcalength);
    set("#rearballjointheight", s.rear.dimension.bjheight);
    set("#rearlcaheight", s.rear.dimension.lcaheight);

    set("#cgheight", s.cgheight);

    set("#flweight", s.front.weight.leftcorner);
    set("#frweight", s.front.weight.rightcorner);
    set("#frontunsprung", s.front.weight.unsprung);
    set("#rlweight", s.rear.weight.leftcorner);
    set("#rrweight", s.rear.weight.rightcorner);
    set("#rearunsprung", s.rear.weight.unsprung);

    set("#frontspringrate", s.front.springrate);
    set("#frontspringmr", s.front.motionratio);
    set("#rearspringrate", s.rear.springrate);
    set("#rearspringmr", s.rear.motionratio);

    set("#frontbarlength", s.front.swaybar.barlength);
    set("#frontbardiameter", s.front.swaybar.diameter);
    set("#frontbarperpendicular", s.front.swaybar.perpendicular);
    set("#frontbararmlength", s.front.swaybar.armlength);
    set("#frontbarmr", s.front.swaybar.motionratio);
    set("#rearbarlength", s.rear.swaybar.barlength);
    set("#rearbardiameter", s.rear.swaybar.diameter);
    set("#rearbarperpendicular", s.rear.swaybar.perpendicular);
    set("#rearbararmlength", s.rear.swaybar.armlength);
    set("#rearbarmr", s.rear.swaybar.motionratio);

    set("#frontrideheight", 0);
    set("#rearrideheight", 0);

    calculateall();
}

function exportvalues() {
    // package all suspension variables in a JSON file and export it
    // to save for later.

    // generate download link and click on it
    var element = document.createElement('a');
    // convert JSON object to text file
    element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(s)));
    element.setAttribute('download', 'suspension.json');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

function importvalues() {
    var element = document.createElement("input");
    element.setAttribute('type', 'file');
    document.body.appendChild(element);
    element.onchange = function(ev) {
        if(!ev.target.files.length) return false; // no files selected
        fileReader = new FileReader();
        fileReader.readAsText(ev.target.files[0]);
        fileReader.onload = function(e2) {
            // fileReader.read* is asynchronous
            s = JSON.parse(fileReader.result);
            prefill_fields();
        };
    };
    element.click(); // opening dialog
    document.body.removeChild(element);
    updateall();
    updatesuspension(true);
    return false; // avoid redirect
}

function getrollcenter() {
    // get values
    s.front.dimension.trackwidth = get("#fronttrackwidth");
    s.front.dimension.struttopdistance = get("#frontstrutspacing");
    s.front.dimension.lcadistance = get("#frontlcaspacing");
    s.front.dimension.strutlength = get("#frontstrutlength");
    s.front.dimension.lcalength = get("#frontlcalength");
    s.front.dimension.bjheight = get("#frontballjointheight");
    s.front.dimension.lcaheight = get("#frontlcaheight");

    s.rear.dimension.trackwidth = get("#reartrackwidth");
    s.rear.dimension.struttopdistance = get("#rearstrutspacing");
    s.rear.dimension.lcadistance = get("#rearlcaspacing");
    s.rear.dimension.strutlength = get("#rearstrutlength");
    s.rear.dimension.lcalength = get("#rearlcalength");
    s.rear.dimension.bjheight = get("#rearballjointheight");
    s.rear.dimension.lcaheight = get("#rearlcaheight");

    s.cgheight = get("#cgheight");

    // update strut length and lca height with ride height offset
    s.front.dimension.strutlength += get("#frontrideheight");
    s.rear.dimension.strutlength += get("#rearrideheight");
    s.front.dimension.lcaheight += get("#frontrideheight");
    s.rear.dimension.lcaheight += get("#rearrideheight");
}

function calculaterollcenter() {
    // run calculations
    s.front.computed.lca_angle = lcaangle(s.front.dimension.lcalength, s.front.dimension.bjheight, s.front.dimension.lcaheight);
    s.front.computed.strut_x = struthorizontaldist(s.front.dimension.struttopdistance, s.front.dimension.lcadistance);
    s.front.computed.strut_angle = strutangle(s.front.dimension.strutlength, s.front.computed.strut_x, s.front.dimension.lcalength, s.front.computed.lca_angle);
    s.front.computed.strut_vertical = strutverticaldist(s.front.computed.lca_angle, s.front.computed.strut_angle, s.front.dimension.strutlength, s.front.dimension.lcalength, s.front.computed.strut_x);
    s.front.computed.instant_center = instantcenter(s.front.computed.strut_angle, s.front.computed.lca_angle, s.front.dimension.struttopdistance, s.front.computed.strut_vertical, s.front.dimension.lcadistance, s.front.dimension.lcaheight);
    s.front.computed.roll_center = rollcenter(s.front.computed.instant_center[0], s.front.computed.instant_center[1], s.front.dimension.trackwidth);

    s.rear.computed.lca_angle = lcaangle(s.rear.dimension.lcalength, s.rear.dimension.bjheight, s.rear.dimension.lcaheight);
    s.rear.computed.strut_x = struthorizontaldist(s.rear.dimension.struttopdistance, s.rear.dimension.lcadistance);
    s.rear.computed.strut_angle = strutangle(s.rear.dimension.strutlength, s.rear.computed.strut_x, s.rear.dimension.lcalength, s.rear.computed.lca_angle);
    s.rear.computed.strut_vertical = strutverticaldist(s.rear.computed.lca_angle, s.rear.computed.strut_angle, s.rear.dimension.strutlength, s.rear.dimension.lcalength, s.rear.computed.strut_x);
    s.rear.computed.instant_center = instantcenter(s.rear.computed.strut_angle, s.rear.computed.lca_angle, s.rear.dimension.struttopdistance, s.rear.computed.strut_vertical, s.rear.dimension.lcadistance, s.rear.dimension.lcaheight);
    s.rear.computed.roll_center = rollcenter(s.rear.computed.instant_center[0], s.rear.computed.instant_center[1], s.rear.dimension.trackwidth);
}

function updaterollcenter() {
    getrollcenter();
    calculaterollcenter();
    trunc("#frontrollcenter", s.front.computed.roll_center);
    trunc("#rearrollcenter", s.rear.computed.roll_center);
    updatesuspension();
}

function getweights() {
    // get values
    s.front.weight.leftcorner = get("#flweight");
    s.front.weight.rightcorner = get("#frweight");
    s.front.weight.unsprung = get("#frontunsprung");
    s.rear.weight.leftcorner = get("#rlweight");
    s.rear.weight.rightcorner = get("#rrweight");
    s.rear.weight.unsprung = get("#rearunsprung");
}

function calculateweights() {
    // run calculations
    s.computed.weight.total = s.front.weight.leftcorner + s.front.weight.rightcorner + s.rear.weight.leftcorner + s.rear.weight.rightcorner;
    s.computed.weight.frdist = weightdistribution(s.front.weight.leftcorner + s.front.weight.rightcorner, s.rear.weight.leftcorner + s.rear.weight.rightcorner).join("/");
    s.computed.weight.lrdist = weightdistribution(s.front.weight.leftcorner + s.rear.weight.leftcorner, s.front.weight.rightcorner + s.rear.weight.rightcorner).join("/");
}

function updateweights() {
    getweights();
    calculateweights();

    $("#frweightdist").val(s.computed.weight.frdist);
    $("#lrweightdist").val(s.computed.weight.lrdist);
    $("#totalweight").val(s.computed.weight.total);
}

function getwheelrates() {
    // get values
    s.front.springrate = get("#frontspringrate");
    s.front.motionratio = get("#frontspringmr");
    s.rear.springrate = get("#rearspringrate");
    s.rear.motionratio = get("#rearspringmr");

    s.front.swaybar.barlength = get("#frontbarlength");
    s.front.swaybar.diameter = get("#frontbardiameter");
    s.front.swaybar.perpendicular = get("#frontbarperpendicular");
    s.front.swaybar.armlength = get("#frontbararmlength");
    s.front.swaybar.motionratio = get("#frontbarmr");
    s.rear.swaybar.barlength = get("#rearbarlength");
    s.rear.swaybar.diameter = get("#rearbardiameter");
    s.rear.swaybar.perpendicular = get("#rearbarperpendicular");
    s.rear.swaybar.armlength = get("#rearbararmlength");
    s.rear.swaybar.motionratio = get("#rearbarmr");
}

function calculatewheelrates() {
    // run calculations
    s.front.computed.spring_wr = wheelrate(s.front.springrate, s.front.motionratio);
    s.front.computed.bar_springrate = barrate(s.front.swaybar.perpendicular, s.front.swaybar.barlength, s.front.swaybar.armlength, s.front.swaybar.diameter);
    s.front.computed.natural_freq = naturalfrequency(s.front.computed.spring_wr, (s.front.weight.leftcorner + s.front.weight.rightcorner - s.front.weight.unsprung) / 2);

    s.rear.computed.spring_wr = wheelrate(s.rear.springrate, s.rear.motionratio);
    s.rear.computed.bar_springrate = barrate(s.rear.swaybar.perpendicular, s.rear.swaybar.barlength, s.rear.swaybar.armlength, s.rear.swaybar.diameter);
    s.rear.computed.natural_freq = naturalfrequency(s.rear.computed.spring_wr, (s.rear.weight.leftcorner + s.rear.weight.rightcorner - s.rear.weight.unsprung) / 2);
}

function updatewheelrates() {
    getweights();
    getwheelrates();
    calculateweights();
    calculatewheelrates();

    trunc("#frontbarspringrate", s.front.computed.bar_springrate);
    trunc("#rearbarspringrate", s.rear.computed.bar_springrate);
    trunc("#frontwheelrate", s.front.computed.spring_wr);
    trunc("#rearwheelrate", s.rear.computed.spring_wr);
    trunc("#frontfrequency", s.front.computed.natural_freq);
    trunc("#rearfrequency", s.rear.computed.natural_freq);
}

function calculaterollstiffness() {
    bar_wr = wheelrate(s.front.computed.bar_springrate, s.front.swaybar.motionratio);
    bar_stiff = rollstiffness(bar_wr, s.front.dimension.trackwidth);
    s.front.computed.roll_stiffness = rollstiffness(s.front.computed.spring_wr, s.front.dimension.trackwidth) + bar_stiff;
    bar_wr = wheelrate(s.rear.computed.bar_springrate, s.rear.swaybar.motionratio);
    bar_stiff = rollstiffness(bar_wr, s.rear.dimension.trackwidth);
    s.rear.computed.roll_stiffness = rollstiffness(s.rear.computed.spring_wr, s.rear.dimension.trackwidth) + bar_stiff;
}

function updaterollstiffness() {
    getrollcenter(); // for trackwidth
    getwheelrates();
    calculaterollstiffness();

    trunc("#frontrollstiffness", s.front.computed.roll_stiffness);
    trunc("#rearrollstiffness", s.rear.computed.roll_stiffness);
    $("#rollstiffnessdistribution").val(weightdistribution(s.front.computed.roll_stiffness, s.rear.computed.roll_stiffness).join('/'));
}

function calculateall() {
    calculaterollcenter();
    calculateweights();
    calculatewheelrates();
    calculaterollstiffness();
}

function updatecornering() {
    g = $("input[type=radio][name=scenario]:checked").val();
    console.log('test ' + g);
}

function updateall() {
    updaterollcenter();
    updateweights();
    updatewheelrates();
    updaterollstiffness();
}

function updatesuspension(calculate=true) {
    if(calculate) calculateall();
    if(!isNaN(s.front.dimension.trackwidth) && s.front.dimension.trackwidth != 0) {
        setscale(s.front.dimension.trackwidth);
        draw_suspension(s, end=$("input[type=radio][name=simend]:checked").val());
    }
}

$(document).ready(function() {
    // set up auto-updates
    $.each($("#dimensions").find("input"), function(idx, obj) {
        $(obj).on("change", updaterollcenter);
    });
    $.each($("#weights").find("input"), function(idx, obj) {
        $(obj).on("change", updatewheelrates);
    });
    $.each($("#springs").find("input"), function(idx, obj) {
        $(obj).on("change", updatewheelrates);
    });
    $.each($("#bars").find("input"), function(idx, obj) {
        $(obj).on("change", updatewheelrates);
    });

    // clear outputs
    $("input[readonly]").val("");

    // initial input reads and calculations
    updateall();

    // set up simulation
    updatesuspension();

    // set up auto-updates for suspension sim
    $("input[type=radio][name=scenario]").on("change", updatesuspension);
    $("input[type=radio][name=simend]").on("change", updatesuspension);
});

function recalculate() {
    updateall();
    updatesuspension(true);
}