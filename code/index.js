// UTILITY FUNCTIONS
const get_random_in_range = (min, max) => {
    /** Returns a random number between min and max */
    return Math.random() * (max - min) + min;
}

const sum = (num_list) => {
    /** Returns sum of give number list. */
    let sum = 0;
    num_list.forEach(n => sum+=n);
    return sum;
}

const get_encoding = ({type, attr, val}) => {
    /** Given a type (number/string), the name 
     *  of desired attribute (power/speed/balance) and
     *  an encoded value, the string/number (type)
     *  meaning of the encoded value is returned.
     */
    if (type == "number") {
        if (attr == "power") {
            if (val == "high") return 2;
            if (val == "medium") return 1;
            if (val == "low") return 0;
            return -1;
        } else if(attr == "speed") { 
            if (val == "fast") return 2;
            if (val == "medium") return 1;
            if (val == "slow") return 0;
            return -1;
        } else if(attr == "balance") {
            if (val == "head heavy") return 2;
            if (val == "balanced") return 1;
            if (val == "head light") return 0;
            return -1;
        }
    } else if (type=="string") {
        if (attr == "power") {
            if (val == 2) return "high";
            if (val == 1) return "medium";
            if (val == 0) return "low";
            return "";
        } else if (attr == "speed") { 
            if (val == 2) return "fast";
            if (val == 1) return "medium";
            if (val == 0) return "slow";
            return "";
        } else if (attr == "balance") {
            if (val == 2) return "head heavy";
            if (val == 1) return "balanced";
            if (val == 0) return "head light";
            return "";
        }
    }
}

const remove_listeners = (selector) => {
    /** Removes hover and click event listeners
     *  on the given selector. */
    d3.select("body")
        .selectAll(selector)
        .on("mouseover", null)
        .on("mouseout", null)
        .on("click", null)
}

// COLORS
const color_light_grey = "#a8a8a8";
const color_dark_grey = "#545454";
const color_white = "#ffffff";
const color_black = "#000000";
const color_blue = "#0000ff";
const color_red = "#ff0000";
const color_yellow = "#fcf003";
const color_orange = "#ffaa00";
const color_scale = d3.scaleOrdinal().domain([0,1,2])
    .range([color_light_grey, color_orange, color_red]);

// FLUID LAYOUT
// Layout Components
const container = d3.select("#container")
    .style("grid-template-columns", "100% 0%");
const main_panel = d3.select("#main_panel")
    .style("grid-template-columns", "70% 30%")
    .style("grid-template-rows", "0% 100%");
const side_panel = d3.select("#side_panel");

const store_header = d3.select("#store_header");
const store_empty_div = d3.select("#store_empty_div");
const store_svg = d3.select("#store_svg");
const store_side_panel = d3.select("#store_side_panel");

const pie_div = d3.select("#pie_div");
const word_cloud_div = d3.select("#word_cloud_div");

const pie_header = d3.select("#pie_header");
const pie_svg = d3.select("#pie_svg");

const word_cloud_header = d3.select("#word_cloud_header");
const word_cloud_svg = d3.select("#word_cloud_svg");

const scatter_div = d3.select("#scatter_div");
const scatter_header = d3.select("#scatter_header");
const scatter_svg = d3.select("#scatter_svg");

const bar_div = d3.select("#bar_div");
const bar_header = d3.select("#bar_header");
const bar_svg = d3.select("#bar_svg");

const power_filter = d3.select("#power_filter");
const speed_filter = d3.select("#speed_filter");

// Plot Components To Be Added
var layout = null;
var store = null;
var scatter = null;
var bar = null;
var pie = null;
var word_cloud = null;
var power_dropdown = null;
var speed_dropdown = null;

// Layout Set Up
var is_show_side_panel = false;
const set_layout = () => {
    /** Sets grid column dimensions and facilitates 
     *  fluid appearing and disappearing of side panel. 
     *  Also implements power/speed filtering using 
     *  dropdown menus. */

    let cur_power = -1; // selected power filter
    let cur_speed = -1; // selected speed filter
    
    let self = {}; // this object

    self.hide_side_panel = () => {
        /** Hides side panel from view. */
        container.transition().duration(100)
                 .style("grid-template-columns", "100% 0%");
        main_panel.transition().duration(100)
            .style("grid-template-columns", "70% 30%")
            .style("grid-template-rows", "0% 100%");

        // HIDE
        // side panel
        side_panel.classed("hide", true);
        side_panel.classed("show", false);

        // SHOW
        // store side panel with word cloud and
        // pie plot headers 
        store_side_panel.classed("show", true);
        store_side_panel.classed("hide", false);
        word_cloud_header.classed("show", true);
        word_cloud_header.classed("hide", false);
        pie_header.classed("hide", false);
        pie_header.classed("show", true);
        // speed and power filter dropdown menus
        power_dropdown.style("visibility", "visible");
        speed_dropdown.style("visibility", "visible");

        // side panel is now hidden
        is_show_side_panel = false;

        // Remove keydown listener
        d3.select("body").on("keydown", null);
    }

    self.show_side_panel = () => {
        /** Makes side panel visible on screen. */
        container.transition().duration(100)
            .style("grid-template-columns", "30% 70%");
        main_panel.transition().duration(100)
            .style("grid-template-columns", "100% 0%")
            .style("grid-template-rows", "40% 60%");

        // HIDE
        // store side panel with word cloud and
        // pie plot headers
        store_side_panel.classed("hide", true);
        store_side_panel.classed("show", false);
        word_cloud_header.classed("hide", true);
        word_cloud_header.classed("show", false);
        pie_header.classed("hide", true);
        pie_header.classed("show", false);
        // speed and power filter dropdown menus
        power_dropdown.style("visibility", "hidden");
        speed_dropdown.style("visibility", "hidden");

        // SHOW
        // side panel
        side_panel.classed("show", true);
        side_panel.classed("hide", false);

        // side panel is now visible
        is_show_side_panel = true;
    }

    self.color_racquets = ({
        filtered_data, head_color, handle_color
    }) => {
        /** Assigns given head_color and handle_color
         *  to provided racquets (filtered_data). */
        filtered_data.map(row => { // for every racquet given
            let rac = d3.select(`#${row.name}`);
            rac.select(".head") // apply given head color
                .transition().duration(1000)
                .attr("stroke", () => {
                    if (head_color == null)
                        return color_scale(row.speed);
                    else return head_color;
                });
            rac.select(".throat") // apply given handle color
                .transition().duration(1000)
                .attr("stroke", () => {
                    if (handle_color == null)
                        return color_scale(row.power);
                    else return handle_color;
                });
            rac.select(".handle")  // apply given handle color
                .transition().duration(1000)
                .attr("stroke", () => {
                    if (handle_color == null)
                        return color_scale(row.power);
                    else return handle_color;
                }).attr("fill", () => {
                    if (handle_color == null)
                        return color_scale(row.power);
                    else return handle_color;
                });
        });
    }

    self.dropdown_change = () => {
        /** This function is to be called every time
         *  a new option is selected from the power/speed
         *  dropdown menus. This function filters data 
         *  based on selected dropdown options 
         *  (also ensures that pie chart and word cloud
         *  gets updated as per filtered data) and 
         *  instigates color change of
         *  selected racquets accordingly. */

        // assign racquet colors based on 
        // specifications
        self.color_racquets({
            filtered_data: data,
            head_color: null,
            handle_color: null
        })

        // filter data as per selected options 
        if (cur_power > -1 && cur_speed > -1) {
            // if both filters applied, then
            // filtered data must meet both 
            // filter criteria
            let filtered_data = data.filter(
                row => row.power == cur_power
                    && row.speed == cur_speed 
            );
            // highlight filtered racquets as blue
            self.color_racquets({
                filtered_data: filtered_data,
                head_color: color_blue,
                handle_color: color_blue
            })
        } else if (cur_power > -1) {
            // if only power filter is applied, 
            // filtered data must meet only
            // selected power criteria 
            let filtered_data = data.filter(
                row => row.power == cur_power
            );
            // highlight filtered racquets as blue
            self.color_racquets({
                filtered_data: filtered_data,
                head_color: color_blue,
                handle_color: color_blue
            })
        } else if (cur_speed > -1) {
            // if only speed filter is applied, 
            // filtered data must meet only
            // selected speed criteria 
            let filtered_data = data.filter(
                row => row.speed == cur_speed
            );
            // highlight filtered racquets as blue
            self.color_racquets({
                filtered_data: filtered_data,
                head_color: color_blue,
                handle_color: color_blue
            })
        }

        // update pie chart and word cloud
        pie.update({power:cur_power, speed:cur_speed});
        word_cloud.update({power:cur_power, speed:cur_speed});
    }

    let add_filter_dropdowns = () => {
        /** Adds the drop down menus that allow
         * filtering racquets by power and speed. */

        // add power dropdown
        power_dropdown = power_filter.append("select")
                            .attr("id", "power_dropdown");
        power_dropdown.append("option")
                    .attr("name", "power_none")
                    .attr("value", "none")
                    .text("POWER");
        power_dropdown.append("option") 
                    .attr("name", "power_high")
                    .attr("value", "high")
                    .text("High");
        power_dropdown.append("option") 
                    .attr("name", "power_medium")
                    .attr("value", "medium")
                    .text("Medium");
        power_dropdown.append("option") 
                    .attr("name", "power_low")
                    .attr("value", "low")
                    .text("Low");
        
        power_dropdown.on("change", (e,d) => {
            let src_elem = d3.select(e.srcElement);
            let val = src_elem.property("value");

            // set cur_power value as per selected option
            cur_power = -1;
            if (val == "high") cur_power = 2;
            else if (val == "medium") cur_power = 1;
            else if (val == "low") cur_power = 0;
            
            // update layouts
            self.dropdown_change();
        })
        
        // add speed dropdown
        speed_dropdown = speed_filter.append("select")
                                .attr("id", "speed_dropdown");
        speed_dropdown.append("option")
                    .attr("name", "speed_none")
                    .attr("value", "none")
                    .text("SPEED");
        speed_dropdown.append("option") 
                    .attr("name", "speed_fast")
                    .attr("value", "fast")
                    .text("Fast");
        speed_dropdown.append("option") 
                    .attr("name", "speed_medium")
                    .attr("value", "medium")
                    .text("Medium");
        speed_dropdown.append("option") 
                    .attr("name", "speed_slow")
                    .attr("value", "slow")
                    .text("Slow");

        speed_dropdown.on("change", (e,d) => {
            let src_elem = d3.select(e.srcElement);
            let val = src_elem.property("value");

            // set cur_speed value as per selected option
            cur_speed = -1;
            if (val == "fast") cur_speed = 2;  
            else if (val == "medium") cur_speed = 1;
            else if (val == "slow") cur_speed = 0;
            
            // update layouts
            self.dropdown_change();
        })
    }
    add_filter_dropdowns();

    return self;
}

