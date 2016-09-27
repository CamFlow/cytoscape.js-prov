;(function () {
	'use strict';

	var showSuccessors = true;
	var showAncestors = true;
	var ignoreControlFlow = false;
	var event_is_on = false;
	var __node_id='';
	var ___node_id='';

	// registers the extension on a cytoscape lib ref
	var register = function (cytoscape) {
		if (!cytoscape) {
			return;
		} // can't register if cytoscape unspecified


		var _instance;
		cytoscape('core', 'prov_core', function (opts) {
			var cy = this;

			cy.on('tap', function(evt){
				// nasty fix to avoid being called several time
				if(evt.cyTarget.id != undefined){
					var node_id = evt.cyTarget.id();
					if(node_id==__node_id){
						return;
					}else{
						__node_id=node_id;
					}
				}else{
					__node_id='';
					___node_id='';
				}
				// nasty fix to avoid being called several time
				cy.elements().removeClass('faded');
				cy.elements().removeClass('prov_successor');
				cy.elements().removeClass('prov_ancestor');
			});

			cy.on('tap', 'node', function(evt){
				// nasty fix to avoid being called several time
				var node_id = evt.cyTarget.id();
				if(node_id==___node_id){
					return;
				}else{
					___node_id=node_id;
				}
				// nasty fix to avoid being called several time
				cy.startBatch();
				var node = evt.cyTarget;
				cy.elements().addClass('faded');
				cy.elements().removeClass('prov_successor');
				cy.elements().removeClass('prov_ancestor');
				node.removeClass('faded');
				node.ancestors().removeClass('faded');

				if(showSuccessors){
					var successors = [node];
					var visited = [node.id()];
					while(successors.length>0 && successors.length<100){
						var current = successors.pop();
						current.outgoers().each(function(i, edge){
							if(ignoreControlFlow==true && edge.data('label')=='wasInformedBy'){
								// do nothing
							}else{
								edge.removeClass('faded');
								var newNode = edge.target();
								if(visited.includes(newNode.id())) // we already saw that node
									return;
								newNode.addClass('prov_successor');
								newNode.removeClass('faded');
								newNode.ancestors().removeClass('faded');
								newNode.descendants().removeClass('faded');
								visited.push(newNode.id());
								successors.push(newNode);
							}
						});
					}
				}

				if(showAncestors){
					var ancestors = [node];
					var visited = [node.id()];
					while(ancestors.length>0 && ancestors.length<100){
						var current = ancestors.pop();
						current.incomers().each(function(i, edge){
							if(ignoreControlFlow==true && edge.data('label')=='wasInformedBy'){
								// do nothing
							}else{
								edge.removeClass('faded');
								var newNode = edge.source();
								if(visited.includes(newNode.id())) // we already saw that node
									return;
								newNode.addClass('prov_ancestor');
								newNode.removeClass('faded');
								newNode.ancestors().removeClass('faded');
								newNode.descendants().removeClass('faded');
								visited.push(newNode.id());
								ancestors.push(newNode);
							}
						});
					}
					if(ancestors.length>=100){
						alert("Something is wrong, check for cycle. Provenance graph MUST NOT contain cycle.");
					}
				}
				cy.endBatch();
			});

			cy.on('tap', 'node', function(evt){

			});

			var options = {
				clipboardSize: 0
			};

			$.extend(true, options, opts);

			function getScratch() {
				if (!cy.scratch("_prov_core")) {
					cy.scratch("_prov_core", { });
				}
				return cy.scratch("_prov_core");
			}

			if (!getScratch().isInitialized) {
				getScratch().isInitialized = true;
				var ur;
				var clipboard = {};

				_instance = {
					setShowSuccessors: function (bool){
						showSuccessors = bool;
					},

					setShowAncestors: function(bool){
						showAncestors = bool;
					},

					setIgnoreControlFlow: function(bool){
						ignoreControlFlow = bool;
					},

					entity: function (json, id, label, superNode){
						if(typeof label === 'undefined')
							label = id;
						if (typeof superNode === 'undefined')
							cy.add([{ group: "nodes", data: { id: id, weight: 30, type: 'entity', label: label, json: json}}]);
						else
							cy.add([{ group: "nodes", data: { id: id, weight: 30, type: 'entity', label: label, parent: superNode, json: json}}]);
					},

					activity: function (json, id, label, superNode){
						if(typeof label === 'undefined')
							label = id;
						if (typeof superNode === 'undefined')
							cy.add([{ group: "nodes", data: { id: id, weight: 30, type: 'activity', label: label, json: json}}]);
						else
							cy.add([{ group: "nodes", data: { id: id, weight: 30, type: 'activity', label: label, parent: superNode, json: json}}]);
					},

					agent: function(json, id, label, superNode){
						if(typeof label === 'undefined')
							label = id;
						if (typeof superNode === 'undefined')
							cy.add([{ group: "nodes", data: { id: id, weight: 30, type: 'agent', label: label, json: json}}]);
						else
							cy.add([{ group: "nodes", data: { id: id, weight: 30, type: 'agent', label: label, parent: superNode, json: json}}]);
					},

					wasDerivedFrom: function (generatedEntity, usedEntity, label){
						if(label!=undefined){
							cy.add([{ group: "edges", data: { source: usedEntity, target: generatedEntity, color: '#FF9933', label: 'wasDerivedFrom - '+label}}]);
						}else{
							cy.add([{ group: "edges", data: { source: usedEntity, target: generatedEntity, color: '#FF9933', label: 'wasDerivedFrom'}}]);
						}
					},

					wasGeneratedBy: function (entity, activity, label){
						if(label!=undefined){
							cy.add([{ group: "edges", data: { source: activity, target: entity, color: '#0000FF', label: 'wasGeneratedBy - '+label}}]);
						}else{
							cy.add([{ group: "edges", data: { source: activity, target: entity, color: '#0000FF', label: 'wasGeneratedBy'}}]);
						}
					},

					wasAssociatedWith: function (activity, agent, label){
						if(label!=undefined){
							cy.add([{ group: "edges", data: { source: agent, target: activity, color: '#00CCCC', label: 'wasAssociatedWith - '+label}}]);
						}else{
							cy.add([{ group: "edges", data: { source: agent, target: activity, color: '#00CCCC', label: 'wasAssociatedWith'}}]);
						}
					},

					used: function (entity, activity, label){
						if(label!=undefined){
							cy.add([{ group: "edges", data: { source: activity, target: entity, color: '#00FF00', label: 'used - '+label}}]);
						}else{
							cy.add([{ group: "edges", data: { source: activity, target: entity, color: '#00FF00', label: 'used'}}]);
						}
					},

					wasAttributedTo: function (entity, agent, label){
						if(label!=undefined){
							cy.add([{ group: "edges", data: { source: agent, target: entity, color: '#00CCCC', label: 'wasAttributedTo - '+label}}]);
						}else{
							cy.add([{ group: "edges", data: { source: agent, target: entity, color: '#00CCCC', label: 'wasAttributedTo'}}]);
						}
					},

					actedOnBehalfOf: function (acted, of, label){
						if(label!=undefined){
							cy.add([{ group: "edges", data: { source: acted, target: of, color: '#CC00CC', label: 'actedOnBehalfOf - '+label}}]);
						}else{
							cy.add([{ group: "edges", data: { source: acted, target: of, color: '#CC00CC', label: 'actedOnBehalfOf'}}]);
						}
					},

					wasInformedBy: function (entityInformant, entityInformed, label){
						if(label!=undefined){
							cy.add([{ group: "edges", data: { source: entityInformant, target: entityInformed, color: '#CC00CC', label: 'wasInformedBy - '+label}}]);
						}else{
							cy.add([{ group: "edges", data: { source: entityInformant, target: entityInformed, color: '#CC00CC', label: 'wasInformedBy'}}]);
						}
					},

					derivedByInsertionFrom: function (before, after, label){
						if(label!=undefined){
							cy.add([{ group: "edges", data: { source: before, target: after, color: '#CC00CC', label: 'derivedByInsertionFrom - '+label}}]);
						}else{
							cy.add([{ group: "edges", data: { source: before, target: after, color: '#CC00CC', label: 'derivedByInsertionFrom'}}]);
						}
					},

					hadMember: function (collection, entry, label){
						if(label!=undefined){
							cy.add([{ group: "edges", data: { source: entry, target: collection, color: '#CC00CC', label: 'hadMember - '+label}}]);
						}else{
							cy.add([{ group: "edges", data: { source: entry, target: collection, color: '#CC00CC', label: 'hadMember'}}]);
						}
					},

					hadDictionaryMember: function (dictionary, entry, label){
						if(label!=undefined){
							cy.add([{ group: "edges", data: { source: entry, target: dictionary, color: '#CC00CC', label: 'hadDictionaryMember - '+label}}]);
						}else{
							cy.add([{ group: "edges", data: { source: entry, target: dictionary, color: '#CC00CC', label: 'hadDictionaryMember'}}]);
						}
					},

					specializationOf: function (entity, specialization, label){
						if(label!=undefined){
							cy.add([{ group: "edges", data: { source: entity, target: specialization, color: '#CC00CC', label: 'specializationOf - '+label}}]);
						}else{
							cy.add([{ group: "edges", data: { source: entity, target: specialization, color: '#CC00CC', label: 'specializationOf'}}]);
						}
					},

					alternateOf: function (entity, alternate, label){
						if(label!=undefined){
							cy.add([{ group: "edges", data: { source: entity, target: alternate, color: '#CC00CC', label: 'alternateOf - '+label}}]);
						}else{
							cy.add([{ group: "edges", data: { source: entity, target: alternate, color: '#CC00CC', label: 'alternateOf'}}]);						}
					},

					hadPlan: function (agent, plan, label){
						if(label!=undefined){
							cy.add([{ group: "edges", data: { source: plan, target: agent, color: '#CC00CC', label: 'hadPlan - '+label}}]);
						}else{
							cy.add([{ group: "edges", data: { source: plan, target: agent, color: '#CC00CC', label: 'hadPlan'}}]);
						}
					},

					genericRelation: function (node1, node2, label){
						if(label!=undefined){
							cy.add([{ group: "edges", data: { source: node1, target: node2, color: '#FF0000', label: label}}]);
						}else{
							cy.add([{ group: "edges", data: { source: node1, target: node2, color: '#FF0000', label: 'unknown'}}]);
						}
					},

					draw: function (){
						var layout = cy.makeLayout({
							name: 'dagre',
							rankDir: 'TB',
							fit: true,
							edgeWeight: function( edge ){
								switch(edge.data("label")){
									case "wasInformedBy":
										return 1000000;
									case "wasDerivedFrom":
										return 100;
									case "used":
										return 10;
									default:
										return 1;
								}
							}
						});
						layout.run();
					},

					collapse: function(node){
						if(node.data('removed')!=null){ // the node has already been collapsed
							return;
						}
						var nodes = node.children();
						if(nodes.empty()){
							return;
						}
						var added = new Array();

						cy.startBatch();
						nodes.each(function(i, n){
							n.outgoers().each(function(i, e){
								if(e.target().id()!=undefined){
									e = cy.add([{ group: "edges",  data: { source: node.id(), target: e.target().id(), color: e.data('color'), label: e.data('label')}}]);
									if(!added.includes(e))
										added.push(e);
								}
							});
							n.incomers().each(function(i, e){
								if(e.source().id()!=undefined){
									e = cy.add([{ group: "edges",  data: { source: e.source().id(), target: node.id(), color: e.data('color'), label: e.data('label')}}]);
									if(!added.includes(e))
										added.push(e);
								}
							});
						});
						var removed = nodes.remove();
						node.data('removed', removed);
						node.data('added', added);
						node.edgesTo(node).remove();
						cy.endBatch();
					},

					uncollapse: function(node){
						cy.startBatch();
						var removed = node.data('removed');
						if(removed==undefined || removed==null){
							return;
						}
						var added = node.data('added');
						removed.restore();
						added.forEach(function(e, i){e.remove()});
						node.edgesTo(node.children()).remove();
						node.children().edgesTo(node).remove();
						node.data('removed', null);
						node.data('added', null);
						cy.endBatch();
					},

					average: function(attribute_name){
						var count = 1;
						var time=0;
						cy.nodes().each(function(i, node){
							var json = node.data('json');
							if(json[attribute_name]!=undefined){
								time+=parseFloat(json[attribute_name]);
								count++;
							}
						});
						return time/count;
					},

					max: function(attribute_name){
						var time=undefined;
						cy.nodes().each(function(i, node){
							var json = node.data('json');
							if(json[attribute_name]!=undefined){
								var tmp = parseFloat(json[attribute_name]);
								if(time==undefined){
									time = tmp;
								}
								if(tmp > time){
									time = tmp;
								}
							}
						});
						return time;
					},

					weight: function(attribute_name, factor){
						var max = this.max(attribute_name);
						cy.nodes().each(function(i, node){
							var json = node.data('json');
							if(json[attribute_name]!=undefined){
								var time=parseFloat(json[attribute_name]);
								var weight = (1 + factor * (time / max)) * node.data('weight');
								node.data('weight', weight);
							}
						});
					}
				};
			}
			return _instance; // chainability
		});
	};



	if (typeof module !== 'undefined' && module.exports) { // expose as a commonjs module
		module.exports = register;
	}

	if (typeof define !== 'undefined' && define.amd) { // expose as an amd/requirejs module
		define('cytoscape-clipboard', function () {
			return register;
		});
	}

	if (typeof cytoscape !== 'undefined') { // expose to global cytoscape (i.e. window.cytoscape)
		register(cytoscape);
	}

})();
