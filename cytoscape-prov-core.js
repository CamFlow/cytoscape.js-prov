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
							cy.add([{ group: "nodes", data: { id: id, label: label, color: '#FFB266', shape: 'ellipse', json: json}}]);
						else
							cy.add([{ group: "nodes", data: { id: id, label: label, parent: superNode, color: '#FFB266', shape: 'ellipse', json: json}}]);
					},

					activity: function (json, id, label, superNode){
						if(typeof label === 'undefined')
							label = id;
						if (typeof superNode === 'undefined')
							cy.add([{ group: "nodes", data: { id: id, label: label, color: '#66B2FF', shape: 'rectangle', json: json}}]);
						else
							cy.add([{ group: "nodes", data: { id: id, label: label, parent: superNode, color: '#0000FF', shape: 'rectangle', json: json}}]);
					},

					agent: function(json, id, label, superNode){
						if(typeof label === 'undefined')
							label = id;
						if (typeof superNode === 'undefined')
							cy.add([{ group: "nodes", data: { id: id, label: label, color: '#66FF66', shape: 'octagon', json: json}}]);
						else
							cy.add([{ group: "nodes", data: { id: id, label: label, parent: superNode, color: '#66FF66', shape: 'octagon', json: json}}]);
					},

					wasDerivedFrom: function (generatedEntity, usedEntity){
						cy.add([{ group: "edges", data: { source: usedEntity, target: generatedEntity, color: '#FF9933', label: 'wasDerivedFrom'}}]);
					},

					wasGeneratedBy: function (entity, activity){
						cy.add([{ group: "edges", data: { source: activity, target: entity, color: '#0000FF', label: 'wasGeneratedBy'}}]);
					},

					wasAssociatedWith: function (activity, agent){
						cy.add([{ group: "edges", data: { source: agent, target: activity, color: '#00CCCC', label: 'wasAssociatedWith'}}]);
					},

					used: function (entity, activity){
						cy.add([{ group: "edges", data: { source: activity, target: entity, color: '#00FF00', label: 'used'}}]);
					},

					wasAttributedTo: function (entity, agent){
						cy.add([{ group: "edges", data: { source: agent, target: entity, color: '#00CCCC', label: 'wasAttributedTo'}}]);
					},

					actedOnBehalfOf: function (acted, of){
						cy.add([{ group: "edges", data: { source: acted, target: of, color: '#CC00CC', label: 'actedOnBehalfOf'}}]);
					},

					wasInformedBy: function (entityInformant, entityInformed){
						cy.add([{ group: "edges", data: { source: entityInformant, target: entityInformed, color: '#CC00CC', label: 'wasInformedBy'}}]);
					},

					derivedByInsertionFrom: function (before, after){
						cy.add([{ group: "edges", data: { source: before, target: after, color: '#CC00CC', label: 'derivedByInsertionFrom'}}]);
					},

					hadMember: function (collection, entry){
						cy.add([{ group: "edges", data: { source: entry, target: collection, color: '#CC00CC', label: 'hadMember'}}]);
					},

					hadDictionaryMember: function (dictionary, entry){
						cy.add([{ group: "edges", data: { source: entry, target: dictionary, color: '#CC00CC', label: 'hadDictionaryMember'}}]);
					},

					specializationOf: function (entity, specialization){
						cy.add([{ group: "edges", data: { source: entity, target: specialization, color: '#CC00CC', label: 'specializationOf'}}]);
					},

					alternateOf: function (entity, alternate){
						cy.add([{ group: "edges", data: { source: entity, target: alternate, color: '#CC00CC', label: 'alternateOf'}}]);
					},

					hadPlan: function (agent, plan){
						cy.add([{ group: "edges", data: { source: plan, target: agent, color: '#CC00CC', label: 'hadPlan'}}]);
					},

					unknownEdge: function (node1, node2){
						cy.add([{ group: "edges", data: { source: node1, target: node2, color: '#FF0000', label: 'unknown'}}]);
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