// Plot Focus Behavior
var focus_plot = "store"; 
const focus_on_hover = () => {
    /** Implements behavior which ensures 
     *  that the layout over which the cursor is, 
     *  is the layout of focus. */

    // if cursor is over the store header 
    // or the store svg, then the plot of
    // focus is "store"
    store_header.on("mouseover", () => {
        if (focus_plot != "store" && store != null) {
            focus_plot = "store";
        }
    });
    store_svg.on("mouseover", () => {
        if (focus_plot != "store" && store != null) {
            focus_plot = "store";
        }
    });

    // if cursor is over the bar plot header 
    // or the bar plot svg, then the plot of
    // focus is "bar"
    bar_header.on("mouseover", () => {
        if (bar != null) {
            focus_plot = "bar";
        }
    });
    bar_svg.on("mouseover", () => {
        if (focus_plot != "bar" && bar != null) {
            focus_plot = "bar";
            bar.listen(); // add bar plot event listers
        }
    });

    // if cursor is over the scatter plot header 
    // or the scatter plot svg, then the plot of
    // focus is "scatter"
    scatter_header.on("mouseover", () => {
        if (focus_plot != "scatter" && scatter != null) {
            focus_plot = "scatter";
            // remove keydown listener from body so
            // that any listeners set by other
            // plots are not activated when focussing
            // on this plot.
            d3.select("body").on("keydown", null);
        }
    });
    scatter_svg.on("mouseover", () => {
        if (focus_plot != "scatter" && scatter != null) {
            focus_plot = "scatter";
            // remove keydown listener from body so
            // that any listeners set by other
            // plots are not activated when focussing
            // on this plot.
            d3.select("body").on("keydown", null);
        }
    });
}
focus_on_hover();

// LOAD DATA & LAYOUTS
// Data Components
var data = null;
var sel_racquet = null;
var sel_data = null; 
var extents = {};

const get_extents = () => {
    /** Calculates extent/range of every attribute. */
    extents = {
        head_size: d3.extent(data.values(),d =>d.head_size),
        weight: d3.extent(data.values(),d=>d.weight),
        length: d3.extent(data.values(),d=>d.length),
        beam_width: d3.extent(data.values(),d=>d.beam_width),
        power: d3.extent(data.values(),d=>d.power),
        speed: d3.extent(data.values(),d=>d.speed),
        balance: d3.extent(data.values(),d=>d.balance),
        flex: d3.extent(data.values(),d=>d.flex),
        tension: d3.extent(data.values(),d=>d.tension),
        price: d3.extent(data.values(),d=>d.price),
        swing_weight: d3.extent(data.values(),d=>d.swing_weight)
    }
}

(async function load_data() {
    /** Loads data and creates layouts. */
    data = await d3.csv( // get data
        "../data/useful_data_tennis_racquets.csv", 
        d3.autoType
    );
    get_extents(); // calculate attribute extents
    layout = set_layout(); // set up general webpage layout
    store = set_up_store(); // set up store layout
    pie = add_pie_plot(); // set up pie layout
    word_cloud = add_word_cloud(); // set up word cloud layout
})();

