function parse_entities(entities){
	for(key in entities){	
		var parent_id = undefined;
		if(entities[key]['rdt:name']!=undefined){
			var label = entities[key]['rdt:name']+' ['+entities[key]['rdt:type']+']';
		}else if( entities[key]['cf:pathname']!=undefined ){
			var label = '[path]'+entities[key]['cf:pathname'];
		}else if( entities[key]['cf:ifc']!=undefined ){
			var label = '[ifc]'+entities[key]['cf:ifc'];
		}else if(entities[key]['prov:type'] != undefined){
			var label = '['+entities[key]['prov:type']+']'+entities[key]['cf:id'];
			var parent_id = entities[key]['cf:type'] + entities[key]['cf:id'] + entities[key]['cf:boot_id'] + entities[key]['cf:machine_id'];
			entity(parent_id, label);
			label = label+' v'+entities[key]['cf:version'];
		}else{
			var label = key;
		}
		
		if(entities[key]['prov:type']=='prov:agent'){
			agent(key, label, parent_id);
		}else{
			entity(key, label, parent_id);
		}
	}
}

var tryNodeAgain = new Array();
function parse_activities(activities){
	for(key in activities){
		var parent_id = undefined;
		if(activities[key]['rdt:name']!=undefined){
			var label = activities[key]['rdt:name']+' ['+activities[key]['rdt:scriptLine']+']';
		}else if(activities[key]['cf:id'] != undefined){
			var label = activities[key]['cf:id'];
			parent_id = activities[key]['cf:type'] + activities[key]['cf:id'] + activities[key]['cf:boot_id'] + activities[key]['cf:machine_id'];
			activity(parent_id, label);
			label = label+' v'+activities[key]['cf:version'];
		}else{
			var label = key;
		}
		
		if(activities[key]['cf:parent_id'] != undefined){
			parent_id = activities[key]['cf:parent_id'];
			if(cy.elements('node[id="'+parent_id+'"]').empty()){ // parent does not exist yet
				tryNodeAgain.push({fn: activity, key: key, label: label, parent_id: parent_id});
				continue;
			}
			
		}		
		activity(key, label, parent_id);
	}
}

function parse_agents(agents){
	for(key in agents){
		agent(key);
	}
}

var tryInsertAgain = new Array();

function missing(fn, key1, key2){
	if(cy.elements('node[id="'+key1+'"]').empty() || cy.elements('node[id="'+key2+'"]').empty() ){
		tryInsertAgain.push({fn: fn, key1: key1, key2: key2});
		return true;
	}
	return false;
}

function parse_edges(eles, fn, key1, key2){
	for(key in eles){
		if(missing(fn, eles[key][key1], eles[key][key2]))
			continue;
		fn(eles[key][key1], eles[key][key2]);
	}
}

function parse_nested_edges(eles, fn, key1, key2, neston, fn2, nest1, nest2){
	for(key in eles){
		if(missing(fn, eles[key][key1], eles[key][key2]))
			continue;
		fn(eles[key][key1], eles[key][key2]);
		for(i=0; i < eles[key][neston].length; i++){
			if(!missing(fn2, eles[key][nest1], eles[key][nest2][i][1]))
				fn2(eles[key][nest1], eles[key][nest2][i][1]);
		}
	}
}

function parse_double_edges(eles, fn, key1, key2, neston, fn2, nest1, nest2){
	for(key in eles){
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
	again = new Array();
	while(tryInsertAgain.length>0){
		edge = tryInsertAgain.pop();
		if(cy.elements('node[id="'+edge.key1+'"]').empty() || cy.elements('node[id="'+edge.key2+'"]').empty() ){
			again.push(edge);
			continue;
		}
		edge.fn(edge.key1, edge.key2);		
	}
	tryInsertAgain = again;
}

function node_again(){
	var node;
	again = new Array();
	while(tryNodeAgain.length>0){
		node = tryNodeAgain.pop();
		if(cy.elements('node[id="'+node.parent_id+'"]').empty()){
			again.push(node);
			continue;
		}
		node.fn(node.key, node.label, node.parent_id);		
	}
	tryNodeAgain = again;
}

function JSProvParseJSON(text){
	var data = JSON.parse(text);
	
	cy.startBatch();
	
	parse_entities(data.entity);
	parse_activities(data.activity);
	parse_agents(data.agent);
	
	//	try edges that could not be inserted earlier
	edge_again();
	//	try nodes that could not be inserted earlier
	node_again();
	
	parse_edges(data.wasGeneratedBy, wasGeneratedBy, 'prov:entity', 'prov:activity');
		
	parse_edges(data.used, used, 'prov:activity', 'prov:entity');

	parse_edges(data.wasDerivedFrom, wasDerivedFrom, 'prov:generatedEntity', 'prov:usedEntity');

	parse_edges(data.wasAttributedTo, wasAttributedTo, 'prov:entity', 'prov:agent');
	
	parse_edges(data.wasInformedBy, wasInformedBy, 'prov:informant', 'prov:informed');
	
	parse_edges(data.specializationOf, specializationOf, 'prov:entity', 'prov:specialization');
	
	parse_edges(data.alternateOf, alternateOf, 'prov:entity', 'prov:alternate');
	
	parse_edges(data.edge, unknownEdge, 'prov:receiver', 'prov:sender');
	
	parse_double_edges(data.wasAssociatedWith, 
						wasAssociatedWith, 
						'prov:activity', 
						'prov:agent', 
						'prov:plan', 
						hadPlan, 
						'prov:agent', 
						'prov:plan');
	
	parse_nested_edges(data.derivedByInsertionFrom, 
						derivedByInsertionFrom, 
						'prov:before', 
						'prov:after', 
						'prov:key-entity-set', 
						hadDictionaryMember, 
						'prov:after', 
						'prov:key-entity-set');
	cy.endBatch();
	JSProvDraw();
}