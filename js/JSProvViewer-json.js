function parse_entities(entities){
	for(key in entities){	
		var parent_id = undefined;
		if(entities[key]['rdt:name']!=undefined){
			var label = entities[key]['rdt:name']+' ['+entities[key]['rdt:type']+']';
		}else if( entities[key]['cf:pathname']!=undefined ){
			var label = '[path]'+entities[key]['cf:pathname'];
		}else if( entities[key]['cf:ifc']!=undefined ){
			var label = '[ifc]'+entities[key]['cf:ifc'];
		}else if(entities[key]['cf:node_info'] != undefined){
			var node_info = entities[key]['cf:node_info'];
			var label = '['+entities[key]['prov:type']+']'+node_info['cf:id'];
			var parent_id = node_info['cf:type'] + node_info['cf:id'] + node_info['cf:boot_id'] + node_info['cf:machine_id'];
			entity(parent_id, label);
			label = label+' v'+node_info['cf:version'];
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

function parse_activities(activities){
	for(key in activities){
		var parent_id = undefined;
		if(activities[key]['rdt:name']!=undefined){
			var label = activities[key]['rdt:name']+' ['+activities[key]['rdt:scriptLine']+']';
		}else if(activities[key]['cf:node_info'] != undefined){
			var node_info = activities[key]['cf:node_info'];
			var label = node_info['cf:id'];
			parent_id = node_info['cf:type'] + node_info['cf:id'] + node_info['cf:boot_id'] + node_info['cf:machine_id'];
			activity(parent_id, label);
			label = label+' v'+node_info['cf:version'];
		}else{
			var label = key;
		}
		
		if(activities[key]['cf:parent_id'] != undefined){
			parent_id = activities[key]['cf:parent_id'];
		}
		
		activity(key, label, parent_id);
	}
}

function parse_agents(agents){
	for(key in agents){
		agent(key);
	}
}

function parse_edges(eles, fn, key1, key2){
	for(key in eles){
		if(cy.elements('node[id="'+eles[key][key1]+'"]').empty() || cy.elements('node[id="'+eles[key][key2]+'"]').empty() ){
			console.log("missing node!");
		}
		fn(eles[key][key1], eles[key][key2]);
	}
}

function JSProvParseJSON(text){
	var data = JSON.parse(text);
	parse_entities(data.entity);
	parse_activities(data.activity);
	parse_agents(data.agent);
	
	parse_edges(data.wasGeneratedBy, wasGeneratedBy, 'prov:entity', 'prov:activity');
		
	parse_edges(data.used, used, 'prov:activity', 'prov:entity');

	parse_edges(data.wasDerivedFrom, wasDerivedFrom, 'prov:generatedEntity', 'prov:usedEntity');

	parse_edges(data.wasAttributedTo, wasAttributedTo, 'prov:entity', 'prov:agent');
	
	parse_edges(data.wasInformedBy, wasInformedBy, 'prov:informant', 'prov:informed');
	
	parse_edges(data.specializationOf, specializationOf, 'prov:entity', 'prov:specialization');
	
	parse_edges(data.alternateOf, alternateOf, 'prov:entity', 'prov:alternate');
	
	parse_edges(data.edge, unknownEdge, 'prov:receiver', 'prov:sender');
	
	associated = data.wasAssociatedWith;
	for(key in associated){
		wasAssociatedWith(associated[key]['prov:activity'], associated[key]['prov:agent']);
		if(associated[key]['prov:plan']!=undefined){
			hadPlan(associated[key]['prov:agent'], associated[key]['prov:plan'])
		}
	}
	
	derived = data.derivedByInsertionFrom;
	for(key in derived){
		entity(derived[key]['prov:before'], 'was missing');
		entity(derived[key]['prov:before'], 'was missing');
		derivedByInsertionFrom(derived[key]['prov:before'], derived[key]['prov:after']);
		for(i=0; i < derived[key]['prov:key-entity-set'].length; i++){
			hadDictionaryMember(derived[key]['prov:after'], derived[key]['prov:key-entity-set'][i][1]);
		}
	}
	
	JSProvDraw();
}