// RACQUET STORE
const set_up_store = () => {
    /** Arranges all racquets in the store. */
    let plot_data = [...data]; // plot data = copy of data
    let self = {};

    // define scales
    let head_scale = d3.scaleLinear()
        .domain(extents.head_size).range([20,30]);
    let handle_scale = d3.scaleLinear()
        .domain(extents.length).range([10,22]);
    let beam_width_scale = d3.scaleLinear()
        .domain(extents.beam_width).range([0.5,4]);

    // get dimensions of store.
    let store_w = store_svg.style("width").replace("px", "");
    let store_h = store_svg.style("height").replace("px", "");
    let x_scale = d3.scaleLinear()
        .domain([0, plot_data.length-1]).range([70,store_w-50]);

    // add and remove text description of racquet
    let add_text_description = () => {
        /** Display basic information about 
         *  selected racquet like its name
         *  and the brand of its maker along 
         *  with its balance type. */
        store_header.html(
            `"${sel_data.name.replace("Racquet", "Racquet ")}" `
            + `by "${sel_data.brand}"<br/>`
            + `<font size=1em>Price = $ ${sel_data.price}<br/>`
            + `Balance = ${get_encoding({
                type: "string",
                attr: "balance",
                val: sel_data.balance
            })}<br/>`
            + `Length = ${sel_data.length} in<br/>`
            + `Weight = ${sel_data.weight} g<br/>`
            + `Head Size = ${sel_data.head_size} sq in<br/>`
            + `Beam Width = ${sel_data.beam_width} mm<br/>`
            + `Flex = ${sel_data.flex}<br/>`
            + `String Tension = ${sel_data.tension} lb<br/>`
            + `Swing Weight = ${sel_data.swing_weight} kg/sq cm</font>`
        );
    }
    let remove_text_description = () => {
        /** Removes any racquet description. */
        store_header.html("");
    }

    // add back to store
    let add_back_to_store_btn = () => {
        /** Adds the back to store button
         *  and returns this button. */

        // add a circle element that shall act
        // as the back to store button
        return store_svg.append("circle")
            .attr("id", "back_to_store_btn")
            // fill color = image pattern of back arrow icon
            .attr("fill", "url(#back_icon)") 
            .attr("opacity", 0) // initially not visible
            .on("mouseover", () => {
                // on mouse over, make it bigger
                let trans = back_to_store_btn.attr("transform");
                if (trans == null) trans = "";
                back_to_store_btn.attr("transform", 
                    `${trans} scale(1.2)`
                )
            }).on("mouseout", (e,d) => {
                // on mouse out make it back to normal size
                let trans = back_to_store_btn.attr("transform");
                back_to_store_btn.attr("transform", 
                    `${trans.replace("scale(1.2)", "scale(1)")}`
                )
            }).on("click", (e,d) => {
                // on click, go back to broad store view
                // and make this button invisible again
                self.broaden_focus();
                remove_text_description();
                back_to_store_btn.attr("opacity", 0);
            });
    }
    let back_to_store_btn = add_back_to_store_btn();

    // get data to use to draw racquets
    let get_racquet_draw_data = (d) => {
        /** Extracts racquet dimensions and colors
         *  for drawing on svg from data associated
         *  with each racquet. */
        let head_size = head_scale(d.head_size);
        let draw_dims = {
            head_w: head_size*(80/90),
            head_h: head_size*(90/80),
            beam_width: beam_width_scale(d.beam_width),
            speed_color: color_scale(d.speed),
            power_color: color_scale(d.power)
        }
        draw_dims.throat_s = draw_dims.head_w+20;
        draw_dims.handle_w = draw_dims.head_w/10;
        draw_dims.handle_h = handle_scale(d.length);
        return draw_dims;
    }  
    let draw_data = plot_data.map(d=>get_racquet_draw_data(d));  

    let add_display_racquet = () => {
        /** Adds an invisible group to the 
         *  center of the plot 
         *  with components of a racquet 
         *  (1 ellipse, 1 triangle, 1 rectangle)
         *  to be used to display selected
         *  racquet in the focused store view
         *  and returns this group element. The d3.js
         *  center force is used to align display  
         *  racquet to the center of the svg. */
        let self = {};

        // dummy single object list to be fed into
        // d3 force simulation as node data
        let nodes = [{}];

        // set up center force simluation
        let sim = d3.forceSimulation(nodes);

        // create 1 group object that moves to the
        // center of the plot as per d3 center force
        store_svg.selectAll("g.display_racquet")
            .data(nodes)
            .enter().append("g")
            .attr("class", "display_racquet")
            .call((g) => {
                // add an invisible group 
                // with components of a racquet 
                // (1 ellipse, 1 triangle, 1 rectangle)
                // to be used to display selected
                // racquet in the focused store view.
                g.attr("opacity", 0);
                g.append("ellipse").attr("class", "head");
                g.append("path").attr("class", "throat");
                g.append("rect").attr("class", "handle");
                self.racquet = g;
            });  

        self.show_display_racquet = () => {
            /** Displays currently selected racquet's 
             *  features using display_racquet. */
    
            // get latest store dimensions
            let w = store_svg.style("width").replace("px", "");
            let h = store_svg.style("height").replace("px", "");

            // update center of center force
            // and restart force simulation
            sim.force('center',
                d3.forceCenter(w/2,h/2).strength(1)
            ).alpha(0.8).restart();
    
            // get racquet dimensions to draw on svg
            let draw_data = get_racquet_draw_data(sel_data);
    
            // update head of display racquet
            // to match that of selected racquet
            self.racquet.select(".head")
                .attr("fill", "url(#strings_img)")
                .transition().duration(1000)
                .attr("rx", draw_data.head_w/2)
                .attr("ry", draw_data.head_h/2)
                .attr("cx", draw_data.head_w/2)
                .attr("cy", draw_data.head_h/2)
                .attr("stroke-width", draw_data.beam_width)
                .attr("stroke", draw_data.speed_color);
                
    
            // update throat of display racquet
            // to match that of selected racquet
            self.racquet.select(".throat")
                .lower()
                .transition().duration(1000)
                .attr("d", d3.symbol()
                    .type(d3.symbolTriangle)
                    .size(draw_data.throat_s)
                ).attr("transform", 
                   `translate(${
                       draw_data.head_w/2
                    },${draw_data.head_h+1.2})`
                   + `rotate(180)`
                ).attr("stroke-width", 2.5)
                .attr("stroke", draw_data.power_color)
                .attr("fill", "white");
    
            // update handle of display racquet
            // to match that of selected racquet
            self.racquet.select(".handle")
                .transition().duration(1000)
                .attr("width", draw_data.handle_w)
                .attr("height", draw_data.handle_h)
                .attr("transform", 
                   `translate(
                       ${draw_data.head_w/2-draw_data.handle_w/2},
                       ${draw_data.head_h+(draw_data.throat_s/6)}
                   )`
                ).attr("stroke", draw_data.power_color)
                .attr("fill", draw_data.power_color);
    
            // rotate the racquet as per its balance attribute
            // and adjust its position to account for rotation
            // after scaling it up for better visibility
            let head_s = head_scale(sel_data.head_size);
            let handle_s = handle_scale(sel_data.length);
            let rotate = 0;
            let trans = [0,0];
            if (sel_data.balance == 1) {
                rotate = 90;
                trans[0] = head_s+(rotate/2);
                trans[1] = -(head_s+handle_s);
            }
            else if (sel_data.balance == 0) {
                rotate = 40;
                trans[0] = head_s+(rotate/5);
                trans[1] = -(head_s+handle_s+10)*2;
            }
            else if (sel_data.balance == 2) {
                rotate = 140;
                trans[0] = head_s+(rotate/4);
                trans[1] = head_s;
            }
            
            sim.on('tick', () => {
                store_svg.selectAll("g.display_racquet")
                    .attr("transform", draw_data => 
                        `translate(${
                            draw_data.x+trans[0]
                        },${draw_data.y+trans[1]})`+
                        `rotate(${rotate})`+ 
                        `scale(${4})`
                    );
            });
    
            // make display_racquet visible
            self.racquet.transition().duration(1000)
                        .attr("opacity", 1);
    
            // show back button
            back_to_store_btn.transition().duration(1000)
                .attr("opacity", 1)
            back_to_store_btn.attr("transform", 
                `translate(${w-50},${h-50})`
            );
        }

        return self;
    }
    let display_racquet = add_display_racquet();

    // set up all racquets in the store
    let add_all_racquets = () => {
        // set up all racquets
        let nodes = [];
        for (let i = 0; i < plot_data.length; i++) {
            nodes.push({name: plot_data[i].name});
        }

        // set up simulation
        let sim = d3.forceSimulation(nodes) 
            // nodes attract each another
            .force('charge', d3.forceManyBody().strength(8)) 
            // nodes get arranged horizontally in the middle
            // of the screen
            .force('x', d3.forceX().x(d => x_scale(
                get_random_in_range(0, plot_data.length)
            ))).force('y', d3.forceY().y((store_h/2)-15))
            // prevent overlap of nodes
            .force('collision', d3.forceCollide().radius(15))
            // make simulation end quicker to avoid making user wait 
            // before he/she can start interacting with the racquets
            .alphaDecay(0.06) 
            .on('tick', () => {
                store_svg.selectAll("g.racquet")
                .attr("transform", d => `translate(${d.x},${d.y})`);
            });
        
        let set_scale = (elem, scale) => {
            /** Adds new scale transform to
             *  existing transform of given element. */
            let cur_transform = elem.attr("transform");
            if (cur_transform.includes("scale")) {
                new_transform = cur_transform.split("scale(");
                new_transform = new_transform[0];
                new_transform += ` scale(${scale},${scale})`;
            } else new_transform = cur_transform + 
                ` scale(${scale},${scale})`;
            elem.attr("transform", new_transform);
        }

        self.broaden_focus = () => {
            /** Broadens focus to all racquets
             *  in the broad store view. */
            layout.hide_side_panel();
            sim.alpha(0.01);
            sim.restart();
    
            // make display racquet invisible
            display_racquet.racquet.transition()
                .duration(100).attr("opacity", 0);
    
            // make all racquets visible
            d3.selectAll(".racquet")
              .transition().duration(100)
              .attr("opacity", 1)
              .attr("visibility", "visible");
    
            // wait for some time to allow the
            // layout to change before removing
            // data related to selected racquet
            // now that no racquet is selected
            setTimeout(() => { 
                sel_data = null; 
                sel_racquet = null;
            }, 200);      
        }
    
        self.focus_selected = ({
            racquet, scatter_update, bar_update
        }) => {
            /** Brings the selected racquet to focus. */
    
            // get data associated with selected racquet
            // by extracting the index of associated
            // data from the id of the racquet group
            sel_racquet = racquet;
            sel_data = data[Number(racquet.replace("Racquet",""))];
    
            // update layout to show side panel
            if (!is_show_side_panel) {
                layout.show_side_panel(); 
    
                // make all racquets invisible
                d3.selectAll(".racquet")
                .transition().duration(1000)
                .attr("opacity", 0)
                .attr("visibility", 'hidden');
            }
    
            // wait for little time to ensure
            // that the layout has been updated
            // before showing the display_racquet
            setTimeout(() => {
                display_racquet.show_display_racquet();
                // add layouts if not already present
                if (scatter == null) scatter = add_scatter_plot();
                if (bar == null) bar = add_bar_plot();
                // update layouts
                if (scatter_update == true) scatter.update();
                if (bar_update == true) bar.update();
            }, 300);
            
            add_text_description();
        }
        
        let add_racquet_groups = (g) => {
            /** Add elements of the racquet within given group tag. */
            // set id
            g.attr("id", (d, i) => d.name).attr("opacity", '1');
    
            // add head of racquet
            g.append("ellipse").attr("class", "head")
            .data(draw_data)
            .attr("rx", d => d.head_w/2)
            .attr("ry", d => d.head_h/2)
            .attr("cx", d => d.head_w/2)
            .attr("cy", d => d.head_h/2)
            .attr("stroke-width", d => d.beam_width)
            .attr("stroke", d => d.speed_color)
            .attr("fill", "url(#strings_img)");
    
            // add throat of racquet
            g.append("path").attr("class", "throat")
            .data(draw_data)
            .attr("d", d3.symbol()
                        .type(d3.symbolTriangle)
                        .size(d => d.throat_s)
            ).attr("transform", 
            d => `translate(${d.head_w/2},${d.head_h+1.2})`+
                    `rotate(180)`
            ).attr("stroke", d => d.power_color)
            .attr("stroke-width", 2.5)
            .attr("fill", "white")
            .lower();
    
            // add handle of racquet
            g.append("rect").attr("class", "handle")
            .data(draw_data)
            .attr("width", d => d.handle_w)
            .attr("height", d => d.handle_h)
            .attr("transform", d => `translate(`
                +`${d.head_w/2-d.handle_w/2},`
                +`${d.head_h+(d.throat_s/6)})`
            ).attr("stroke", d => d.power_color)
            .attr("fill", d => d.power_color);
    
            // bind events to racquet
            g.on("mouseover", (e,d) => {
                let sel_g = d3.select(`#${e.target.parentElement.id}`);
                set_scale(sel_g, 2);
                sel_g.raise();
            }).on("mouseout", (e,d) => {
                let sel_g = d3.select(`#${e.target.parentElement.id}`);
                set_scale(sel_g, 1);
            }).on("click", (e,d) => {
                let sel_g = d3.select(`#${e.target.parentElement.id}`);
                self.focus_selected({
                    racquet:sel_g.attr("id"), 
                    scatter_update:true,
                    bar_update:true
                });
            })
        }
        
        // add all racquets to store
        store_svg.selectAll("g.racquet").data(nodes)
            .enter().append("g").attr("class", "racquet")
            .call(add_racquet_groups);   
    }
    add_all_racquets();  

    return self;
}

