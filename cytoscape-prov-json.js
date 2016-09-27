;(function () {
	'use strict';

	var tryNodeAgain = new Array();
	var tryEdgeAgain = new Array();
	var json = {};

	// registers the extension on a cytoscape lib ref
	var register = function (cytoscape) {
		if (!cytoscape) {
			return;
		} // can't register if cytoscape unspecified


		var _instance;
		cytoscape('core', 'prov_json', function (opts) {
			var cy = this;

			var options = {
				clipboardSize: 0
			};

			$.extend(true, options, opts);

			function getScratch() {
				if (!cy.scratch("_prov_json")) {
					cy.scratch("_prov_json", { });
				}
				return cy.scratch("_prov_json");
			}

			function parse_entities(entities){
				for(var key in entities){
					var parent_id = undefined;
					if(entities[key]['prov:label']!=undefined){
						var label = entities[key]['prov:label'];
					} else if(entities[key]['rdt:name']!=undefined){
						var label = entities[key]['rdt:name']+' ['+entities[key]['rdt:type']+']';
					}else{
						var label = key;
					}

					if(entities[key]['prov:type'] != undefined && entities[key]['cf:id']!=undefined){
						var parent_label = entities[key]['cf:id'];
						var parent_id = entities[key]['cf:type'] + entities[key]['cf:id'] + entities[key]['cf:boot_id'] + entities[key]['cf:machine_id'];
						cy.prov_core().entity(entities[key], parent_id, parent_label);
					}

					if(entities[key]['prov:type']=='prov:agent'){
						cy.prov_core().agent(entities[key], key, label, parent_id);
					}else{
						cy.prov_core().entity(entities[key], key, label, parent_id);
					}
				}
			}


			function parse_activities(activities){
				for(var key in activities){
					var parent_id = undefined;

					if(activities[key]['prov:label']!=undefined){
						var label = activities[key]['prov:label'];
					} else if(activities[key]['rdt:name']!=undefined){
						var label = activities[key]['rdt:name']+' ['+activities[key]['rdt:startLine']+']';
					}else{
						var label = key;
					}

					if(activities[key]['cf:id'] != undefined){
						var parent_label = activities[key]['cf:id'];
						parent_id = activities[key]['cf:type'] + activities[key]['cf:id'] + activities[key]['cf:boot_id'] + activities[key]['cf:machine_id'];
						cy.prov_core().activity(activities[key], parent_id, parent_label);
					}

					if(activities[key]['cf:parent_id'] != undefined){
						parent_id = activities[key]['cf:parent_id'];
						if(cy.elements('node[id="'+parent_id+'"]').empty()){ // parent does not exist yet
							tryNodeAgain.push({fn: cy.prov_core().activity, json: activities[key], key: key, label: label, parent_id: parent_id});
							continue;
						}

					}
					cy.prov_core().activity(activities[key], key, label, parent_id);
				}
			}

			function parse_agents(agents){
				for(var key in agents){
					cy.prov_core().agent(agents[key], key);
				}
			}

			function missing(fn, key1, key2){
				if(cy.elements('node[id="'+key1+'"]').empty() || cy.elements('node[id="'+key2+'"]').empty() ){
					tryEdgeAgain.push({fn: fn, key1: key1, key2: key2});
					return true;
				}
				return false;
			}

			function parse_edges(eles, fn, key1, key2){
				for(var key in eles){
					if(missing(fn, eles[key][key1], eles[key][key2]))
						continue;
					if(eles[key]['prov:label']!=undefined){
						fn(eles[key][key1], eles[key][key2], eles[key]['prov:label']);
					}else{
						fn(eles[key][key1], eles[key][key2]);
					}
				}
			}

			function parse_nested_edges(eles, fn, key1, key2, neston, fn2, nest1, nest2){
				for(var key in eles){
					if(missing(fn, eles[key][key1], eles[key][key2]))
						continue;
					fn(eles[key][key1], eles[key][key2]);
					for(var i=0; i < eles[key][neston].length; i++){
						if(!missing(fn2, eles[key][nest1], eles[key][nest2][i][1]))
							fn2(eles[key][nest1], eles[key][nest2][i][1]);
					}
				}
			}

			function parse_double_edges(eles, fn, key1, key2, neston, fn2, nest1, nest2){
				for(var key in eles){
					if(missing(fn, eles[key][key1], eles[key][key2]))
						continue;
					fn(eles[key][key1], eles[key][key2]);
					if(eles[key][neston]!=undefined){
						if(!missing(fn2, eles[key][nest1], eles[key][nest2]))
							fn2(eles[key][nest1], eles[key][nest2])
					}
				}
			}

			Array.prototype.pushArray = function() {
			    this.push.apply(this, this.concat.apply([], arguments));
			};

			function edge_again(){
				var edge;
				var again = new Array();
				while(tryEdgeAgain.length>0){
					edge = tryEdgeAgain.pop();
					if(cy.elements('node[id="'+edge.key1+'"]').empty() || cy.elements('node[id="'+edge.key2+'"]').empty() ){
						again.push(edge);
						continue;
					}
					edge.fn(edge.key1, edge.key2);
				}
				tryEdgeAgain = again;
			}

			function node_again(){
				var node;
				var again = new Array();
				while(tryNodeAgain.length>0){
					node = tryNodeAgain.pop();
					if(cy.elements('node[id="'+node.parent_id+'"]').empty()){
						again.push(node);
						continue;
					}
					node.fn(node.json, node.key, node.label, node.parent_id);
				}
				tryNodeAgain = again;
			}

			function parse_messages(messages){
				var div = document.getElementById('camflow-message');

				for(key in messages){
					div.innerHTML = div.innerHTML + '['+messages[key]['cf:machine_id']+':'+messages[key]['cf:boot_id']+':'+messages[key]['cf:id']+']'+' '+messages[key]['cf:message'];
				}
			}

			if (!getScratch().isInitialized) {
				getScratch().isInitialized = true;

				_instance = {
					exportProvJSON: function () {
						return json;
					},

					parse: function (text){
						var data = JSON.parse(text);
						var tmp = {};
						$.extend(true, tmp, json, data);
						json = tmp;

						cy.startBatch();

						parse_entities(data.entity);
						parse_activities(data.activity);
						parse_agents(data.agent);

						parse_messages(data.message);

						//	try edges that could not be inserted earlier
						edge_again();
						//	try nodes that could not be inserted earlier
						node_again();

						parse_edges(data.wasGeneratedBy, cy.prov_core().wasGeneratedBy, 'prov:entity', 'prov:activity');

						parse_edges(data.used, cy.prov_core().used, 'prov:activity', 'prov:entity');

						parse_edges(data.wasDerivedFrom, cy.prov_core().wasDerivedFrom, 'prov:generatedEntity', 'prov:usedEntity');

						parse_edges(data.wasAttributedTo, cy.prov_core().wasAttributedTo, 'prov:entity', 'prov:agent');

						parse_edges(data.wasInformedBy, cy.prov_core().wasInformedBy, 'prov:informant', 'prov:informed');

						parse_edges(data.specializationOf, cy.prov_core().specializationOf, 'prov:entity', 'prov:specialization');

						parse_edges(data.alternateOf, cy.prov_core().alternateOf, 'prov:entity', 'prov:alternate');

						parse_edges(data.relation, cy.prov_core().genericRelation, 'cf:receiver', 'cf:sender');

						parse_double_edges(data.wasAssociatedWith,
											cy.prov_core().wasAssociatedWith,
											'prov:activity',
											'prov:agent',
											'prov:plan',
											cy.prov_core().hadPlan,
											'prov:agent',
											'prov:plan');

						parse_nested_edges(data.derivedByInsertionFrom,
											cy.prov_core().derivedByInsertionFrom,
											'prov:before',
											'prov:after',
											'prov:key-entity-set',
											cy.prov_core().hadDictionaryMember,
											'prov:after',
											'prov:key-entity-set');
						cy.endBatch();
						cy.prov_core().draw();
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
