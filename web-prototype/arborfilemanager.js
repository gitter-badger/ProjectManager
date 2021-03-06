function error_message(msg) {
    d3.select(document.body)
        .append("h1")
        .style("color", "red")
        .text(msg);
}

function servicePath(){
    var pathArgs = $.makeArray(arguments).join("/");
    if (pathArgs.length > 0) {
        pathArgs = "/" + pathArgs;
    }

    return "../tangelo/projmgr" + pathArgs;
}

window.onload = function () {
    "use strict";

    var hl_proj = null,
        hl_type = null,
        hl_dataset = null,
        loadfile = null;

    function refreshProjects(fade){
        var ajax,
            items,
            fresh;

        ajax = d3.json(servicePath("project"));
        ajax.send("GET", function (e, projects) {
            if (e) {
                error_message("Error!");
                console.log(e);
            }

            items = d3.select("#projects")
                .selectAll("div")
                .data(projects, function (d) {
                    return d;
                });

            fresh = items.enter()
                .append("div")
                .classed("item", true)
                .attr("name", function (d) {
                    return d;
                })
                .text(function (d) {
                    return d;
                })
                .on("click", function (d) {
                    // Move the highlight to the selected project (or remove the
                    // highlight entirely if the selected item is clicked
                    // again).
                    if (hl_proj !== null) {
                        d3.select("#projects")
                            .select("[name=" + hl_proj + "]")
                            .classed("selected", false);
                    }

                    if (hl_proj !== d) {
                        hl_proj = d;
                        d3.select(this)
                            .classed("selected", true);
                    } else {
                        hl_proj = null;
                    }

                    hl_type = null;
                    hl_dataset = null;

                    // Refresh the data type list.
                    if (hl_proj !== null) {
                        refreshDatatypes(hl_proj);
                    } else {
                        clearDatatypes();
                    }

                    // Clear the data set list.
                    clearDatasets();
                });

            fresh.append("a")
                .classed("btn", true)
                .classed("btn-mini", true)
                .text("delete")
                .on("click", function () {
                    d3.event.stopPropagation();
                    deleteProject(d3.select(this.parentNode).attr("name"));
                });

            fresh.append("a")
                .classed("btn", true)
                .classed("btn-mini", true)
                .text("new dataset")
                .on("click", function () {
                    d3.event.stopPropagation();
                    newDataset(d3.select(this.parentNode).attr("name"));
                });

            if (fade) {
                items.exit()
                    .transition()
                    .duration(1000)
                    .style("height", "0px")
                    .style("opacity", 0.0)
                    .remove();
            } else {
                items.exit()
                    .remove();
            }

            if (hl_proj !== null) {
                refreshDatatypes(hl_proj, fade);
            } else {
                hl_type = null;
                hl_dataset = null;
            }
        });
    }

    function newDataset(project) {
        $("#newdataset-dialog").modal("show");
        $("#newdataset-dialog").on("hide", function () {
            d3.select("#newdataset-yes")
                .on("click", null);
        });
    }

    function deleteProject(project) {
        $("#confirmation-dialog").modal("show");
        $("#confirmation-dialog").on("hide", function () {
            d3.select("#confirmation-yes")
                .on("click", null);
        });

        d3.select("#confirmation-action")
            .html("You are about to delete project <i>" + project + "</i>.");

        d3.select("#confirmation-yes")
            .on("click", function () {
                var ajax;

                ajax = d3.xhr(servicePath("project", project));
                ajax.send("DELETE", function (e, r) {
                    if (e) {
                        error_message("Error!");
                        console.log(e);
                        return;
                    }

                    hl_proj = null;
                    refreshProjects(true);
                });
            });
    }

    function clearDatatypeSelection() {
        hl_type = null;
        d3.select("#datatypes")
            .selectAll("div")
            .classed("selected", false);
    }

    function refreshDatatypes(project, fade) {
        var ajax,
            items;

        ajax = d3.json(servicePath("project", project));
        ajax.send("GET", function (e, datatypes) {
            if (e) {
                error_message("Error!");
                console.log(e);
                return;
            }

            items = d3.select("#datatypes")
                .selectAll("div")
                .data(datatypes, function (d) {
                    return d;
                });

            items.enter()
                .append("div")
                .classed("item", true)
                .attr("name", function (d) {
                    return d;
                })
                .text(function (d) {
                    return d;
                })
                .on("click", function (d) {
                    // Move the highlight to the selected datatype (or remove
                    // the highlight entirely if the selected item is clicked
                    // again).
                    if (hl_type !== null) {
                        d3.select("#datatypes")
                            .select("[name=" + hl_type + "]")
                            .classed("selected", false);
                    }
                    if (hl_type !== d) {
                        hl_type = d;
                        d3.select(this)
                            .classed("selected", true);
                    } else {
                        clearDatatypeSelection();
                    }

                    hl_dataset = null;

                    // Refresh the data set list.
                    if (hl_type !== null) {
                        refreshDatasets(hl_proj, hl_type);
                    } else {
                        clearDatasets();
                    }
                });

            items.classed("selected", function (d) {
                return d === hl_type;
            });

            if (fade) {
                items.exit()
                    .transition()
                    .duration(1000)
                    .style("height", "0px")
                    .style("opacity", 0.0)
                    .remove();
            } else {
                items.exit()
                    .remove();
            }

            if (hl_type !== null) {
                refreshDatasets(hl_proj, hl_type, fade);
            } else {
                hl_dataset = null;
            }
        });
    }

    function refreshDatasets(project, type, fade) {
        var ajax;

        ajax = d3.json(servicePath("project", project, type));
        ajax.send("GET", function (e, datasets) {
            var items,
                fresh;

            if (e) {
                error_message("Error!");
                console.log(e);
                return;
            }

            items = d3.select("#datasets")
                .selectAll("div")
                .data(datasets, function (d) {
                    return d;
                });

            fresh = items.enter()
                .append("div")
                .classed("item", true)
                .attr("name", function (d) {
                    return d;
                })
                .text(function (d) {
                    return d;
                })
                .on("click", function (d) {
                    // Move the highlight to the selected dataset (or remove the
                    // highlight entirely if the selected item is clicked
                    // again).
                    if (hl_dataset !== null) {
                        d3.select("#datasets")
                            .select("[name=" + hl_dataset + "]")
                            .classed("selected", false);
                    }
                    if (hl_dataset !== d) {
                        hl_dataset = d;
                        d3.select(this)
                            .classed("selected", true);
                    } else {
                        hl_dataset = null;
                    }
                });

            fresh.append("a")
                .classed("btn", true)
                .classed("btn-mini", true)
                .text("delete")
                .on("click", function () {
                    d3.event.stopPropagation();
                    deleteDataset(hl_proj, hl_type, d3.select(this.parentNode).attr("name"));
                });

            fresh.append("a")
                .classed("btn", true)
                .classed("btn-mini", true)
                .text("preview")
                .on("click", function () {
                    d3.event.stopPropagation();
                });

            fresh.append("a")
                .classed("btn", true)
                .classed("btn-mini", true)
                .text("select")
                .on("click", function () {
                    d3.event.stopPropagation();
                });

            if (fade) {
                items.exit()
                    .transition()
                    .duration(1000)
                    .style("height", "0px")
                    .style("opacity", 0.0)
                    .remove();
            } else {
                items.exit()
                    .remove();
            }
        });
    }

    function deleteDataset(project, type, dataset) {
        $("#confirmation-dialog").modal("show");
        $("#confirmation-dialog").on("hide", function () {
            d3.select("#confirmation-yes")
                .on("click", null);
        });

        d3.select("#confirmation-action")
            .html("You are about to delete dataset <i>" + dataset + "</i> in project <i>" + project + "</i>.");

        d3.select("#confirmation-yes")
            .on("click", function () {
                var ajax;

                ajax = d3.xhr(servicePath("project", project, type, dataset));
                ajax.send("DELETE", function (e, r) {
                    if (e) {
                        error_message("Error!");
                        console.log(e);
                        return;
                    }

                    hl_dataset = null;
                    refreshDatasets(hl_proj, hl_type, true);
                });
            });
    }

    function clearDatasets() {
        d3.select("#datasets")
            .selectAll("*")
            .remove();

        hl_dataset = null;
    }

    function clearDatatypes() {
        d3.select("#datatypes")
            .selectAll("*")
            .remove();

        hl_type = null;
    }


    d3.select("#newproject-ok")
        .on("click", function () {
            var name,
                ajax;

            name = encodeURI(d3.select("#newproject-name").property("value"));

            if (name !== "") {
                ajax = d3.xhr(servicePath("project", name));
                ajax.send("PUT", function (err, response) {
                    if (err) {
                        console.log("error: ");
                        console.log(err);
                        return;
                    }

                    refreshProjects(true);
                });
            }
        });

    d3.select("#newdataset-select")
        .on("click", function () {
            $("#newdataset-file").click();
        });

    d3.select("#newdataset-file")
        .on("change", function () {
            loadfile = d3.event.target.files[0];
            d3.select("#newdataset-filename")
                .text(loadfile.name);
        });

    d3.select("#newdataset-ok")
        .on("click", function () {
            var filename,
                datasetname,
                reader;

            if (loadfile === null) {
                alert("loadfile is null!");
                return;
            }

            datasetname = d3.select("#newdataset-name").property("value");
            console.log(datasetname);
            if (datasetname === "") {
                alert("datasetname is blank!");
                return;
            }

            reader = new FileReader();
            reader.onload = function (e) {
                var text,
                    type;

                type = d3.select("input[name=newdataset-type]:checked").attr("id");
                text = e.target.result;

                switch(type){
                    case "tree":
                        $.ajax({
                            url: servicePath("project", hl_proj, datasetname),
                            type: "PUT",
                            dataType: "text",
                            data: $.param({
                                data: text,
                                filename: loadfile.name,
                                filetype: "phyloxml"
                            }),
                            success: function (response) {
                                console.log("success! " + response);
                            },
                            error: function (xhr, status, err) {
                                console.log("error :(");
                                console.log("xhr: " + xhr);
                                console.log("status: " + status);
                                console.log("error: " + err);
                            }
                        });

                        refreshDatasets(hl_proj, "PhyloTree");
                        break;

                    case "otl":
                        alert("Type: " + type + ", file: " + loadfile.name);
                        break;

                    case "character-matrix":
                        alert("Type: " + type + ", file: " + loadfile.name);
                        break;

                    case "occurrences":
                        alert("Type: " + type + ", file: " + loadfile.name);
                        break;

                    case "sequences":
                        alert("Type: " + type + ", file: " + loadfile.name);
                        break;

                    case "workflow":
                        alert("Type: " + type + ", file: " + loadfile.name);
                        break;

                    default:
                        throw "Serious error: type was '" + type + "'";
                        break;
                }
            };
            reader.readAsText(loadfile);

        });

    refreshProjects(false);
};