// SCATTER PLOT
const add_scatter_plot = () => {
    /** Adds a scatter plot to screen. */
    let self = {};

    // add initially invisible tooltip display
    let tooltip = scatter_svg.append("g")
        .attr("class", "tooltip").attr("opacity", 0);
    tooltip.append("text")
        .attr("transform", "translate(50,20)");

    // default selected attribute for
    // x axis, y axis and dot color
    let x_attr = ["Weight", "weight"];  // [name, value]
    let y_attr = ["Length", "length"];  // [name, value]
    let hue_attr = ["Power", "power"];  // [name, value]

    // set the dimensions and margins of the graph
    let margin = {top: 50, right: 30, bottom: 80, left: 60};
    let width = Number(scatter_svg.style("width").replace("px",""));
    let height = Number(scatter_svg.style("height").replace("px",""));

    // add axes
    let x_scale = d3.scaleLinear();
    let x_axis = scatter_svg.append("g").attr("class", "x_axis");
    x_axis.append("text").attr("fill", "black").text(x_attr[0]);
    let y_scale = d3.scaleLinear();
    let y_axis = scatter_svg.append("g").attr("class", "y_axis");
    y_axis.append("text").attr("fill", "black").text(y_attr[0]);

    let update_axes = () => {
        /** Updates scale of x and y axes as per latest data
         *  and redraws them. */

        // get latest width and height of svg
        width = Number(
            scatter_svg.style("width").replace("px","")
        );
        height = Number(
            scatter_svg.style("height").replace("px","")
        );
        
        // update x axis
        x_scale.domain(extents[x_attr[1]]) // update scale
            .range([margin.left,width-margin.right]);
        x_axis.transition().duration(1000) // move axis to right position
            .attr("transform", `translate(${0},${
                height-margin.bottom
            })`)
            .call(d3.axisBottom(x_scale).ticks(5));
        x_axis.select("text") // add axis label at right position
            .attr("transform", `translate(${width/2},${40})`)
            .text(x_attr[0]);

        // update y axis
        y_scale.domain(extents[y_attr[1]]) // update scale
            .range([height-margin.bottom, margin.top]);
        y_axis.transition().duration(1000) // move axis to right position
            .attr("transform", `translate(${margin.left}, ${0})`)
            .call(d3.axisLeft(y_scale).ticks(10));
        y_axis.select("text") // add axis label at right position
            .attr("transform", `rotate(-90) translate(${
                -height/2
            },${-40})`)
            .text(y_attr[0]);
    }

    let add_hover_listener = () => {
        /** Adds hover behavior to each dot on the 
         *  scatter plot. */
        scatter_svg.selectAll(".dot").on("mouseover", (e,d) => {
            let sel_dot = d3.select(`#${e.target.id}`); //current dot
            let sel_dot_data = data[Number( // data of current dot
                sel_dot.attr("id").replace("dot", "")
            )];

            // bring all dots with same fill color
            // as the selected one to the front and
            // make them opaque while making all other
            // dots almost fully transparent
            for(let i = 0; i < data.length; i++) {
                let dot = scatter_svg.select(`#dot${i}`);
                if (dot.attr("fill") == sel_dot.attr("fill")) {
                    dot.transition().duration(100)
                        .attr("opacity", 1);
                    dot.raise();
                } else {
                    dot.transition().duration(100)
                        .attr("opacity", 0.05);
                }
            }

            // display selected dot's power/speed
            // on the tooltip display and move
            // tooltip display to right above the
            // selected dot before making it visible
            tooltip.select("text")
                .text(sel_dot_data.name.replace("Racquet", "R"));
            tooltip.attr("transform", `translate(${
                sel_dot.attr("cx")-margin.left
            },${sel_dot.attr("cy")-30})`);
            tooltip.attr("opacity", 1);

            // bring selected dot to the front
            // of all dots and the tooltip
            // display to the front of selected 
            // dot as well
            sel_dot.raise();
            tooltip.raise();

        }).on("mouseout", () => {
            // make all dots semi transparent 
            // and the tooltip display
            // invisible again
            scatter_svg.selectAll(`.dot`)
                .transition().duration(100)
                .attr("opacity", 0.5);
            tooltip.attr("opacity", 0);

            // bring selected dot to the front
            // of all dots and the tooltip
            // display to the front of selected 
            // dot as well
            scatter_svg.select(`#dot${
                sel_racquet.replace("Racquet","")
            }`).raise();
            tooltip.raise();
        });
    }

    let add_click_listener = () => {
        /** Filters data across all layouts 
         *  on click of dot. */
        scatter_svg.selectAll(".dot")
            .on('click', (e) => {

                // make tooltip disappear and
                // remove event listeners
                // to prevent interference of
                // update action due to events
                // like hover
                tooltip.attr("opacity", 0);
                remove_listeners(".dot");

                // make all dots semitransparent
                // again after click since
                // the mouseout listener cannot
                // do this now since its removed.
                scatter_svg.selectAll(`.dot`)
                    .transition().duration(500)
                    .attr("opacity", 0.5);

                // get selected dot
                let sel_dot = d3.select(`#${e.target.id}`);
                let sel_dot_data = data[Number(
                    sel_dot.attr("id").replace("dot", "")
                )];

                // set the radius and stroke-width
                // of previously selected dot to normal
                scatter_svg.select(`#dot${
                    sel_racquet.replace("Racquet", "")
                }`).transition().duration(500)
                .attr("r", 7).attr("stroke-width", 0);

                // highlight currently selected dot
                // by making its radius bigger and 
                // by giving it a thicker stroke
                sel_dot.transition().duration(500)
                .attr("r", 15).attr("stroke-width", 4);
                sel_dot.raise();
                
                // update selected data to point
                // to data associated with that 
                // of newly selected dot
                sel_racquet = sel_dot_data.name;
                sel_data = sel_dot_data;
                
                // update focused store plot
                // and bar plot
                store.focus_selected({
                    racquet:sel_racquet, 
                    // there is no need for the 
                    // focus_selected function to
                    // update the scatter plot since
                    // this is already 
                    // done in this function
                    scatter_update:false,
                    bar_update:true
                });

                // wait for little time for the
                // layout changes to take effect before
                // adding event listers again
                setTimeout(() => {
                    add_click_listener();
                    add_hover_listener();
                }, 500);
            })
    }

    let dots = null;
    let update_dots = () => {
        /** Updates dots on the scatter plot 
         *  according to latest data. */

        // remove listeners
        // so that actions like hover does
        // not disrupt update of dots
        remove_listeners(".dot");

        // Add dots
        dots = scatter_svg.selectAll(".dot").data(data);
        dots.join("circle")
            .attr("class", "dot")
            .attr("id", d => `dot${d.name.replace("Racquet","")}`)
            .merge(dots)
            .transition().duration(1000)
            .attr("cx", d => x_scale(d[x_attr[1]]))
            .attr("cy", d => y_scale(d[y_attr[1]]))
            .attr("r", (d, i) => {
                // all dots have radius 7 but
                // dot corresponding to selected
                // racquet shall have a higher radius
                // of 15 to emphasize it
                if (d.name == sel_racquet) return 15;
                else return 7;
            })
            .attr("stroke", color_yellow)
            .attr("stroke-width", (d, i) => {
                // only dot corresponding to 
                // selected racquet shall have a 
                // stroke width > 0
                if (d.name == sel_racquet) return 4;
                else return 0;
            })
            .attr("fill", d => color_scale(d[hue_attr[1]]))
            .attr("opacity", 0.5);
        dots.exit()
            .transition().duration(1000)
            .attr("opacity", 0).remove();

        // wait for some time for the updates to 
        // occur before adding the listeners
        setTimeout(() => {
            add_hover_listener();
            add_click_listener();
        }, 1000)
    }

    self.update = () => {
        /** Updates plot by instigating 
         *  axes and dots update. */
        update_axes();
        update_dots();
    }

    // drop downs used to set
    // x and y axes parameters
    // initialized to null
    let x_dropdown = null;
    let y_dropdown = null;
    let hue_dropdown = null;
    // define parameters to choose from
    let axes_options = [ 
        "weight", "length", 
        "head_size", "beam_width",
        "flex", "tension", "price",
        "swing_weight", "power",
        "speed", "balance"
    ];
    let hue_options = [
        "power","speed", "balance"
    ];

    let add_dropdown = () => {
        /** Adds a dropdown list containing
         *  attributes that can be picked for the
         *  x axis, y axis and color of dots. */

        // create drop downs
        x_dropdown = scatter_header.append("select")
                    .attr("name", "x_axis_attr");
        y_dropdown = scatter_header.append("select")
                    .attr("name", "y_axis_attr");
        hue_dropdown = scatter_header.append("select")
                    .attr("name", "hue_attr");
        
        // populate drop downs with options
        x_dropdown.selectAll("option")
            .data(axes_options)
            .join("option")
            .attr("value", d=>d)
            .text(d=>d);
        x_dropdown.append("option")
            .attr("disabled", true)
            .attr("value", "placeholder")
            .text("X Axis")
        y_dropdown.selectAll("option")
            .data(axes_options)
            .join("option")
            .attr("value", d=>d)
            .attr("selected", d => {
                if (d == "length") return true;
                else return null;
            })
            .text(d=>d);
        y_dropdown.append("option")
            .attr("disabled", true)
            .attr("value", "placeholder")
            .text("Y Axis");
        hue_dropdown.selectAll("option")
            .data(hue_options)
            .join("option")
            .attr("value", d=>d)
            .text(d=>d);
        hue_dropdown.append("option")
            .attr("disabled", true)
            .attr("value", "placeholder")
            .text("Hue");

        // filter data on scatter layout
        // accordingly every time a new
        // dropdown option is selected
        x_dropdown.on("change", (e, d) => {
            // get chosen option
            let src_elem = d3.select(e.srcElement);
            let val = src_elem.property("value");
            let name = val.split("_").map(n => 
                n.charAt(0).toUpperCase() + n.slice(1)
            ).join(" ");

            // set option as currently selected option
            x_attr = [name, val];

            // update data on scatter layout
            self.update();
        });

        y_dropdown.on("change", (e, d) => {
            // get chosen option
            let src_elem = d3.select(e.srcElement);
            let val = src_elem.property("value");
            let name = val.split("_").map(n => 
                n.charAt(0).toUpperCase() + n.slice(1)
            ).join(" ");

            // set option as currently selected option
            y_attr = [name, val];

            // update data on scatter layout
            self.update();
        });

        hue_dropdown.on("change", (e,d) => {
            // get chosen option
            let src_elem = d3.select(e.srcElement);
            let val = src_elem.property("value");
            let name = val.split("_").map(n => 
                n.charAt(0).toUpperCase() + n.slice(1)
            ).join(" ");

            // set option as currently selected option
            hue_attr = [name, val];

            // update data on scatter layout
            self.update();
        })
    }
    add_dropdown();

    return self;
}

// BAR PLOT
const add_bar_plot = () => {
    /** Adds a bar plot to the dashboard. */
    let self = {};

    // currently selected attribute (weight by default)
    let sel_attr = ["Weight", "weight"];  // [name, value]

    // set up color scale
    let color_scale = d3.scaleLinear().range([
        color_light_grey, color_blue
    ]);

    // set the dimensions and margins of the graph
    let margin = {top: 50, right: 30, bottom: 80, left: 60};
    let width = Number(bar_svg.style("width").replace("px",""));
    let height = Number(bar_svg.style("height").replace("px",""));

    // set up variable that store data
    let plot_data = [...data]; // copy of all data 
    let display_data = [...plot_data]; // data to display
    let n_bars = 9; // no. bars that will be displayed
    let display_range = [0, n_bars] // index of bars to display

    // define axes
    let x_scale = d3.scaleBand().padding(0.1);
    let x_axis = bar_svg.append("g").attr("class", "x_axis");
    x_axis.append("text").attr("fill", "black").text("Racquets");
    let y_scale = d3.scaleLinear();
    let y_axis = bar_svg.append("g").attr("class", "y_axis");
    y_axis.append("text").attr("fill", "black").text(sel_attr[0]);

    let update_data = (range) => {
        /** Updates the data to display by sorting it
         *  based on current selected attribute. 
         *  If a range of bars to choose is provided, then
         *  these bars are displayed. Else, range of n_bars
         *  no. of bars ensuring inclusion of selected 
         *  bar is calculated. */
        
        // sort data to be in decreasing order
        // of selected attribute's value
        plot_data.sort((a, b) => d3.descending(
            a[sel_attr[1]], b[sel_attr[1]]
        ));
        if (range == undefined) {
            // calculate range of indices of bars to 
            // display on the plot making sure that bar
            // corresponding to selected racquet is included
            let sel_index = plot_data.map(row => row.name)
                .indexOf(sel_racquet);
            let to_subtract = Math.floor(n_bars/2)
            display_range[0] = (sel_index - to_subtract);
            if (display_range[0] < 0) display_range[0] = 0;
            display_range[1] = display_range[0] + n_bars;
        }
        // filter out and store data to display 
        // based on calculated display range
        display_data = plot_data.slice(
            display_range[0], display_range[1]
        );

        // update svg width and height
        width = Number(bar_svg.style("width").replace("px",""));
        height = Number(bar_svg.style("height").replace("px",""));
    }

    let update_axes = () => {
        /** Updates the axes as per latest data. */
        
        // update x axis
        x_scale.domain(display_data.map(
            row => row.name.replace("Racquet", "")
        )).range([margin.left,width-margin.right]);
        x_axis.transition().duration(1000)
            .attr("transform", `translate(${0},${
                height-margin.bottom
            })`).call(d3.axisBottom(x_scale));
        x_axis.select("text")
            .attr("transform", `translate(${width/2},${40})`)
            .text("Racquets");

        // update y axis
        // extent = [min-1, max+1] to 
        // ensure that even smallest bars are visible.
        let cur_extent = extents[sel_attr[1]];
        y_scale.domain([cur_extent[0]-1,cur_extent[1]+1])
            .range([height-margin.bottom, margin.top]);
        y_axis.transition().duration(1000)
            .attr("transform", `translate(${
                margin.left
            }, ${0})`).call(d3.axisLeft(y_scale).ticks(10));
        y_axis.select("text")
            .attr("transform", `rotate(-90) translate(${
                -height/2
            },${-40})`) .text(sel_attr[0]);
    }
    
    let bars = null;
    let bar_labels = null;
    let update_bars = () => {
        /* Updates bars as per latest data. */

        // update color scale
        color_scale.domain(extents[sel_attr[1]]); 

        // add/update/remove bars 
        bars = bar_svg.selectAll(".bar").data(display_data);
        bars.enter()
            .append("rect")
            .attr("class", "bar")
            .attr("id", (d,i) => `bar${i}`)
            .merge(bars)
            .transition().duration(1000)
            .attr("x", d => x_scale(d.name.replace("Racquet","")))
            .attr("y", d => y_scale(d[sel_attr[1]]))
            .attr("width", x_scale.bandwidth())
            .attr("height", d => 
                height-margin.bottom-y_scale(d[sel_attr[1]])
            ).attr("opacity", 1)
            .attr("stroke", d => {
                // display only bar corresponding to
                // data of selected racquet in yellow
                if (d.name == sel_racquet) {
                    return color_yellow;
                } else {
                    return color_scale(d[sel_attr[1]]);
                }
            })
            .attr("fill", d => {
                // display only bar corresponding to
                // data of selected racquet in yellow
                if (d.name == sel_racquet) {
                    return color_yellow;
                } else {
                    return color_scale(d[sel_attr[1]]);
                }
            });
        bars.exit()
            .transition().duration(1000)
            .attr("height", 0).attr("width", 0)
            .attr("x", 0).attr("y", 0)
            .attr("opacity", 0).remove();

        // if more than 11 bars are displayed on
        // the plot, make the tick labels
        // invisible to avoid clutter
        // else make tick text visible
        if (n_bars > 11) {
            x_axis.selectAll(".tick")
                .selectAll("text")
                .transition().duration(500)
                .attr("opacity", 0);
        } 
        else {
            x_axis.selectAll(".tick")
                .selectAll("text")
                .transition().duration(500)
                .attr("opacity", 1);
        }

        // add/update/remove labels displaying 
        // data of each bar above it.
        bar_labels = bar_svg.selectAll(".bar_label")
                        .data(display_data);
        bar_labels.enter()
            .append("text")
            .attr("class", "bar_label")
            .attr("id", (d,i) => `bar_label${i}`)
            .merge(bar_labels)
            .attr("x", (d,i) => x_scale(
                d.name.replace("Racquet","")
            )).attr("y", d => y_scale(d[sel_attr[1]])-5)
            .attr("fill", color_black)
            .style("font-size", "0.8em")
            .text(d => d[sel_attr[1]])
            .transition().duration(500)
            .attr("opacity", 0);
        bar_labels.exit().remove();

        // bind hover and click event listeners to bars.
        bar_svg.selectAll(".bar")
            .on("mouseover", e => {
                // get selected bar and its index
                let sel_bar = d3.select(`#${e.target.id}`);
                let sel_i = Number(
                    sel_bar.attr("id").replace("bar","")
                )
                // if the bar tick is not visible, 
                // make it visible
                if (n_bars > 11){ 
                    x_axis.select(`.tick:nth-child(${sel_i+3})`)
                        .select("text")
                        .transition().duration(500)
                        .attr("opacity", 1);
                }
                // make bar value label visible
                bar_svg.select(`#${ 
                    sel_bar.attr("id").replace("bar","bar_label")
                }`).transition().duration(500).attr("opacity", 1);
            
        }).on("mouseout", e => {
            // get selected bar and its index
            let sel_bar = d3.select(`#${e.target.id}`);
            let sel_i = Number(sel_bar.attr("id").replace("bar",""))
            // if there are more than 11 bars, 
            // make tick texts invisible
            if (n_bars > 11){ 
                x_axis.select(`.tick:nth-child(${sel_i+3})`)
                    .select("text")
                    .transition().duration(500)
                    .attr("opacity", 0);
            }
            // make bar value label invisible
            bar_svg.select(`#${ 
                sel_bar.attr("id").replace("bar","bar_label")
            }`).transition().duration(500).attr("opacity", 0);

        }).on("click", e => {
            // get selected bar and its index
            let sel_bar = d3.select(`#${e.target.id}`);
            let sel_i = Number(sel_bar.attr("id")
                        .replace("bar",""));
            // get bar that is corresponding to 
            // currently selected racquet if it is
            // currently displayed.
            let cur_bar_i = null;
            for(let i = 0; i < display_data.length; i++) {
                if (display_data[i].name == sel_data.name)
                cur_bar_i = i;
            }
            let cur_bar = bar_svg.select(`#bar${cur_bar_i}`)
            // if current selection is indeed displayed, 
            // change its color back to one which reflects
            // it value
            if (!cur_bar.empty()) {
                cur_bar.transition().duration(500)
                .attr("fill", color_scale(
                    display_data[cur_bar_i][sel_attr[1]]
                ))
                .attr("stroke", color_scale(
                    display_data[cur_bar_i][sel_attr[1]]
                ))
            }

            // set newly selected bar as selected bar
            // and highlight it in yellow
            sel_bar.transition().duration(500)
                .attr("fill", color_yellow)
                .attr("stroke", color_yellow)

            // update focused racquet store layout
            // and scatter layout to reflect this change.
            // the bar plot itself need not be updated 
            // using the focus_selected() function as
            // this function has already updated it
            store.focus_selected({
                racquet: display_data[sel_i].name,
                scatter_update: true,
                bar_update: false
            })
        })
    }

    // bar zoom/traverse
    let shift_bars_calc = (direction) => {
        /** Changes the display range to
         *  simulate lateral traversal through
         *  bars upon pressing left or right
         *  arrow keys. */
        // if the direction to shift display range
        // in is given as left, then -1 from
        // both min and max values of current 
        // display range if possible
        if (direction == "left") {
            if ((display_range[0] - 1) >= 0) {
                display_range[0] -= 1;
                display_range[1] -= 1;
            }
        // if the direction to shift display range
        // in is given as right, then +1 to
        // both min and max values of current 
        // display range if possible
        } else if (direction == "right") { 
            if ((display_range[1] + 1) <= plot_data.length) {
                display_range[0] += 1;
                display_range[1] += 1;
            }
        }
    }

    let zoom_bars_calc = (direction) => {
        /** Changes the display range to
         *  simulate zooming in/out into
         *  bars upon pressing up or down
         *  arrow keys. */
        // if the direction to shift display range
        // in is given as out, then -1 from
        // min value and +1 to max values of current 
        // display range if possible
        if (direction == "out") {
            if (n_bars < plot_data.length) {
                if (
                    ((display_range[0] - 1) >= 0)
                    && ((display_range[1] + 1) <= plot_data.length)
                ) {
                    display_range[0] -= 1;
                    display_range[1] += 1;
                    n_bars += 2;
                } else {
                    if ((display_range[0] - 1) >= 0) {
                        display_range[0] -= 1;
                        n_bars += 1;
                    } else {
                        // (display_data[1] + 1) <= plot_data.length
                        display_range[1] += 1;
                        n_bars += 1;
                    }
                }
            }
        // if the direction to shift display range
        // in is given as in, then +1 to
        // min value and -1 from max values of current 
        // display range if possible
        } else if (direction=="in") { 
            if ((n_bars > 1) && (
                (display_range[0] + 1)
                != (display_range[1] - 1)
            )) {
                display_range[0] += 1;
                display_range[1] -= 1;
                n_bars -= 2;
            }
        }
    }

    self.listen = () => {
        // add keypress listeners
        d3.select("body").on("keydown", (e,d) => {
            // if arrow keys were pressed, shift display
            // range accordingly 
            if (focus_plot == "bar") {
                if (e.key == "ArrowRight") shift_bars_calc('right');
                if (e.key == "ArrowLeft") shift_bars_calc('left');
                if (e.key == "ArrowUp") zoom_bars_calc('in');
                if (e.key == "ArrowDown") zoom_bars_calc('out');
            }
        });
    
        d3.select("body").on("keyup", (e,d) => {
            // once arrow key has been released,
            // update bars to reflect change of
            // display range calculated when the 
            // key was pressed
            // this allows for long press to result 
            // in bigger shift of display range
            if (focus_plot == "bar") {
                if (
                    (e.key == "ArrowRight")
                    || (e.key == "ArrowLeft")
                    || (e.key == "ArrowUp")
                    || (e.key == "ArrowDown")
                ) self.update(display_range);
            }
        })
    }

    self.update = (range) => {
        /** Updates the plot to display
         *  latest data. */
        remove_listeners(".bar");
        update_data(range);
        update_axes();
        update_bars();
    }

    // add y axes attribute dropdown 
    let dropdown = null;
    let options = [
        "weight", "length", 
        "head_size", "beam_width",
        "flex", "tension", "price",
        "swing_weight", "power", 
        "balance", "speed"
    ];

    let add_dropdown = () => {
        /** Adds a dropdown list containing
         *  attributes that can be picked for the
         *  x axis, y axis and color of dots. */

        // create drop downs
        dropdown = bar_header.append("select")
                    .attr("name", "sel_attr");
        
        // populate drop downs with options
        dropdown.selectAll("option")
            .data(options)
            .join("option")
            .attr("value", d=>d)
            .text(d=>d);

        // filter data on scatter layout
        // accordingly every time a new
        // dropdown option is selected
        dropdown.on("change", (e, d) => {
            // get chosen option
            let src_elem = d3.select(e.srcElement);
            let val = src_elem.property("value");
            let name = val.split("_").map(n => 
                n.charAt(0).toUpperCase() + n.slice(1)
            ).join(" ");

            // set option as currently selected option
            sel_attr = [name, val];
            // update data on scatter layout
            self.update();
        });
    }
    add_dropdown();

    // add info button
    let info_btn = null;
    let add_info_btn = () => {
        /** Adds info button to the plot. */
        info_btn = bar_svg.append("circle")
            .attr("id", "info_btn")
            .attr("transform", `translate(${width-50},${50})`)
            .attr("fill", "url(#info_icon)")
            .attr("r", 15)
            .on("mouseover", () => {
                info_btn.attr(
                    "transform", 
                    `translate(${width-50},${50})`
                    + `scale(${1.2})`
                )
            }).on("mouseout", () => {
                info_btn.attr(
                    "transform", 
                    `translate(${width-50},${50})`
                    + `scale(${1})`
                )
            }).on("click", () => alert(
                "Please use arrow keys to zoom in/"
                + "zoom out/traverse through the bars."
                + "To activate this feature, just hover "
                + "over the bar plot."
            ));
    }
    add_info_btn();

    return self;
}

// PIE PLOT
const add_pie_plot = () => {
    /** Adds pie plot to the dashboard. */
    let self = {};

    let plot_data = [...data]; // store copy of data

    // calculate width and height of parent svg
    let width = Number(pie_svg.style("width").replace("px",""));
    let height = Number(pie_svg.style("height").replace("px",""));
    let radius = Math.min(width, height)/2;

    // add group element that represents pie chart
    let pie_group = pie_svg.append("g")
                    .attr("transform", 
                        `translate(${width/2},${height/2})`
                    );

    // define pie chart color scale
    let color_scale = d3.scaleOrdinal().range(d3.schemeSet3);

    let clicked = -1; // keep track of index of clicked wedge

    // define pie chart generator
    let pie = d3.pie(); 

    // define arc generator
    let arc = d3.arc()
                .innerRadius(30)
                .outerRadius(radius-20);

    // arc with no angle or value
    let zero_arc = { 
        startAngle: 0,  endAngle: 0,  
        value: 0, data:0, index:0, padAngle:0
    }

    function arcTweenIn(a) {
        /** Tween function for when new wedge is to enter. 
         *  Creates an interpolator that interpolates from zero arc 
         *  to the arc corresponding current data. 
         *  @param a: The new arc object. 
         *  @returns: Function that returns arc 
         *            corresponding to data output by 
         *            the new interpolator upon being provided 
         *            given value t as input. */
        // interpolate from 0 angle arc to current arc
        let i = d3.interpolate(zero_arc, a); 
        this._current = i(0); // set new arc as the current arc
        return t => arc(i(t)); 
    }
    
    function  arcTween(a) { 
        /** Tween function for when existing wedge has to be updated. 
        *   Creates an interpolator that interpolates from 
        *   arc corresponding to existing data to arc corresponding 
        *   to new data.
        *   @param a: The new arc object. 
        *   @returns: Function that returns arc 
        *             corresponding to data output by 
        *             the new interpolator upon being provided 
        *             a given value t as input. */
        // interpolate from current to new arc
        let i = d3.interpolate(this._current, a); 
        this._current = a; // set new arc as the current arc
        return t => arc(i(t)); 
    }
    
    function arcTweenOut() {
        /** Tween function for when existing wedge has to 
         *  be removed. Creates an interpolator that interpolates 
        *   from arc corresponding to existing data to zero arc.
        *   Note: "this" here refers to a selected path.  
        *   @returns: Function that returns arc corresponding 
        *             to data output by the new interpolator upon 
        *             being provided given value t as input. */
        let i = d3.interpolate(this._current, zero_arc);
        this._current = zero_arc;
        return t => arc(i(t)); 
    }

    let filter_data = (power, speed) => {
        /** Filters data as per current 
         *  power/speed filters applied. */

        // plot data is an object such that  
        // keys are categories that each wedge in the
        // pie chart represents and values are
        // objects of the form {count: , filtered_data: } 
        // that store the frequency of data points (count)
        // per category (used to determine the size of
        // the wedge) and the filtered data itself 
        // as belonging to respective category (stored 
        // so that store and word cloud layout
        // may be updated based on it)
        plot_data = {};

        // if both power and speed filter applied
        if (power != -1 && speed != -1) {
            let filtered_data = [];
            let other_data = [];

            // filter data based on power and speed
            [...data].forEach(row => {
                if (row.power == power && row.speed == speed)
                    filtered_data.push(row)
                else other_data.push(row)
            });

            // update plot data of wedge
            // representing data corresponding
            // to filters applied
            plot_data[`${get_encoding({
                type:"string", 
                attr:"power", 
                val:power
            })} power ${get_encoding({
                type:"string", 
                attr:"speed", 
                val:speed
            })} speed`] = {
                count: filtered_data.length,
                filtered_data: filtered_data
            };

            // update plot data of wedge
            // representing data other than
            // that corresponding
            // to filters applied
            plot_data["Other"] = {
                count: other_data.length,
                filtered_data: other_data
            };
        } 
        
        // if only power filter applied
        else if (power != -1) {
            let filtered_data = [];
            let other_data = [];

            // filter data based on power
            [...data].forEach(row => {
                if (row.power == power)
                    filtered_data.push(row)
                else other_data.push(row)
            });

            // update plot data of wedge
            // representing data corresponding
            // to filter applied
            plot_data[`${get_encoding({
                type:"string", 
                attr:"power", 
                val:power
            })} power`] = {
                count: filtered_data.length,
                filtered_data: filtered_data
            };

            // update plot data of wedge
            // representing data other than
            // that corresponding
            // to filter applied
            plot_data["Other"] = {
                count: other_data.length,
                filtered_data: other_data
            };
        }

        // if only speed filter applied
        else if (speed != -1) {
            let filtered_data = [];
            let other_data = [];

            // filter data based on power
            [...data].forEach(row => {
                if (row.speed == speed)
                    filtered_data.push(row)
                else other_data.push(row)
            });

            // update plot data of wedge
            // representing data corresponding
            // to filter applied
            plot_data[`${get_encoding({
                type:"string", 
                attr:"speed", 
                val:speed
            })} speed`] = {
                count: filtered_data.length,
                filtered_data: filtered_data
            }

            // update plot data of wedge
            // representing data other than
            // that corresponding
            // to filter applied
            plot_data["Other"] = {
                count: other_data.length,
                filtered_data: other_data
            }
        }

        // if no filter applied, show all
        else {
            // update plot data for every possible
            // combination of the 3 power and speed
            // levels available
            [0,1,2].forEach(p => {
                [0,1,2].forEach(s => {
                    let filtered_data = data.filter(row => 
                        row.power == p
                        && row.speed == s
                    );
                    plot_data[
                        `${get_encoding({
                            type:"string", 
                            attr:"power", 
                            val:p
                        })} power ${get_encoding({
                            type:"string", 
                            attr:"speed", 
                            val:s
                        })} speed`
                    ] = {
                        count: filtered_data.length,
                        filtered_data: filtered_data
                    };
                });
            });
        }
    }

    let get_wedge_description = (wedge_data) => {
        /** Computes wedge % and returns a string 
         *  describing this. */
        // calculate % value to 2 decimal places
        let text = `${wedge_data[0]}: `
            + `${
                Math.round((wedge_data[1].count/sum(
                    Object.values(plot_data).map(
                        val => val.count
                    )
                )*100)*100)/100
            }%`;
        // make 1st letter capital
        text = text.split(" ");
        for (let i=0; i<text.length; i++) {
            text[i] = text[i].charAt(0).toUpperCase() 
                    + text[i].slice(1);
        }
        text = text.join(" ");
        return text;
    }

    let on_mouseover = (e) => {
        /** This function is called when 
         *  mouse moves over a wedge. */

        // get selected wedge and its data
        let sel_wedge = d3.select(`#${e.target.id}`);
        let wedge_data = Object.entries(plot_data)[
            Number(sel_wedge.attr("id").replace("wedge",""))
        ]

        // highlight it in blue
        sel_wedge.attr("fill", color_blue);

        // change header to display its category
        // name and % value
        d3.select("#pie_header")
            .transition().duration(1000)
            .attr("opacity", 1)
            .text(() => get_wedge_description(wedge_data));
    }

    let on_mouseout = (e) => {
        /** This function is called when 
         *  mouse moves out of a wedge. */

        // get selected wedge and its data
        let sel_wedge = d3.select(`#${e.target.id}`);
        let wedge_id = Number(
            sel_wedge.attr("id").replace("wedge","")
        );

        // if this wedge is not clicked, then 
        // set its color back to original
        if (clicked != wedge_id) {
            sel_wedge.attr("fill", color_scale(wedge_id));
        } 

        // if at least one wedge is clicked, 
        // on mouse out display the clicked
        // wedges description in the header
        // else display a general heading
        if (clicked != -1) {
            let clicked_data = Object.entries(
                plot_data
            )[clicked]
            d3.select("#pie_header")
                .transition().duration(1000)
                .attr("opacity", 0)
                .text(get_wedge_description(clicked_data));
        } else {
            d3.select("#pie_header")
                .transition().duration(1000)
                .attr("opacity", 0)
                .text("Power/Speed Distribution");
        }
    }

    let on_click = (e) => {
        /** This function is called a 
         *  wedge is clicked. */

        // get selected wedge and its data
        let sel_wedge = d3.select(`#${e.target.id}`);
        let wedge_id = Number(
            sel_wedge.attr("id").replace("wedge","")
        )
        let wedge_data = Object.entries(
            plot_data
        )[wedge_id];
        
        // set all racquets  int the store 
        // to original color
        layout.color_racquets({
            filtered_data: data,
            head_color: null,
            handle_color: null
        });

        // if an already clicked
        // wedge is clicked again, 
        // then change filter data
        // across layouts to be as
        // per currently applied filter
        // options from the power/speed filters
        // by calling the layout object's
        // dropdown_change() function
        if (clicked == wedge_id) {
            clicked = -1;
            layout.dropdown_change();
        }
        else {
            // set color selected wedge to blue
            // and set clicked to this wedge
            pie_svg.select(`#wedge${clicked}`)
                .transition().duration(1000)
                .attr("fill", color_scale(clicked));
            clicked = wedge_id;
            sel_wedge.transition().duration(1000)
            .attr("fill", color_blue);
            // change store layout and word cloud
            // display as per filtered data
            layout.color_racquets({
                filtered_data: wedge_data[1].filtered_data,
                head_color: color_blue,
                handle_color: color_blue
            });
            word_cloud.update({}, wedge_data[1].filtered_data);
        }
    }
    
    self.update = ({power, speed}) => {
        /** Adds, updates or removes pie wedges and 
         *  attaches event listeners to them to update plot 
         *  with data as per selected wedge. */
        clicked = -1;

        filter_data(power, speed);

        let path = pie_group.selectAll(".wedge")
                    .data(pie(
                        Object.values(plot_data)
                        .map(val => val.count)
                    ));

        path.enter().append("path") // add new wedges
            .attr("class", "wedge")
            .attr("id", (d,i) => `wedge${i}`)
            .attr("stroke", color_dark_grey)
            .attr("fill", (d,i) => color_scale(i))
            .attr("d", arc)
            .transition().duration(1000)
            .attr("opacity", 1)
            .attrTween("d", arcTweenIn);

        path.attr("id", (d,i) => `wedge${i}`)   
            .transition().duration(1000)
            .attr("fill", (d,i) => color_scale(i))
            .attrTween("d", arcTween); // update existing wedges
        
        path.exit() // remove old unnecessary wedges
            .transition().duration(1000)
            .attr("opacity", 0)
            .attrTween('d', arcTweenOut)
            .remove();

        d3.selectAll(".wedge")
        .on("mouseover", on_mouseover)
        .on("mouseout", on_mouseout)
        .on("click", on_click);
    }

    self.update({power:-1, speed:-1});

    return self;
}

// WORD CLOUD
const add_word_cloud = () => {
    /** Adds word cloud to the dashboard. */
    let self = {};

    // words.symbols with less meaning to be 
    // removed from words to be displayed
    // in the cloud
    let drop_words = ["with", "and", "&", ""];

    // set up color and font size scale
    let color_scale = d3.scaleOrdinal()
                .range(d3.schemeDark2);
    let font_size_scale = d3.scaleLinear();

    // get width and height of svg
    let width = Number(
        word_cloud_svg.style("width").replace("px","")
    );

    let height = Number(
        word_cloud_svg.style("height").replace("px","")
    );

    // plot data shall be a object such that
    // keys are unique words and their values are
    // the no. of times they occurred 
    let plot_data = [];

    // define cloud layout and
    // group element to which to 
    // add words
    let cloud = null;
    let cloud_group = word_cloud_svg.append("g");

    let count_words = (words) => {
        /** Counts how many times
         *  a word that is not one to to be
         *  dropped, appears in given
         *  list of words. */
        let counts = {};
        words.forEach(word => {
            if (!(drop_words.includes(word))) {
                if (word in counts) {
                    counts[word] += 1;
                } else {
                    counts[word] = 1;
                }
            }
        });

        return counts;
    }

    let filter_words = (filtered_data, power, speed) => {
        /** Filters words based on applied
         *  power/speed filters if any. */
        let words = [];

        if (filtered_data == null) {
            // if both power and speed filter applied
            if (power != -1 && speed != -1) {
                filtered_data = data.filter(row => 
                    row.power == power
                    && row.speed == speed
                )
            }

            // if only power filter applied
            else if (power != -1) {
                filtered_data = data.filter(
                    row => row.power == power
                );
            }

            // if only speed filter applied
            else if (speed != -1) {
                filtered_data = data.filter(
                    row => row.speed == speed
                );
            }

            // no filters applied, consider all data
            else {
                filtered_data = [...data];
            }
        }

        // concatenate string compositions of 
        // all racquets in  filtered data into 
        // one string
        filtered_data.map(row => {
            words = words.concat(row.composition.split(" "))
        });

        // get plot data by counting words
        // in this string
        plot_data = count_words(words);
    }

    let draw = (words) => {
        /** Draws the word cloud. */

        // make could fit within the svg
        cloud_group.attr(
            "transform", `translate(${
                cloud.size()[0]/2
            },${cloud.size()[1]/2})`
        );
        
        // add, update or remove
        // text content, its font size, color
        // and rotation
        cloud_group.selectAll("text")
            .data(words).join("text")
            .transition().duration(1000)
            .attr("font-size", d => d.size)
            .attr("fill", d => color_scale(d.size))
            .attr("text-anchor", "middle")
            .attr("font-family", "Impact")
            .attr("transform", d =>
                `translate(${[d.x, d.y]}) rotate(${d.rotate})`
            ).attr("opacity",1).text(d => d.text);
        cloud_group.exit()
            .transition().duration(1000)
            .attr("font-size", 0)
            .attr("fill", color_white)
            .attr("transform", "translate(0,0) rotate(0)")
            .attr("opacity",0)
            .remove();
    }

    let create_cloud = () => {
        /** Function that constructs a new cloud 
         *  layout instance using an algorithm that 
         *  can find the position of each word based on
         *  word count data input. */
        
        // update fontsize scale
        font_size_scale.domain(
            d3.extent(Object.values(plot_data))
        ).range([5,50]);

        // update svg width and height
        width = Number(
            word_cloud_svg.style("width").replace("px","")
        );
        height = Number(
            word_cloud_svg.style("height").replace("px","")
        );

        // create word cloud layout and 
        // draw words using draw() functions
        cloud = d3.layout.cloud()
            .size([width, height])
            .words(
                Object.entries(plot_data).map(d => {
                    return { text: d[0], size: d[1] }
                })
            ).padding(5) //space between words
            .rotate(() => !(Math.random()*2)*90)
            .fontSize(d => font_size_scale(d.size)) 
            .on("end", draw);
        cloud.start();
    }

    self.update = ({power, speed}, filtered_data) => {
        /** Updates word cloud based on applied filters. */

        if (filtered_data == undefined) {
            filter_words(null, power, speed);
        } else {
            filter_words(filtered_data);
        }
        create_cloud();
    }

    self.update({power:-1, speed:-1});

    return self;
}
